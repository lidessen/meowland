import { expect, test } from "@playwright/test";

test("a composed workspace preserves its draft while its body scrolls and its toolbar stays reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/canvas.html?story=workspace-composition");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const workspace = page.locator("[data-workspace-composition]");
  const body = workspace.locator('[data-meowui-part="page-frame/body"]');
  const toolbar = page.getByRole("toolbar", { name: "组合工作区工具栏" });
  const input = page.getByRole("textbox", { name: "组合草稿" });
  const original = await input.elementHandle();
  await input.fill("A draft across nested layouts");
  await page.getByRole("button", { name: "展开检查项", exact: true }).click();
  await expect(page.locator("[data-workspace-composition-content] > p")).toHaveCount(28);
  await page.setViewportSize({ width: 390, height: 330 });
  const last = page.getByRole("button", { name: "检查末尾草稿", exact: true });
  await last.focus();
  await expect(last).toBeInViewport();
  await expect(toolbar).toBeInViewport();
  expect(await body.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await last.click();
  await expect(page.getByRole("status")).toContainText("已检查当前本地草稿。");
  const options = page.getByRole("button", { name: "检查选项", exact: true });
  await options.click();
  const panel = page.locator("#workspace-review-options");
  await expect(panel).toBeVisible();
  await expect(panel).toBeInViewport();
  await panel.getByRole("button", { name: "检查当前草稿" }).focus();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(options).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 720 });
  await input.focus();
  await expect(input).toHaveValue("A draft across nested layouts");
  expect(await original!.evaluate((element) => element.isConnected)).toBe(true);
});
