import type { Page } from "@playwright/test";
import type { CaptureRect } from "./types";

export interface CaptureTargetGeometry {
  selected: {
    group: number;
    selector: string;
    rect: CaptureRect;
    visibleRect: CaptureRect;
    clipRect: CaptureRect;
    approximate: string[];
  }[];
  width: number;
  height: number;
  viewport: { width: number; height: number };
  scroll: { x: number; y: number };
  dpr: number;
}

export function validateCaptureSelectors(selectors: string[]): void {
  if (
    !Array.isArray(selectors) ||
    selectors.length < 1 ||
    selectors.length > 12 ||
    selectors.some(
      (selector) => typeof selector !== "string" || !selector.trim() || selector.length > 512,
    )
  )
    throw new Error(
      "Capture selectors must contain 1–12 nonempty CSS selectors of at most 512 characters",
    );
}

/** Read geometry without changing layout, scroll, focus, or element stacking. */
export async function measureCaptureTargets(
  page: Page,
  selectors: string[] | undefined,
  fullPage: boolean,
): Promise<CaptureTargetGeometry> {
  if (selectors !== undefined) validateCaptureSelectors(selectors);
  return page.evaluate(
    ({ selectors, fullPage }) => {
      const width = Math.max(
        innerWidth,
        document.documentElement.scrollWidth,
        document.body.scrollWidth,
      );
      const height = Math.max(
        innerHeight,
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      const selected: CaptureTargetGeometry["selected"] = [];
      for (const [index, selector] of (selectors ?? []).entries()) {
        let matched: NodeListOf<Element>;
        try {
          matched = document.querySelectorAll(selector);
        } catch {
          throw new Error(`Invalid CSS capture selector at position ${index + 1}`);
        }
        const before = selected.length;
        for (const element of matched) {
          if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
          const rect = element.getBoundingClientRect();
          const approximate: string[] = [];
          if (element.getClientRects().length > 1) approximate.push("multiple-boxes");
          let left = fullPage ? -scrollX : 0;
          let top = fullPage ? -scrollY : 0;
          let right = fullPage ? width - scrollX : innerWidth;
          let bottom = fullPage ? height - scrollY : innerHeight;
          for (
            let ancestor: Element | null = element;
            ancestor;
            ancestor = ancestor.parentElement
          ) {
            const style = getComputedStyle(ancestor);
            if (style.transform !== "none" && !approximate.includes("transformed"))
              approximate.push("transformed");
            if (
              (style.clipPath !== "none" || style.maskImage !== "none") &&
              !approximate.includes("mask-or-clip-path")
            )
              approximate.push("mask-or-clip-path");
            if (
              ancestor === element ||
              ancestor === document.body ||
              ancestor === document.documentElement
            )
              continue;
            const clip = ancestor.getBoundingClientRect();
            if (style.overflowX !== "visible") {
              left = Math.max(left, clip.left + ancestor.clientLeft);
              right = Math.min(right, clip.left + ancestor.clientLeft + ancestor.clientWidth);
            }
            if (style.overflowY !== "visible") {
              top = Math.max(top, clip.top + ancestor.clientTop);
              bottom = Math.min(bottom, clip.top + ancestor.clientTop + ancestor.clientHeight);
            }
          }
          const visibleLeft = Math.max(left, rect.left),
            visibleTop = Math.max(top, rect.top);
          const visibleRight = Math.min(right, rect.right),
            visibleBottom = Math.min(bottom, rect.bottom);
          if (!(visibleRight > visibleLeft && visibleBottom > visibleTop)) continue;
          if (
            visibleLeft > rect.left ||
            visibleTop > rect.top ||
            visibleRight < rect.right ||
            visibleBottom < rect.bottom
          )
            approximate.push("clipped-bounds");
          selected.push({
            group: index + 1,
            selector,
            approximate,
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            visibleRect: {
              x: visibleLeft,
              y: visibleTop,
              width: visibleRight - visibleLeft,
              height: visibleBottom - visibleTop,
            },
            clipRect: { x: left, y: top, width: right - left, height: bottom - top },
          });
          if (selected.length > 48)
            throw new Error("Capture exceeds 48 targets; narrow the selection");
        }
        if (before === selected.length)
          throw new Error(
            `Capture selector ${index + 1} has no visible targets in the capture area`,
          );
      }
      return {
        selected,
        width,
        height,
        viewport: { width: innerWidth, height: innerHeight },
        scroll: { x: scrollX, y: scrollY },
        dpr: devicePixelRatio,
      };
    },
    { selectors, fullPage },
  );
}
