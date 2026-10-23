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
    .getByRole("button", { name: "Append tool output", exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(output).toContainText(
    "New output: A text update <img src=x onerror=alert(1)> stays inert.",
  );
  await expect(fold).toHaveAttribute("open", "");
  await expect(tool).toHaveAttribute("open", "");
  await expect(summary).toBeFocused();
  await expect(part.locator("img,script")).toHaveCount(0);
  await expect(part).toHaveCount(1);
  await expect(page.locator('[data-assistant-part-id="delegate-task"]')).toContainText(
    "Waiting for the public reply does not mean execution failed.",
  );
});

test("host retry and cancel intents update their own stable tool records", async ({ page }) => {
  const failedPart = page.locator('[data-assistant-part-id="retry-tool"]');
  const failed = failedPart.locator('[data-meowui-part="chat-tool-call/root"]');
  await failed.locator(":scope > summary").click();
  await failedPart.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(failed).toHaveAttribute("data-tool-state", "running");
  await expect(failedPart.getByRole("button", { name: "Retry", exact: true })).toBeDisabled();
  await expect(failed).toHaveAttribute("data-tool-state", "success");
  await expect(failed).toHaveAttribute("open", "");
  await expect(failedPart.getByRole("button", { name: "Retry", exact: true })).toBeHidden();
  await expect(failedPart).toContainText("Index read completed in this local fixture.");

  const runningPart = page.locator('[data-assistant-part-id="inspect-tool"]');
  await runningPart.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(runningPart.locator('[data-meowui-part="chat-tool-call/root"]')).toHaveAttribute(
    "data-tool-state",
    "cancelled",
  );
  await expect(runningPart.getByRole("button", { name: "Cancel", exact: true })).toBeHidden();
  await expect(runningPart).toContainText("The user canceled further checks");
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
    .getByRole("button", { name: "Append tool output", exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(summary).toBeFocused();
  await expect(draft).toHaveValue("Keep the next question while tools update");
  const task = page.locator('[data-assistant-part-id="delegate-task"]');
  await expect(task.locator('[data-meowui-part="chat-task/root"]')).toHaveAttribute(
    "data-execution-state",
    "success",
  );
  await expect(task).toContainText("Public reply not received");
  await expect(task.getByRole("progressbar")).toHaveAccessibleName("Execution check 5 / 5 items");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});

test("your messages gather over the transcript and jump back to the chosen turn", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=agent-workflow");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  // The trigger's name follows its state (Your messages / Close your messages).
  const trigger = page.locator('[data-meowui-part="assistant-view/historyTrigger"] button');
  const column = page.getByRole("navigation", { name: "Your messages", exact: true });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toHaveAccessibleName("Your messages");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toHaveAccessibleName("Close your messages");
  await expect(column.getByRole("button")).toHaveText([
    "Check the chat components for long content and narrow containers.",
    "Should the review cover anything else?",
    "Did the keyboard review come back?",
    "And the index read that failed earlier?",
  ]);
  await expect(column.getByRole("button").last()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
  const before = await page.evaluate(() => scrollY);
  await trigger.click();
  await column.getByRole("button", { name: "Should the review cover anything else?" }).click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator('[data-assistant-message-id="ask-scope"]')).toBeInViewport();
  // Only the transcript scrolls; the host page keeps its position.
  expect(await page.evaluate(() => scrollY)).toBe(before);
});

test("a finished reply offers copy and the host's feedback intents", async ({ page }) => {
  await page.goto("/canvas.html?story=agent-workflow");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const reply = page.locator('[data-assistant-message-id="index"]');
  await expect(reply.getByRole("button", { name: "Copy reply", exact: true })).toBeVisible();
  await reply.getByRole("button", { name: "Good response", exact: true }).click();
  await expect(page.getByRole("status").first()).toContainText('"good" for index');
});
