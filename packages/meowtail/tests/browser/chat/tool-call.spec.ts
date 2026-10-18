import { expect, test } from "@playwright/test";
const part = (name: string) => `[data-meowui-part="${name}"]`;

test.beforeEach(async ({ page }) => {
  await page.goto("/canvas.html?story=tool-call-contract");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
});

test("native keyboard disclosure preserves its node, copy focus and fold across streamed data", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const tool = page.locator(part("chat-tool-call/root")).first();
  const summary = tool.locator(":scope > summary");
  await expect(tool.locator(part("chat-tool-call/output"))).not.toBeVisible();
  await summary.focus();
  await summary.press("Enter");
  await expect(tool).toHaveJSProperty("open", true);
  const output = tool.locator(part("chat-tool-call/output"));
  const copy = output.getByRole("button", { name: "复制", exact: true });
  const fold = output.locator("details");
  await fold.locator("summary").click();
  await expect(fold).toHaveJSProperty("open", true);
  await copy.focus();
  await copy.evaluate((node) => {
    node.setAttribute("data-stable-copy", "yes");
  });
  await page
    .getByRole("button", { name: "Update output", exact: true })
    .evaluate((node: HTMLButtonElement) => node.click());
  await expect(copy).toBeFocused();
  await expect(copy).toHaveAttribute("data-stable-copy", "yes");
  await expect(tool).toHaveJSProperty("open", true);
  await expect(fold).toHaveJSProperty("open", true);
  await expect(tool).toHaveAttribute("data-tool-state", "running");
  await copy.click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("new streamed line");
  await expect(tool.locator("script")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => (window as Window & { untrustedExecuted?: boolean }).untrustedExecuted,
    ),
  ).toBeUndefined();
});

test("missing and empty results stay distinct; retry and cancel only emit host intents", async ({
  page,
}) => {
  const tool = page.locator(part("chat-tool-call/root")).first();
  await tool.locator(":scope > summary").click();
  await page.getByRole("button", { name: "Empty output", exact: true }).click();
  await expect(tool.locator(part("chat-tool-call/output"))).toContainText("Empty output");
  await page.getByRole("button", { name: "Missing output", exact: true }).click();
  await expect(tool.locator(part("chat-tool-call/output"))).not.toBeVisible();
  await tool.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(tool.getByRole("button", { name: "Retry", exact: true })).toBeDisabled();
  await expect(tool).toHaveAttribute("data-tool-state", "queued");
  await expect(page.locator("[data-tool-intents]")).toHaveText("Retry intent");
  await page.getByRole("button", { name: "Toggle retry", exact: true }).click();
  await expect(tool.getByRole("button", { name: "Retry", exact: true })).toHaveCount(0);
  await tool.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator("[data-tool-intents]")).toHaveText("Cancel intent");
  await expect(tool).toHaveAttribute("data-tool-state", "queued");
});

test("long tool names, status facts and bilingual payloads fit a narrow container", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 600 });
  const tool = page.locator(part("chat-tool-call/root")).first();
  await tool.locator(":scope > summary").click();
  await page.getByRole("button", { name: "Update output", exact: true }).click();
  const overflow = await tool.evaluate((root) => {
    const edge = root.getBoundingClientRect().right;
    return Array.from(root.querySelectorAll("*"))
      .filter((element) => element.getBoundingClientRect().width > 0)
      .some((element) => element.getBoundingClientRect().right > edge + 1);
  });
  expect(overflow).toBe(false);
  await expect(tool.getByRole("button", { name: "Retry", exact: true })).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("tool-call-narrow.png"), fullPage: true });
});

test("a missing reactive target summary occupies no layout space", async ({ page }) => {
  const summary = page.locator(part("chat-tool-call/summary")).first();
  await expect(summary).toBeVisible();
  await page.getByRole("button", { name: "Missing summary", exact: true }).click();
  await expect(summary).toBeHidden();
  expect(await summary.evaluate((node) => node.getBoundingClientRect().width)).toBe(0);
});

test("a long target yields width before a short action and state fact wrap", async ({ page }) => {
  const tool = page.locator("[data-wide-tool]");
  const geometry = await tool.evaluate((root) => {
    const label = root.querySelector('[data-meowui-part="chat-tool-call/label"]')!;
    const status = root.querySelector('[data-meowui-part="chat-tool-call/status"]')!;
    const target = root.querySelector('[data-meowui-part="chat-tool-call/summary"]')!;
    return {
      labelHeight: label.getBoundingClientRect().height,
      statusHeight: status.getBoundingClientRect().height,
      line: Number.parseFloat(getComputedStyle(label).lineHeight),
      targetWidth: target.clientWidth,
      targetScroll: target.scrollWidth,
    };
  });
  expect(geometry.labelHeight).toBeLessThanOrEqual(geometry.line + 1);
  expect(geometry.statusHeight).toBeLessThanOrEqual(geometry.line + 1);
  expect(geometry.targetWidth).toBeGreaterThan(0);
  expect(geometry.targetScroll).toBeGreaterThan(geometry.targetWidth);
  await tool.screenshot({ path: test.info().outputPath("tool-call-wide-target.png") });
});
