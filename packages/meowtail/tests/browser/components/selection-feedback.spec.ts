import { expect, test } from "@playwright/test";

test("nested activity text shares one decorative sweep and respects reduced motion", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=selection-feedback");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const compound = page.locator(".compound-shimmer");
  await expect(compound.locator('[aria-hidden="true"][inert]')).toHaveCount(1);
  await expect(compound).toHaveAttribute("data-active", "true");
  await page.getByRole("button", { name: "Toggle active state" }).click();
  await expect(compound.locator('[aria-hidden="true"]')).toBeHidden();
  await page.getByRole("button", { name: "Toggle active state" }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(compound.locator('[aria-hidden="true"]')).toBeHidden();
  await expect(compound).toContainText("Checking");
});

test("controlled segmented choices survive native reset with internal and external form owners", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=segmented-forms");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  for (const [groupName, buttonName, formId] of [
    ["Inner choice", "Reset inner form", "segmented-inside"],
    ["Outer choice", "Reset outer form", "segmented-outside"],
  ]) {
    const group = page.getByRole("group", { name: groupName });
    await group.getByRole("radio", { name: "B", exact: true }).check();
    await page.getByRole("button", { name: buttonName }).click();
    await expect(group.getByRole("radio", { name: "B", exact: true })).toBeChecked();
    await expect(group.getByRole("radio", { name: "A", exact: true })).not.toBeChecked();
    expect(
      await page
        .locator(`#${formId}`)
        .evaluate((form) => new FormData(form as HTMLFormElement).get("mode")),
    ).toBe("b");
  }
});
test("segmented radio keyboard skips disabled choice and confirmation requires acknowledgement", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=selection-feedback");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("radio", { name: "Comfortable" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Compact" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "Automatic" })).toBeDisabled();
  const originalRadio = await page.getByRole("radio", { name: "Comfortable" }).elementHandle();
  await page.getByRole("button", { name: "Toggle selection lock" }).click();
  await expect(page.getByRole("radio", { name: "Comfortable" })).toBeDisabled();
  await expect(page.getByRole("radio", { name: "Compact" })).toBeDisabled();
  await expect(page.getByRole("radio", { name: "Compact" })).toBeChecked();
  await page.getByRole("button", { name: "Toggle selection lock" }).click();
  await expect(page.getByRole("radio", { name: "Comfortable" })).toBeEnabled();
  await page.getByRole("radio", { name: "Compact" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("radio", { name: "Comfortable" })).toBeChecked();
  expect(await originalRadio!.evaluate((node) => node.isConnected)).toBe(true);
  const trigger = page.getByRole("button", { name: "Remove example", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Remove example" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Confirm removal" })).toBeDisabled();
  await dialog.getByRole("checkbox").focus();
  await page.keyboard.press("Space");
  await expect(dialog.getByRole("button", { name: "Confirm removal" })).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog.getByRole("checkbox")).not.toBeChecked();
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Confirm removal" }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("status").filter({ hasText: "Removed the local example." }),
  ).toBeVisible();
});
