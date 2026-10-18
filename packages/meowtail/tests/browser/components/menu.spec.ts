import { expect, test } from "@playwright/test";

for (const direction of ["Tab", "Shift+Tab"])
  for (const nested of [false, true])
    test(`${direction} leaves ${nested ? "a nested" : "an action"} menu without selecting or submitting`, async ({
      page,
    }) => {
      await page.goto("/canvas.html?story=menu-navigation");
      await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
      const trigger = page.getByRole("button", { name: "Actions", exact: true });
      await trigger.press("ArrowDown");
      if (nested) {
        await page.keyboard.press("End");
        await page.keyboard.press("ArrowRight");
        await expect(page.getByRole("menuitem", { name: "Plain text" })).toBeFocused();
      } else await expect(page.getByRole("menuitem", { name: "Remove item" })).toBeFocused();
      await page.keyboard.press(direction);
      await expect(page.getByRole("menu")).toHaveCount(0);
      await expect(
        page.getByRole("button", {
          name: direction === "Tab" ? "After menu" : "Before menu",
          exact: true,
        }),
      ).toBeFocused();
      await expect(page.getByLabel("Menu action count")).toHaveText("0");
      await expect(page.getByLabel("Form submit count")).toHaveText("0");
    });

for (const direction of ["Tab", "Shift+Tab"])
  for (const retained of [false, true])
    test(`${direction} retains native order when a controlled menu ${retained ? "refuses" : "accepts"} dismissal`, async ({
      page,
    }) => {
      await page.goto("/canvas.html?story=menu-navigation");
      await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
      const trigger = page.getByRole("button", {
        name: retained ? "Retained actions" : "Controlled actions",
        exact: true,
      });
      await trigger.press("ArrowDown");
      await expect(
        page.getByRole("menuitem", {
          name: retained ? "Retained action" : "Controlled action",
          exact: true,
        }),
      ).toBeFocused();
      await page.keyboard.press(direction);
      await expect(
        page.getByRole("button", {
          name: retained
            ? direction === "Tab"
              ? "Submit form"
              : "Retained actions"
            : direction === "Tab"
              ? "After controlled menu"
              : "Before controlled menu",
          exact: true,
        }),
      ).toBeFocused();
      await expect(page.getByRole("menu")).toHaveCount(retained ? 1 : 0);
      await expect(page.getByLabel("Menu action count")).toHaveText("0");
      await expect(page.getByLabel("Form submit count")).toHaveText("0");
    });

test("nested menus enter and return by keyboard, close the chain on selection, and work by click", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=menu-nested");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const trigger = page.getByRole("button", { name: "Format actions", exact: true });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Export format", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("menuitem", { name: "Markdown", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "More formats", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("menuitem", { name: "Plain text", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("menuitem", { name: "More formats", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menuitem", { name: "Export format", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "Selected Markdown." })).toBeVisible();
  await trigger.click();
  await page.getByRole("menuitem", { name: "Export format", exact: true }).click();
  await page.getByRole("menuitem", { name: "More formats", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain text", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Selected Plain text." })).toBeVisible();
  await trigger.click();
  await page.getByRole("menuitem", { name: "Export format", exact: true }).hover();
  await expect(page.getByRole("menuitem", { name: "Markdown", exact: true })).toBeVisible();
  // The menu legitimately covers the feedback directly below its trigger.
  // Dismiss using the empty viewport edge, not an obscured underlying control.
  const viewport = page.viewportSize()!;
  await page.mouse.click(viewport.width - 16, viewport.height - 16);
  await expect(page.getByRole("menu")).toHaveCount(0);
});

test("Menu skips disabled actions, supports typeahead and returns focus after Escape and selection", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=menu-actions");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const trigger = page.getByRole("button", { name: "Actions", exact: true });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Open" })).toBeFocused();
  await expect(page.getByRole("menuitem", { name: "Export (unavailable)" })).toBeDisabled();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Copy" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Remove" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(page.getByRole("menuitem", { name: "Open" })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("menuitem", { name: "Remove" })).toBeFocused();
  await page
    .getByRole("menuitem", { name: "Remove" })
    .dispatchEvent("keydown", { key: "c", bubbles: true });
  await expect(page.getByRole("menuitem", { name: "Copy" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("menu")).toBeHidden();
  await trigger.click();
  await page.getByRole("menuitem", { name: "Copy" }).click();
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("status").filter({ hasText: "Selected Copy." })).toBeVisible();
});

test("Toast remains until its owner closes it", async ({ page }) => {
  await page.goto("/canvas.html?story=toast-feedback");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("button", { name: "Show toast" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved the local sample." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Dismiss toast" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved the local sample." })).toHaveCount(
    0,
  );
});
