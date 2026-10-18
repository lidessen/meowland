import { expect, test } from "@playwright/test";

test("story feedback is visible while inspection stays collapsed", async ({ page }) => {
  await page.goto("/?story=buttons&width=fluid");
  const frame = page.frameLocator("#canvas");
  await expect(frame.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await frame.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.locator("#latest-event")).toBeVisible();
  await expect(page.locator("#latest-event")).not.toBeEmpty();
  await expect(page.locator("#inspection-panel")).not.toHaveAttribute("open", "");
  await page.getByRole("button", { name: "Reset sample" }).click();
  await expect(page.locator("#latest-event")).toBeHidden();
});
