import { expect, test } from "@playwright/test";

test("autocomplete keeps focus in the input, accepts with Enter and leaves free text valid", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=autocomplete");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const input = page.getByRole("combobox", { name: "Path", exact: true });
  const list = page.getByRole("listbox", { name: "Suggestions" }).first();

  await input.fill("comp");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await expect(list.getByRole("option")).toHaveCount(3);
  // Typing never activates an option, so Enter cannot accept what the reader did not choose.
  await expect(input).not.toHaveAttribute("aria-activedescendant");

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  const active = list.getByRole("option", { name: /button\.tsx/ });
  await expect(active).toHaveAttribute("aria-selected", "true");
  await expect(input).toHaveAttribute("aria-activedescendant", (await active.getAttribute("id"))!);
  await expect(input).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(input).toHaveValue("src/components/button.tsx");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Accepted src/components/button.tsx.")).toBeVisible();

  // Escape closes the list and keeps the text; ArrowUp wraps to the last option.
  await input.fill("src");
  await page.keyboard.press("ArrowUp");
  await expect(list.getByRole("option").last()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Escape");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(input).toHaveValue("src");

  // A pointer choice keeps focus in the input.
  await input.fill("readme");
  await list.getByRole("option", { name: /README/ }).click();
  await expect(input).toHaveValue("README.md");
  await expect(input).toBeFocused();

  // Text that matches nothing stays as typed.
  await input.fill("docs/new-file.md");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Tab");
  await expect(input).toHaveValue("docs/new-file.md");
});

test("autocomplete reports loading and an empty result beside the list", async ({ page }) => {
  await page.goto("/canvas.html?story=autocomplete");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const input = page.getByRole("combobox", { name: "Environment variable" });
  await input.fill("api");
  await expect(page.getByText("Loading suggestions")).toBeVisible();
  await expect(page.getByRole("option", { name: "API_URL" })).toBeVisible();
  await expect(page.getByText("Loading suggestions")).toBeHidden();
  await input.fill("nothing");
  await expect(page.getByText("No matching variables")).toBeVisible();
});
