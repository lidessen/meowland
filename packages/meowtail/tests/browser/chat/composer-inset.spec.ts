import { expect, test } from "@playwright/test";

test("a direct frame composer keeps its reading inset while nested composers use their own container", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/canvas.html?story=chat-composer-inset");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    const direct = await page
      .getByRole("region", { name: "Direct composer frame" })
      .evaluate((frame) => {
        const bounds = frame.getBoundingClientRect();
        const composer = frame.querySelector('[data-meowui-part="chat-composer/root"]')!;
        const rect = composer.getBoundingClientRect();
        const css = getComputedStyle(composer);
        return {
          start: rect.left - bounds.left,
          end: bounds.right - rect.right,
          top: Number.parseFloat(css.marginTop),
        };
      });
    expect(direct.start).toBeGreaterThan(0);
    expect(direct.start).toBeCloseTo(direct.end, 1);
    expect(direct.top).toBeGreaterThan(0);
    for (const name of ["footer", "card", "standalone"]) {
      const geometry = await page
        .locator(`[data-composer-container="${name}"]`)
        .evaluate((container) => {
          const bounds = container.getBoundingClientRect();
          const box = getComputedStyle(container);
          const composer = container.querySelector('[data-meowui-part="chat-composer/root"]')!;
          const rect = composer.getBoundingClientRect();
          const css = getComputedStyle(composer);
          return {
            expectedStart:
              bounds.left +
              Number.parseFloat(box.paddingLeft) +
              Number.parseFloat(box.borderLeftWidth),
            expectedEnd:
              bounds.right -
              Number.parseFloat(box.paddingRight) -
              Number.parseFloat(box.borderRightWidth),
            start: rect.left,
            end: rect.right,
            marginTop: Number.parseFloat(css.marginTop),
            marginBottom: Number.parseFloat(css.marginBottom),
          };
        });
      expect(geometry.start, `${name} start`).toBeCloseTo(geometry.expectedStart, 1);
      expect(geometry.end, `${name} end`).toBeCloseTo(geometry.expectedEnd, 1);
      expect(geometry.marginTop, `${name} top margin`).toBe(0);
      expect(geometry.marginBottom, `${name} bottom margin`).toBe(0);
    }
  }
});
