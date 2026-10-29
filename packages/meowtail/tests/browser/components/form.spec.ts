import { expect, test } from "@playwright/test";

test("form validates natively, reports busy once and keeps edits through errors and cancel", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=form");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const host = page.getByRole("textbox", { name: "Host" });
  const save = page.getByRole("button", { name: "Save connection" });
  const summary = page.locator('[data-meowui-part="form/error"]').getByRole("alert");

  // Invalid: the first invalid control gets focus and the summary names it.
  await save.click();
  await expect(host).toBeFocused();
  await expect(summary).toContainText("Host:");
  await host.fill("not a url");
  await expect(summary).toBeHidden();
  await save.click();
  await expect(host).toBeFocused();

  // A hidden native carrier hands focus to its visible control.
  await host.fill("https://fail.example.com");
  await save.click();
  await expect(page.getByRole("button", { name: /^Region/ })).toBeFocused();
  await expect(summary).toContainText("Region:");

  await page.getByRole("button", { name: /^Region/ }).click();
  await page.getByRole("option", { name: "Europe" }).click();
  await save.click();
  const busy = page.getByRole("button", { name: "Saving connection…" });
  await expect(busy).toHaveAttribute("aria-disabled", "true");
  await expect(page.locator("form")).toHaveAttribute("aria-busy", "true");
  // A second submit while busy is not reported; the error below arrives once.
  await page.keyboard.press("Enter");
  await expect(summary).toHaveText("Could not reach https://fail.example.com.");
  await expect(host).toHaveValue("https://fail.example.com");

  await host.fill("https://api.example.com");
  await save.click();
  await expect(page.getByText("Saved Production (eu).")).toBeVisible();
  await expect(summary).toBeHidden();

  // Cancel never submits and never resets.
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Cancelled; your edits are still here.")).toBeVisible();
  await expect(host).toHaveValue("https://api.example.com");
});
