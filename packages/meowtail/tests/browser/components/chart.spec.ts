import { expect, test } from "@playwright/test";

test("chart reads each category from the keyboard and carries every value in a table", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=chart");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const figure = page.getByRole("figure", { name: "Tasks completed by team" });
  const plot = figure.getByRole("group", { name: "Tasks completed by team" });
  await expect(plot).toHaveAccessibleDescription(/arrow keys/);
  // The drawing itself is hidden from assistive technology; the wrapper is the focus target.
  await expect(figure.locator("svg[aria-hidden='true']").first()).toBeAttached();
  await expect(figure.getByRole("list", { name: "Legend" }).getByRole("listitem")).toHaveCount(3);
  await expect(figure.locator('[data-meowui-part="chart/bar"]')).toHaveCount(12);

  await plot.focus();
  await page.keyboard.press("ArrowRight");
  const live = figure.getByRole("status");
  await expect(live).toHaveText("Design. January: 42, February: 48, March: 51");
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowLeft");
  await expect(live).toHaveText("Support. January: 38, February: 44, March: No value");
  await expect(figure.locator('[data-meowui-part="chart/tooltip"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(figure.locator('[data-meowui-part="chart/tooltip"]')).toBeHidden();

  await figure.getByText("Show data").click();
  const table = figure.getByRole("table", { name: "Tasks completed by team" });
  await expect(table.getByRole("row")).toHaveCount(5);
  await expect(table.getByRole("row", { name: /Support/ })).toContainText("No value");
});

test("line charts keep their marks through host updates and fit the container", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=chart");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const figure = page.getByRole("figure", { name: "Response time" });
  const line = figure.locator('[data-meowui-part="chart/line"]').first();
  await line.evaluate((element) => {
    (element as unknown as { marked: boolean }).marked = true;
  });
  const before = await line.getAttribute("d");
  await page.getByRole("button", { name: "New week" }).click();
  await expect(line).not.toHaveAttribute("d", before!);
  // Same element: the update moved the mark instead of replacing the drawing.
  expect(
    await line.evaluate((element) => (element as unknown as { marked?: boolean }).marked),
  ).toBe(true);
  const svg = figure.locator('[data-meowui-part="chart/svg"]');
  const box = (await svg.boundingBox())!;
  const plot = (await figure.getByRole("group", { name: "Response time" }).boundingBox())!;
  expect(Math.abs(box.width - plot.width)).toBeLessThanOrEqual(1);
  // One series needs no legend; two do.
  await expect(figure.getByRole("list", { name: "Legend" })).toBeVisible();
  await expect(
    page
      .getByRole("figure", { name: "Monthly active readers" })
      .getByRole("list", { name: "Legend" }),
  ).toBeHidden();
});
