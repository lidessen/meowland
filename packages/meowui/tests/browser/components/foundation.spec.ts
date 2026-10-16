import { expect, test } from "@playwright/test";

test("tooltip permits hover transit, Escape dismissal and normal keyboard navigation", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=tooltip");
  const trigger = page.getByRole("button", { name: "独立预览", exact: true });
  const tooltip = page.getByRole("tooltip");
  await trigger.hover();
  await expect(tooltip).toBeVisible();
  await tooltip.hover();
  await expect(tooltip).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(tooltip).toBeHidden();
  await trigger.focus();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("textbox", { name: "下一项" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(tooltip).toBeHidden();
});

test.describe("touch help", () => {
  test.use({ hasTouch: true });
  test("a touch tap does not open hover help; later keyboard focus still does", async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:13007/canvas.html?story=tooltip");
    const trigger = page.getByRole("button", { name: "独立预览", exact: true });
    await trigger.tap();
    await expect(page.getByRole("tooltip")).toBeHidden();
    await page.getByRole("textbox", { name: "下一项" }).focus();
    await trigger.focus();
    await expect(page.getByRole("tooltip")).toBeVisible();
  });
});

test("field group uses native group naming, description and disabled descendants", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=field-group");
  const managed = page.getByRole("group", { name: "组织托管设置" });
  await expect(managed).toHaveAccessibleDescription("这组设置由组织管理，当前不可修改。");
  await expect(managed.getByRole("textbox", { name: "组织名称" })).toBeDisabled();
  await expect(managed.getByRole("combobox", { name: "可见范围" })).toBeDisabled();
  const email = page.getByRole("textbox", { name: "接收地址" });
  await email.fill("designer@example.com");
  await expect(email).toHaveValue("designer@example.com");
});

for (const width of [390, 1100]) {
  test(`aspect ratio retains both media shapes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("http://127.0.0.1:13007/canvas.html?story=aspect-ratio");
    for (const [text, ratio] of [
      ["16 : 9 · 演示预览", 16 / 9],
      ["1 : 1 · 项目封面", 1],
    ] as const) {
      const media = page.getByText(text, { exact: true });
      await expect(media).toBeVisible();
      const box = await media.boundingBox();
      expect(box!.width / box!.height).toBeCloseTo(ratio, 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  });
}
