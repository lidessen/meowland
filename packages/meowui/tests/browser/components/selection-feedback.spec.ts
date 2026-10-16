import { expect, test } from "@playwright/test";

test("nested activity text shares one decorative sweep and respects reduced motion", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=selection-feedback");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const compound = page.locator(".compound-shimmer");
  await expect(compound.locator('[aria-hidden="true"][inert]')).toHaveCount(1);
  await expect(compound).toHaveAttribute("data-active", "true");
  await page.getByRole("button", { name: "切换活动状态" }).click();
  await expect(compound.locator('[aria-hidden="true"]')).toBeHidden();
  await page.getByRole("button", { name: "切换活动状态" }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(compound.locator('[aria-hidden="true"]')).toBeHidden();
  await expect(compound).toContainText("正在检查");
});

test("controlled segmented choices survive native reset with internal and external form owners", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=segmented-forms");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  for (const [groupName, buttonName, formId] of [
    ["内部选择", "重置内部表单", "segmented-inside"],
    ["外部选择", "重置外部表单", "segmented-outside"],
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
  await page.goto("http://127.0.0.1:13007/canvas.html?story=selection-feedback");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("radio", { name: "舒适" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "紧凑" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "自动" })).toBeDisabled();
  const originalRadio = await page.getByRole("radio", { name: "舒适" }).elementHandle();
  await page.getByRole("button", { name: "切换选择锁定" }).click();
  await expect(page.getByRole("radio", { name: "舒适" })).toBeDisabled();
  await expect(page.getByRole("radio", { name: "紧凑" })).toBeDisabled();
  await expect(page.getByRole("radio", { name: "紧凑" })).toBeChecked();
  await page.getByRole("button", { name: "切换选择锁定" }).click();
  await expect(page.getByRole("radio", { name: "舒适" })).toBeEnabled();
  await page.getByRole("radio", { name: "紧凑" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("radio", { name: "舒适" })).toBeChecked();
  expect(await originalRadio!.evaluate((node) => node.isConnected)).toBe(true);
  const trigger = page.getByRole("button", { name: "移除样例", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "移除样例" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "确认移除" })).toBeDisabled();
  await dialog.getByRole("checkbox").focus();
  await page.keyboard.press("Space");
  await expect(dialog.getByRole("button", { name: "确认移除" })).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog.getByRole("checkbox")).not.toBeChecked();
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "确认移除" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("status").filter({ hasText: "已移除本地样例。" })).toBeVisible();
});
