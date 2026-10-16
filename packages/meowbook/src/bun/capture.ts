import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  chromium,
  devices,
  type Browser,
  type BrowserContext,
  type BrowserContextOptions,
} from "playwright";
import type { StoryConfig, StoryEntry } from "../types";
import type { CaptureManifest, CaptureResult, CaptureScene } from "../capture/types";
import { captureScene, validateCaptureGeometry, validateCaptureSelection } from "../capture/page";
import { summarizeCapture, writeCaptureReport } from "../capture/report";
import { validateGuideOptions, type GuideOptions } from "../capture/guides";
import { validateFocusOptions, type FocusOptions } from "../capture/focus";
import { discoverStories, sourcePath, type TemporaryStory } from "./discover";
import { serveStories } from "./server";

export interface CaptureOptions {
  focus?: FocusOptions;
  guides?: GuideOptions;
  configFile?: string;
  story?: string;
  all?: boolean;
  fullPage?: boolean;
  temporary?: TemporaryStory;
  select?: string;
  depth?: number | "all";
  viewport?: { width: number; height: number };
  device?: string;
  dpr?: number;
  colorScheme?: "light" | "dark";
  out?: string;
  timeout?: number;
  signal?: AbortSignal;
  progress?(message: string): void;
}

/** Bounds apply to both explicit options and expanded device presets. */
export function captureEnvironment(options: CaptureOptions): BrowserContextOptions {
  const device = options.device ? devices[options.device] : undefined;
  if (options.device && !device)
    throw new Error(
      `Unknown device: ${options.device}. Available devices: ${Object.keys(devices).join(", ")}`,
    );
  const { defaultBrowserType: _browserType, ...preset } = device ?? {};
  const environment: BrowserContextOptions = {
    ...preset,
    viewport: options.viewport ?? device?.viewport ?? { width: 1100, height: 900 },
    deviceScaleFactor: options.dpr ?? device?.deviceScaleFactor ?? 1,
    colorScheme: options.colorScheme ?? "light",
    reducedMotion: "reduce",
    isMobile: device?.isMobile ?? false,
    hasTouch: device?.hasTouch ?? false,
  };
  validateCaptureGeometry(environment.viewport!, environment.deviceScaleFactor!);
  if (options.colorScheme !== undefined && !["light", "dark"].includes(options.colorScheme))
    throw new Error("Color scheme must be light or dark");
  validateCaptureSelection(options.depth, options.timeout);
  validateGuideOptions(options.guides);
  validateFocusOptions(options.focus);
  if (options.select !== undefined && !options.select.trim())
    throw new Error("Component selection must be a nonempty display name");
  return environment;
}

function quote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function replay(
  options: CaptureOptions,
  story: StoryEntry,
  environment: BrowserContextOptions,
): string {
  const args = [
    "bun",
    resolve(import.meta.dir, `../cli${import.meta.url.endsWith(".ts") ? ".ts" : ".js"}`),
    "capture",
  ];
  if (options.configFile) args.push("--config", resolve(options.configFile));
  if (options.temporary) {
    args.push("--component", options.temporary.component, "--export", options.temporary.exportName);
    if (options.temporary.propsFile) args.push("--props-file", options.temporary.propsFile);
  } else args.push("--story", story.id);
  if (options.select !== undefined) args.push("--select", options.select);
  if (options.fullPage) args.push("--full-page");
  if (options.focus) {
    for (const selector of options.focus.selectors) args.push("--focus", selector);
    if (options.focus.padding !== undefined)
      args.push("--focus-padding", String(options.focus.padding));
  }
  if (options.guides) {
    if (options.guides.selectors?.length)
      for (const selector of options.guides.selectors) args.push("--guide", selector);
    else args.push("--guides");
    if (options.guides.lines) args.push("--guide-lines", options.guides.lines.join(","));
  }
  args.push("--depth", String(options.depth ?? 1));
  if (options.device) args.push("--device", options.device);
  args.push("--viewport", `${environment.viewport!.width}x${environment.viewport!.height}`);
  args.push(
    "--dpr",
    String(environment.deviceScaleFactor),
    "--color-scheme",
    environment.colorScheme!,
  );
  args.push("--timeout", String(options.timeout ?? 30_000));
  return args.map(quote).join(" ");
}

async function reference(file: string): Promise<{ path: string; sha256: string }> {
  return {
    path: file,
    sha256: createHash("sha256")
      .update(await readFile(file))
      .digest("hex"),
  };
}

async function gitState(root: string): Promise<CaptureManifest["git"]> {
  try {
    const revision = Bun.spawn(["git", "rev-parse", "HEAD"], {
      cwd: root,
      stdout: "pipe",
      stderr: "ignore",
    });
    const status = Bun.spawn(["git", "status", "--porcelain"], {
      cwd: root,
      stdout: "pipe",
      stderr: "ignore",
    });
    const [revisionText, statusText, revisionCode, statusCode] = await Promise.all([
      new Response(revision.stdout).text(),
      new Response(status.stdout).text(),
      revision.exited,
      status.exited,
    ]);
    if (revisionCode || statusCode) return undefined;
    return { revision: revisionText.trim(), dirty: statusText.trim().length > 0 };
  } catch {
    return undefined;
  }
}

function unexecuted(story: StoryEntry, command: string): CaptureScene {
  return { story, status: "unexecuted", matched: 0, nodes: [], replay: command };
}

export async function captureStories(
  config: StoryConfig,
  options: CaptureOptions,
): Promise<CaptureResult> {
  const started = performance.now();
  if (
    [Boolean(options.story), Boolean(options.all), Boolean(options.temporary)].filter(Boolean)
      .length !== 1
  )
    throw new Error(
      "Capture requires exactly one of --story <id>, --all, or --component <file> --export <name>. Use list --json to discover stories.",
    );
  const environment = captureEnvironment(options);
  const discovered = await discoverStories(config, options.temporary);
  const entries = discovered
    .map(({ generated: _generated, ...story }) => story)
    .filter((story) =>
      options.temporary
        ? story.id === "temporary/component"
        : !options.story || story.id === options.story,
    );
  if (!entries.length)
    throw new Error(
      `No stories matched ${options.story ?? "the configured patterns"}. Available stories: ${discovered.map((story) => story.id).join(", ") || "(none)"}`,
    );
  const output = resolve(config.root, options.out ?? "dist/meowbook/captures");
  await mkdir(output, { recursive: true });
  const directory = await mkdtemp(
    join(output, `run-${new Date().toISOString().replaceAll(/[:.]/g, "-")}-`),
  );
  const references: Record<string, unknown> = {};
  if (options.configFile) references.config = await reference(resolve(options.configFile));
  if (options.temporary?.propsFile)
    references.props = await reference(await sourcePath(config.root, options.temporary.propsFile));
  const manifest: CaptureManifest = {
    version: 1,
    createdAt: new Date().toISOString(),
    status: "complete",
    input: {
      configRoot: resolve(config.root),
      stories: entries.map((story) => story.id),
      selection: options.all ? "all" : options.temporary ? "temporary" : "story",
      temporary: options.temporary
        ? {
            component: options.temporary.component,
            exportName: options.temporary.exportName,
            propsFile: options.temporary.propsFile,
          }
        : undefined,
      select: options.select,
      depth: options.depth ?? 1,
      fullPage: options.fullPage ?? false,
      guides: options.guides,
      focus: options.focus,
      device: options.device,
      timeout: options.timeout ?? 30_000,
      out: output,
    },
    environment: { browser: "chromium", ...environment },
    references,
    git: await gitState(config.root),
    scenes: entries.map((story) => unexecuted(story, replay(options, story, environment))),
  };
  let service: Awaited<ReturnType<typeof serveStories>> | undefined;
  let browser: Browser | undefined;
  let activeContext: BrowserContext | undefined;
  let browserStarted: number | undefined;
  const timings: NonNullable<CaptureManifest["timings"]> = { totalMs: 0 };
  const cancel = () => {
    void activeContext?.close().catch(() => {});
  };
  options.signal?.addEventListener("abort", cancel);
  try {
    if (!options.signal?.aborted) {
      options.progress?.(`Building ${entries.length} selected stories`);
      const buildStarted = performance.now();
      service = await serveStories(config, {
        port: 0,
        temporary: options.temporary,
        capture: true,
      });
      timings.buildMs = Math.round(performance.now() - buildStarted);
    }
    if (service && !options.signal?.aborted) {
      browserStarted = performance.now();
      // The caller owns process signals; browser shutdown must not skip the capture report.
      browser = await chromium.launch({ handleSIGINT: false, handleSIGTERM: false });
      manifest.environment!.browserVersion = browser.version();
      for (const [index, story] of entries.entries()) {
        if (options.signal?.aborted) break;
        options.progress?.(`Capturing ${index + 1}/${entries.length}: ${story.id}`);
        const started = performance.now();
        const timeout = options.timeout ?? 30_000;
        const prefix = `s${String(index + 1).padStart(3, "0")}`;
        let deadline: ReturnType<typeof setTimeout> | undefined;
        try {
          activeContext = await browser.newContext(environment);
          options.signal?.throwIfAborted();
          const context = activeContext;
          deadline = setTimeout(() => {
            void context.close().catch(() => {});
          }, timeout);
          const page = await context.newPage();
          manifest.environment!.userAgent = await page.evaluate(() => navigator.userAgent);
          const url = new URL("canvas.html", service.url);
          url.searchParams.set("story", story.id);
          url.searchParams.set("capture", "1");
          await page.goto(url.href, { waitUntil: "domcontentloaded", timeout });
          const remaining = Math.max(1, Math.floor(timeout - (performance.now() - started)));
          manifest.scenes[index] = await captureScene(page, {
            directory: join(directory, prefix),
            pathPrefix: prefix,
            story,
            select: options.select,
            depth: options.depth ?? 1,
            fullPage: options.fullPage,
            guides: options.guides,
            focus: options.focus,
            timeout: remaining,
            signal: options.signal,
          });
        } catch (error) {
          manifest.scenes[index] = {
            story,
            status: "failed",
            matched: 0,
            nodes: [],
            error: options.signal?.aborted
              ? "Capture cancelled"
              : performance.now() - started >= timeout
                ? `Scene timeout after ${timeout}ms`
                : error instanceof Error
                  ? error.message
                  : String(error),
          };
        } finally {
          if (deadline !== undefined) clearTimeout(deadline);
          await activeContext?.close().catch(() => {});
          activeContext = undefined;
          manifest.scenes[index]!.replay = replay(options, story, environment);
          manifest.scenes[index]!.durationMs = Math.round(performance.now() - started);
          if (manifest.scenes[index]!.status === "failed")
            options.progress?.(`Failed ${story.id}: ${manifest.scenes[index]!.error}`);
        }
      }
    }
  } catch (error) {
    if (!options.signal?.aborted) {
      manifest.scenes[0] = {
        ...manifest.scenes[0]!,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      };
      options.progress?.(`Capture failed: ${manifest.scenes[0].error}`);
    }
  } finally {
    options.signal?.removeEventListener("abort", cancel);
    await activeContext?.close().catch(() => {});
    await browser?.close().catch(() => {});
    if (browserStarted !== undefined)
      timings.browserMs = Math.round(performance.now() - browserStarted);
    await service?.stop();
  }
  manifest.summary = summarizeCapture(manifest.scenes);
  if (options.signal?.aborted) manifest.status = "cancelled";
  else if (manifest.summary.failed || manifest.summary.unexecuted) manifest.status = "partial";
  if (
    options.select !== undefined &&
    manifest.summary.matched === 0 &&
    !options.signal?.aborted &&
    !manifest.summary.failed
  ) {
    const candidates = [
      ...new Set(
        manifest.scenes.flatMap((scene) =>
          scene.nodes.flatMap((node) => [
            node.name,
            ...(node.originalName ? [node.originalName] : []),
          ]),
        ),
      ),
    ];
    manifest.status = "partial";
    manifest.input.selectionError = `No components matched ${options.select}. Available names: ${candidates.join(", ") || "(none)"}`;
  }
  timings.totalMs = Math.round(performance.now() - started);
  manifest.timings = timings;
  const paths = await writeCaptureReport(directory, manifest);
  return { directory, ...paths, manifest };
}
