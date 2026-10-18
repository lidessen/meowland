import { expect, test } from "@playwright/test";

test("App shell keeps the bar, notice, scrolling body and composer in one page", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/canvas.html?story=app-shell");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    await expect(page.locator('[data-meowui-part="app-bar/root"]')).toBeVisible();
    await expect(page.locator('[data-meowui-part="alert/root"]')).toBeVisible();
    await expect(page.locator('[data-meowui-part="page-frame/footer"]')).toBeVisible();
    await expect(page.locator('[data-meowui-part="composer-panel/surface"]')).toBeVisible();
    const geometry = await page.evaluate(() => {
      const box = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) return null;
        const bounds = element.getBoundingClientRect();
        return { top: bounds.top, bottom: bounds.bottom, left: bounds.left, right: bounds.right };
      };
      return {
        header: box('[data-meowui-part="app-bar/root"]'),
        notice: box('[data-meowui-part="alert/root"]'),
        body: box('[data-meowui-part="page-frame/body"]'),
        footer: box('[data-meowui-part="page-frame/footer"]'),
        surface: box('[data-meowui-part="composer-panel/surface"]'),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    expect(geometry.header!.bottom).toBeLessThanOrEqual(geometry.notice!.top + 1);
    expect(geometry.notice!.bottom).toBeLessThanOrEqual(geometry.body!.top + 1);
    expect(geometry.body!.bottom).toBeLessThanOrEqual(geometry.footer!.top + 1);
    expect(geometry.surface!.bottom).toBeLessThanOrEqual(geometry.footer!.bottom + 1);
    expect(geometry.overflow).toBe(false);
  }
});
