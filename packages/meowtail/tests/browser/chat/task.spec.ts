import { expect, test } from "@playwright/test";

test("task facts update without interpreting a missing reply as failure or replacing actions", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=chat-task-boundaries");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const task = page.locator('[data-meowui-part="chat-task/root"]').first();
  const retry = page.getByRole("button", { name: "Retry task", exact: true });
  const retryNode = await retry.elementHandle();
  await expect(task).toHaveAttribute("data-execution-state", "queued");
  await expect(task.getByRole("progressbar")).toHaveCount(0);
  await page.getByRole("button", { name: "Start task", exact: true }).click();
  await expect(task).toHaveAttribute("data-execution-state", "running");
  await expect(task.getByRole("progressbar")).toHaveAttribute("value", "1");
  await page.getByRole("button", { name: "Complete execution", exact: true }).click();
  await expect(task).toHaveAttribute("data-execution-state", "success");
  await expect(task).toContainText("Waiting for the author to publish the reply");
  expect(await retryNode!.evaluate((element) => element.isConnected)).toBe(true);
  await retry.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Retry intent delivered to the host.");
  await expect(task).toHaveAttribute("data-execution-state", "success");
});

test("nested task records keep long titles, statuses and footer controls within a narrow container", async ({
  page,
}) => {
  await page.setViewportSize({ width: 340, height: 420 });
  await page.goto("/canvas.html?story=chat-task-boundaries");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const tasks = page.locator('[data-meowui-part="chat-task/root"]');
  await expect(tasks).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const task of await tasks.all()) {
    expect(await task.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  }
  await page.getByRole("button", { name: "Open child task", exact: true }).focus();
  await expect(page.getByRole("button", { name: "Open child task", exact: true })).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Opened child task.");
  const cancel = page.getByRole("button", { name: "Cancel task", exact: true });
  await cancel.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("status")).toHaveText("Cancellation intent delivered to the host.");
});

test("a task inside a conversation reply keeps its facts and actions together", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/canvas.html?story=agent-workflow");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const task = page.getByRole("region", { name: "Confirm check scope", exact: true });
  await task.scrollIntoViewIfNeeded();
  const relation = await task.evaluate((element) => {
    const header = element.querySelector('[data-meowui-part="chat-task/header"]')!;
    const execution = element.querySelector('[data-meowui-part="chat-task/execution"]')!;
    return {
      gap: execution.getBoundingClientRect().top - header.getBoundingClientRect().bottom,
      expectedGap: Number.parseFloat(getComputedStyle(element).rowGap),
    };
  });
  expect(relation.gap).toBeLessThanOrEqual(relation.expectedGap + 1);
  await expect(task.getByRole("button", { name: "Tools and tasks", exact: true })).toBeInViewport();
});
