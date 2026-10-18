import { expect, test, type Locator } from "@playwright/test";

const part = (name: string) => `[data-meowui-part="card-${name}/root"]`;
const header = (card: Locator) => card.locator(`:scope > ${part("header")}`);
async function boxes(card: Locator) {
  return header(card).evaluate((node) => {
    const rect = (name: string) =>
      node
        .querySelector(`[data-meowui-part="card-${name}/root"]`)
        ?.getBoundingClientRect()
        .toJSON();
    return {
      header: node.getBoundingClientRect().toJSON(),
      title: rect("title")!,
      description: rect("description"),
      action: rect("action")!,
      rowGap: Number.parseFloat(getComputedStyle(node).rowGap),
    };
  });
}

test("card actions stay beside wide copy and follow narrow copy without changing the draft", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/canvas.html?story=card-responsive-header");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const wide = page.locator('[data-card-responsive="wide"]');
  const sidebar = page.locator('[data-card-responsive="sidebar"]');
  const draft = page.getByRole("textbox", { name: "Kept draft", exact: true });
  await draft.fill("The same draft survives container reflow");
  const original = await draft.elementHandle();
  const broad = await boxes(wide);
  expect(broad.action.x).toBeGreaterThanOrEqual(broad.title.right);
  expect(broad.action.y).toBeCloseTo(broad.title.y, 0);
  const narrowSide = await boxes(sidebar);
  expect(narrowSide.action.y).toBeGreaterThanOrEqual(narrowSide.description!.bottom);
  expect(narrowSide.title.width).toBeCloseTo(narrowSide.header.width, 0);
  await page.setViewportSize({ width: 390, height: 844 });
  const narrow = await boxes(wide);
  expect(narrow.action.y).toBeGreaterThanOrEqual(narrow.description!.bottom);
  expect(narrow.title.width).toBeCloseTo(narrow.header.width, 0);
  await expect(draft).toHaveValue("The same draft survives container reflow");
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
  const actions = header(sidebar).getByRole("button");
  await actions.first().focus();
  await page.keyboard.press("Tab");
  await expect(actions.nth(1)).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("intrinsic cards retain readable content and optional descriptions leave no empty row", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/canvas.html?story=card-responsive-header");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  for (const name of ["button", "intrinsic", "nested"]) {
    const card = page.locator(`[data-card-responsive="${name}"]`);
    expect(
      await card.evaluate((node) => {
        const title = node.querySelector('[data-meowui-part="card-title/root"]')!;
        return (
          title.clientWidth > 0 &&
          title.scrollWidth <= title.clientWidth + 1 &&
          node.scrollWidth <= node.clientWidth + 1
        );
      }),
    ).toBe(true);
  }
  const titleOnly = page.locator('[data-card-responsive="title-only"]');
  const broad = await boxes(titleOnly);
  expect(broad.header.height).toBeCloseTo(Math.max(broad.title.height, broad.action.height), 0);
  await page.setViewportSize({ width: 390, height: 360 });
  const narrow = await boxes(titleOnly);
  expect(narrow.action.y).toBeGreaterThanOrEqual(narrow.title.bottom);
  expect(narrow.header.height).toBeCloseTo(
    narrow.title.height + narrow.rowGap + narrow.action.height,
    0,
  );
  const buttonCard = page.locator('button[data-card-responsive="button"]');
  await buttonCard.focus();
  await expect(buttonCard).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
