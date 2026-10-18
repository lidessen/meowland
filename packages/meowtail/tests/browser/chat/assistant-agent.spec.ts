import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/canvas.html?story=agent-workflow-assistant");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
});

test("tool payload updates preserve the native disclosures, focused summary and inert content", async ({
  page,
}) => {
  const part = page.locator('[data-assistant-part-id="inspect-tool"]');
  const tool = part.locator('[data-meowui-part="chat-tool-call/root"]');
  const output = part.locator('[data-meowui-part="chat-tool-call/output"]');
  const fold = output.locator('[data-meowui-part="output-block/fold"]');
  const summary = fold.locator("summary");
  await expect(tool).toHaveAttribute("open", "");
  await summary.click();
  await expect(fold).toHaveAttribute("open", "");
  await summary.focus();
  await page
    .getByRole("button", { name: "追加工具输出", exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(output).toContainText(
    "New output: 中文更新 <img src=x onerror=alert(1)> stays inert.",
  );
  await expect(fold).toHaveAttribute("open", "");
  await expect(tool).toHaveAttribute("open", "");
  await expect(summary).toBeFocused();
  await expect(part.locator("img,script")).toHaveCount(0);
  await expect(part).toHaveCount(1);
  await expect(page.locator('[data-assistant-part-id="delegate-task"]')).toContainText(
    "等待公开答复，不表示执行失败。",
  );
});

test("host retry and cancel intents update their own stable tool records", async ({ page }) => {
  const failedPart = page.locator('[data-assistant-part-id="retry-tool"]');
  const failed = failedPart.locator('[data-meowui-part="chat-tool-call/root"]');
  await failed.locator(":scope > summary").click();
  await failedPart.getByRole("button", { name: "重试", exact: true }).click();
  await expect(failed).toHaveAttribute("data-tool-state", "running");
  await expect(failedPart.getByRole("button", { name: "重试", exact: true })).toBeDisabled();
  await expect(failed).toHaveAttribute("data-tool-state", "success");
  await expect(failed).toHaveAttribute("open", "");
  await expect(failedPart.getByRole("button", { name: "重试", exact: true })).toBeHidden();
  await expect(failedPart).toContainText("Index read completed in this local fixture.");

  const runningPart = page.locator('[data-assistant-part-id="inspect-tool"]');
  await runningPart.getByRole("button", { name: "取消", exact: true }).click();
  await expect(runningPart.locator('[data-meowui-part="chat-tool-call/root"]')).toHaveAttribute(
    "data-tool-state",
    "cancelled",
  );
  await expect(runningPart.getByRole("button", { name: "取消", exact: true })).toBeHidden();
  await expect(runningPart).toContainText("用户已取消后续检查");
  await expect(failed).toHaveAttribute("data-tool-state", "success");
});

test("narrow assistant keeps independent task facts, keyboard disclosure and draft", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 700 });
  const draft = page.getByRole("textbox", { name: "Message", exact: true });
  await draft.fill("Keep the next question while tools update");
  const part = page.locator('[data-assistant-part-id="inspect-tool"]');
  const tool = part.locator('[data-meowui-part="chat-tool-call/root"]');
  const summary = tool.locator(":scope > summary");
  await summary.focus();
  await summary.press("Enter");
  await expect(tool).not.toHaveAttribute("open", "");
  await summary.press("Space");
  await expect(tool).toHaveAttribute("open", "");
  await page
    .getByRole("button", { name: "追加工具输出", exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(summary).toBeFocused();
  await expect(draft).toHaveValue("Keep the next question while tools update");
  const task = page.locator('[data-assistant-part-id="delegate-task"]');
  await expect(task.locator('[data-meowui-part="chat-task/root"]')).toHaveAttribute(
    "data-execution-state",
    "success",
  );
  await expect(task).toContainText("公开答复未收到");
  await expect(task.getByRole("progressbar")).toHaveAccessibleName("执行检查 5 / 5 项");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});
