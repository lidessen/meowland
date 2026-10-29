import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Chart, admitSeries, installMeowUI, meowUIComponents, niceTicks } from "../../../src/index";
import { barRect, linePath, valueDomain } from "../../../src/components/chart-scale";

test("ticks are round numbers covering the range, and degenerate ranges stay usable", () => {
  expect(niceTicks(0, 51)).toEqual([0, 20, 40, 60]);
  expect(niceTicks(12.4, 26.5)).toEqual([10, 15, 20, 25, 30]);
  expect(niceTicks(0.1, 0.3)).toEqual([0.1, 0.15, 0.2, 0.25, 0.3]);
  expect(niceTicks(0, 0)).toEqual([0, 1]);
  expect(niceTicks(5, 5)[0]).toBeLessThan(5);
  expect(niceTicks(Number.NaN, 1)).toEqual([0, 1]);
});

test("series are admitted at eight, padded or cut to the categories, with bad numbers missing", () => {
  const many = Array.from({ length: 10 }, (_, index) => ({
    id: `s${index}`,
    label: `S${index}`,
    values: [1, Number.NaN, 3, 4],
  }));
  const admitted = admitSeries(many, 3);
  expect(admitted).toHaveLength(8);
  expect(admitted[0]!.values).toEqual([1, null, 3]);
  expect(admitSeries([{ id: "a", label: "A", values: [1] }], 3)[0]!.values).toEqual([
    1,
    null,
    null,
  ]);
});

test("bars start at zero, negative values grow down and missing values draw nothing", () => {
  const series = [{ id: "a", label: "A", values: [10, -5, null] }];
  const ticks = valueDomain(series, true);
  expect(ticks[0]).toBeLessThan(0);
  const frame = { width: 300, height: 100, left: 0, right: 0, top: 0, bottom: 0 };
  const up = barRect(frame, ticks, 3, 1, 0, 0, 10);
  const down = barRect(frame, ticks, 3, 1, 1, 0, -5);
  expect(up.y + up.height).toBeCloseTo(down.y);
  expect(barRect(frame, ticks, 3, 1, 2, 0, null).height).toBe(0);
  // A gap in a line starts a new segment.
  expect(linePath(frame, ticks, [1, null, 2]).match(/M/g)).toHaveLength(2);
});

test("the figure is labelled, the drawing is hidden and the plot is the focus target", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const output = createWebRenderer(runtime).renderToHtml(
    <Chart
      type="bar"
      label="Tasks"
      categories={["A", "B"]}
      series={[{ id: "x", label: "X", values: [1, 2] }]}
    />,
  );
  expect(output).toContain("<figure");
  expect(output).toContain("<figcaption");
  expect(output).toMatch(/role="group" aria-label="Tasks"[^>]*tabindex="0"/);
  expect(output).toMatch(/<svg aria-hidden="true"[^>]*data-meowui-part="chart\/svg"/);
  expect(output).toContain('role="status"');
  expect(output).toContain("<details");
});
