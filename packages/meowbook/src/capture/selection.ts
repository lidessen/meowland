import type { CaptureInstance, CaptureNode, CaptureRect } from "./types";

/** Derive a capture view without losing or rewriting the mounted instance tree. */
export function selectCaptureNodes(
  instances: readonly CaptureInstance[],
  depth: number | "all" = 1,
  select?: string,
): { nodes: CaptureNode[]; matched: number } {
  const limit = depth === "all" ? Infinity : depth;
  const ids = new Set(instances.map((node) => node.id));
  const children = new Map<string | null, CaptureInstance[]>();
  for (const node of instances) {
    const parent = node.parentId && ids.has(node.parentId) ? node.parentId : null;
    const siblings = children.get(parent) ?? [];
    siblings.push(node);
    children.set(parent, siblings);
  }
  const matches = select
    ? instances.filter((node) => node.name === select || node.originalName === select)
    : [];
  const matchedIds = new Set(matches.map((node) => node.id));
  const views = new Map<string, { depth: number; parent: string | null; forced: boolean }>();
  const visit = (
    node: CaptureInstance,
    currentDepth: number,
    parent: string | null,
    forced: boolean,
    ancestry: Set<string>,
  ) => {
    if (ancestry.has(node.id)) throw new Error("Capture instance tree contains a cycle");
    const previous = views.get(node.id);
    if (!previous || currentDepth < previous.depth || forced)
      views.set(node.id, { depth: currentDepth, parent, forced });
    const next = new Set(ancestry).add(node.id);
    const takesDepth = !node.transparent || forced;
    for (const child of children.get(node.id) ?? [])
      visit(child, currentDepth + (takesDepth ? 1 : 0), takesDepth ? node.id : parent, false, next);
  };
  for (const node of select ? matches : (children.get(null) ?? []))
    visit(node, 0, null, Boolean(select), new Set());
  const nodes: CaptureNode[] = instances.map((node) => {
    const view = views.get(node.id);
    return {
      ...node,
      matched: matchedIds.has(node.id),
      captureParentId: view?.parent ?? null,
      captureDepth: view?.depth,
      selection: !view
        ? "outside-selection"
        : node.transparent && !view.forced
          ? "transparent"
          : view.depth > limit
            ? "depth"
            : "selected",
    };
  });
  return {
    nodes,
    matched: select ? matches.length : nodes.filter((node) => node.selection === "selected").length,
  };
}

export function unionRects(rects: readonly CaptureRect[]): CaptureRect | undefined {
  const nonempty = rects.filter((rect) => rect.width > 0 && rect.height > 0);
  if (!nonempty.length) return undefined;
  const left = Math.min(...nonempty.map((rect) => rect.x));
  const top = Math.min(...nonempty.map((rect) => rect.y));
  const right = Math.max(...nonempty.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...nonempty.map((rect) => rect.y + rect.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/** Convert through the actual PNG dimensions, rather than assuming an integer DPR. */
export function pixelCrop(
  rect: CaptureRect,
  viewport: { width: number; height: number },
  image: { width: number; height: number },
  padding = 4,
): CaptureRect {
  const scaleX = image.width / viewport.width;
  const scaleY = image.height / viewport.height;
  const x = Math.max(0, Math.floor((rect.x - padding) * scaleX));
  const y = Math.max(0, Math.floor((rect.y - padding) * scaleY));
  const right = Math.min(image.width, Math.ceil((rect.x + rect.width + padding) * scaleX));
  const bottom = Math.min(image.height, Math.ceil((rect.y + rect.height + padding) * scaleY));
  return { x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y) };
}
