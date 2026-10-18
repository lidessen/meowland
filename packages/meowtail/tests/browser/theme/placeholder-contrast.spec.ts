import { expect, test } from "@playwright/test";

const contrast = (foreground: number[], background: number[]) => {
  const luminance = (color: number[]) =>
    color
      .map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index]!, 0);
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
};

const rgb = (color: string) =>
  color
    .match(/[\d.]+/g)!
    .slice(0, 3)
    .map(Number);

test("placeholder ink stays readable on native inputs and the inline composer in both schemes", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=basic-quality-controls");
  await expect(page.locator("[data-basic-quality-scene]")).toBeVisible();

  for (const scheme of ["light", "dark"] as const) {
    await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption(scheme);
    const results = await page.evaluate(() => {
      const opaqueBackground = (element: HTMLElement) => {
        for (let node: HTMLElement | null = element; node; node = node.parentElement) {
          const fill = getComputedStyle(node).backgroundColor;
          if (fill.startsWith("rgb(")) return fill;
          const alpha = fill.match(/^rgba\(([^)]+)\)$/)?.[1]?.split(",")[3];
          if (alpha !== undefined && Number(alpha) >= 1) return fill;
        }
        return "rgb(255, 255, 255)";
      };
      const measure = (selector: string, role: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) return { role, ratio: 0, reason: "missing" };
        const colour = getComputedStyle(element, "::placeholder").color;
        return {
          role,
          ratio: 0,
          colour,
          background: opaqueBackground(element),
        };
      };
      return [
        measure('[data-batch1="input-placeholder"]', "native input placeholder"),
        measure('[data-batch1="composer"] textarea', "inline composer placeholder"),
      ];
    });

    for (const result of results) {
      expect(result.colour, `${scheme} ${result.role} colour`).toBeTruthy();
      expect(
        contrast(rgb(result.colour!), rgb(result.background!)),
        `${scheme} ${result.role} on ${result.background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  }
});
