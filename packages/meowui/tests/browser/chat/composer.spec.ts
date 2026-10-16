import { expect, test } from "@playwright/test";

test("choice selection preserves the selected value and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("http://127.0.0.1:13007/canvas.html?story=choice-select-grouped");
  const trigger = page.getByRole("button", { name: "Provider 与模型", exact: true });
  await trigger.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.getByRole("option", { name: "DeepSeek-V4-Pro", exact: true }).click();
  await expect(trigger).toContainText("DeepSeek-V4-Pro");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(page.getByRole("option", { name: /^DeepSeek-V4-Pro/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});

test("draft attachments preview and remove independently; failure preserves the newer draft", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("http://127.0.0.1:13007/canvas.html?story=composer-attachments");
  const draft = page.getByRole("textbox", { name: "工作草稿" });
  await draft.fill("先检查这两份材料。");
  const preview = page.getByRole("button", { name: "预览 工作区草图.svg", exact: true });
  await preview.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(preview).toBeFocused();
  await page.getByRole("button", { name: "移除 工作区草图.svg", exact: true }).click();
  await expect(preview).toHaveCount(0);
  await expect(draft).toHaveValue("先检查这两份材料。");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByRole("button", { name: "发送", exact: true })).toBeDisabled();
  await draft.fill("等待时继续写的新草稿。");
  await expect(page.locator("[data-submitted-snapshot]")).toContainText(
    "先检查这两份材料。 · 1 个附件",
  );
  await page.getByRole("button", { name: "模拟失败", exact: true }).click();
  await expect(draft).toHaveValue("等待时继续写的新草稿。");
  await expect(page.getByRole("button", { name: "发送", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "移除 交互评审与验收记录.md", exact: true }).click();
  await expect(page.getByRole("group", { name: "待发送附件" })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});

test("sent attachments retain viewing and download without draft removal", async ({ page }) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=attachments-sent");
  const group = page.getByRole("group", { name: "已发送材料" });
  await expect(group.getByRole("link", { name: "打开图片 工作区草图.svg" })).toBeVisible();
  await expect(group.locator("a[download]")).toHaveAttribute("download", "交互评审与验收记录.md");
  await expect(group.getByRole("button", { name: /^移除/ })).toHaveCount(0);
});
