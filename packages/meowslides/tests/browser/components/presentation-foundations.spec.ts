import { expect, test } from "@playwright/test";

const body = '[data-meowui-part="presentation-layout/body"]';
const list = '[data-meowui-part="presentation-list/root"]';
const diagnostic = '[data-meowui-part="presentation/diagnostic"]';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/canvas.html?story=presentation-foundations-contract");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
});

test("one, two and three columns share finite allocations with the legacy proportions", async ({
  page,
}) => {
  const picker = page.getByRole("combobox", { name: "Choose slide" });
  for (const [id, count, ratio] of [
    ["1", 1, 1],
    ["2", 2, 1],
    ["3", 3, 1],
    ["single", 1, 1],
    ["equal", 2, 1],
    ["wide-start", 2, 2],
    ["wide-end", 2, 0.5],
  ] as const) {
    await picker.selectOption(id);
    const columns = await page
      .locator(body)
      .evaluate((element) =>
        getComputedStyle(element).gridTemplateColumns.split(" ").map(Number.parseFloat),
      );
    expect(columns).toHaveLength(count);
    if (count > 1) expect(columns[0]! / columns[1]!).toBeCloseTo(ratio, 2);
    if (count === 3) expect(columns[1]! / columns[2]!).toBeCloseTo(1, 2);
    await expect(page.locator(body).locator("[data-foundation-column]")).toHaveCount(count);
    await expect(page.locator(diagnostic)).toBeHidden();
  }
  await picker.selectOption("3");
  const logicalColumns = await page
    .locator(body)
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 500 },
  ]) {
    await page.setViewportSize(viewport);
    expect(
      await page.locator(body).evaluate((element) => getComputedStyle(element).gridTemplateColumns),
    ).toBe(logicalColumns);
    await expect(page.locator(diagnostic)).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test("native lists retain markers, numbering, nesting and the shared reading scale", async ({
  page,
}) => {
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("nested");
  const outer = page.getByRole("list", { name: "Evidence summary" });
  const ordered = page.getByRole("list", { name: "Evidence sources" });
  await expect(outer).toHaveJSProperty("tagName", "UL");
  await expect(ordered).toHaveJSProperty("tagName", "OL");
  await expect(ordered).toHaveAttribute("start", "4");
  await expect(ordered).toHaveAttribute("reversed", "");
  await expect(outer.locator(":scope > li")).toHaveCount(2);
  await expect(ordered.locator(":scope > li")).toHaveCount(2);
  expect(await outer.evaluate((element) => getComputedStyle(element).listStyleType)).not.toBe(
    "none",
  );
  expect(await ordered.evaluate((element) => getComputedStyle(element).listStyleType)).toBe(
    "decimal",
  );
  const sizes = await page
    .locator(list)
    .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).fontSize));
  expect(sizes[1]).toBe(sizes[0]);
  expect(await outer.evaluate((element) => getComputedStyle(element).fontSize)).toBe(
    await page
      .locator('[data-meowui-part="presentation/slide"]')
      .evaluate((element) => getComputedStyle(element).fontSize),
  );
  await expect(page.locator(diagnostic)).toBeHidden();
});

test("long tokens wrap inside a third column while genuinely excessive list content stays diagnostic", async ({
  page,
}) => {
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("3");
  const third = page.locator('[data-foundation-column="2"]').locator(list);
  expect(await third.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
    true,
  );
  await expect(page.locator(diagnostic)).toBeHidden();
  await third
    .locator("li")
    .last()
    .evaluate((element) => {
      element.textContent = "Long reading content needs more space. ".repeat(100);
    });
  await expect(page.locator(diagnostic)).toBeVisible();
});
