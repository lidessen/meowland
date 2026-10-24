import type { ComponentObservation, ObservedComponent } from "meowjsx";
import type { StoryEntry } from "../types";
import type { CaptureInstance, CaptureRect, CaptureSnapshot } from "../capture/types";
import type {} from "../metadata";
import { createSkeletonController, type SkeletonSnapshot } from "meowjsx/web";
import { captureInstanceId, readCaptureFacts } from "./capture-facts";

const rect = (value: {
  left: number;
  top: number;
  width: number;
  height: number;
}): CaptureRect => ({
  x: Math.round(value.left * 1000) / 1000,
  y: Math.round(value.top * 1000) / 1000,
  width: Math.round(value.width * 1000) / 1000,
  height: Math.round(value.height * 1000) / 1000,
});
const name = (instance: ObservedComponent<Node>, original = false): string => {
  const component = original ? instance.originalComponent : instance.component;
  return component.meta?.name || component.name || `instance-${instance.id}`;
};

function geometry(
  nodes: ReadonlySet<Node>,
): Pick<CaptureInstance, "rects" | "visibleRects" | "visibility" | "approximate"> {
  const rects: CaptureRect[] = [],
    visibleRects: CaptureRect[] = [];
  const approximate = new Set<string>();
  let hidden = false,
    visual = false,
    onscreen = false;
  for (const node of nodes) {
    if (!node.isConnected) continue;
    const element = node instanceof Element ? node : node.parentElement;
    if (!element || (node instanceof Text && !node.textContent?.trim())) continue;
    visual = true;
    let left = 0,
      top = 0,
      right = innerWidth,
      bottom = innerHeight;
    let displayed = true;
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      if (
        style.display === "none" ||
        Number(style.opacity) === 0 ||
        style.contentVisibility === "hidden"
      )
        displayed = false;
      if (style.transform !== "none") approximate.add("transform");
      if (style.clipPath !== "none") approximate.add("clip-path");
      if (style.maskImage !== "none") approximate.add("mask");
      if (ancestor !== element || node instanceof Text) {
        const bound = ancestor.getBoundingClientRect();
        const clips =
          style.display !== "contents" &&
          !(ancestor instanceof HTMLElement && style.display === "inline");
        if (clips && style.overflowX !== "visible") {
          left = Math.max(left, bound.left + ancestor.clientLeft);
          right = Math.min(right, bound.left + ancestor.clientLeft + ancestor.clientWidth);
        }
        if (clips && style.overflowY !== "visible") {
          top = Math.max(top, bound.top + ancestor.clientTop);
          bottom = Math.min(bottom, bound.top + ancestor.clientTop + ancestor.clientHeight);
        }
        if (
          style.borderRadius !== "0px" &&
          (style.overflowX !== "visible" || style.overflowY !== "visible")
        )
          approximate.add("rounded-overflow");
      }
    }
    if (getComputedStyle(element).visibility !== "visible") displayed = false;
    if (!displayed) {
      hidden = true;
      continue;
    }
    let bounds: DOMRect[];
    if (node instanceof Element) {
      bounds = [...node.getClientRects()];
      if (node instanceof HTMLIFrameElement) approximate.add("iframe-content-unobserved");
      if (node.shadowRoot) approximate.add("shadow-content-unobserved");
    } else if (node instanceof Text) {
      const range = document.createRange();
      range.selectNodeContents(node);
      bounds = [...range.getClientRects()];
    } else continue;
    for (const bound of bounds) {
      if (bound.width <= 0 || bound.height <= 0) continue;
      rects.push(rect(bound));
      if (bound.right > 0 && bound.bottom > 0 && bound.left < innerWidth && bound.top < innerHeight)
        onscreen = true;
      const x = Math.max(bound.left, left),
        y = Math.max(bound.top, top);
      const width = Math.min(bound.right, right) - x,
        height = Math.min(bound.bottom, bottom) - y;
      if (width > 0 && height > 0) visibleRects.push(rect({ left: x, top: y, width, height }));
    }
  }
  const unique = (items: CaptureRect[]) => [
    ...new Map(items.map((item) => [JSON.stringify(item), item])).values(),
  ];
  return {
    rects: unique(rects),
    visibleRects: unique(visibleRects),
    visibility: visibleRects.length
      ? "visible"
      : rects.length
        ? onscreen
          ? "clipped"
          : "offscreen"
        : hidden && visual
          ? "hidden"
          : "no-visual-output",
    ...(approximate.size ? { approximate: [...approximate] } : {}),
  };
}

export function createCaptureProjection(
  story: StoryEntry,
  replacements: () => CaptureSnapshot["replacements"],
  observation: ComponentObservation<Node>,
) {
  const snapshot = (): CaptureSnapshot => {
    const instances = observation.read();
    const membership = new Set(instances);
    return {
      story,
      viewport: { width: innerWidth, height: innerHeight },
      dpr: devicePixelRatio,
      replacements: replacements(),
      ...readCaptureFacts(document, instances),
      boundaries: [
        "Direct function calls, private renderers, closed shadow roots and native popups have no observable internal component boundary.",
      ],
      nodes: instances.map((instance) => {
        const metadata = instance.component.metadata?.capture;
        if (
          metadata !== undefined &&
          (metadata === null ||
            typeof metadata !== "object" ||
            Array.isArray(metadata) ||
            Object.keys(metadata).some((key) => key !== "transparent") ||
            (metadata.transparent !== undefined && typeof metadata.transparent !== "boolean"))
        )
          throw new Error(`Invalid capture metadata on ${name(instance)}`);
        const transparentReason =
          instance.semantic ?? (metadata?.transparent ? "metadata" : undefined);
        return {
          id: captureInstanceId(instance),
          parentId:
            instance.parent && membership.has(instance.parent)
              ? captureInstanceId(instance.parent)
              : null,
          name: name(instance),
          originalName: name(instance, true),
          transparent: !!transparentReason,
          ...(transparentReason ? { transparentReason } : {}),
          ...geometry(instance.nodes),
        };
      }),
    };
  };
  const skeletons = new Map<string, ReturnType<typeof createSkeletonController>>();
  const clearSkeleton = (id: string) => {
    skeletons.get(id)?.dispose();
    skeletons.delete(id);
  };
  const api = {
    snapshot,
    paintSkeleton(id: string): SkeletonSnapshot {
      if (!/^meowbook-focus-[a-f0-9-]{36}$/.test(id)) throw new Error("Invalid focus session ID");
      if (skeletons.has(id)) throw new Error("Focus session already exists");
      const controller = createSkeletonController({
        scope: function* () {
          for (const instance of observation.read()) yield* instance.nodes;
        },
        observe: false,
        preserveExisting: true,
        observation: { source: observation },
      });
      try {
        const result = controller.activate();
        skeletons.set(id, controller);
        return result;
      } catch (error) {
        controller.dispose();
        throw error;
      }
    },
    clearSkeleton,
  };
  window.__MEOWBOOK_CAPTURE__ = api;
  return {
    dispose() {
      for (const id of skeletons.keys()) clearSkeleton(id);
      if (window.__MEOWBOOK_CAPTURE__ === api) delete window.__MEOWBOOK_CAPTURE__;
    },
  };
}
