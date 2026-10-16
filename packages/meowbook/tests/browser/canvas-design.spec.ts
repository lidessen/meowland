import { expect, test } from "@playwright/test";

function contrast(element: Element) {
  const style = getComputedStyle(element);
  const luminance = (color: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    const channels = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
    return channels.reduce((sum, channel, i) => {
      const value = channel / 255;
      const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      return sum + linear * [0.2126, 0.7152, 0.0722][i]!;
    }, 0);
  };
  const a = luminance(style.color);
  const b = luminance(style.backgroundColor);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

for (const scheme of ["light", "dark"] as const) {
  test(`partial preview adapts to inherited ${scheme} without styling consumer content`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/canvas.html?story=runtime/partial");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    await page.evaluate((value) => {
      document.documentElement.style.colorScheme = value;
    }, scheme);
    const placeholder = page.getByRole("img", { name: "子组件占位" }).first();
    await expect(placeholder).toContainText("placeholder");
    await expect(placeholder).toHaveCSS("height", "120px");
    expect(await placeholder.evaluate(contrast)).toBeGreaterThanOrEqual(4.5);
    expect(await placeholder.evaluate((element) => (element as HTMLElement).style.background)).toBe(
      "",
    );
    const background = await placeholder.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await page.evaluate(
      (value) => {
        document.documentElement.style.colorScheme = value;
      },
      scheme === "light" ? "dark" : "light",
    );
    expect(
      await placeholder.evaluate((element) => getComputedStyle(element).backgroundColor),
    ).not.toBe(background);
    await expect(page.locator("body")).not.toHaveAttribute("data-child-executed", "true");
    await expect(page.locator("#story-replacements")).toContainText('"hits":2');
    expect(
      await page.locator("h2").evaluate((element) => getComputedStyle(element).backgroundColor),
    ).toBe("rgba(0, 0, 0, 0)");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });

  test(`late error remains readable with inherited ${scheme} palette`, async ({ page }) => {
    await page.goto("/canvas.html?story=runtime/late-error");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    await page.evaluate((value) => {
      document.documentElement.style.colorScheme = value;
    }, scheme);
    await page.getByRole("button", { name: "触发异步错误" }).click();
    const state = page.locator("#story-state");
    await expect(state).toHaveAttribute("data-status", "error");
    await expect(state).toContainText("fixture late error");
    expect(await state.evaluate(contrast)).toBeGreaterThanOrEqual(4.5);
    const background = await state.evaluate((element) => getComputedStyle(element).backgroundColor);
    await page.evaluate(
      (value) => {
        document.documentElement.style.colorScheme = value;
      },
      scheme === "light" ? "dark" : "light",
    );
    expect(await state.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(
      background,
    );
    await expect(state).toHaveAttribute("data-status", "error");
  });
}
