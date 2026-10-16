import type { LayoutAlign, LayoutGap } from "./layout-types";

export interface RegionDescription {
  direction?: "block" | "inline";
  align?: LayoutAlign;
  gap?: LayoutGap;
  scrollOwner?: "layout" | "content";
  compactRow?: "content" | "fill";
  group?: string;
}

/** Geometry only. Content and business identities belong to the consumer. */
export interface RegionLayoutDescription {
  areas: readonly (readonly (string | null)[])[];
  columns?: readonly ("content" | "compact" | "fill")[];
  rows?: readonly ("content" | "fill")[];
  gap?: LayoutGap;
  regions: Readonly<Record<string, RegionDescription>>;
}

const logicalName = /^[a-z][a-z0-9-]{0,63}$/;
const gaps = ["none", "compact", "normal", "relaxed"];
function record(
  value: unknown,
  keys?: readonly string[],
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid region layout object");
  if (keys && Object.keys(value).some((key) => !keys.includes(key)))
    throw new Error("Unknown region layout field");
}
function option(value: unknown, choices: readonly string[]) {
  if (value !== undefined && (typeof value !== "string" || !choices.includes(value)))
    throw new Error("Invalid region layout option");
}

/** Shared UI admission; backend admission mirrors this serializable contract. */
export function validateRegionLayout(value: unknown): RegionLayoutDescription {
  record(value, ["areas", "columns", "rows", "gap", "regions"]);
  const areas = value.areas;
  if (!Array.isArray(areas) || !areas.length || !Array.isArray(areas[0]) || !areas[0].length)
    throw new Error("Region areas must be a nonempty matrix");
  const width = areas[0].length;
  const bounds = new Map<
    string,
    { top: number; left: number; bottom: number; right: number; count: number }
  >();
  for (const [y, row] of areas.entries()) {
    if (!Array.isArray(row) || row.length !== width) throw new Error("Region matrix is uneven");
    for (const [x, name] of row.entries()) {
      if (name === null) continue;
      if (typeof name !== "string" || !logicalName.test(name))
        throw new Error("Invalid region name");
      const box = bounds.get(name);
      if (box) {
        box.left = Math.min(box.left, x);
        box.right = Math.max(box.right, x);
        box.bottom = y;
        box.count++;
      } else bounds.set(name, { top: y, left: x, bottom: y, right: x, count: 1 });
    }
  }
  if (!bounds.size) throw new Error("Region layout must contain content regions");
  for (const box of bounds.values())
    if (box.count !== (box.right - box.left + 1) * (box.bottom - box.top + 1))
      throw new Error("Named regions must form rectangles");
  for (const [key, size, choices] of [
    ["columns", width, ["content", "compact", "fill"]],
    ["rows", areas.length, ["content", "fill"]],
  ] as const) {
    const tracks = value[key];
    if (tracks !== undefined) {
      if (!Array.isArray(tracks) || tracks.length !== size)
        throw new Error("Region track count mismatch");
      for (const track of tracks) {
        if (track === undefined) throw new Error("Invalid region track");
        option(track, choices);
      }
    }
  }
  option(value.gap, gaps);
  record(value.regions);
  if (Object.keys(value.regions).length !== bounds.size)
    throw new Error("Region declarations must match named areas");
  for (const [name, region] of Object.entries(value.regions)) {
    if (!bounds.has(name)) throw new Error("Unknown declared region");
    record(region, ["direction", "align", "gap", "scrollOwner", "compactRow", "group"]);
    option(region.direction, ["block", "inline"]);
    option(region.align, ["start", "center", "end", "stretch", "baseline"]);
    option(region.gap, gaps);
    option(region.scrollOwner, ["layout", "content"]);
    option(region.compactRow, ["content", "fill"]);
    if (
      region.group !== undefined &&
      (typeof region.group !== "string" || !logicalName.test(region.group))
    )
      throw new Error("Invalid region group");
  }
  return value as unknown as RegionLayoutDescription;
}
