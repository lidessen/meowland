import { expect, test } from "@playwright/test";

test.describe("Meowbook mobile tool surface", () => {
  test.use({ hasTouch: true });
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 390, height: 500 },
    { width: 844, height: 390 },
  ]) {
    test(`catalog and inspection stay reachable at ${viewport.width}x${viewport.height}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.goto("/?story=search-input&width=fluid");
      const frame = page.frameLocator("#canvas");
      const input = frame.getByRole("searchbox", { name: "在当前项目中查找" });
      await input.fill("主题");
      if (viewport.width < 640) {
        const toggle = page.getByRole("button", { name: "切换组件目录" });
        await toggle.tap();
        await expect(page.getByRole("searchbox", { name: "查找组件" })).not.toBeFocused();
        await expect(page.locator("#sidebar")).toBeVisible();
        await page.screenshot({ path: testInfo.outputPath("mobile-catalog.png") });
        await toggle.tap();
        await toggle.focus();
        await page.keyboard.press("Enter");
        await expect(page.getByRole("searchbox", { name: "查找组件" })).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(toggle).toBeFocused();
        const canvas = await page.locator("#canvas").boundingBox();
        expect(canvas!.width).toBe(viewport.width);
        expect(canvas!.x).toBe(0);
      }
      await page.locator("#inspection-panel > summary").tap();
      const panel = await page.locator("#inspection-panel").boundingBox();
      expect(panel!.y).toBeGreaterThanOrEqual(112);
      expect(panel!.y + panel!.height).toBeLessThanOrEqual(viewport.height + 1);
      const batch = page.getByRole("button", { name: "检查全部样例", exact: true });
      await batch.scrollIntoViewIfNeeded();
      const button = await batch.boundingBox();
      expect(button!.y + button!.height).toBeLessThanOrEqual(viewport.height);
      await page.screenshot({ path: testInfo.outputPath("mobile-inspection.png") });
      await page.locator("#inspection-panel > summary").tap();
      await expect(input).toHaveValue("主题");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  }
});
