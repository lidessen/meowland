import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/canvas.html?story=assistant-complete");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
});

test("accepted submission consumes its own snapshot while newer text and files remain", async ({
  page,
}) => {
  const composer = page.locator('[data-meowui-part="assistant-composer/root"]');
  const draft = page.getByRole("textbox", { name: "Message", exact: true });
  const send = page.getByRole("button", { name: "Send message", exact: true });
  const files = composer.locator('input[type="file"]');
  await draft.fill("Submitted text");
  await files.setInputFiles({
    name: "submitted.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("submitted"),
  });
  await send.click();
  await expect(send).toBeDisabled();
  await draft.fill("A newer draft");
  await files.setInputFiles({
    name: "next.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("new"),
  });
  await expect(send).toBeEnabled();
  await expect(draft).toHaveValue("A newer draft");
  await expect(composer.getByRole("link", { name: /submitted.txt/ })).toHaveCount(0);
  await expect(composer.getByRole("link", { name: /next.txt/ })).toBeVisible();
  await draft.focus();
  await draft.press("Shift+Enter");
  await expect(draft).toHaveValue("A newer draft\n");
  await page.getByRole("button", { name: "Toggle disabled" }).click();
  await expect(draft).toBeDisabled();
  await expect(composer).toContainText("The host has disabled input.");
  await page.getByRole("button", { name: "Toggle disabled" }).click();
  await expect(draft).toBeEnabled();
  await expect(draft).toHaveValue("A newer draft\n");
});

test("same-tree updates preserve ancestor context, process disclosure and reading anchors", async ({
  page,
}) => {
  const viewport = page.locator('[data-meowui-part="assistant-view/viewport"]');
  const oldRow = page.locator('[data-assistant-message-id="message-7"]');
  const disclosure = oldRow.locator("details");
  await disclosure.locator("summary").click();
  await expect(disclosure).toHaveAttribute("open", "");
  await disclosure.locator("summary").focus();
  await page
    .getByRole("button", { name: "Append result" })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(disclosure.locator("summary")).toBeFocused();
  await expect(disclosure).toHaveAttribute("open", "");
  await expect(disclosure.locator("summary")).toBeInViewport();
  await expect(page.locator("[data-assistant-context]")).toHaveText("Ancestor context retained");
  await page.screenshot({ path: test.info().outputPath("assistant-wide-process.png") });

  await viewport.evaluate((element) => {
    element.scrollTop = 350;
  });
  await page.waitForTimeout(60);
  const top = await viewport.evaluate((element) => element.scrollTop);
  await page.getByRole("button", { name: "Append result" }).click();
  await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeCloseTo(top, 0);
  await viewport.evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.waitForTimeout(60);
  const before = await page.locator('[data-assistant-message-id="message-0"]').boundingBox();
  await page.getByRole("button", { name: "Load older messages" }).click();
  await expect(page.locator('[data-assistant-message-id^="older-"]')).toHaveCount(1);
  const after = await page.locator('[data-assistant-message-id="message-0"]').boundingBox();
  expect(Math.abs(after!.y - before!.y)).toBeLessThan(2);
  await expect(page.locator("[data-assistant-context]")).toHaveText("Ancestor context retained");
  await page.getByRole("button", { name: "Back to latest" }).click();
  await expect
    .poll(() =>
      viewport.evaluate(
        (element) => element.scrollHeight - element.clientHeight - element.scrollTop,
      ),
    )
    .toBeLessThan(2);
});

test("activity changes modality at narrow widths without remounting the draft or details", async ({
  page,
}) => {
  const draft = page.getByRole("textbox", { name: "Message", exact: true });
  await draft.fill("Preserve while reviewing");
  const activity = page.getByRole("button", { name: "Activity", exact: true });
  await activity.click();
  const panel = page.getByRole("dialog", { name: "Activity", exact: true });
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: /Review the reading experience/ }).click();
  await expect(panel).toContainText("The goal is still open");
  await page.screenshot({ path: test.info().outputPath("assistant-wide-detail.png") });
  await panel.getByRole("button", { name: "Refresh details" }).click();
  await expect(panel).toContainText("previously read details remain visible");
  await expect(panel).toContainText("The goal is still open");
  await page.setViewportSize({ width: 390, height: 700 });
  await expect.poll(() => panel.evaluate((element) => element.matches(":modal"))).toBe(true);
  await expect(panel).toContainText("The goal is still open");
  await panel.getByRole("button", { name: "Back to activity" }).click();
  await expect(panel.getByRole("button", { name: /Review the reading experience/ })).toBeFocused();
  await panel
    .getByRole("textbox", { name: /^Answer: Which reading layout/ })
    .fill("Keep one reading column");
  await panel
    .locator('[data-meowui-part="assistant-question/root"]')
    .first()
    .getByRole("button", { name: "Answer", exact: true })
    .click();
  await expect(panel).toContainText("Host accepted: Keep one reading column");
  await page.keyboard.press("Escape");
  await expect(panel).not.toBeVisible();
  await expect(activity).toBeFocused();
  await expect(draft).toHaveValue("Preserve while reviewing");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  await page.getByRole("combobox", { name: "Appearance" }).selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-meowui-color-scheme", "dark");
  // Let the existing standard-theme color transitions settle before a static comparison.
  await page.waitForTimeout(250);
  await page.screenshot({ path: test.info().outputPath("assistant-narrow-dark.png") });
});
