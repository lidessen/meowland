import { expect, test } from "@playwright/test";

test("MeowUI appearance changes presentation without replacing content or interaction state", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=design-language");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await expect(page.getByRole("combobox", { name: "Design", exact: true })).toHaveCount(0);
  await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption("light");
  const input = page.getByLabel("Project name", { exact: true });
  await input.fill("Keep the project being edited");
  const originalInput = await input.elementHandle();
  expect(originalInput).not.toBeNull();
  const process = page.locator("details").filter({ hasText: "Checked 3 kinds of components" });
  await process.locator("summary").click();
  await expect(process).toHaveJSProperty("open", true);
  const button = page.getByRole("button", { name: "Save", exact: true });
  const light = await button.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.backgroundColor, style.borderRadius, style.boxShadow];
  });

  await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption("dark");
  await expect
    .poll(() =>
      button.evaluate((element) => {
        const style = getComputedStyle(element);
        return [style.backgroundColor, style.borderRadius, style.boxShadow];
      }),
    )
    .not.toEqual(light);
  expect(await input.evaluate((element, original) => element === original, originalInput)).toBe(
    true,
  );
  await expect(input).toHaveValue("Keep the project being edited");
  await expect(process).toHaveJSProperty("open", true);

  await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption("light");
  expect(await input.evaluate((element, original) => element === original, originalInput)).toBe(
    true,
  );
  await expect(input).toHaveValue("Keep the project being edited");
  await expect(process).toHaveJSProperty("open", true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => button.evaluate((element) => getComputedStyle(element).transitionDuration))
    .toBe("0s");
  await originalInput?.dispose();
});

test("MeowUI appearance persists across story navigation and gallery reset clears only story state", async ({
  page,
}) => {
  await page.goto("/?story=fields");
  const canvas = page.frameLocator("#canvas");
  await expect(canvas.locator("#story-state")).toHaveAttribute("data-status", "ready");
  // The gallery owns the one appearance control; the embedded canvas draws none of its own.
  await expect(canvas.getByRole("combobox", { name: "Appearance", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Appearance", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Appearance" })
    .getByRole("radio", { name: "Dark" })
    .check();
  await page.keyboard.press("Escape");
  await canvas.getByLabel("Project name", { exact: true }).fill("Unsaved rename");
  await page.locator("#reset").click();
  await expect(canvas.getByLabel("Project name", { exact: true })).toHaveValue("Meowland");
  await expect(canvas.locator("html")).toHaveAttribute("data-meowui-color-scheme", "dark");
  await page.goto("/?story=dialog");
  await expect(canvas.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await expect(canvas.locator("html")).toHaveAttribute("data-meowui-color-scheme", "dark");
});

test("MeowUI local form validation, composer callback and attachment preview work", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=fields");
  const name = page.getByLabel("Project name", { exact: true });
  await name.fill("  ");
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toBeFocused();
  await name.fill("Redesign");
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await expect(page.locator("#project-feedback")).toContainText('Saved "Redesign"');
  await page.getByRole("button", { name: "Restore initial values", exact: true }).click();
  await expect(name).toHaveValue("Meowland");
  await expect(name).not.toHaveAttribute("aria-invalid");
  await page.goto("/canvas.html?story=design-language");
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Keep the input in place");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.locator("[data-feedback]")).toContainText(
    "Component submit callback: Keep the input in place",
  );
  await expect(page.getByRole("textbox", { name: "Message", exact: true })).toHaveValue(
    "Keep the input in place",
  );
  await page.goto("/canvas.html?story=content-carriers");
  const preview = page.getByRole("button", {
    name: "Preview component-design-language-and-interaction-states.md",
    exact: true,
  });
  await preview.click();
  await expect(page.getByRole("dialog")).toContainText("Built-in Markdown example");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(preview).toBeFocused();
});

test("MeowUI dialog fits a narrow viewport and restores keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/canvas.html?story=dialog");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const trigger = page.getByRole("button", { name: "Open confirmation dialog", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
  expect(
    await dialog.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return (
        bounds.left >= 0 &&
        bounds.right <= innerWidth &&
        element.scrollWidth <= element.clientWidth + 1
      );
    }),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
