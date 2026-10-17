import { expect, test, type Locator, type Page } from "@playwright/test";

async function open(page: Page) {
  await page.goto("/canvas.html?story=skeleton-lifecycle");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await expect(page.locator("#kept-image")).toHaveJSProperty("complete", true);
}

async function photo(locator: Locator) {
  return (await locator.screenshot({ animations: "disabled", caret: "initial" })).toString(
    "base64",
  );
}

async function resources(page: Page) {
  return page.evaluate(() => ({
    styles: Array.from(document.querySelectorAll("style"), (style) => style.textContent),
    highlights: Array.from(
      (CSS as typeof CSS & { highlights: Map<string, unknown> }).highlights.keys(),
    ),
  }));
}

test("loading preserves controls and layout while applying and releasing busy and inert state", async ({
  page,
}) => {
  await open(page);
  const input = page.locator("#kept-input");
  await input.fill("Preserve this edited draft");
  await page.locator("#start-first").focus();
  const original = await input.elementHandle();
  const style = await input.getAttribute("style");
  const selectors = ["#first-text", "#kept-input", "#kept-image", "#kept-icon"];
  const before = await Promise.all(
    selectors.map(async (selector) => ({
      rect: await page.locator(selector).boundingBox(),
      pixels: await photo(page.locator(selector)),
    })),
  );
  await page.locator("#start-first").click();
  await expect(page.locator("#first-boundary")).toHaveAttribute("aria-busy", "true");
  await expect(
    page.locator('#first-boundary [data-meowui-part="skeleton-boundary/content"]'),
  ).toHaveJSProperty("inert", true);
  await expect(page.getByRole("status").filter({ hasText: "Loading first panel" })).toHaveCount(1);
  for (const [index, selector] of selectors.entries()) {
    await expect.poll(() => photo(page.locator(selector))).not.toBe(before[index]!.pixels);
    expect(await page.locator(selector).boundingBox()).toEqual(before[index]!.rect);
  }
  expect(await input.evaluate((node, previous) => node === previous, original)).toBe(true);
  await expect(input).toHaveValue("Preserve this edited draft");
  await expect(page.locator("#disabled-input")).toBeDisabled();
  await page.locator("#finish-first").click();
  await expect(page.locator("#first-boundary")).toHaveAttribute("aria-busy", "false");
  await expect(
    page.locator('#first-boundary [data-meowui-part="skeleton-boundary/content"]'),
  ).toHaveJSProperty("inert", false);
  for (const [index, selector] of selectors.entries())
    await expect.poll(() => photo(page.locator(selector))).toBe(before[index]!.pixels);
  expect(await input.getAttribute("style")).toBe(style);
  expect(await input.evaluate((node, previous) => node === previous, original)).toBe(true);
  await input.fill("Still editable");
  await expect(input).toHaveValue("Still editable");
});

test("new signal content and changed surface geometry remain skeletonized while active", async ({
  page,
}) => {
  await open(page);
  await page.locator("#start-first").click();
  await page.locator("#append-content").click();
  await expect(page.locator("#appended-text")).toHaveText("WWWWWWWW MMMMMMMM");
  const light = await photo(page.locator("#appended-text"));
  await page.locator("#first-content").evaluate((element) => {
    element.style.width = "180px";
    element.style.background = "#222";
    element.style.color = "#eee";
  });
  await expect.poll(() => photo(page.locator("#appended-text"))).not.toBe(light);
  const activeRect = await page.locator("#appended-text").boundingBox();
  const active = await photo(page.locator("#appended-text"));
  await page.locator("#finish-first").click();
  await expect.poll(() => photo(page.locator("#appended-text"))).not.toBe(active);
  expect(await page.locator("#appended-text").boundingBox()).toEqual(activeRect);
  await expect(page.locator("#first-content")).toHaveCSS("background-color", "rgb(34, 34, 34)");
  await expect(page.locator("#first-content")).toHaveCSS("width", "180px");
});

test("independent boundaries release only their own resources on stop and unmount", async ({
  page,
}) => {
  await open(page);
  const before = await resources(page);
  const secondOriginal = await photo(page.locator("#second-text"));
  await page.locator("#start-first").click();
  await page.locator("#start-second").click();
  await expect.poll(() => photo(page.locator("#second-text"))).not.toBe(secondOriginal);
  const secondActive = await photo(page.locator("#second-text"));
  await page.locator("#remove-first").click();
  await expect(page.locator("#first-boundary")).toHaveCount(0);
  await expect(page.locator("#second-boundary")).toHaveAttribute("aria-busy", "true");
  expect(await photo(page.locator("#second-text"))).toBe(secondActive);
  await page.locator("#finish-second").click();
  await expect.poll(() => photo(page.locator("#second-text"))).toBe(secondOriginal);
  await expect.poll(() => resources(page)).toEqual(before);
});

test("plugin exclusion and repeated disposal preserve caller-owned attributes and styles", async ({
  page,
}) => {
  await open(page);
  const scope = page.locator("#plugin-scope");
  const before = await scope.evaluate((element) => ({
    html: element.outerHTML,
    rect: element.getBoundingClientRect().toJSON(),
  }));
  const initialResources = await resources(page);
  const excluded = await photo(page.locator("#excluded-text"));
  const text = await photo(page.locator("#plugin-text"));
  for (let cycle = 0; cycle < 2; cycle++) {
    await page.locator("#plugin-start").click();
    await expect.poll(() => photo(page.locator("#plugin-text"))).not.toBe(text);
    expect(await photo(page.locator("#excluded-text"))).toBe(excluded);
    await expect(scope).toHaveJSProperty("inert", true);
    await expect(scope).toHaveAttribute("aria-busy", "false");
    await page.locator("#plugin-stop").click();
    await expect.poll(() => photo(page.locator("#plugin-text"))).toBe(text);
    expect(
      await scope.evaluate((element) => ({
        html: element.outerHTML,
        rect: element.getBoundingClientRect().toJSON(),
      })),
    ).toEqual(before);
    await expect.poll(() => resources(page)).toEqual(initialResources);
  }
});

test("temporary traversal preserves an active skeleton and rejected overlap leaks no resources", async ({
  page,
}) => {
  await open(page);
  await page.locator("#start-first").click();
  await expect(page.locator("#first-boundary")).toHaveAttribute("aria-busy", "true");
  const activeResources = await resources(page);
  const activePixels = await photo(page.locator("#first-content"));
  await page.locator("#overlap-default").click();
  await expect(page.locator("#overlap-result")).toHaveText("Rejected overlap");
  await expect.poll(() => resources(page)).toEqual(activeResources);
  expect(await photo(page.locator("#first-content"))).toBe(activePixels);
  await page.locator("#overlap-preserve").click();
  await expect(page.locator("#overlap-result")).toHaveText("Preserved existing scope");
  expect(await photo(page.locator("#first-content"))).toBe(activePixels);
  await page.locator("#overlap-stop").click();
  await expect.poll(() => resources(page)).toEqual(activeResources);
  expect(await photo(page.locator("#first-content"))).toBe(activePixels);
  await expect(page.locator("#first-boundary")).toHaveAttribute("aria-busy", "true");
  await page.locator("#finish-first").click();
  await expect.poll(() => photo(page.locator("#first-content"))).not.toBe(activePixels);
});
