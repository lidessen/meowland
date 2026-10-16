import type { Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { measureCaptureTargets } from "./targets";
import { writeFile, unlink } from "node:fs/promises";
import { join, posix } from "node:path";
import { PNG } from "pngjs";
import { renderGuideOverlay, type GuideOptions, type GuideResult } from "./guides";
import { validateCaptureSelectors, type CaptureTargetGeometry } from "./targets";
import type { CaptureRect } from "./types";

export interface FocusOptions {
  selectors: string[];
  padding?: number;
}
export interface FocusTarget {
  id: number;
  group: number;
  selector: string;
  approximate: string[];
  viewportRect: CaptureRect;
  documentRect: CaptureRect;
  visibleViewportRect: CaptureRect;
  visibleDocumentRect: CaptureRect;
  focusViewportRect: CaptureRect;
  focusDocumentRect: CaptureRect;
}
export interface FocusResult {
  frame: string;
  fullPage?: string;
  guides?: string;
  fullPageGuides?: string;
  metadata: string;
  targets: FocusTarget[];
}

export function validateFocusOptions(options?: FocusOptions): void {
  if (options === undefined) return;
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new Error("Capture focus must be an object");
  if (Object.keys(options).some((key) => !["selectors", "padding"].includes(key)))
    throw new Error("Unknown capture focus option");
  validateCaptureSelectors(options.selectors);
  if (
    options.padding !== undefined &&
    (!Number.isFinite(options.padding) || options.padding < 0 || options.padding > 128)
  )
    throw new Error("Focus padding must be between 0 and 128 CSS pixels");
}

function intersect(a: CaptureRect, b: CaptureRect): CaptureRect {
  const x = Math.max(a.x, b.x),
    y = Math.max(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(0, Math.min(a.x + a.width, b.x + b.width) - x),
    height: Math.max(0, Math.min(a.y + a.height, b.y + b.height) - y),
  };
}

/** Paint observed text without reflow and restore selected regions from the original pixels. */
export async function captureFocus(
  page: Page,
  options: FocusOptions,
  settings: {
    directory: string;
    pathPrefix: string;
    frame: Buffer;
    fullPage?: Buffer;
    geometry: CaptureTargetGeometry;
    guides?: { options: GuideOptions; result: GuideResult };
    timeout: number;
  },
): Promise<FocusResult> {
  validateFocusOptions(options);
  if (!/^s\d+$/.test(settings.pathPrefix))
    throw new Error("Focus path must be a generated scene ID");
  if (!Number.isSafeInteger(settings.timeout) || settings.timeout < 1 || settings.timeout > 120000)
    throw new Error("Focus timeout must be between 1 and 120000 milliseconds");
  const started = Date.now();
  const remaining = () => {
    const value = settings.timeout - (Date.now() - started);
    if (value <= 0) throw new Error("Capture focus timed out");
    return value;
  };
  const bounded = async <T>(operation: Promise<T>): Promise<T> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        operation,
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(() => reject(new Error("Capture focus timed out")), remaining());
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  };
  const { geometry } = settings;
  if (!geometry.selected.length || geometry.selected.length > 48)
    throw new Error("Focus requires 1–48 visible targets");
  const padding = options.padding ?? 12;
  const documentRect = (r: CaptureRect): CaptureRect => ({
    ...r,
    x: r.x + geometry.scroll.x,
    y: r.y + geometry.scroll.y,
  });
  const targets: FocusTarget[] = geometry.selected.map((target, index) => {
    const r = target.visibleRect;
    const focus = intersect(
      {
        x: r.x - padding,
        y: r.y - padding,
        width: r.width + padding * 2,
        height: r.height + padding * 2,
      },
      target.clipRect,
    );
    return {
      id: index + 1,
      group: target.group,
      selector: target.selector,
      approximate: target.approximate,
      viewportRect: target.rect,
      documentRect: documentRect(target.rect),
      visibleViewportRect: r,
      visibleDocumentRect: documentRect(r),
      focusViewportRect: focus,
      focusDocumentRect: documentRect(focus),
    };
  });
  const written: string[] = [];
  const save = async (name: string, bytes: Buffer | string) => {
    remaining();
    const path = join(settings.directory, name);
    await writeFile(path, bytes, { flag: "wx" });
    written.push(path);
    remaining();
    return posix.join(settings.pathPrefix, name);
  };
  const derive = (bytes: Buffer, fullPage: boolean, skeleton: Buffer): Buffer => {
    if (
      bytes.length < 24 ||
      !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      throw new Error("Focus source must be PNG");
    const width = bytes.readUInt32BE(16),
      height = bytes.readUInt32BE(20);
    if (!width || !height || width * height > 32000000)
      throw new Error("Focus PNG exceeds the 32 megapixel allocation limit");
    const source = PNG.sync.read(bytes, { checkCRC: true });
    const output = PNG.sync.read(skeleton, { checkCRC: true });
    if (output.width !== width || output.height !== height)
      throw new Error("Focus painted frame dimensions changed");
    const cssWidth = fullPage ? geometry.width : geometry.viewport.width;
    const cssHeight = fullPage ? geometry.height : geometry.viewport.height;
    const scaleX = width / cssWidth,
      scaleY = height / cssHeight;
    for (const target of targets) {
      const r = intersect(fullPage ? target.focusDocumentRect : target.focusViewportRect, {
        x: 0,
        y: 0,
        width: cssWidth,
        height: cssHeight,
      });
      const left = Math.max(0, Math.floor(r.x * scaleX)),
        top = Math.max(0, Math.floor(r.y * scaleY));
      const right = Math.min(width, Math.ceil((r.x + r.width) * scaleX)),
        bottom = Math.min(height, Math.ceil((r.y + r.height) * scaleY));
      if (r.width <= 0 || r.height <= 0) continue;
      for (let y = top; y < bottom; y++)
        source.data.copy(
          output.data,
          (y * width + left) * 4,
          (y * width + left) * 4,
          (y * width + right) * 4,
        );
    }
    remaining();
    return PNG.sync.write(output);
  };
  const combine = async (bytes: Buffer, fullPage: boolean): Promise<Buffer> => {
    const browser = page.context().browser();
    if (!browser) throw new Error("Focus guides require a browser-backed page");
    const width = bytes.readUInt32BE(16),
      height = bytes.readUInt32BE(20);
    const pendingContext = browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      javaScriptEnabled: true,
    });
    const context = await bounded(pendingContext).catch((error: unknown) => {
      void pendingContext.then((created) => created.close()).catch(() => {});
      throw error;
    });
    try {
      const canvas = await bounded(context.newPage());
      await canvas.route("**/*", (route) => route.abort());
      await bounded(
        canvas.evaluate(
          async ({ url, width, height }) => {
            document.documentElement.style.cssText = "margin:0;padding:0;overflow:hidden";
            document.body.style.cssText = "margin:0;padding:0;overflow:hidden";
            const image = document.createElement("img");
            image.src = url;
            image.width = width;
            image.height = height;
            image.style.display = "block";
            document.body.append(image);
            await image.decode();
          },
          { url: `data:image/png;base64,${bytes.toString("base64")}`, width, height },
        ),
      );
      const sx = width / (fullPage ? geometry.width : geometry.viewport.width),
        sy = height / (fullPage ? geometry.height : geometry.viewport.height);
      const guides = settings.guides!;
      const cssWidth = fullPage ? geometry.width : geometry.viewport.width,
        cssHeight = fullPage ? geometry.height : geometry.viewport.height;
      await bounded(
        renderGuideOverlay(canvas, {
          id: "meowbook-focus-guides",
          targets: guides.result.targets.map((target) => ({
            ...target,
            viewportRect: fullPage ? target.documentRect : target.viewportRect,
          })),
          viewport: { width: cssWidth, height: cssHeight },
          width: cssWidth,
          height: cssHeight,
          fullPage: false,
          guideLines: guides.options.lines ?? [
            "left",
            "right",
            "top",
            "bottom",
            "center-x",
            "center-y",
          ],
        }),
      );
      await canvas.evaluate(
        ({ sx, sy }) => {
          const host = document.getElementById("meowbook-focus-guides")!;
          host.style.transformOrigin = "0 0";
          host.style.transform = `scale(${sx},${sy})`;
        },
        { sx, sy },
      );
      return await canvas.screenshot({
        type: "png",
        timeout: remaining(),
        animations: "allow",
        caret: "initial",
      });
    } finally {
      await context.close();
    }
  };
  let paintedFrame: Buffer;
  let paintedFullPage: Buffer | undefined;
  let textDetails: { ranges: number; limitations: Record<string, number> };
  const paintId = `meowbook-focus-${randomUUID()}`;
  try {
    const current = await bounded(
      measureCaptureTargets(page, options.selectors, !!settings.fullPage),
    );
    if (JSON.stringify(current) !== JSON.stringify(geometry))
      throw new Error("Focus targets changed before text painting");
    const before = await bounded(page.evaluate(() => window.__MEOWBOOK_CAPTURE__!.snapshot()));
    try {
      textDetails = await bounded(
        page.evaluate((id) => {
          const api = window.__MEOWBOOK_CAPTURE__;
          if (!api?.paintSkeleton)
            throw new Error("Focus requires the capture observer; rebuild the capture canvas");
          return api.paintSkeleton(id);
        }, paintId),
      );
      paintedFrame = await page.screenshot({
        type: "png",
        scale: "device",
        caret: "initial",
        animations: "allow",
        timeout: remaining(),
      });
      if (settings.fullPage)
        paintedFullPage = await page.screenshot({
          type: "png",
          fullPage: true,
          scale: "device",
          caret: "initial",
          animations: "allow",
          timeout: remaining(),
        });
    } finally {
      if (!page.isClosed())
        await page.evaluate(
          ({ id, scroll }) => {
            window.__MEOWBOOK_CAPTURE__?.clearSkeleton?.(id);
            if (scrollX !== scroll.x || scrollY !== scroll.y)
              window.scrollTo({ left: scroll.x, top: scroll.y, behavior: "instant" });
          },
          { id: paintId, scroll: geometry.scroll },
        );
    }
    // Compare the restored scene: temporary skeleton paint may hide media without reflow.
    const after = await bounded(page.evaluate(() => window.__MEOWBOOK_CAPTURE__!.snapshot()));
    const measured = await bounded(
      measureCaptureTargets(page, options.selectors, !!settings.fullPage),
    );
    if (
      JSON.stringify(after) !== JSON.stringify(before) ||
      JSON.stringify(measured) !== JSON.stringify(geometry)
    )
      throw new Error("Focus scene changed during skeleton painting; retry after it settles");
    const frame = derive(settings.frame, false, paintedFrame);
    const result: FocusResult = { frame: await save("focus.png", frame), metadata: "", targets };
    if (settings.guides)
      result.guides = await save("focus-guides.png", await combine(frame, false));
    if (settings.fullPage) {
      const full = derive(settings.fullPage, true, paintedFullPage!);
      result.fullPage = await save("focus-full-page.png", full);
      if (settings.guides)
        result.fullPageGuides = await save("focus-guides-full-page.png", await combine(full, true));
    }
    result.metadata = await save(
      "focus.json",
      JSON.stringify(
        {
          version: 1,
          derived: true,
          padding,
          units: "css-pixels",
          effect: { kind: "skeleton", ...textDetails },
          viewport: geometry.viewport,
          scroll: geometry.scroll,
          dpr: geometry.dpr,
          document: { width: geometry.width, height: geometry.height },
          geometry:
            "axis-aligned rectangles; occlusion, masks, transforms and corner shapes are not pixel segmentation",
          targets,
        },
        null,
        2,
      ),
    );
    return result;
  } catch (error) {
    await Promise.all(written.map((path) => unlink(path).catch(() => {})));
    throw error;
  }
}
