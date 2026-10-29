import { expect, test } from "@playwright/test";

test("token field adds, steps back into tokens and repairs focus after the host removes one", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=token-field");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const draft = page.getByRole("textbox", { name: "To" });
  const tokens = page.getByRole("list", { name: "Added items" }).first();

  await draft.fill("grace");
  await page.keyboard.press("Enter");
  await expect(tokens.getByRole("button", { name: "Remove Grace Hopper" })).toBeVisible();
  await expect(draft).toHaveValue("");
  await expect(draft).toBeFocused();

  // A comma ends a token as it is typed; a rejected duplicate stays in the draft.
  await draft.pressSequentially("alan,");
  await expect(tokens.getByRole("listitem")).toHaveCount(3);
  await draft.fill("ada");
  await page.keyboard.press("Enter");
  await expect(draft).toHaveValue("ada");
  await expect(page.getByText("ada is already added.")).toBeVisible();

  // An unknown entry becomes an invalid token whose name says so.
  await draft.fill("nobody");
  await page.keyboard.press("Enter");
  const invalid = tokens.getByRole("button", { name: "Remove nobody" });
  await expect(invalid).toHaveAccessibleDescription("Needs attention");

  // The first Backspace on an empty draft only moves to the last token; the next removes it.
  await page.keyboard.press("Backspace");
  await expect(invalid).toBeFocused();
  await page.keyboard.press("Backspace");
  await expect(tokens.getByRole("listitem")).toHaveCount(3);
  await expect(tokens.getByRole("button", { name: "Remove Alan Turing" })).toBeFocused();

  // Arrow keys move between tokens and back to the draft; one tab stop for all tokens.
  await page.keyboard.press("ArrowLeft");
  await expect(tokens.getByRole("button", { name: "Remove Grace Hopper" })).toBeFocused();
  await expect(tokens.locator('button[tabindex="0"]')).toHaveCount(1);
  await page.keyboard.press("End");
  await expect(draft).toBeFocused();

  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Submitted ada, grace, alan.")).toBeVisible();
});

test("a required token field blocks submission until a token exists", async ({ page }) => {
  await page.goto("/canvas.html?story=token-field");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const tokens = page.locator('[data-meowui-part="token-field/root"]').first();
  await tokens.getByRole("button", { name: "Remove Ada Lovelace" }).click();
  await expect(tokens.getByRole("listitem")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "To" })).toBeFocused();
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(/^Submitted/)).toHaveCount(0);
  expect(
    await page
      .getByRole("textbox", { name: "To" })
      .evaluate((input: HTMLInputElement) => input.validationMessage),
  ).toBe("Add at least one item.");
});
