import { expect, test } from "@playwright/test";

test("ComposerPanel keeps one surface, the editor actions and the meta row without horizontal overflow", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/canvas.html?story=composer-panel");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    const panel = page.locator('[data-meowui-part="composer-panel/root"]');
    expect(await panel.count()).toBe(1);
    const first = panel;
    const geometry = await first.evaluate((element) => {
      const box = (part: string) => {
        const target = element.querySelector<HTMLElement>(`[data-meowui-part="${part}"]`)!;
        const bounds = target.getBoundingClientRect();
        return { top: bounds.top, bottom: bounds.bottom, left: bounds.left, right: bounds.right };
      };
      const root = element.getBoundingClientRect();
      return {
        root: { top: root.top, bottom: root.bottom, left: root.left, right: root.right },
        surface: box("composer-panel/surface"),
        meta: box("composer-panel/meta"),
        input: box("chat-composer/input"),
        trailing: box("chat-composer/trailing"),
        submit: box("chat-composer/submit"),
      };
    });
    expect(geometry.surface.top).toBeGreaterThanOrEqual(geometry.root.top);
    expect(geometry.meta.top).toBeGreaterThanOrEqual(geometry.surface.bottom);
    expect(geometry.input.top).toBeGreaterThan(geometry.surface.top);
    expect(geometry.submit.right).toBeLessThanOrEqual(geometry.surface.right + 1);
    if (viewport.width >= 768)
      expect(geometry.trailing.right).toBeLessThanOrEqual(geometry.submit.left + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
});
