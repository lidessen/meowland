import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

test("tool sequence keeps targets visible and reveals results with keyboard disclosure", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/canvas.html?story=chat-tool-sequence");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const group = page.locator("summary").filter({ hasText: "Read, search · 3 calls" });
  await group.focus();
  await page.keyboard.press("Enter");
  const tool = page.locator("summary").filter({ hasText: "src/search/request.ts" });
  await expect(tool).toBeVisible();
  const result = page.getByText("const request = await fetch(url, options);", { exact: true });
  await expect(result).not.toBeVisible();
  await tool.focus();
  await page.keyboard.press("Enter");
  await expect(result).toBeVisible();
  for (const state of ["Running", "Waiting", "Error", "Unconfirmed result"]) {
    await expect(page.getByText(state, { exact: true })).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});

async function settledAppearance(control: Locator) {
  return control.evaluate(async (element) => {
    await Promise.allSettled(element.getAnimations().map((animation) => animation.finished));
    const style = getComputedStyle(element);
    return [
      style.backgroundColor,
      style.color,
      style.borderRadius,
      style.padding,
      style.fontSize,
      style.minHeight,
      style.boxShadow,
      style.cursor,
    ];
  });
}

test(`Studio message action composition preserves button variants and disabled behavior`, async ({
  page,
}) => {
  await page.goto("/canvas.html?story=buttons");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.mouse.move(0, 0);
  const primary = await settledAppearance(
    page.getByRole("button", { name: "Save changes", exact: true }),
  );
  const outline = await settledAppearance(
    page.getByRole("button", { name: "View diff", exact: true }),
  );
  await page.goto("/canvas.html?story=message-parts");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.mouse.move(0, 0);
  expect(
    await settledAppearance(page.getByRole("button", { name: "Review suggestion", exact: true })),
  ).toEqual(primary);
  expect(
    await settledAppearance(page.getByRole("button", { name: "View diff", exact: true })),
  ).toEqual(outline);
  const unavailable = page.getByRole("button", { name: "Waiting for check results", exact: true });
  const disabled = await settledAppearance(unavailable);
  await unavailable.hover();
  expect(await settledAppearance(unavailable)).toEqual(disabled);
  await expect(unavailable).toBeDisabled();
  await page.getByRole("button", { name: "Handle later", exact: true }).click();
  await expect(page.locator("[data-message-feedback]")).toHaveText(
    "Kept the check record; you can come back later",
  );
});

test("composer failure and recovery preserve the user's draft", async ({ page }) => {
  await page.goto("/canvas.html?story=composer-recovery");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  await input.fill("First check the input, then check failure recovery.");
  await page.getByRole("button", { name: "Submit check", exact: true }).click();
  await expect(input).toBeEnabled();
  await expect(page.getByRole("button", { name: "Submit check", exact: true })).toBeDisabled();
  await input.fill("The next draft segment added while waiting.");
  await expect(page.locator("[data-composer-submitted]")).toHaveText(
    "This submission: First check the input, then check failure recovery.",
  );
  await page.getByRole("button", { name: "Simulate failure", exact: true }).click();
  await expect(page.locator("[data-composer-feedback]")).toContainText("Not completed yet");
  const recover = page.getByRole("button", { name: "Recover and keep editing", exact: true });
  await expect(recover).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(input).toBeEnabled();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("The next draft segment added while waiting.");
  await page.getByRole("button", { name: "Submit check", exact: true }).click();
  await expect(page.locator("[data-composer-submitted]")).toHaveText(
    "This submission: The next draft segment added while waiting.",
  );
  await page.getByRole("button", { name: "Simulate success", exact: true }).click();
  await expect(page.locator("[data-composer-feedback]")).toContainText("sample completed");
});

test("all execution states retain real expand and collapse behavior", async ({ page }) => {
  await page.goto("/canvas.html?story=execution-details");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  for (const state of ["running", "complete", "waiting", "error"]) {
    const details = page.locator(`details[data-tool-state="${state}"]`);
    await expect(details).toHaveJSProperty("open", false);
    await details.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(details).toHaveJSProperty("open", true);
    await expect(details.locator('[data-meowui-part="chat-tool-call/body"]')).toBeVisible();
    await page.keyboard.press("Space");
    await expect(details).toHaveJSProperty("open", false);
  }
  const sources = page.locator('[data-meowui-part="chat-sources/root"]');
  await expect(sources).toHaveCount(1);
  await expect(sources).toHaveJSProperty("open", true);
  await expect(sources.getByRole("link")).toHaveCount(2);
});
