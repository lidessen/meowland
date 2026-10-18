import { expect, test } from "@playwright/test";

test("long content and action groups stay within a narrow container in a wide window", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 760 });
  await page.goto("/canvas.html?story=content-boundaries");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const scope = page.locator("[data-content-boundaries]");
  const draft = page.getByRole("textbox", { name: "WORKSPACEIDENTIFIER".repeat(8) });
  const original = await draft.elementHandle();
  await draft.fill("Keep this draft through resize and dynamic details");

  const assertContained = async () => {
    expect(
      await scope.evaluate((node) =>
        [node, ...node.querySelectorAll("[data-meowui-part]")].every(
          (element) =>
            element.matches("input, textarea, select") ||
            element.scrollWidth <= element.clientWidth + 1,
        ),
      ),
    ).toBe(true);
    const headers = scope.locator('[data-meowui-part="card-header/root"]');
    expect(
      await headers.evaluateAll((nodes) =>
        nodes.every((node) => {
          const title = node.querySelector('[data-meowui-part="card-title/root"]')!;
          return title.getBoundingClientRect().width > 0;
        }),
      ),
    ).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  };

  for (const scheme of ["light", "dark"]) {
    await page.getByRole("combobox", { name: "外观", exact: true }).selectOption(scheme);
    await assertContained();
  }
  await page.getByRole("button", { name: "Toggle details", exact: true }).click();
  await expect(scope.locator('[data-meowui-part="list-row/description"]')).toHaveText(
    "WORKSPACEIDENTIFIER".repeat(8),
  );
  await assertContained();
  await page.setViewportSize({ width: 390, height: 330 });
  await assertContained();
  await expect(draft).toHaveValue("Keep this draft through resize and dynamic details");
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);

  const inspect = page.getByRole("button", { name: "Inspect record", exact: true });
  await page.getByRole("button", { name: "Toggle details", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(inspect).toBeFocused();
  expect(
    await inspect.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= innerHeight;
    }),
  ).toBe(true);
});
