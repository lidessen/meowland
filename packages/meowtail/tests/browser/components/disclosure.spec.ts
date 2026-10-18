import { expect, test } from "@playwright/test";

test("Disclosure uses native keyboard expansion, isolates nested state and reports toggles", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=disclosure");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const details = page.locator('[data-disclosure="execution"]');
  const summary = details.locator(":scope > summary");
  await expect(details).toHaveJSProperty("open", false);
  await expect(page.locator('[data-disclosure="open"]')).toHaveJSProperty("open", true);
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveJSProperty("open", true);
  await expect(page.locator("[data-disclosure-status]")).toHaveText("Execution details expanded");
  const nested = page.locator('[data-disclosure="nested"]');
  await nested.locator("summary").click();
  await expect(nested).toHaveJSProperty("open", true);
  await summary.focus();
  await page.keyboard.press("Space");
  await expect(details).toHaveJSProperty("open", false);
  await expect(page.locator("[data-disclosure-status]")).toHaveText("Execution details collapsed");
  await page.keyboard.press("Enter");
  await expect(nested).toHaveJSProperty("open", true);
  await expect(nested.locator("p")).toBeVisible();
});
