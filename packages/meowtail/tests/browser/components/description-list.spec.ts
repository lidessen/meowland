import { expect, test } from "@playwright/test";

test("description groups share columns and reflow by local width without replacing content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto("/canvas.html?story=description-list-composition");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const wide = page.locator("[data-description-wide]");
  const narrow = page.locator("[data-description-narrow] dl");
  const geometry = (list: typeof wide) =>
    list.evaluate((node) =>
      [...node.children].map((group) => {
        const term = group.querySelector("dt")!;
        const value = group.querySelector("dd")!;
        return {
          term: term.getBoundingClientRect().toJSON(),
          value: value.getBoundingClientRect().toJSON(),
        };
      }),
    );
  const wideGroups = await geometry(wide);
  expect(wideGroups.every(({ term, value }) => value.left > term.right)).toBe(true);
  expect(new Set(wideGroups.map(({ value }) => value.left)).size).toBe(1);
  const narrowGroups = await geometry(narrow);
  expect(
    narrowGroups.every(({ term, value }) => value.top >= term.bottom && value.left === term.left),
  ).toBe(true);
  expect(
    await wide.evaluate((node) =>
      [...node.children].every(
        (group) =>
          group.tagName === "DIV" &&
          group.children[0]?.tagName === "DT" &&
          group.children[1]?.tagName === "DD",
      ),
    ),
  ).toBe(true);

  const input = page.getByRole("textbox", { name: "Note draft", exact: true });
  const original = await input.elementHandle();
  await input.fill("Keep the same draft while the region becomes narrow");
  const action = page.getByRole("button", { name: "Check reference", exact: true });
  await action.focus();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await wide.evaluate((node) => ((node as HTMLElement).style.maxWidth = "20rem"));
  await expect
    .poll(async () =>
      (await geometry(wide)).every(
        ({ term, value }) => value.top >= term.bottom && value.left === term.left,
      ),
    )
    .toBe(true);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("Keep the same draft while the region becomes narrow");
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
  expect(await wide.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  await wide.evaluate((node) => (node as HTMLElement).style.removeProperty("max-width"));
  await page.setViewportSize({ width: 390, height: 330 });
  await expect
    .poll(async () => (await geometry(wide)).every(({ term, value }) => value.top >= term.bottom))
    .toBe(true);
  await expect(input).toHaveValue("Keep the same draft while the region becomes narrow");
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await action.focus();
  await expect(action).toBeInViewport();
  expect(await wide.evaluate((node) => node.scrollTop)).toBe(0);
});
