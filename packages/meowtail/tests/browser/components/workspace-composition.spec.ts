import { expect, test } from "@playwright/test";

test("a composed workspace preserves its draft while its body scrolls and its page header stays reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/canvas.html?story=workspace-composition");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const workspace = page.locator("[data-workspace-composition]");
  const body = workspace.locator('[data-meowui-part="page-frame/body"]');
  const header = page.locator('[data-meowui-part="page-header/root"]');
  const input = page.getByRole("textbox", { name: "Composition draft" });
  const original = await input.elementHandle();
  await input.fill("A draft across nested layouts");
  await page.getByRole("button", { name: "Expand checks", exact: true }).click();
  await expect(page.locator('[data-workspace-composition-content] [role="listitem"]')).toHaveCount(
    28,
  );
  await page.setViewportSize({ width: 390, height: 330 });
  const last = page.getByRole("button", { name: "Check the draft at the end", exact: true });
  await last.focus();
  await expect(last).toBeInViewport();
  await expect(header).toBeInViewport();
  expect(await body.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await last.click();
  await expect(page.getByRole("status")).toContainText("Checked the current local draft.");
  const options = page.getByRole("button", { name: "Check options", exact: true });
  await options.click();
  const panel = page.locator("#workspace-review-options");
  await expect(panel).toBeVisible();
  await expect(panel).toBeInViewport();
  await panel.getByRole("button", { name: "Check current draft" }).focus();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(options).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 720 });
  await input.focus();
  await expect(input).toHaveValue("A draft across nested layouts");
  expect(await original!.evaluate((element) => element.isConnected)).toBe(true);
});
