import { expect, test } from "@playwright/test";

for (const width of [320, 390, 704, 1000]) {
  test(`Pine and Doodle matrix actions stay whole at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    for (const theme of ["pine", "doodle"]) {
      await page.goto(`/canvas.html?story=actions-matrix&theme=${theme}`);
      await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
      await page.evaluate(() => document.fonts.ready);
      const wrapping = await page
        .getByRole("button", { name: /^(View progress|Stop processing)$/ })
        .evaluateAll((buttons) =>
          buttons
            .filter((button) => {
              const label = document.createRange();
              label.selectNodeContents(button);
              return (
                new Set(Array.from(label.getClientRects(), (rect) => Math.round(rect.top))).size > 1
              );
            })
            .map((button) => button.textContent),
        );
      expect(wrapping).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    }
  });
}
