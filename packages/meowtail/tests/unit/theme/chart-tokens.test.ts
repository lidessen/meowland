import { expect, test } from "bun:test";
import { chartTokens, standardTheme } from "../../../src/theme/index";

const raised = { light: "#ffffff", dark: "#1a1a1a" };
const series = {
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"],
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"],
};

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((index) => {
    const channel = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
const contrast = (a: string, b: string) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high! + 0.05) / (low! + 0.05);
};

test("the chart series are eight theme variables emitted with the standard theme", () => {
  for (let slot = 1; slot <= 8; slot++) {
    const ref = chartTokens[`series${slot}` as "series1"];
    expect(ref.name).toBe(`--chart-series${slot}`);
    expect(standardTheme.cssText).toContain(`${ref.name}:`);
  }
  for (const hex of [...series.light, ...series.dark])
    expect(standardTheme.cssText.toLowerCase()).toContain(hex);
});

test("dark series reach 3:1 on the raised surface; light ones below it are the documented three", () => {
  for (const hex of series.dark) expect(contrast(hex, raised.dark)).toBeGreaterThanOrEqual(3);
  const below = series.light.filter((hex) => contrast(hex, raised.light) < 3);
  // Aqua, yellow and magenta: charts that use them label marks or draw a legend.
  expect(below).toEqual(["#1baf7a", "#eda100", "#e87ba4"]);
  for (const hex of series.light) expect(contrast(hex, raised.light)).toBeGreaterThanOrEqual(2);
});
