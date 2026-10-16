import type { Page } from "@playwright/test";
import type { CaptureInstance, CapturePageTarget, CaptureSnapshot } from "./types";

export function validateCaptureTarget(target: CapturePageTarget): void {
  for (const [key, value, limit] of [
    ["id", target?.id, 256],
    ["title", target?.title, 256],
    ["ready", target?.ready, 512],
    ["root", target?.root ?? "body", 512],
  ] as const)
    if (typeof value !== "string" || !value.trim() || value.length > limit)
      throw new Error(`Live capture ${key} must contain 1–${limit} characters`);
}

/** Metadata excludes credentials, query parameters and fragments. */
export function capturePageURL(value: string): string {
  const url = new URL(value);
  return `${url.origin}${url.pathname}`;
}

export async function livePageReady(page: Page, target: CapturePageTarget): Promise<boolean> {
  return page.evaluate(
    ({ ready, root }) => {
      const element = document.querySelector(ready);
      return Boolean(
        document.querySelector(root ?? "body") &&
        element?.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }),
      );
    },
    { ready: target.ready, root: target.root },
  );
}

/** Photograph existing DOM and iframe surfaces without injecting a runtime or changing security. */
export async function readLivePageSnapshot(
  page: Page,
  target: CapturePageTarget,
): Promise<CaptureSnapshot> {
  return page.evaluate(
    ({ id, title, root: selector }) => {
      const root = document.querySelector(selector ?? "body");
      if (!root) throw new Error("Live capture root is missing");
      const geometry = (
        element: Element,
      ): Pick<CaptureInstance, "rects" | "visibleRects" | "visibility"> => {
        const box = element.getBoundingClientRect();
        const rect = { x: box.x, y: box.y, width: box.width, height: box.height };
        let left = Math.max(0, box.left);
        let top = Math.max(0, box.top);
        let right = Math.min(innerWidth, box.right);
        let bottom = Math.min(innerHeight, box.bottom);
        for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
          const style = getComputedStyle(ancestor);
          const bounds = ancestor.getBoundingClientRect();
          if (style.overflowX !== "visible") {
            left = Math.max(left, bounds.left + ancestor.clientLeft);
            right = Math.min(right, bounds.left + ancestor.clientLeft + ancestor.clientWidth);
          }
          if (style.overflowY !== "visible") {
            top = Math.max(top, bounds.top + ancestor.clientTop);
            bottom = Math.min(bottom, bounds.top + ancestor.clientTop + ancestor.clientHeight);
          }
        }
        const visible = element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
        const onscreen = right > left && bottom > top;
        return {
          rects: box.width > 0 && box.height > 0 ? [rect] : [],
          visibleRects:
            visible && onscreen
              ? [{ x: left, y: top, width: right - left, height: bottom - top }]
              : [],
          visibility: !visible ? "hidden" : onscreen ? "visible" : "offscreen",
        };
      };
      const regions = [root, ...root.querySelectorAll("iframe")];
      if (regions.length > 101) throw new Error("Live capture exceeds the 100 iframe region limit");
      return {
        story: { id, title, file: "", exportName: "", line: 0 },
        viewport: { width: innerWidth, height: innerHeight },
        dpr: devicePixelRatio,
        boundaries: [
          "Live-page nodes are DOM regions, not observed MeowJSX components.",
          "Iframe photographs retain the actual host viewport and clipping; internal component trees, scroll content and native window chrome are not observed.",
        ],
        nodes: regions.map((element, index) => ({
          id: `live-${index}`,
          parentId: index ? "live-0" : null,
          name: index
            ? `iframe: ${(element.getAttribute("title") ?? "Embedded view").slice(0, 256)}`
            : "page",
          transparent: false,
          ...geometry(element),
          ...(index ? { approximate: ["iframe-content-unobserved"] } : {}),
        })),
      };
    },
    { id: target.id, title: target.title, root: target.root },
  );
}
