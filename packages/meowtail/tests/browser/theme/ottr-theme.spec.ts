import { expect, test } from "@playwright/test";

test("the gallery switches to Ottr and preserves workspace interactions in light and dark", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1100, height: 860 });
  await page.goto("/canvas.html?story=workspace-composition");
  const storyState = page.locator("#story-state");
  await expect(storyState).toHaveAttribute("data-status", "ready");
  await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption("ottr");
  await expect(page).toHaveURL(/theme=ottr/);
  await expect(storyState).toHaveAttribute("data-status", "ready");

  const draft = page.getByRole("textbox", { name: "Composition draft" });
  await draft.fill("Keep this draft");
  await page.getByRole("button", { name: "Expand checks" }).click();
  await expect(page.getByRole("button", { name: "Collapse checks" })).toBeVisible();

  const options = page.getByRole("button", { name: "Check options" });
  const check = page.getByRole("button", { name: "Check current draft" });
  const colors = { light: "rgb(44, 119, 101)", dark: "rgb(63, 156, 130)" };
  for (const scheme of ["light", "dark"] as const) {
    await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption(scheme);
    await expect(page.locator("html")).toHaveAttribute("data-meowui-color-scheme", scheme);
    await options.focus();
    await page.keyboard.press("Enter");
    await expect(check).toBeVisible();
    await expect(check).toHaveCSS("background-color", colors[scheme]);
    await page.screenshot({
      path: info.outputPath(`ottr-workspace-${scheme}.png`),
      animations: "disabled",
    });
    await page.keyboard.press("Escape");
    await expect(check).toBeHidden();
    await expect(options).toBeFocused();
    await expect(draft).toHaveValue("Keep this draft");
  }
  await page.emulateMedia({ colorScheme: "dark" });
  await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption("auto");
  await expect(page.locator("html")).toHaveCSS("color-scheme", /dark/);
});
