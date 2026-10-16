import { expect, test } from "@playwright/test";

test("gallery appearance persists and auto follows the system without remounting canvas", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/?story=runtime/input");
  const frame = page.frameLocator("#canvas");
  await expect(frame.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await frame.getByRole("textbox", { name: "草稿" }).fill("不改变预览的输入");
  const appearance = page.getByRole("combobox", { name: "工具外观" });
  const light = await page
    .locator(".workshop-sidebar")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  await appearance.selectOption("dark");
  const dark = await page
    .locator(".workshop-sidebar")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(dark).not.toBe(light);
  await expect(frame.getByRole("textbox", { name: "草稿" })).toHaveValue("不改变预览的输入");
  await page.reload();
  await expect(appearance).toHaveValue("dark");
  await appearance.selectOption("auto");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator(".workshop-sidebar")).toHaveCSS("background-color", dark);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator(".workshop-sidebar")).toHaveCSS("background-color", light);
});

test("mobile catalog has a return path, search feedback and no hidden focus targets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?story=runtime/input");
  const toggle = page.getByRole("button", { name: "切换组件目录" });
  await toggle.click();
  await expect(page.getByRole("searchbox", { name: "查找组件" })).toBeFocused();
  await page.getByRole("searchbox", { name: "查找组件" }).fill("不会存在的组件");
  await expect(page.locator("#catalog")).toContainText("没有找到");
  await expect(page.locator("#story-count")).toContainText("0 /");
  await expect(page.locator(".workshop-stage")).toHaveJSProperty("inert", true);
  await expect(toggle).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(page.locator(".workshop-stage")).toHaveJSProperty("inert", false);
  await toggle.click();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await page.getByRole("searchbox", { name: "查找组件" }).fill("注释按钮");
  await page.locator("#catalog a").click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#title")).toBeFocused();
  await expect(page.frameLocator("#canvas").getByRole("button", { name: "提交" })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
