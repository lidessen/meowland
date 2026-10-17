import { expect, test } from "@playwright/test";

test("code highlighting loads asynchronously without changing source or copy", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/canvas.html?story=code-block");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const block = page.locator('[data-meowui-part="code-block/root"]').first();
  const code = block.locator("code");
  const original = await code.textContent();
  await expect(code.locator('span[style*="token-keyword"]').first()).toBeVisible();
  expect(await code.textContent()).toBe(original);
  await block.getByRole("button", { name: "复制代码", exact: true }).click();
  await expect(block.getByRole("status")).toHaveText("已复制");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(original);
});

test("output folds preserve terminal tail and copy full raw payload", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/canvas.html?story=output-blocks");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const terminal = page.locator('[data-meowui-part="terminal-block/root"]');
  const fold = terminal.locator("details").first();
  await expect(fold).toHaveJSProperty("open", false);
  await expect(terminal.getByText("case 24: passed", { exact: true })).toBeVisible();
  await fold.locator("summary").click();
  await expect(fold).toHaveJSProperty("open", true);
  await terminal.getByRole("button", { name: "复制", exact: true }).click();
  await expect(terminal.getByRole("status")).toHaveText("已复制");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("\u001b[32mPASS\u001b[0m");
  expect(copied).toContain("case 24: passed");
});

test("JSON expands lazily and lightbox returns keyboard focus", async ({ page }) => {
  await page.goto("/canvas.html?story=content-views");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const options = page.getByText("options: Object(2)", { exact: true });
  await expect(page.getByText('theme: "DeepSeek"', { exact: true })).toHaveCount(0);
  await options.click();
  await expect(page.getByText('theme: "DeepSeek"', { exact: true })).toBeVisible();
  const trigger = page.getByRole("button", { name: "预览图片", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "蓝色圆形示例" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "关闭图片预览" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("JSON keyboard expansion and copy keep branch identity and failure visible", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/canvas.html?story=json-tree-states");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const summary = page
    .locator('summary[data-meowui-part="json-tree/summary"]')
    .filter({ hasText: "nested: Object(2)" });
  await expect(page.getByText('"<内容>\\n第二行"', { exact: true })).toHaveCount(0);
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(summary.locator("..")).toHaveJSProperty("open", true);
  await expect(summary.locator("button")).toHaveCount(0);
  const copy = page.getByRole("button", { name: "复制 nested", exact: true });
  await copy.focus();
  await page.keyboard.press("Enter");
  expect(JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))).toEqual({
    text: "<内容>\n第二行",
    items: [1, 2],
  });
  await expect(summary.locator("..")).toHaveJSProperty("open", true);
  await page.getByRole("button", { name: "复制 复制失败示例", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "复制失败" })).toBeVisible();
});
