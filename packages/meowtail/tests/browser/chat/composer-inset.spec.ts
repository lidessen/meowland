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

test("a labeled action in a narrow stacked composer takes its own row instead of the text's column", async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto("/canvas.html?story=composer-attachments");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const geometry = await page
    .locator('[data-meowui-part="chat-composer/surface"]')
    .evaluate((surface) => {
      const rect = (selector: string) => surface.querySelector(selector)!.getBoundingClientRect();
      const input = rect('[data-meowui-part="chat-composer/input"]');
      const action = rect(
        '[data-meowui-part="chat-composer/actions"] > [data-meowui-part="button/root"]',
      );
      const submit = rect('[data-meowui-part="chat-composer/submit"]');
      return { input, action, submit, surface: surface.getBoundingClientRect() };
    });
  // The text keeps the writing row beside send, starting at the surface's leading edge.
  expect(Math.abs(geometry.input.bottom - geometry.submit.bottom)).toBeLessThan(2);
  expect(geometry.input.left - geometry.surface.left).toBeLessThan(24);
  expect(geometry.input.right).toBeLessThanOrEqual(geometry.submit.left);
  // The labeled action sits beneath, not beside the text.
  expect(geometry.action.top).toBeGreaterThanOrEqual(geometry.input.bottom - 1);
});
