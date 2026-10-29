import { expect, test } from "@playwright/test";

test("pagination keeps focus through a boundary and while the host loads", async ({ page }) => {
  await page.goto("/canvas.html?story=pagination");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");

  const runs = page.getByRole("navigation", { name: "Build run pages" });
  await expect(runs.getByRole("button", { name: "Page 1", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await runs.getByRole("button", { name: "Page 23", exact: true }).click();
  await expect(page.getByText("Showing 111–112 of 112 runs.")).toBeVisible();
  // Reaching the last page leaves Next focused but inert instead of dropping focus to the body.
  const next = runs.getByRole("button", { name: "Next" });
  await runs.getByRole("button", { name: "Page 22", exact: true }).click();
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(next).toHaveAttribute("aria-disabled", "true");
  await expect(next).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(runs.getByRole("button", { name: "Page 23", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );

  const activity = page.getByRole("navigation", { name: "Activity pages" });
  const activityNext = activity.getByRole("button", { name: "Next" });
  await expect(activity.getByText("Page 1")).toBeVisible();
  await activityNext.click();
  await expect(activity).toHaveAttribute("aria-busy", "true");
  await expect(activityNext).toBeFocused();
  await expect(activity).not.toHaveAttribute("aria-busy", "true");
  await expect(activity.getByText("Page 2")).toBeVisible();
  await activityNext.click();
  await expect(activity.getByText("Page 3")).toBeVisible();
  await expect(activityNext).toHaveAttribute("aria-disabled", "true");
});

test("pagination controls sit on the control ladder and the current page is marked", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=pagination");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const runs = page.getByRole("navigation", { name: "Build run pages" });
  const heights = await runs
    .getByRole("button")
    .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
  expect(new Set(heights)).toEqual(new Set([36]));
  const current = runs.getByRole("button", { name: "Page 1", exact: true });
  const other = runs.getByRole("button", { name: "Page 2", exact: true });
  const background = (element: Element) => getComputedStyle(element).backgroundColor;
  expect(await current.evaluate(background)).not.toBe(await other.evaluate(background));
});

test("a narrow bar shows the page fact instead of wrapping the numbered pages", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/canvas.html?story=pagination");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const runs = page.getByRole("navigation", { name: "Build run pages" });
  await expect(runs.getByRole("list")).toBeHidden();
  await expect(runs.getByText("Page 1 of 23")).toBeVisible();
  const previous = await runs.getByRole("button", { name: "Previous" }).boundingBox();
  const next = await runs.getByRole("button", { name: "Next" }).boundingBox();
  expect(previous!.y).toBe(next!.y);
  await runs.getByRole("button", { name: "Next" }).click();
  await expect(runs.getByText("Page 2 of 23")).toBeVisible();
});
