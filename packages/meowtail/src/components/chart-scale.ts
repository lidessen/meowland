/** Pure chart geometry: nice ticks, series admission and the band layout. No DOM. */

export interface ChartSeries {
  /** Unique in the chart; keeps the series' color slot and marks across updates. */
  id: string;
  label: string;
  /** One value per category; null is a missing value. */
  values: readonly (number | null)[];
}

/** The categorical slots in `chartTokens`; a series takes the next and keeps it. */
export const chartSeriesLimit = 8;

/**
 * The series a chart draws: at most eight, each with exactly one value per category. Extra
 * values are cut, missing ones become null and non-finite numbers are treated as missing.
 */
export function admitSeries(
  series: readonly ChartSeries[],
  categoryCount: number,
): readonly ChartSeries[] {
  return series.slice(0, chartSeriesLimit).map((entry) => ({
    ...entry,
    values: Array.from({ length: categoryCount }, (_, index) => {
      const value = entry.values[index];
      return typeof value === "number" && Number.isFinite(value) ? value : null;
    }),
  }));
}

function niceStep(rough: number): number {
  const power = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / power;
  const nice =
    fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * power;
}

/**
 * Round tick values covering [min, max] with about `count` steps. A flat or empty range still
 * yields a usable axis.
 */
export function niceTicks(min: number, max: number, count = 5): readonly number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) {
    if (min === 0) return [0, 1];
    const pad = Math.abs(min) / 2;
    return niceTicks(min - pad, max + pad, count);
  }
  const step = niceStep((max - min) / Math.max(1, count - 1));
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  // Rounding keeps 0.1 + 0.2 from printing as 0.30000000000000004.
  const digits = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  for (let value = start; value <= end + step / 2; value += step)
    ticks.push(Number(value.toFixed(digits)));
  return ticks;
}

/** The value domain: bars always include zero so their lengths compare honestly. */
export function valueDomain(
  series: readonly ChartSeries[],
  includeZero: boolean,
): readonly number[] {
  const values = series.flatMap((entry) => entry.values.filter((value) => value !== null));
  if (values.length === 0) return niceTicks(0, 1);
  let min = Math.min(...(values as number[]));
  let max = Math.max(...(values as number[]));
  if (includeZero) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }
  return niceTicks(min, max);
}

export interface ChartFrame {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** The vertical position of a value inside the plot area. */
export function valueY(frame: ChartFrame, ticks: readonly number[], value: number): number {
  const low = ticks[0]!;
  const high = ticks.at(-1)!;
  const plot = frame.height - frame.top - frame.bottom;
  return frame.top + plot * (1 - (value - low) / (high - low || 1));
}

/** The center of a category band. */
export function bandCenter(frame: ChartFrame, count: number, index: number): number {
  const band = (frame.width - frame.left - frame.right) / Math.max(1, count);
  return frame.left + band * (index + 0.5);
}

export function bandWidth(frame: ChartFrame, count: number): number {
  return (frame.width - frame.left - frame.right) / Math.max(1, count);
}

/** One rect per value: series side by side inside each band, 70% of the band in all. */
export function barRect(
  frame: ChartFrame,
  ticks: readonly number[],
  categoryCount: number,
  seriesCount: number,
  categoryIndex: number,
  seriesIndex: number,
  value: number | null,
): { x: number; y: number; width: number; height: number } {
  const band = bandWidth(frame, categoryCount);
  const group = band * 0.7;
  const width = Math.max(1, group / Math.max(1, seriesCount) - (seriesCount > 1 ? 2 : 0));
  const x =
    frame.left +
    band * categoryIndex +
    (band - group) / 2 +
    (group / Math.max(1, seriesCount)) * seriesIndex;
  if (value === null) return { x, y: valueY(frame, ticks, 0), width, height: 0 };
  const zero = valueY(frame, ticks, Math.min(Math.max(0, ticks[0]!), ticks.at(-1)!));
  const end = valueY(frame, ticks, value);
  return { x, y: Math.min(zero, end), width, height: Math.abs(zero - end) };
}

/** An SVG path through the points, broken at missing values. */
export function linePath(
  frame: ChartFrame,
  ticks: readonly number[],
  values: readonly (number | null)[],
): string {
  let path = "";
  let drawing = false;
  values.forEach((value, index) => {
    if (value === null) {
      drawing = false;
      return;
    }
    const x = bandCenter(frame, values.length, index).toFixed(1);
    const y = valueY(frame, ticks, value).toFixed(1);
    path += `${drawing ? "L" : "M"}${x} ${y}`;
    drawing = true;
  });
  return path;
}

/** Point markers that differ by shape as well as color, one per series slot. */
export function markerPath(slot: number, x: number, y: number, size = 4): string {
  const s = size;
  switch (slot % 4) {
    case 0:
      return `M${x - s} ${y}a${s} ${s} 0 1 0 ${2 * s} 0a${s} ${s} 0 1 0 ${-2 * s} 0`;
    case 1:
      return `M${x - s} ${y - s}h${2 * s}v${2 * s}h${-2 * s}z`;
    case 2:
      return `M${x} ${y - s * 1.2}L${x + s * 1.2} ${y + s}H${x - s * 1.2}z`;
    default:
      return `M${x} ${y - s * 1.3}L${x + s * 1.3} ${y}L${x} ${y + s * 1.3}L${x - s * 1.3} ${y}z`;
  }
}
