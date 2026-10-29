import { expect, test } from "@playwright/test";

test("tree view follows the tree keyboard model with one tab stop", async ({ page }) => {
  await page.goto("/canvas.html?story=tree-view");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const tree = page.getByRole("tree", { name: "Project files" });
  const item = (name: string) => tree.getByRole("treeitem", { name, exact: true });

  // The selected item holds the only tab stop.
  await expect(tree.locator('[role="treeitem"][tabindex="0"]')).toHaveCount(1);
  await expect(item("button.tsx 2 KB")).toHaveAttribute("tabindex", "0");
  await item("button.tsx 2 KB").focus();

  await page.keyboard.press("ArrowDown");
  await expect(item("tree-view.tsx 9 KB")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(tree.getByRole("treeitem", { name: /^components/ })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(tree.getByRole("treeitem", { name: /^components/ })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await page.keyboard.press("ArrowRight");
  await expect(tree.getByRole("treeitem", { name: /^components/ })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await page.keyboard.press("ArrowRight");
  await expect(item("button.tsx 2 KB")).toBeFocused();

  // End reaches the last visible item; a letter jumps to the next label starting with it.
  await page.keyboard.press("End");
  await expect(item("package.json")).toBeFocused();
  await page.keyboard.press("d");
  await expect(tree.getByRole("treeitem", { name: /^docs/ })).toBeFocused();

  // A disabled item is reachable but not selectable.
  await page.keyboard.press("ArrowDown");
  await expect(item(".env No access")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Selected button.")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Selected package.")).toBeVisible();
  await expect(item("package.json")).toHaveAttribute("aria-selected", "true");

  // The chevron is pointer-only and toggles without leaving the item.
  await tree
    .getByRole("treeitem", { name: /^docs/ })
    .locator('[data-meowui-part="tree-view/toggle"]')
    .first()
    .click();
  await expect(tree.getByRole("treeitem", { name: /^docs/ })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(item("package.json")).toHaveAttribute("aria-selected", "true");
  await expect(tree.locator("button, a, input")).toHaveCount(0);
});

test("focus moves to a visible ancestor when the host collapses its branch", async ({ page }) => {
  await page.goto("/canvas.html?story=tree-view");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const tree = page.getByRole("tree", { name: "Plan" });
  await tree.getByRole("treeitem", { name: "Write tests" }).click();
  await expect(tree.getByRole("treeitem", { name: "Write tests" })).toBeFocused();
  // The host collapses everything while focus is still on the nested item (a script click
  // does not move focus to the button).
  await page.evaluate(() =>
    (
      [...document.querySelectorAll("button")].find(
        (button) => button.textContent === "Collapse all",
      ) as HTMLButtonElement
    ).click(),
  );
  await expect(tree.getByRole("treeitem", { name: /^Build/ })).toBeFocused();
});
