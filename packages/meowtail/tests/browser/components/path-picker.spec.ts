import { expect, test } from "@playwright/test";

test("path chooser preserves manual editing, cancellation, errors and keyboard focus", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=path-picker-lifecycle");
  const input = page.getByRole("textbox", { name: "Directory", exact: true });
  await input.fill("/manual");
  await input.press("Tab");
  const browse = page.getByRole("button", { name: "浏览目录…" });
  await expect(browse).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(input).not.toBeEditable();
  await expect(page.getByRole("button", { name: "正在选择…" })).toBeDisabled();
  await page.getByRole("button", { name: "Cancel selection" }).click();
  await expect(input).toHaveValue("/manual");
  await browse.click();
  await page.getByRole("button", { name: "Reject selection" }).click();
  await expect(page.getByRole("status").filter({ hasText: "未能打开选择器" })).toBeVisible();
  await expect(input).toHaveValue("/manual");
  await browse.click();
  await page.getByRole("button", { name: "Resolve selection" }).click();
  await expect(input).toHaveValue("/selected");
  await expect(page.getByRole("button", { name: "Resolve selection" })).toBeFocused();
});

test("parent updates, disabled state, readonly state and unmount suppress stale selections", async ({
  page,
}) => {
  for (const action of ["Change parent", "Disable", "Read only", "Unmount"]) {
    await page.goto("/canvas.html?story=path-picker-lifecycle");
    await page.getByRole("button", { name: "浏览目录…" }).click();
    await page.getByRole("button", { name: action, exact: true }).click();
    await page.getByRole("button", { name: "Resolve selection" }).click();
    await expect(page.locator('output[aria-label="Current path"]')).toHaveText(
      action === "Change parent" ? "/parent" : "/original",
    );
  }
});
