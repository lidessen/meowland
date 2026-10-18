import { expect, test } from "@playwright/test";

test("tooltip permits hover transit, Escape dismissal and normal keyboard navigation", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=tooltip");
  const trigger = page.getByRole("button", { name: "Standalone preview", exact: true });
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
  await expect(page.getByRole("textbox", { name: "Next item" })).toBeFocused();
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
    await page.goto("/canvas.html?story=tooltip");
    const trigger = page.getByRole("button", { name: "Standalone preview", exact: true });
    await trigger.tap();
    await expect(page.getByRole("tooltip")).toBeHidden();
    await page.getByRole("textbox", { name: "Next item" }).focus();
    await trigger.focus();
    await expect(page.getByRole("tooltip")).toBeVisible();
  });
});

test("field group uses native group naming, description and disabled descendants", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=field-group");
  const managed = page.getByRole("group", { name: "Organization-managed settings" });
  await expect(managed).toHaveAccessibleDescription(
    "The organization manages this group; it cannot be changed now.",
  );
  await expect(managed.getByRole("textbox", { name: "Organization name" })).toBeDisabled();
  await expect(managed.getByRole("combobox", { name: "Visibility" })).toBeDisabled();
  const email = page.getByRole("textbox", { name: "Delivery address" });
  await email.fill("designer@example.com");
  await expect(email).toHaveValue("designer@example.com");
});

for (const width of [390, 1100]) {
  test(`aspect ratio retains both media shapes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/canvas.html?story=aspect-ratio");
    for (const [text, ratio] of [
      ["16 : 9 · Demo preview", 16 / 9],
      ["1 : 1 · Project cover", 1],
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
