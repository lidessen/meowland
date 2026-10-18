import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test("output and code actions keep a 44px touch area on a narrow page", async ({ page }) => {
  for (const [story, selector] of [
    ["output-blocks", '[data-meowui-part="output-block/actions"]'],
    ["code-block", '[data-meowui-part="code-block/actions"] button'],
    ["page-structure", '[data-meowui-part="page-header/actions"] > *'],
    ["workspace-composition", '[data-meowui-part="toolbar/root"] button'],
  ] as const) {
    await page.goto(`/canvas.html?story=${story}`);
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    const sizes = await page.locator(selector).evaluateAll((elements) =>
      elements
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          return { width: Math.round(bounds.width), height: Math.round(bounds.height) };
        })
        .filter((size) => size.width > 0 && size.height > 0),
    );
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) {
      expect(size.width, `${story} action width`).toBeGreaterThanOrEqual(44);
      expect(size.height, `${story} action height`).toBeGreaterThanOrEqual(44);
    }
  }
});
