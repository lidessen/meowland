/// <reference types="node" preserve="true" />
import type { Page } from "@playwright/test";
import { mkdir, mkdtemp } from "node:fs/promises";
import { join, resolve } from "node:path";
import { captureScene, validateCaptureSelection } from "./capture/page";
import { validateGuideOptions } from "./capture/guides";
import { validateFocusOptions } from "./capture/focus";
import { writeCaptureReport } from "./capture/report";
import type { CaptureManifest, CapturePageOptions, CaptureResult } from "./capture/types";

export type * from "./capture/types";
export type { CapturePagePlan, LiveCaptureEntry } from "./bun/pages";

/** Photograph the current scene while retaining the caller's page and interaction state. */
export async function capturePage(
  page: Page,
  options: CapturePageOptions = {},
): Promise<CaptureResult> {
  validateCaptureSelection(options.depth, options.timeout);
  validateGuideOptions(options.guides);
  validateFocusOptions(options.focus);
  const out = resolve(options.out ?? "dist/meowbook/captures");
  await mkdir(out, { recursive: true });
  const directory = await mkdtemp(join(out, "capture-"));
  const scene = await captureScene(page, {
    ...options,
    directory: join(directory, "s001"),
    pathPrefix: "s001",
  });
  const manifest: CaptureManifest = {
    version: 1,
    createdAt: new Date().toISOString(),
    status: options.signal?.aborted
      ? "cancelled"
      : scene.status === "failed" || scene.status === "unmatched"
        ? "partial"
        : "complete",
    input: {
      entry: "capturePage",
      depth: options.depth ?? 1,
      fullPage: options.fullPage ?? false,
      guides: options.guides,
      focus: options.focus,
      select: options.select,
      timeout: options.timeout ?? 30000,
      name: options.name,
      testLocation: options.testLocation,
      target: options.target,
    },
    environment: scene.environment,
    scenes: [scene],
  };
  const paths = await writeCaptureReport(directory, manifest);
  return { directory, ...paths, manifest };
}
