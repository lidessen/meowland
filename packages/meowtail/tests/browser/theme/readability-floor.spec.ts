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

test("metadata and warning text keep the normal-text contrast floor in both schemes", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=app-shell");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");

  for (const scheme of ["light", "dark"] as const) {
    await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption(scheme);
    const pairs = await page.evaluate(() => {
      const background = (element: HTMLElement) => {
        for (let node: HTMLElement | null = element; node; node = node.parentElement) {
          const fill = getComputedStyle(node).backgroundColor;
          if (fill.startsWith("rgb(")) return fill;
          const alpha = fill.match(/^rgba\(([^)]+)\)$/)?.[1]?.split(",")[3];
          if (alpha !== undefined && Number(alpha) >= 1) return fill;
        }
        return "rgb(255, 255, 255)";
      };
      return [
        ["status", '[data-meowui-part="chat-status/label"]'],
        ["time", '[data-meowui-part="chat-message/time"]'],
      ].map(([role, selector]) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) return { role, color: "", background: "", text: "" };
        const style = getComputedStyle(element);
        return {
          role,
          color: style.color,
          background: background(element),
          text: element.textContent ?? "",
        };
      });
    });
    for (const pair of pairs) {
      expect(pair.color, `${scheme} ${pair.role} color`).toBeTruthy();
      expect(
        contrast(rgb(pair.color), rgb(pair.background)),
        `${scheme} ${pair.role} ${pair.text}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  }

  await page.goto("/canvas.html?story=tag-facts");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  for (const scheme of ["light", "dark"] as const) {
    await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption(scheme);
    const warning = await page
      .locator('[data-meowui-part="tag/root"][data-option-tag-tone="warning"]')
      .first()
      .evaluate((element) => {
        const style = getComputedStyle(element);
        return { color: style.color, background: style.backgroundColor };
      });
    expect(warning.background).toBeTruthy();
    expect(
      contrast(rgb(warning.color), rgb(warning.background)),
      `${scheme} warning tag`,
    ).toBeGreaterThanOrEqual(4.5);
  }
});
