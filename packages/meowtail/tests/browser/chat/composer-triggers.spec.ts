import { expect, test, type Page } from "@playwright/test";

const open = async (page: Page, width = 1000) => {
  await page.setViewportSize({ width, height: 760 });
  await page.goto("/canvas.html?story=composer-extensions");
  const draft = page.getByRole("textbox", { name: "Task draft" });
  await draft.click();
  return draft;
};
const list = (page: Page, name: string) => page.getByRole("listbox", { name });
const log = (page: Page) => page.locator("#composer-extensions-log");
const status = (page: Page) => page.locator('[data-meowui-part="chat-composer/suggestionStatus"]');

test("a mention list keeps focus in the draft and follows one keyboard order", async ({ page }) => {
  const draft = await open(page);
  await draft.pressSequentially("Fix @");
  const tasks = list(page, "Tasks");
  await expect(tasks).toBeVisible();
  await expect(draft).toBeFocused();
  await expect(draft).toHaveAttribute("aria-controls", (await tasks.getAttribute("id"))!);
  const options = tasks.getByRole("option");
  await expect(options).toHaveCount(4);
  await expect(options.first()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown");
  await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(draft).toHaveAttribute(
    "aria-activedescendant",
    (await options.nth(1).getAttribute("id"))!,
  );
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await expect(options.nth(3)).toHaveAttribute("aria-selected", "true");
  await draft.pressSequentially("pag");
  await expect(options).toHaveCount(1);
  await expect(page.locator('[data-meowui-part="chat-composer/announcement"]')).toHaveText(
    "Tasks: 1 suggestion",
  );
  // Enter accepts instead of submitting; the host records the reference.
  await page.keyboard.press("Enter");
  await expect(draft).toHaveValue("Fix @t-105 ");
  await expect(tasks).toBeHidden();
  await expect(draft).not.toHaveAttribute("aria-controls");
  await expect(page.getByText("@t-105", { exact: true })).toBeVisible();
  await expect(log(page)).toHaveText("Nothing sent yet.");
  // Escape dismisses this occurrence only; a new @ opens again.
  await draft.pressSequentially("and @");
  await expect(tasks).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tasks).toBeHidden();
  await draft.pressSequentially("a");
  await expect(tasks).toBeHidden();
  await draft.pressSequentially(" @");
  await expect(tasks).toBeVisible();
  // Moving the caret away closes the list; deleting the token drops the host's reference.
  await page.keyboard.press("Escape");
  await draft.fill("Fix it");
  await expect(page.getByText("@t-105", { exact: true })).toBeHidden();
});

test("Enter submits through the form unless a list holds an active option", async ({ page }) => {
  const draft = await open(page);
  // Blocked: an empty draft swallows Enter without a newline.
  await page.keyboard.press("Enter");
  await expect(draft).toHaveValue("");
  await draft.pressSequentially("First line");
  await page.keyboard.press("Shift+Enter");
  await draft.pressSequentially("second @nothing");
  await expect(status(page)).toHaveText("No matching task");
  // An empty list has no active option, so Enter falls through to submit.
  await page.keyboard.press("Enter");
  await expect(log(page)).toContainText("First line\nsecond @nothing");
  await expect(draft).toHaveValue("");
});

test("an asynchronous path lookup shows loading, drops stale answers and keeps drilling", async ({
  page,
}) => {
  const draft = await open(page);
  await draft.pressSequentially("Read #");
  const files = list(page, "Files");
  await expect(status(page)).toHaveText("Loading suggestions");
  await draft.pressSequentially("src/c");
  await expect(files.getByRole("option")).toHaveCount(3);
  await expect(files.getByRole("option").first()).toHaveText("src/chat/");
  await page.keyboard.press("Tab");
  await expect(draft).toHaveValue("Read #src/chat/");
  await expect(draft).toBeFocused();
  await expect(files.getByRole("option")).toHaveCount(2);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(draft).toHaveValue("Read #src/chat/composer.tsx ");
});

test("a command acts and removes its text; commands only open at the start", async ({ page }) => {
  const draft = await open(page);
  await draft.pressSequentially("Note /de");
  await expect(list(page, "Commands")).toBeHidden();
  await draft.fill("");
  await draft.pressSequentially("/de");
  const commands = list(page, "Commands");
  await expect(commands.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(draft).toHaveValue("");
  await expect(page.getByRole("button", { name: /Model/ })).toContainText("Deep");
  await draft.pressSequentially("/pl");
  await page.keyboard.press("Enter");
  await expect(draft).toHaveValue("Plan first: ");
});

test("a pasted trigger does not open a list and choices follow a pending send", async ({
  page,
}) => {
  const draft = await open(page);
  await page.evaluate(() => navigator.clipboard?.writeText?.("@t-1").catch(() => {}));
  await draft.evaluate((element: HTMLTextAreaElement) => {
    element.value = "@t-1";
    element.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertFromPaste" }));
  });
  await expect(list(page, "Tasks")).toBeHidden();
  await draft.fill("Ship it");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /Model/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Model/ })).toBeEnabled();
});

for (const scheme of ["light", "dark"] as const) {
  test(`the suggestion list fits the surface in ${scheme} at phone width`, async ({
    page,
  }, info) => {
    await page.emulateMedia({ colorScheme: scheme });
    const draft = await open(page, 390);
    await draft.pressSequentially("@");
    const panel = page.locator('[data-meowui-part="popover/panel"]:popover-open');
    await expect(panel).toBeVisible();
    const surface = page.locator('[data-meowui-part="chat-composer/surface"]');
    // Positioning settles on the next frames; wait for the panel to take the surface's width.
    await expect
      .poll(async () => {
        const [a, b] = [await panel.boundingBox(), await surface.boundingBox()];
        return Math.abs(a!.width - b!.width) <= 2 && a!.x + a!.width <= 390;
      })
      .toBe(true);
    await page.screenshot({ path: info.outputPath(`composer-triggers-${scheme}.png`) });
  });
}
