import { expect, test, type Locator, type Page } from "@playwright/test";

const modality = (page: Page) =>
  page.locator("html").getAttribute("data-meowui-focus-modality", { timeout: 1000 });
// Safari rings script-moved focus after a tap; focusVisible: true reproduces that in Chromium.
const focusAsSafariDoes = (target: Locator) =>
  target.evaluate((element: HTMLElement) => {
    element.blur();
    element.focus({ focusVisible: true } as FocusOptions);
  });
const focusState = (target: Locator) =>
  target.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.borderColor, style.boxShadow, style.outlineStyle].join(" | ");
  });

test("a tap hides the focus ring Safari would draw, and the keyboard brings it back", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=buttons");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const button = page.getByRole("button").first();
  await button.click();
  expect(await modality(page)).toBe("pointer");
  await focusAsSafariDoes(button);
  expect(await button.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  await expect(button).toHaveCSS("outline-style", "none");

  await page.keyboard.press("Tab");
  expect(await modality(page)).toBe("keyboard");
  await focusAsSafariDoes(button);
  await expect(button).toHaveCSS("outline-style", "solid");
});

test("a field keeps its focus state after a tap", async ({ page }) => {
  await page.goto("/canvas.html?story=parameterized-theme-prototype");
  const draft = page.getByRole("textbox", { name: "Draft", exact: true });
  const resting = await focusState(draft);
  await draft.click();
  expect(await modality(page)).toBe("pointer");
  await expect(draft).toBeFocused();
  expect(await focusState(draft)).not.toBe(resting);
});

test("a menu opened from the keyboard marks its first row", async ({ page }) => {
  await page.goto("/canvas.html?story=menu-button");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const trigger = page.locator('[aria-controls="export-menu"]');
  await trigger.click();
  expect(await modality(page)).toBe("pointer");
  await page.keyboard.press("Escape");
  await trigger.focus();
  await page.keyboard.press("Enter");
  expect(await modality(page)).toBe("keyboard");
  const row = page.getByRole("menuitem").first();
  await expect(row).toBeFocused();
  expect(await row.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  // Menu rows mark focus with their active background, which the pointer rule leaves alone.
  const background = (target: Locator) =>
    target.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(await background(row)).not.toBe(await background(page.getByRole("menuitem").nth(1)));
});
