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

  // The chart styles restyle Pele's marks by class name, which is not an API: pin each one and
  // check the rule reaches it.
  for (const [name, selector] of [
    ["pie", ".pele-slices"],
    ["pie", ".pele-slice-labels[fill]"],
    ["pie", ".pele-legend rect"],
    ["xychart", ".pele-grid"],
    ["xychart", ".pele-axis"],
    ["xychart", ".pele-axis-labels"],
    ["xychart", ".pele-bars rect"],
    ["xychart", ".pele-line circle"],
  ] as const)
    expect(await page.locator(`${canvas(name)} ${selector}`).count()).toBeGreaterThan(0);
  const chart = await page.evaluate(() => {
    const style = (selector: string) => getComputedStyle(document.querySelector(selector)!);
    return {
      ring: style('[data-diagram="pie"] .pele-slices').maskImage,
      dot: style('[data-diagram="pie"] .pele-legend rect').rx,
      bar: style('[data-diagram="xychart"] .pele-bars rect').transform,
    };
  });
  expect(chart.ring).toContain("radial-gradient");
  expect(chart.dot).toBe("50%");
  expect(chart.bar).not.toBe("none");

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
