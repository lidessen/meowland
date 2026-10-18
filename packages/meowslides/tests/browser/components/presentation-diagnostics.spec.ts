import { expect, test } from "@playwright/test";

const diagnostic = '[data-meowui-part="presentation/diagnostic"]';
const slide = '[data-meowui-part="presentation/slide"]';
const body = '[data-meowui-part="presentation-layout/body"]';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/canvas.html?story=presentation-diagnostics");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
});

test("visible content crossing an allocated region is diagnosed inside a finite canvas", async ({
  page,
}) => {
  const picker = page.getByRole("combobox", { name: "Choose slide" });
  await picker.selectOption("nested");
  await expect(page.locator(diagnostic)).toBeHidden();
  // This reproduces a body overlapping its footer while the article itself
  // still has no scrolling overflow: checking only the article misses it.
  await page.locator("[data-diagnostic-content]").evaluate((element) => {
    const region = element.closest('[data-meowui-part="presentation-layout/body"]')!;
    const height = region.clientHeight;
    (element as HTMLElement).style.cssText = `height:${height + 12}px;flex-shrink:0`;
  });
  expect(await page.locator(slide).evaluate((element) => element.scrollHeight)).toBe(720);
  await expect(page.locator(diagnostic)).toBeVisible();
  await expect(page.locator(diagnostic)).toContainText("allocated layout region");
  await page
    .locator("[data-diagnostic-content]")
    .evaluate((element) => element.removeAttribute("style"));
  await expect(page.locator(diagnostic)).toBeHidden();
  await page.setViewportSize({ width: 390, height: 330 });
  await expect(page.locator(diagnostic)).toBeHidden();
});

test("hidden reveals and explicit nested scrolling do not cause false overflow warnings", async ({
  page,
}) => {
  await expect(page.locator(diagnostic)).toBeHidden();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(diagnostic)).toBeVisible();
  await page.getByRole("button", { name: "Previous", exact: true }).click();
  await expect(page.locator(diagnostic)).toBeHidden();
  await page.setViewportSize({ width: 390, height: 330 });
  await expect(page.locator(diagnostic)).toBeHidden();
  await page.setViewportSize({ width: 1280, height: 500 });
  await expect(page.locator(diagnostic)).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(diagnostic)).toBeHidden();
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("scroll");
  await expect(page.locator(diagnostic)).toBeHidden();
  const scroll = page.locator("[data-diagnostic-scroll]");
  expect(await scroll.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
    true,
  );
  await scroll.evaluate((element) => {
    element.scrollTop = 400;
  });
  await page.getByRole("textbox", { name: "Long draft" }).fill("More text. ".repeat(500));
  await expect(page.locator(diagnostic)).toBeHidden();
  // An intentional scroll owner may contain long content, but its own box
  // must still respect the region it was allocated.
  await scroll.evaluate((element) => {
    (element as HTMLElement).style.width = "1400px";
  });
  await expect(page.locator(diagnostic)).toBeVisible();
});

test("slideClassName scopes authored slide styling without changing the chrome class contract", async ({
  page,
}) => {
  await expect(page.locator(slide)).toHaveClass("diagnostic-lesson");
  await expect(page.locator('[data-meowui-part="presentation/root"]')).toHaveClass(
    "diagnostic-player",
  );
  await expect(page.locator('[data-meowui-part="presentation/root"]')).not.toHaveClass(
    /diagnostic-lesson/,
  );
  await page.addStyleTag({
    content:
      ".diagnostic-lesson h1 { font-size: 100px; } .diagnostic-lesson p { letter-spacing: 1px; }",
  });
  await expect(page.locator('[data-meowui-part="presentation/title"]')).toHaveCSS(
    "font-size",
    "13px",
  );
  await expect(page.locator('[data-meowui-part="presentation/position"]')).toHaveCSS(
    "letter-spacing",
    "normal",
  );
  await expect(page.locator(body).locator("p").first()).toHaveCSS("letter-spacing", "1px");
});

test("dynamic text styles are remeasured while native top-layer tools stay outside canvas diagnostics", async ({
  page,
}) => {
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("nested");
  await page.getByRole("button", { name: "Open teaching tools" }).click();
  await expect(page.locator(":popover-open")).toBeVisible();
  await expect(page.locator(diagnostic)).toBeHidden();
  await page.keyboard.press("Escape");
  const content = page.locator("[data-diagnostic-content]");
  await content.evaluate((element) => {
    element.textContent = "UnbrokenContent".repeat(100);
    (element as HTMLElement).style.whiteSpace = "nowrap";
  });
  await expect(page.locator(diagnostic)).toBeVisible();
  await content.evaluate((element) => {
    element.textContent = "Content fits again.";
    element.removeAttribute("style");
  });
  await expect(page.locator(diagnostic)).toBeHidden();
});

test("allocated region resizing rechecks content without changing the fixed article size", async ({
  page,
}) => {
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("nested");
  await page.locator("[data-diagnostic-content]").evaluate((element) => {
    const region = element.closest('[data-meowui-part="presentation-layout/body"]')!;
    (element as HTMLElement).style.cssText = `height:${region.clientHeight - 120}px;flex-shrink:0`;
  });
  await expect(page.locator(diagnostic)).toBeHidden();
  const style = await page.addStyleTag({
    content:
      '[data-meowui-part="presentation-layout/body"] [data-meowui-part="presentation-layout/header"] { padding-bottom: 160px; }',
  });
  await expect(page.locator(diagnostic)).toBeVisible();
  expect(await page.locator(slide).evaluate((element) => element.clientHeight)).toBe(720);
  await style.evaluate((element) => element.parentNode?.removeChild(element));
  await expect(page.locator(diagnostic)).toBeHidden();
});

test("font metric overhang is not mistaken for line-box overflow in compact headings", async ({
  page,
}) => {
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("nested");
  await page.addStyleTag({ content: ".diagnostic-lesson h2 { font-size:48px; line-height:1.1; }" });
  await expect(page.locator(diagnostic)).toBeHidden();
  await page.locator(".diagnostic-lesson h2").evaluate((element) => {
    const emphasis = document.createElement("span");
    emphasis.textContent = element.textContent;
    element.replaceChildren(emphasis);
  });
  await expect(page.locator(diagnostic)).toBeHidden();
  // The paragraph's own box fits. Its genuinely excessive rendered lines must
  // still be checked after normalizing the font rectangle to CSS line-height.
  await page.locator("[data-diagnostic-content]").evaluate((element) => {
    (element as HTMLElement).style.cssText = "height:20px;flex-shrink:0";
    element.textContent = "More visible reading content. ".repeat(150);
  });
  await expect(page.locator(diagnostic)).toBeVisible();
  await page.locator("[data-diagnostic-content]").evaluate((element) => {
    element.textContent = "Short content fits again.";
    element.removeAttribute("style");
  });
  await expect(page.locator(diagnostic)).toBeHidden();
});
