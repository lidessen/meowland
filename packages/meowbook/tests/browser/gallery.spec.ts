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

test("catalog is a labelled NavList with groups, anchors, current story and search that keeps focus", async ({
  page,
}) => {
  await page.goto("/?story=runtime/input");
  const catalog = page.locator("#catalog");
  const manifest = (await (await page.request.get("/manifest.json")).json()) as { id: string }[];
  await expect(page.getByRole("navigation", { name: "Component samples" })).toHaveCount(1);
  await expect(catalog.locator('[data-meowui-part="nav-list/root"]')).toHaveCount(1);
  await expect(catalog.locator('[data-meowui-part="nav-list/group"]')).toHaveCount(1);
  await expect(catalog.locator('[data-meowui-part="nav-list/groupTitle"]')).toHaveText(
    "Components",
  );
  await expect(catalog.locator("a")).toHaveCount(manifest.length);
  const current = catalog.locator('a[aria-current="page"]');
  await expect(current).toHaveCount(1);
  await expect(current).toHaveText("Input and cleanup");
  await expect(catalog.locator('a[href*="story=runtime"]')).toHaveCount(
    manifest.filter((entry) => entry.id.startsWith("runtime/")).length,
  );

  const search = page.getByRole("searchbox", { name: "Find components" });
  await search.fill("Annotation");
  await expect(search).toBeFocused();
  await expect(catalog.locator("a")).toHaveCount(1);
  await expect(catalog.locator('a[aria-current="page"]')).toHaveCount(0);
  await expect(page.locator("#story-count")).toHaveText(`1 / ${manifest.length}`);

  await search.fill("");
  await expect(search).toBeFocused();
  await expect(catalog.locator("a")).toHaveCount(manifest.length);
  await expect(catalog.locator('a[aria-current="page"]')).toHaveText("Input and cleanup");
});

test("mobile catalog opens as NavList, filters, closes and selects through one delegated handler", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?story=runtime/input");
  const catalog = page.locator("#catalog");
  const toggle = page.getByRole("button", { name: "Toggle component catalog" });
  await toggle.click();
  const search = page.getByRole("searchbox", { name: "Find components" });
  await expect(search).toBeFocused();
  await expect(page.getByRole("navigation", { name: "Component samples" })).toBeVisible();
  await expect(catalog.locator('[data-meowui-part="nav-list/root"]')).toHaveCount(1);
  await expect(catalog.locator('a[aria-current="page"]')).toHaveText("Input and cleanup");

  await search.fill("a component that does not exist");
  await expect(search).toBeFocused();
  await expect(catalog).toContainText("No results");
  await expect(catalog.locator('[data-meowui-part="nav-list/root"]')).toHaveCount(0);
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
  await expect(page.getByRole("searchbox", { name: "Find components" })).toBeFocused();
  await expect(catalog.locator("a")).toHaveCount(1);
  await catalog.locator("a").click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#title")).toBeFocused();
  await expect(page).toHaveURL(/story=annotation(%2F|\/)button/);
  await expect(catalog.locator('a[aria-current="page"]')).toHaveText("Annotation button");
  await expect(page.frameLocator("#canvas").getByRole("button", { name: "Submit" })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
