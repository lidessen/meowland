import type { RegionLayoutDescription, RegionLayoutSurface } from "meowui";

const layout = {
  areas: [
    ["list", "body"],
    ["list", "actions"],
  ],
  columns: ["compact", "fill"],
  rows: ["fill", "content"],
  regions: {
    list: { group: "browse", compactRow: "content" },
    body: { group: "detail", scrollOwner: "content" },
    actions: { group: "detail", direction: "inline", gap: "compact" },
  },
} as const satisfies RegionLayoutDescription;
void layout;
const invalid: RegionLayoutDescription = {
  areas: [["body"]],
  // @ts-expect-error Explicit pixel sizes are not layout declarations.
  columns: ["240px"],
  regions: { body: {} },
};
void invalid;
const invalidCompact: RegionLayoutDescription = {
  areas: [["body"]],
  regions: {
    // @ts-expect-error Compact rows retain finite sizing rather than pixel values.
    body: { compactRow: "160px" },
  },
};
void invalidCompact;
declare const surface: RegionLayoutSurface;
surface.showGroup("detail");
surface.regions.body?.focus();
// @ts-expect-error The renderer owns the root map.
surface.regions.body = document.createElement("div");
