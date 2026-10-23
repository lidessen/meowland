import { expect, test } from "@playwright/test";

const diagram = (name: string) => `[data-diagram="${name}"]`;
const canvas = (name: string) => `${diagram(name)} [data-meowui-part="mermaid-diagram/canvas"]`;

test("diagrams draw on the theme, follow the scheme in place and update from a Signal", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto("/canvas.html?story=mermaid-diagram");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");

  for (const name of ["flowchart", "sequence", "state", "pie"]) {
    await expect(page.locator(diagram(name))).toHaveAttribute("data-state", "ready");
    await expect(page.locator(`${canvas(name)} > svg`)).toBeVisible();
    await expect(
      page.locator(`${diagram(name)} [data-meowui-part="mermaid-diagram/source"]`),
    ).toBeHidden();
  }

  // Shapes take the overlay rung; flipping the scheme repaints the same node without a redraw.
  const shape = page
    .locator(
      `${canvas("flowchart")} svg .pele-nodes rect, ${canvas("flowchart")} svg .pele-nodes path`,
    )
    .first();
  await shape.evaluate((node) => ((node as Element & { marker?: boolean }).marker = true));
  const fill = () => shape.evaluate((node) => getComputedStyle(node).fill);
  const light = await fill();
  await page.evaluate(() =>
    document.documentElement.setAttribute("data-meowui-color-scheme", "dark"),
  );
  await expect.poll(fill).not.toBe(light);
  expect(await shape.evaluate((node) => (node as Element & { marker?: boolean }).marker)).toBe(
    true,
  );
  await page.evaluate(() =>
    document.documentElement.setAttribute("data-meowui-color-scheme", "light"),
  );

  // Text inside pie slices takes inverse ink: this pins the one Pele class the theme relies on.
  await expect(page.locator(`${canvas("pie")} .pele-slice-labels[fill]`)).toHaveCount(1);

  // A Signal source redraws in place.
  const nodes = () => page.locator(`${canvas("live")} svg .pele-nodes > *`).count();
  const before = await nodes();
  await page.locator("[data-diagram-add-step]").click();
  await expect.poll(nodes).toBeGreaterThan(before);
  await expect(page.locator(`${canvas("live")} svg`)).toContainText("Publish");

  expect(errors).toEqual([]);
});

test("a failed or oversized diagram shows one error line and its source", async ({ page }) => {
  await page.goto("/canvas.html?story=mermaid-diagram");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  for (const name of ["invalid", "limited"]) {
    const root = page.locator(diagram(name));
    await expect(root).toHaveAttribute("data-state", "error");
    await expect(root.locator('[data-meowui-part="mermaid-diagram/error"]')).toBeVisible();
    await expect(root.locator('[data-meowui-part="mermaid-diagram/error"]')).not.toBeEmpty();
    await expect(root.locator('[data-meowui-part="mermaid-diagram/source"]')).toBeVisible();
    await expect(root.locator('[data-meowui-part="mermaid-diagram/canvas"]')).toBeHidden();
  }
});
