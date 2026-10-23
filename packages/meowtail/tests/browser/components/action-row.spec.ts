import { expect, test, type Page } from "@playwright/test";

/** The geometry of each action in the sample rows, in story order. */
async function rows(page: Page) {
  return page.locator("[data-action-row-sample]").evaluateAll((nodes) =>
    nodes.map((row) => {
      const box = row.getBoundingClientRect();
      const actions = [...row.children].map((child) => {
        const rect = child.getBoundingClientRect();
        return {
          icon: child.getAttribute("data-meowui-part") === "icon-button/root",
          top: Math.round(rect.top),
          width: Math.round(rect.width),
        };
      });
      return { stacked: row.hasAttribute("data-stacked"), width: Math.round(box.width), actions };
    }),
  );
}

test("an action row keeps one line while it fits and stacks whole when it does not", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/canvas.html?story=action-row");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");

  const [wide, narrow] = await rows(page);
  expect(wide!.stacked).toBe(false);
  expect(new Set(wide!.actions.map((action) => action.top)).size).toBe(1);

  expect(narrow!.stacked).toBe(true);
  const text = narrow!.actions.filter((action) => !action.icon);
  const icons = narrow!.actions.filter((action) => action.icon);
  // Every text action is a full line of its own; the icon actions share one line.
  for (const action of text) expect(action.width).toBe(narrow!.width);
  expect(new Set(text.map((action) => action.top)).size).toBe(text.length);
  expect(new Set(icons.map((action) => action.top)).size).toBe(1);

  // A phone stacks the wide row too, and widening the window lays it out on one line again.
  await page.setViewportSize({ width: 375, height: 900 });
  await expect(page.locator("[data-action-row-sample]").first()).toHaveAttribute(
    "data-stacked",
    "",
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator("[data-action-row-sample]").first()).not.toHaveAttribute(
    "data-stacked",
    "",
  );
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  expect(errors).toEqual([]);
});
