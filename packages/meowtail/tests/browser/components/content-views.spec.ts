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
  const copy = block.getByRole("button", { name: "Copy code", exact: true });
  await copy.click();
  await expect(block.getByRole("status")).toHaveText("Copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(original);
  // Success shows on the button itself: a check and the name "Copied", then back to copy.
  const copied = block.getByRole("button", { name: "Copied", exact: true });
  await expect(copied.locator('[data-meowui-part="code-block/copiedIcon"]')).toBeVisible();
  await expect(copied.locator('[data-meowui-part="code-block/copyIcon"]')).toBeHidden();
  await expect(copy).toBeVisible({ timeout: 4000 });
  // The success text is announced, not drawn as an extra line.
  expect(
    await block.getByRole("status").evaluate((element) => element.getBoundingClientRect().height),
  ).toBeLessThanOrEqual(1);

  // Header text and code share one start edge.
  const language = await block.locator('[data-meowui-part="code-block/language"]').boundingBox();
  const content = await block.locator('[data-meowui-part="code-block/code"]').boundingBox();
  expect(Math.abs(language!.x - content!.x)).toBeLessThanOrEqual(1);
  await expect(block.locator('[data-meowui-part="code-block/language"]')).toHaveText("TypeScript");
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
  await terminal.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(terminal.getByRole("status")).toHaveText("Copied");
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
  const trigger = page.getByRole("button", { name: "Preview image", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Blue circle example" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close image preview" })).toBeFocused();
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
  await expect(page.getByText('"<content>\\nsecond line"', { exact: true })).toHaveCount(0);
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(summary.locator("..")).toHaveJSProperty("open", true);
  await expect(summary.locator("button")).toHaveCount(0);
  const copy = page.getByRole("button", { name: "Copy nested", exact: true });
  await copy.focus();
  await page.keyboard.press("Enter");
  expect(JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))).toEqual({
    text: "<content>\nsecond line",
    items: [1, 2],
  });
  await expect(summary.locator("..")).toHaveJSProperty("open", true);
  await page.getByRole("button", { name: "Copy Copy failure example", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Copy failed" })).toBeVisible();
});
