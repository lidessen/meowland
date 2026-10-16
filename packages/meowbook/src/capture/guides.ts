import type { Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join, posix } from "node:path";
import { measureCaptureTargets } from "./targets";
import { unionRects } from "./selection";
import type { CaptureNode, CaptureRect } from "./types";

const GUIDE_LINES = ["left", "right", "top", "bottom", "center-x", "center-y"] as const;
export type GuideLine = (typeof GUIDE_LINES)[number];

export interface GuideOptions {
  selectors?: string[];
  lines?: GuideLine[];
}

export interface GuideTarget {
  id: number;
  group: number;
  selector?: string;
  component?: string;
  instanceId?: string;
  approximate?: string[];
  viewportRect: CaptureRect;
  documentRect: CaptureRect;
  referenceId: number;
  delta: Record<
    "left" | "top" | "right" | "bottom" | "centerX" | "centerY" | "width" | "height",
    number
  >;
}

export interface GuideResult {
  frame: string;
  fullPage?: string;
  measurements: string;
  targets: GuideTarget[];
}

export function validateGuideOptions(options?: GuideOptions): void {
  if (options === undefined) return;
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new Error("Capture guides must be an object");
  if (Object.keys(options).some((key) => key !== "selectors" && key !== "lines"))
    throw new Error("Unknown capture guides option");
  if (
    options.lines !== undefined &&
    (!Array.isArray(options.lines) ||
      options.lines.length < 1 ||
      options.lines.length > 6 ||
      new Set(options.lines).size !== options.lines.length ||
      options.lines.some((line) => !GUIDE_LINES.includes(line)))
  )
    throw new Error(
      "Guide lines must contain 1–6 unique values: left, right, top, bottom, center-x, center-y",
    );
  if (
    options.selectors !== undefined &&
    (!Array.isArray(options.selectors) ||
      options.selectors.length < 1 ||
      options.selectors.length > 12 ||
      options.selectors.some(
        (selector) => typeof selector !== "string" || !selector.trim() || selector.length > 512,
      ))
  )
    throw new Error(
      "Guide selectors must contain 1–12 nonempty CSS selectors of at most 512 characters",
    );
}

/** Capture geometric evidence only; guides do not decide whether an alignment is correct. */
export async function captureGuides(
  page: Page,
  options: GuideOptions,
  nodes: CaptureNode[],
  settings: { directory: string; pathPrefix: string; fullPage: boolean; timeout: number },
): Promise<GuideResult> {
  validateGuideOptions(options);
  if (!/^s\d+$/.test(settings.pathPrefix))
    throw new Error("Guide path must be a generated scene ID");
  if (!Number.isSafeInteger(settings.timeout) || settings.timeout < 1 || settings.timeout > 120000)
    throw new Error("Guide timeout must be between 1 and 120000 milliseconds");
  const started = Date.now();
  const remaining = () => {
    const time = settings.timeout - (Date.now() - started);
    if (time <= 0) throw new Error("Capture guides timed out");
    return time;
  };
  let timer: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error("Capture guides timed out")), settings.timeout);
  });
  const bounded = <T>(operation: Promise<T>) => Promise.race([operation, expired]);
  const overlayId = `meowbook-guides-${randomUUID()}`;
  const guideLines = options.lines ?? [...GUIDE_LINES];
  const relative = (name: string) => posix.join(settings.pathPrefix, name);
  let originalScroll: { x: number; y: number } | undefined;
  try {
    const measure = () =>
      bounded(measureCaptureTargets(page, options.selectors, settings.fullPage));
    const geometry = await measure();
    const { viewport, scroll, dpr } = geometry;
    originalScroll = scroll;
    if (
      viewport.width * viewport.height * dpr ** 2 > 32000000 ||
      (settings.fullPage && geometry.width * geometry.height * dpr ** 2 > 32000000)
    )
      throw new Error("Guide image exceeds the 32 megapixel allocation limit");
    const groups = new Map<string, number>();
    const selected = options.selectors
      ? geometry.selected.map(({ rect, group, selector, approximate }) => ({
          group,
          selector,
          approximate,
          viewportRect: rect,
        }))
      : nodes
          .filter((node) => node.selection === "selected" && node.visibleRects.length > 0)
          .flatMap((node) => {
            const viewportRect = unionRects(node.rects);
            if (!viewportRect) return [];
            if (!groups.has(node.name)) groups.set(node.name, groups.size + 1);
            return [
              {
                group: groups.get(node.name)!,
                component: node.name,
                instanceId: node.id,
                approximate: [
                  ...(node.approximate ?? []),
                  ...(node.rects.length > 1 ? ["multiple-boxes"] : []),
                  ...(node.visibility === "clipped" ? ["clipped-bounds"] : []),
                ],
                viewportRect,
              },
            ];
          });
    if (!selected.length) throw new Error("No visible selected components for guides");
    if (selected.length > 48) throw new Error("Guides exceed 48 targets; narrow the selection");
    const references = new Map<number, GuideTarget>();
    const targets: GuideTarget[] = selected.map((target, index) => {
      const rect = target.viewportRect;
      const reference = references.get(target.group);
      const base = reference?.viewportRect ?? rect;
      const result: GuideTarget = {
        ...target,
        id: index + 1,
        referenceId: reference?.id ?? index + 1,
        documentRect: { ...rect, x: rect.x + scroll.x, y: rect.y + scroll.y },
        delta: {
          left: rect.x - base.x,
          top: rect.y - base.y,
          right: rect.x + rect.width - base.x - base.width,
          bottom: rect.y + rect.height - base.y - base.height,
          centerX: rect.x + rect.width / 2 - base.x - base.width / 2,
          centerY: rect.y + rect.height / 2 - base.y - base.height / 2,
          width: rect.width - base.width,
          height: rect.height - base.height,
        },
      };
      if (!reference) references.set(target.group, result);
      return result;
    });
    const render = (fullPage: boolean) =>
      bounded(
        renderGuideOverlay(page, {
          id: overlayId,
          targets,
          viewport,
          width: geometry.width,
          height: geometry.height,
          fullPage,
          guideLines,
        }),
      );
    const save = async (name: string, fullPage: boolean) => {
      await render(fullPage);
      const image = await bounded(
        page.screenshot({
          type: "png",
          fullPage,
          scale: "device",
          animations: "allow",
          caret: "initial",
          timeout: remaining(),
        }),
      );
      if (image.readUInt32BE(16) * image.readUInt32BE(20) > 32000000)
        throw new Error("Guide PNG exceeds the allocation limit");
      remaining();
      const after = await measure();
      if (JSON.stringify(after) !== JSON.stringify(geometry))
        throw new Error("Guide targets changed during capture; retry after the scene settles");
      await bounded(writeFile(join(settings.directory, name), image, { flag: "wx" }));
    };
    await save("guides.png", false);
    if (settings.fullPage) await save("guides-full-page.png", true);
    remaining();
    await bounded(
      writeFile(
        join(settings.directory, "measurements.json"),
        JSON.stringify(
          {
            version: 1,
            units: "css-pixels",
            geometry: "axis-aligned bounding boxes; not typographic baselines",
            viewport,
            scroll,
            dpr,
            lines: guideLines,
            document: { width: geometry.width, height: geometry.height },
            targets,
          },
          null,
          2,
        ),
        { flag: "wx" },
      ),
    );
    return {
      frame: relative("guides.png"),
      fullPage: settings.fullPage ? relative("guides-full-page.png") : undefined,
      measurements: relative("measurements.json"),
      targets,
    };
  } finally {
    clearTimeout(timer);
    if (!page.isClosed())
      await page
        .evaluate(
          ({ id, scroll }) => {
            document.getElementById(id)?.remove();
            if (scroll && (scrollX !== scroll.x || scrollY !== scroll.y))
              window.scrollTo({ left: scroll.x, top: scroll.y, behavior: "instant" });
          },
          { id: overlayId, scroll: originalScroll },
        )
        .catch(() => {});
  }
}

export async function renderGuideOverlay(
  page: Page,
  settings: {
    id: string;
    targets: GuideTarget[];
    viewport: { width: number; height: number };
    width: number;
    height: number;
    fullPage: boolean;
    guideLines: GuideLine[];
  },
): Promise<void> {
  const { id, targets, viewport, width, height, fullPage, guideLines } = settings;
  await page.evaluate(
    ({ id, targets, viewport, width, height, fullPage, guideLines }) => {
      document.getElementById(id)?.remove();
      const host = document.createElement("div");
      host.id = id;
      host.dataset.meowbookGuides = "true";
      host.setAttribute("aria-hidden", "true");
      // A manual popover paints above native dialogs without closing existing popovers.
      // Top-layer positioning also escapes transformed or clipping page ancestors.
      host.popover = "manual";
      host.style.cssText = `all:initial;position:${fullPage ? "absolute" : "fixed"};inset:auto;left:0;top:0;margin:0;padding:0;border:0;width:0;height:0;pointer-events:none;overflow:visible;`;
      const shadow = host.attachShadow({ mode: "closed" });
      const ns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      const w = fullPage ? width : viewport.width;
      const h = fullPage ? height : viewport.height;
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.style.cssText = "position:absolute;left:0;top:0;pointer-events:none;overflow:hidden;";
      const append = (tag: string, attributes: Record<string, string | number>, text?: string) => {
        const item = document.createElementNS(ns, tag);
        for (const [key, value] of Object.entries(attributes))
          item.setAttribute(key, String(value));
        if (text !== undefined) item.textContent = text;
        svg.append(item);
      };
      const colors = ["#d64045", "#1565c0", "#8e24aa", "#087f5b", "#b45309", "#006978"];
      const lines = new Set<string>();
      for (const target of targets) {
        const r = fullPage ? target.documentRect : target.viewportRect;
        const color = colors[(target.group - 1) % colors.length]!;
        for (const [name, axis, value, center] of [
          ["left", "x", r.x, false],
          ["right", "x", r.x + r.width, false],
          ["center-x", "x", r.x + r.width / 2, true],
          ["top", "y", r.y, false],
          ["bottom", "y", r.y + r.height, false],
          ["center-y", "y", r.y + r.height / 2, true],
        ] as const) {
          if (!guideLines.includes(name)) continue;
          const key = `${target.group}:${axis}:${value}:${center}`;
          if (lines.has(key)) continue;
          lines.add(key);
          append("line", {
            x1: axis === "x" ? value : 0,
            x2: axis === "x" ? value : w,
            y1: axis === "y" ? value : 0,
            y2: axis === "y" ? value : h,
            stroke: color,
            "stroke-width": 1,
            "stroke-opacity": center ? 0.35 : 0.55,
            "stroke-dasharray": center ? "2 5" : "6 4",
          });
        }
        append("rect", {
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          fill: "none",
          stroke: color,
          "stroke-width": 1.5,
        });
        if (r.x + r.width <= 0 || r.y + r.height <= 0 || r.x >= w || r.y >= h) continue;
        let label = `${target.id} · ${Math.round(r.width * 10) / 10}×${Math.round(r.height * 10) / 10}`;
        if (guideLines.length === 1) {
          const line = guideLines[0]!;
          const key = line === "center-x" ? "centerX" : line === "center-y" ? "centerY" : line;
          label +=
            target.id === target.referenceId
              ? " · ref"
              : ` · Δ${line} ${Math.round(target.delta[key] * 10) / 10}`;
        }
        const labelWidth = label.length * 7 + 12;
        const x = Math.max(0, Math.min(r.x, w - labelWidth));
        const y = Math.max(0, Math.min(r.y >= 21 ? r.y - 21 : r.y, h - 20));
        append("rect", { x, y, width: labelWidth, height: 20, rx: 3, fill: color });
        append(
          "text",
          {
            x: x + 6,
            y: y + 14,
            fill: "white",
            "font-size": 11,
            "font-family": "monospace",
            "font-weight": 600,
          },
          label,
        );
      }
      shadow.append(svg);
      document.documentElement.append(host);
      host.showPopover();
    },
    {
      id,
      targets,
      viewport,
      width,
      height,
      fullPage,
      guideLines,
    },
  );
}
