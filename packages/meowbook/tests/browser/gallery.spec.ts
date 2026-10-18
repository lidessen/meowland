import { expect, test } from "@playwright/test";

test("gallery appearance persists and auto follows the system without remounting canvas", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/?story=runtime/input");
  const frame = page.frameLocator("#canvas");
  await expect(frame.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await frame.getByRole("textbox", { name: "Draft" }).fill("Input retained across preview");
  const appearance = page.getByRole("combobox", { name: "Tool appearance" });
  const light = await page
    .locator(".workshop-sidebar")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  await appearance.selectOption("dark");
  const dark = await page
    .locator(".workshop-sidebar")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(dark).not.toBe(light);
  await expect(frame.getByRole("textbox", { name: "Draft" })).toHaveValue(
    "Input retained across preview",
  );
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
  const toggle = page.getByRole("button", { name: "Toggle component catalog" });
  await toggle.click();
  await expect(page.getByRole("searchbox", { name: "Find components" })).toBeFocused();
  await page
    .getByRole("searchbox", { name: "Find components" })
    .fill("a component that does not exist");
  await expect(page.locator("#catalog")).toContainText("No results");
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
  await page.getByRole("searchbox", { name: "Find components" }).fill("Annotation button");
  await page.locator("#catalog a").click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#title")).toBeFocused();
  await expect(page.frameLocator("#canvas").getByRole("button", { name: "Submit" })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
