import type { Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join, posix } from "node:path";
import { PNG } from "pngjs";
import { captureGuides, validateGuideOptions } from "./guides";
import { captureFocus, validateFocusOptions } from "./focus";
import { measureCaptureTargets, type CaptureTargetGeometry } from "./targets";
import { pixelCrop, selectCaptureNodes, unionRects } from "./selection";
import {
  capturePageURL,
  livePageReady,
  readLivePageSnapshot,
  validateCaptureTarget,
} from "./live-page";
import type {
  CapturePageTarget,
  CaptureScene,
  CaptureSceneOptions,
  CaptureSnapshot,
} from "./types";

export const MAX_CAPTURE_DIMENSION = 4096;
export const MAX_CAPTURE_PIXELS = 32000000;
export const MAX_CAPTURE_DPR = 4;
export const MAX_CAPTURE_TIMEOUT = 120000;
export const MAX_CAPTURE_DEPTH = 1000;

export function validateCaptureSelection(depth: number | "all" = 1, timeout = 30000): void {
  if (depth !== "all" && (!Number.isSafeInteger(depth) || depth < 0 || depth > MAX_CAPTURE_DEPTH))
    throw new Error(`Capture depth must be an integer between 0 and ${MAX_CAPTURE_DEPTH}, or all`);
  if (!Number.isSafeInteger(timeout) || timeout < 1 || timeout > MAX_CAPTURE_TIMEOUT)
    throw new Error(
      `Capture timeout must be an integer between 1 and ${MAX_CAPTURE_TIMEOUT} milliseconds`,
    );
}

export function validateCaptureGeometry(
  viewport: { width: number; height: number },
  dpr: number,
): void {
  const { width, height } = viewport;
  if (
    ![width, height].every(
      (dimension) =>
        Number.isInteger(dimension) && dimension >= 64 && dimension <= MAX_CAPTURE_DIMENSION,
    )
  )
    throw new Error(
      `Capture viewport dimensions must be integers between 64 and ${MAX_CAPTURE_DIMENSION}`,
    );
  if (!Number.isFinite(dpr) || dpr < 0.25 || dpr > MAX_CAPTURE_DPR)
    throw new Error(`Capture DPR must be between 0.25 and ${MAX_CAPTURE_DPR}`);
  if (width * height * dpr ** 2 > MAX_CAPTURE_PIXELS)
    throw new Error("Capture image exceeds the 32 megapixel allocation limit");
}

export async function readCaptureSnapshot(
  page: Page,
  target?: CapturePageTarget,
): Promise<CaptureSnapshot> {
  if (target) return readLivePageSnapshot(page, target);
  return page.evaluate(() => {
    const capture = window.__MEOWBOOK_CAPTURE__;
    if (!capture) throw new Error("This Meowbook canvas has not enabled capture observation");
    return capture.snapshot();
  });
}

async function assertCanvasReady(page: Page, target?: CapturePageTarget): Promise<void> {
  if (target) {
    if (!(await livePageReady(page, target))) throw new Error("Live page is no longer ready");
    return;
  }
  const state = await page.locator("#story-state").evaluate((element) => ({
    status: (element as HTMLElement).dataset.status,
    error: element.textContent,
  }));
  if (state.status !== "ready") throw new Error(state.error || "Canvas is not ready for capture");
}

/** Wait for only scene assets: network polling and unrelated document images are irrelevant. */
async function waitForAssets(page: Page, timeout: number, root = "#story-root"): Promise<void> {
  await page.evaluate(
    async ({ remaining, root }) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      let released = false;
      const cleanup: (() => void)[] = [];
      const inCurrentFrame = (image: HTMLImageElement) => {
        if (!image.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
        const bounds = image.getBoundingClientRect();
        let left = Math.max(0, bounds.left);
        let top = Math.max(0, bounds.top);
        let right = Math.min(innerWidth, bounds.right);
        let bottom = Math.min(innerHeight, bounds.bottom);
        for (let ancestor = image.parentElement; ancestor; ancestor = ancestor.parentElement) {
          const style = getComputedStyle(ancestor);
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
        return right > left && bottom > top;
      };
      try {
        const assets = async () => {
          // Fonts can move images into the viewport; decide which images matter after reflow.
          await document.fonts.ready;
          if (released) return;
          const pendingImages = [
            ...(document.querySelector(root)?.querySelectorAll<HTMLImageElement>("img") ?? []),
          ]
            .filter((image) => Boolean(image.currentSrc || image.src) && inCurrentFrame(image))
            .map(async (image) => {
              if (!image.complete)
                await new Promise<void>((resolve, reject) => {
                  const loaded = () => resolve();
                  const failed = () => reject(new Error("A scene image failed to load"));
                  image.addEventListener("load", loaded, { once: true });
                  image.addEventListener("error", failed, { once: true });
                  cleanup.push(() => {
                    image.removeEventListener("load", loaded);
                    image.removeEventListener("error", failed);
                  });
                });
              if (!image.naturalWidth) throw new Error("A scene image has no decoded pixels");
              await image.decode();
            });
          await Promise.all(pendingImages);
        };
        await Promise.race([
          assets(),
          new Promise<never>((_resolve, reject) => {
            timer = setTimeout(
              () => reject(new Error("Timed out waiting for scene fonts or images")),
              remaining,
            );
          }),
        ]);
      } finally {
        released = true;
        clearTimeout(timer);
        for (const release of cleanup) release();
      }
    },
    { remaining: timeout, root },
  );
}

function checkSnapshot(snapshot: CaptureSnapshot): void {
  if (!snapshot || !Array.isArray(snapshot.nodes) || !snapshot.story?.id)
    throw new Error("Invalid Meowbook capture snapshot");
  validateCaptureGeometry(snapshot.viewport, snapshot.dpr);
  const ids = new Set<string>();
  for (const node of snapshot.nodes) {
    if (ids.has(node.id)) throw new Error("Capture instance IDs must be unique");
    ids.add(node.id);
    for (const rect of [...node.rects, ...node.visibleRects])
      if (![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite))
        throw new Error(`Capture geometry is invalid for ${node.name}`);
  }
}

export async function captureScene(
  page: Page,
  options: CaptureSceneOptions,
): Promise<CaptureScene> {
  const started = Date.now();
  const timeout = options.timeout ?? 30000;
  validateCaptureSelection(options.depth, timeout);
  validateGuideOptions(options.guides);
  validateFocusOptions(options.focus);
  if (options.target) {
    validateCaptureTarget(options.target);
    if (options.select || (options.guides && !options.guides.selectors?.length))
      throw new Error(
        "Live capture uses DOM regions; use explicit CSS --guide instead of component selection",
      );
  }
  if (!/^s\d+$/.test(options.pathPrefix))
    throw new Error("Capture scene path must be a generated short ID");
  const remaining = () => {
    options.signal?.throwIfAborted();
    const time = timeout - (Date.now() - started);
    if (time <= 0) throw new Error("Capture scene timed out before a stable frame was available");
    return time;
  };
  const result: CaptureScene = {
    story: options.target
      ? {
          id: options.target.id,
          title: options.target.title,
          file: "",
          exportName: "",
          line: 0,
        }
      : (options.story ?? {
          id: "unknown",
          title: "Unknown scene",
          file: "",
          exportName: "",
          line: 0,
        }),
    name: options.name,
    testLocation: options.testLocation,
    status: "failed",
    matched: 0,
    nodes: [],
    source: options.target
      ? { kind: "page", url: capturePageURL(page.url()), root: options.target.root ?? "body" }
      : undefined,
  };
  const relative = (file: string) => posix.join(options.pathPrefix, file);
  await mkdir(options.directory, { recursive: true });
  let timer: ReturnType<typeof setTimeout> | undefined;
  let rejectAbort: (() => void) | undefined;
  const cancelled = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error("Capture scene timed out")), timeout);
    if (options.signal) {
      rejectAbort = () => reject(options.signal?.reason ?? new Error("Capture cancelled"));
      options.signal.addEventListener("abort", rejectAbort, { once: true });
    }
  });
  const bounded = <T>(operation: Promise<T>) => Promise.race([operation, cancelled]);
  try {
    remaining();
    // An early observer may supply identity while an asynchronous scene is still loading.
    // Absence here is not failure: canvas boot may not have registered it yet.
    try {
      result.story = (await bounded(readCaptureSnapshot(page, options.target))).story;
    } catch {
      remaining();
    }
    if (options.target) {
      await bounded(
        page.waitForFunction(
          ({ ready, root }) => {
            const element = document.querySelector(ready);
            return Boolean(
              document.querySelector(root ?? "body") &&
              element?.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }),
            );
          },
          { ready: options.target.ready, root: options.target.root },
          { timeout: remaining() },
        ),
      );
      if (
        options.focus &&
        !(await bounded(page.evaluate(() => Boolean(window.__MEOWBOOK_CAPTURE__))))
      )
        throw new Error(
          "Live page focus requires an installed capture observation hook; original photos and CSS guides do not",
        );
    } else
      await bounded(
        page.waitForFunction(
          () => {
            const status = document.getElementById("story-state")?.dataset.status;
            return status === "ready" || status === "error";
          },
          undefined,
          { timeout: remaining() },
        ),
      );
    const error = options.target
      ? null
      : await bounded(
          page
            .locator("#story-state")
            .evaluate((state) =>
              (state as HTMLElement).dataset.status === "error" ? state.textContent : null,
            ),
        );
    try {
      result.story = (await bounded(readCaptureSnapshot(page, options.target))).story;
    } catch (snapshotError) {
      if (!error) throw snapshotError;
    }
    if (error) throw new Error(error);
    let snapshot: CaptureSnapshot;
    let bytes: Buffer;
    let fullPage: Buffer | undefined;
    let fullPageSize: { width: number; height: number } | undefined;
    let focusGeometry: CaptureTargetGeometry | undefined;
    for (;;) {
      await bounded(
        waitForAssets(
          page,
          remaining(),
          options.target ? (options.target.root ?? "body") : undefined,
        ),
      );
      snapshot = await bounded(readCaptureSnapshot(page, options.target));
      checkSnapshot(snapshot);
      if (options.focus)
        focusGeometry = await bounded(
          measureCaptureTargets(page, options.focus.selectors, options.fullPage ?? false),
        );
      bytes = await bounded(
        page.screenshot({
          type: "png",
          fullPage: false,
          scale: "device",
          animations: "allow",
          caret: "initial",
          timeout: remaining(),
        }),
      );
      const afterFrame = await bounded(readCaptureSnapshot(page, options.target));
      if (options.fullPage) {
        const documentSize = await bounded(
          page.evaluate(() => ({
            width: Math.max(
              innerWidth,
              document.documentElement.scrollWidth,
              document.body.scrollWidth,
            ),
            height: Math.max(
              innerHeight,
              document.documentElement.scrollHeight,
              document.body.scrollHeight,
            ),
            dpr: devicePixelRatio,
          })),
        );
        if (documentSize.width * documentSize.height * documentSize.dpr ** 2 > MAX_CAPTURE_PIXELS)
          throw new Error("Full-page image exceeds the 32 megapixel allocation limit");
        fullPage = await bounded(
          page.screenshot({
            type: "png",
            fullPage: true,
            scale: "device",
            animations: "allow",
            caret: "initial",
            timeout: remaining(),
          }),
        );
        // Check dimensions before decoding or saving a potentially oversized document image.
        fullPageSize = { width: fullPage.readUInt32BE(16), height: fullPage.readUInt32BE(20) };
        if (fullPageSize.width * fullPageSize.height > MAX_CAPTURE_PIXELS)
          throw new Error("Full-page PNG exceeds the allocation limit");
      }
      const after = options.fullPage
        ? await bounded(readCaptureSnapshot(page, options.target))
        : afterFrame;
      await bounded(assertCanvasReady(page, options.target));
      const identity = JSON.stringify(snapshot);
      const focusStable =
        !options.focus ||
        JSON.stringify(focusGeometry) ===
          JSON.stringify(
            await bounded(
              measureCaptureTargets(page, options.focus.selectors, options.fullPage ?? false),
            ),
          );
      if (
        identity === JSON.stringify(afterFrame) &&
        identity === JSON.stringify(after) &&
        focusStable
      )
        break;
      remaining();
      // Browser frames supply a fresh sample; no setup or interaction is replayed.
      await bounded(
        page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))),
      );
    }
    result.story = snapshot.story;
    result.boundaries = snapshot.boundaries;
    result.replacements = snapshot.replacements;
    result.activeFocus = snapshot.activeFocus;
    result.scrollViews = snapshot.scrollViews;
    const selection = selectCaptureNodes(snapshot.nodes, options.depth, options.select);
    result.nodes = selection.nodes;
    result.matched = selection.matched;
    const frame = PNG.sync.read(bytes, { checkCRC: true });
    if (frame.width * frame.height > MAX_CAPTURE_PIXELS)
      throw new Error("Capture PNG exceeds the allocation limit");
    result.environment = await bounded(
      page.evaluate(() => ({
        viewport: { width: innerWidth, height: innerHeight },
        dpr: devicePixelRatio,
        colorScheme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "reduce"
          : "no-preference",
        touch: navigator.maxTouchPoints > 0,
        userAgent: navigator.userAgent,
      })),
    );
    result.environment.browserVersion = page.context().browser()?.version();
    result.environment.frameSize = { width: frame.width, height: frame.height };
    if (fullPage) {
      await writeFile(join(options.directory, "full-page.png"), fullPage, { flag: "wx" });
      result.fullPage = relative("full-page.png");
      result.environment.fullPageSize = fullPageSize;
    }
    if (options.guides) {
      result.guides = await captureGuides(page, options.guides, result.nodes, {
        directory: options.directory,
        pathPrefix: options.pathPrefix,
        fullPage: options.fullPage ?? false,
        timeout: remaining(),
      });
      remaining();
      const after = await bounded(readCaptureSnapshot(page, options.target));
      if (JSON.stringify(snapshot) !== JSON.stringify(after))
        throw new Error("Scene changed during guide capture; retry after it settles");
    }
    if (options.focus && focusGeometry) {
      result.focus = await captureFocus(page, options.focus, {
        directory: options.directory,
        pathPrefix: options.pathPrefix,
        frame: bytes,
        fullPage,
        geometry: focusGeometry,
        guides:
          options.guides && result.guides
            ? { options: options.guides, result: result.guides }
            : undefined,
        timeout: remaining(),
      });
    }
    const aria = await bounded(
      page
        .locator(options.target ? (options.target.root ?? "body") : "#story-root")
        .ariaSnapshot({ timeout: remaining() }),
    );
    remaining();
    await writeFile(join(options.directory, "frame.png"), bytes, { flag: "wx" });
    result.frame = relative("frame.png");
    await writeFile(join(options.directory, "aria.yml"), aria, { flag: "wx" });
    result.aria = relative("aria.yml");
    await mkdir(join(options.directory, "nodes"), { recursive: true });
    const shared = new Map<string, string>();
    for (const node of result.nodes) {
      remaining();
      node.contentRect = unionRects(node.visibleRects);
      if (!node.contentRect) continue;
      const rect = pixelCrop(node.contentRect, snapshot.viewport, frame);
      if (!rect.width || !rect.height) continue;
      node.pixelRect = rect;
      node.cropRect = {
        x: (rect.x * snapshot.viewport.width) / frame.width,
        y: (rect.y * snapshot.viewport.height) / frame.height,
        width: (rect.width * snapshot.viewport.width) / frame.width,
        height: (rect.height * snapshot.viewport.height) / frame.height,
      };
      if (node.selection !== "selected") continue;
      const key = JSON.stringify(rect);
      let image = shared.get(key);
      if (!image) {
        const filename = `nodes/n${String(shared.size + 1).padStart(3, "0")}.png`;
        const crop = new PNG({ width: rect.width, height: rect.height });
        PNG.bitblt(frame, crop, rect.x, rect.y, rect.width, rect.height, 0, 0);
        await writeFile(join(options.directory, filename), PNG.sync.write(crop), { flag: "wx" });
        image = relative(filename);
        shared.set(key, image);
      }
      node.image = image;
    }
    remaining();
    await bounded(assertCanvasReady(page, options.target));
    result.status = options.select && !result.matched ? "unmatched" : "success";
    if (result.status === "unmatched")
      result.error = `No component matches ${JSON.stringify(options.select)}. Available names: ${[...new Set(snapshot.nodes.flatMap((node) => [node.name, ...(node.originalName ? [node.originalName] : [])]))].sort().join(", ") || "(none)"}`;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    result.frame = undefined;
    result.fullPage = undefined;
    result.guides = undefined;
    result.focus = undefined;
    result.aria = undefined;
    for (const node of result.nodes) node.image = undefined;
    // A diagnostic is never represented as a successful frame or local photo.
    if (!options.signal?.aborted && !page.isClosed()) {
      try {
        const bytes = await page.screenshot({ type: "png", caret: "initial", timeout: 1000 });
        await writeFile(join(options.directory, "diagnostic.png"), bytes, { flag: "wx" });
        result.diagnostic = relative("diagnostic.png");
      } catch {
        /* Preserve the actual capture error when diagnostics are unavailable. */
      }
    }
  } finally {
    clearTimeout(timer);
    if (rejectAbort) options.signal?.removeEventListener("abort", rejectAbort);
    result.durationMs = Date.now() - started;
  }
  return result;
}
