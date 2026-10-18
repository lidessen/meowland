import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test("page-level app shell actions keep a 44px touch area", async ({ page }) => {
  await page.goto("/canvas.html?story=app-shell");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");

  const sizes = await page.evaluate(() => {
    const measure = (selector: string) =>
      [...document.querySelectorAll<HTMLElement>(selector)].map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          selector,
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
          text: (element.textContent ?? "").trim().slice(0, 30),
        };
      });
    return [
      ...measure('[data-meowui-part="app-bar/actions"] > *'),
      ...measure('[data-meowui-part="alert/actions"] > *'),
      ...measure(
        '[data-meowui-part="composer-panel/surface"] [data-meowui-part="chat-composer/actions"] > button',
      ),
      ...measure(
        '[data-meowui-part="composer-panel/surface"] [data-meowui-part="chat-composer/submit"]',
      ),
    ];
  });

  expect(sizes.length).toBeGreaterThan(0);
  for (const size of sizes) {
    expect(size.width, `${size.selector} width ${size.text}`).toBeGreaterThanOrEqual(44);
    expect(size.height, `${size.selector} height ${size.text}`).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});
