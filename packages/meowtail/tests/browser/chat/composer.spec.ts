import { expect, test } from "@playwright/test";

test("choice selection preserves the selected value and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/canvas.html?story=choice-select-grouped");
  const trigger = page.getByRole("button", { name: "Provider and model", exact: true });
  await trigger.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.getByRole("option", { name: "DeepSeek-V4-Pro", exact: true }).click();
  await expect(trigger).toContainText("DeepSeek-V4-Pro");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(page.getByRole("option", { name: /^DeepSeek-V4-Pro/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});

test("draft attachments preview and remove independently; failure preserves the newer draft", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/canvas.html?story=composer-attachments");
  const draft = page.getByRole("textbox", { name: "Working draft" });
  await draft.fill("Check these two materials first.");
  const preview = page.getByRole("button", { name: "Preview workspace-sketch.svg", exact: true });
  await preview.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(preview).toBeFocused();
  await page.getByRole("button", { name: "Remove workspace-sketch.svg", exact: true }).click();
  await expect(preview).toHaveCount(0);
  await expect(draft).toHaveValue("Check these two materials first.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("button", { name: "Send", exact: true })).toBeDisabled();
  await draft.fill("A new draft written while waiting.");
  await expect(page.locator("[data-submitted-snapshot]")).toContainText(
    "This submission: Check these two materials first. · 1 attachment",
  );
  await page.getByRole("button", { name: "Simulate failure", exact: true }).click();
  await expect(draft).toHaveValue("A new draft written while waiting.");
  await expect(page.getByRole("button", { name: "Send", exact: true })).toBeEnabled();
  await page
    .getByRole("button", {
      name: "Remove interaction-review-and-acceptance-notes.md",
      exact: true,
    })
    .click();
  await expect(page.getByRole("group", { name: "Pending attachments" })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});

test("sent attachments retain viewing and download without draft removal", async ({ page }) => {
  await page.goto("/canvas.html?story=attachments-sent");
  const group = page.getByRole("group", { name: "Sent materials" });
  await expect(group.getByRole("link", { name: "Open image workspace-sketch.svg" })).toBeVisible();
  await expect(group.locator("a[download]")).toHaveAttribute(
    "download",
    "interaction-review-and-acceptance-notes.md",
  );
  await expect(group.getByRole("button", { name: /^Remove/ })).toHaveCount(0);
});
