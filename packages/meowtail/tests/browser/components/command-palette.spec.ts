import { expect, test } from "@playwright/test";

test("command palette filters, runs with Enter and returns focus to the opener first", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=command-palette");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const opener = page.getByRole("button", { name: "Open command palette" });
  await opener.click();

  const dialog = page.getByRole("dialog", { name: "Command palette" });
  const search = dialog.getByRole("combobox", { name: "Search commands" });
  await expect(search).toBeFocused();
  const options = dialog.getByRole("option");
  await expect(options).toHaveCount(7);
  // The first enabled match is active.
  await expect(dialog.getByRole("option", { name: /New conversation/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(dialog.getByRole("group", { name: "Workspace" })).toBeVisible();

  // Every term must match; keywords count.
  await search.fill("open work");
  await expect(dialog.getByRole("option", { name: /Open file/ })).toBeVisible();
  await expect(dialog.getByRole("option", { name: /Open terminal/ })).toBeVisible();
  await expect(dialog.getByRole("group", { name: "View" })).toBeHidden();
  await expect(dialog.getByRole("status")).toHaveText("2 commands");
  await search.fill("shell");
  await expect(dialog.getByRole("option", { name: /Open terminal/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Ran Open terminal.")).toBeVisible();
  await expect(opener).toBeFocused();
});

test("command palette skips disabled commands, wraps and reopens with an empty query", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=command-palette");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("button", { name: "Open command palette" }).focus();
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  const search = dialog.getByRole("combobox", { name: "Search commands" });
  await expect(search).toBeFocused();

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  // "Stop the running reply" is disabled and skipped.
  await expect(dialog.getByRole("option", { name: /Open file/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await expect(dialog.getByRole("option", { name: /Toggle side panel/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await search.fill("zzz");
  await expect(dialog.getByText("No matching commands")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByText("No command run yet.")).toBeVisible();
  await page.getByRole("button", { name: "Open command palette" }).click();
  await expect(search).toHaveValue("");
  await expect(dialog.getByRole("option")).toHaveCount(7);
  // A pointer choice runs too.
  await dialog.getByRole("option", { name: /Reload workspace/ }).click();
  await expect(page.getByText("Ran Reload workspace.")).toBeVisible();
});
