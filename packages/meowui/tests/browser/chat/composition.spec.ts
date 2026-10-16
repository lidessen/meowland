import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

test("tool sequence keeps targets visible and reveals results with keyboard disclosure", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("http://127.0.0.1:13007/canvas.html?story=chat-tool-sequence");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const group = page.locator("summary").filter({ hasText: "读取、搜索 · 3 次调用" });
  await group.focus();
  await page.keyboard.press("Enter");
  const tool = page.locator("summary").filter({ hasText: "src/search/request.ts" });
  await expect(tool).toBeVisible();
  const result = page.getByText("const request = await fetch(url, options);", { exact: true });
  await expect(result).not.toBeVisible();
  await tool.focus();
  await page.keyboard.press("Enter");
  await expect(result).toBeVisible();
  for (const state of ["运行中", "等待中", "出错", "结果未确认"]) {
    await expect(page.getByText(state, { exact: true })).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});

async function settledAppearance(control: Locator) {
  return control.evaluate(async (element) => {
    await Promise.allSettled(element.getAnimations().map((animation) => animation.finished));
    const style = getComputedStyle(element);
    return [
      style.backgroundColor,
      style.color,
      style.borderRadius,
      style.padding,
      style.fontSize,
      style.minHeight,
      style.boxShadow,
      style.cursor,
    ];
  });
}

test(`Studio message action composition preserves button variants and disabled behavior`, async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=buttons");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.mouse.move(0, 0);
  const primary = await settledAppearance(
    page.getByRole("button", { name: "保存修改", exact: true }),
  );
  const outline = await settledAppearance(
    page.getByRole("button", { name: "查看差异", exact: true }),
  );
  await page.goto("http://127.0.0.1:13007/canvas.html?story=message-parts");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.mouse.move(0, 0);
  expect(
    await settledAppearance(page.getByRole("button", { name: "审阅建议", exact: true })),
  ).toEqual(primary);
  expect(
    await settledAppearance(page.getByRole("button", { name: "查看差异", exact: true })),
  ).toEqual(outline);
  const unavailable = page.getByRole("button", { name: "等待检查结果", exact: true });
  const disabled = await settledAppearance(unavailable);
  await unavailable.hover();
  expect(await settledAppearance(unavailable)).toEqual(disabled);
  await expect(unavailable).toBeDisabled();
  await page.getByRole("button", { name: "稍后处理", exact: true }).click();
  await expect(page.locator("[data-message-feedback]")).toHaveText("已保留检查记录，可稍后回来");
});

test("composer failure and recovery preserve the user's draft", async ({ page }) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=composer-recovery");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const input = page.getByRole("textbox", { name: "消息", exact: true });
  await input.fill("先检查输入，再检查失败恢复。");
  await page.getByRole("button", { name: "提交检查", exact: true }).click();
  await expect(input).toBeEnabled();
  await expect(page.getByRole("button", { name: "提交检查", exact: true })).toBeDisabled();
  await input.fill("等待期间追加的下一段草稿。");
  await expect(page.locator("[data-composer-submitted]")).toHaveText(
    "本次提交：先检查输入，再检查失败恢复。",
  );
  await page.getByRole("button", { name: "模拟失败", exact: true }).click();
  await expect(page.locator("[data-composer-feedback]")).toContainText("尚未完成");
  const recover = page.getByRole("button", { name: "恢复并继续编辑", exact: true });
  await expect(recover).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(input).toBeEnabled();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("等待期间追加的下一段草稿。");
  await page.getByRole("button", { name: "提交检查", exact: true }).click();
  await expect(page.locator("[data-composer-submitted]")).toHaveText(
    "本次提交：等待期间追加的下一段草稿。",
  );
  await page.getByRole("button", { name: "模拟成功", exact: true }).click();
  await expect(page.locator("[data-composer-feedback]")).toContainText("示例完成");
});

test("all execution states retain real expand and collapse behavior", async ({ page }) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=execution-details");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  for (const state of ["running", "complete", "waiting", "error"]) {
    const details = page.locator(`details[data-tool-state="${state}"]`);
    await expect(details).toHaveJSProperty("open", false);
    await details.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(details).toHaveJSProperty("open", true);
    await expect(details.locator('[data-meowui-part="chat-tool-call/body"]')).toBeVisible();
    await page.keyboard.press("Space");
    await expect(details).toHaveJSProperty("open", false);
  }
  const sources = page.locator('[data-meowui-part="chat-sources/root"]');
  await expect(sources).toHaveCount(1);
  await expect(sources).toHaveJSProperty("open", true);
  await expect(sources.getByRole("link")).toHaveCount(2);
});
