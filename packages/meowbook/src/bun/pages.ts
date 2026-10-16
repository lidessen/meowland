import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { isAbsolute, join, posix, resolve, extname } from "node:path";
import { chromium, type APIRequestContext, type Page, type BrowserContext } from "playwright";
import type {
  CaptureManifest,
  CapturePageTarget,
  CaptureResult,
  CaptureScene,
} from "../capture/types";
import { captureScene } from "../capture/page";
import { summarizeCapture, writeCaptureReport } from "../capture/report";
import { captureEnvironment, type CaptureOptions } from "./capture";

export interface LiveCaptureEntry extends CapturePageTarget {
  prepare(page: Page): Promise<void>;
}

/** Trusted repository code, never JavaScript supplied in a CLI string. */
export type CapturePagePlan = (input: {
  baseURL: string;
  request: APIRequestContext;
}) => Promise<LiveCaptureEntry[]> | LiveCaptureEntry[];

export type LiveCaptureOptions = CaptureOptions & {
  channel?: "chrome" | "chromium";
  cdp?: string;
  ready?: string;
  root?: string;
  scene?: string;
  planFile?: string;
};

export function validateCaptureURL(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Live capture requires a valid HTTP(S) URL");
  }
  if (value.length > 8192 || !["http:", "https:"].includes(url.protocol))
    throw new Error("Live capture requires a bounded HTTP(S) URL");
  if (url.username || url.password)
    throw new Error("Live capture URL must not contain credentials");
  if (url.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    throw new Error("Live capture permits HTTP only on loopback; use HTTPS for remote pages");
  return url;
}

function publicURL(value: string): string {
  const url = validateCaptureURL(value);
  url.search = "";
  url.hash = "";
  return url.href;
}

export function validateCaptureCDP(value: string): URL {
  const url = validateCaptureURL(value);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || url.search || url.hash)
    throw new Error("CDP endpoint must be a loopback HTTP(S) URL without query or fragment");
  return url;
}

export function validatePageOptions(
  baseURL: string,
  options: LiveCaptureOptions,
  hasPlan: boolean,
) {
  validateCaptureURL(baseURL);
  if (options.story || options.temporary || options.configFile)
    throw new Error("Live capture cannot use story, component or story config options");
  if (options.channel !== undefined && !["chrome", "chromium"].includes(options.channel))
    throw new Error("Capture channel must be chrome or chromium");
  if (options.cdp) {
    validateCaptureCDP(options.cdp);
    if (options.channel) throw new Error("Use either --cdp or --channel");
  }
  if (options.select !== undefined || (options.guides && !options.guides.selectors?.length))
    throw new Error(
      "Live capture requires explicit --guide selectors and does not support --select",
    );
  for (const value of [options.ready, options.root])
    if (value !== undefined && (!value.trim() || value.length > 512))
      throw new Error("Page readiness and root selectors must contain 1 to 512 characters");
  if (options.scene !== undefined && (!options.scene.trim() || options.scene.length > 128))
    throw new Error("Page scene ID must contain 1 to 128 characters");
  if (
    options.planFile &&
    (!isAbsolute(options.planFile) ||
      ![".ts", ".js", ".mts", ".mjs"].includes(extname(options.planFile)))
  )
    throw new Error("Page plan must be an absolute local TypeScript or JavaScript file");
  if (hasPlan) {
    if (options.ready !== undefined || options.root !== undefined)
      throw new Error("Page plans define their own ready and root selectors");
    if (Boolean(options.all) === Boolean(options.scene))
      throw new Error("Page plans require exactly one of --all or --scene <id>");
  } else if (!options.ready || options.all || options.scene) {
    throw new Error("Single URL capture requires --ready and cannot use --all or --scene");
  }
  captureEnvironment(options);
}

function validateEntries(value: LiveCaptureEntry[]): LiveCaptureEntry[] {
  if (!Array.isArray(value) || !value.length || value.length > 500)
    throw new Error("Page plans must return between 1 and 500 entries");
  const ids = new Set<string>();
  for (const entry of value) {
    if (
      !entry ||
      typeof entry.id !== "string" ||
      !entry.id.trim() ||
      entry.id.length > 128 ||
      ids.has(entry.id)
    )
      throw new Error("Page plan entries require unique IDs containing 1 to 128 characters");
    ids.add(entry.id);
    if (
      typeof entry.title !== "string" ||
      !entry.title.trim() ||
      entry.title.length > 256 ||
      typeof entry.prepare !== "function"
    )
      throw new Error("Page plan entries require a bounded title and prepare function");
    for (const selector of [entry.ready, entry.root])
      if (
        selector !== undefined &&
        (typeof selector !== "string" || !selector.trim() || selector.length > 512)
      )
        throw new Error("Page plan selectors must contain 1 to 512 characters");
    if (!entry.ready) throw new Error("Each page plan entry requires a ready selector");
  }
  return value;
}

/** Race even trusted prepare code: closing a page does not settle an arbitrary promise. */
async function bounded<T>(
  operation: Promise<T>,
  timeout: number,
  signal?: AbortSignal,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let abort: (() => void) | undefined;
  const stopped = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error("Page operation timed out")), timeout);
    abort = () => reject(new Error("Capture cancelled"));
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
  });
  try {
    return await Promise.race([operation, stopped]);
  } finally {
    clearTimeout(timer);
    if (abort) signal?.removeEventListener("abort", abort);
  }
}

function replay(baseURL: string, entry: LiveCaptureEntry, options: LiveCaptureOptions): string {
  const args = [
    "bun",
    resolve(import.meta.dir, `../cli${import.meta.url.endsWith(".ts") ? ".ts" : ".js"}`),
    "capture",
    "--url",
    publicURL(baseURL),
  ];
  if (options.planFile) args.push("--pages", options.planFile, "--scene", entry.id);
  else args.push("--ready", entry.ready);
  if (entry.root && !options.planFile) args.push("--root", entry.root);
  if (options.channel) args.push("--channel", options.channel);
  if (options.cdp) args.push("--cdp", options.cdp);
  if (options.viewport)
    args.push("--viewport", `${options.viewport.width}x${options.viewport.height}`);
  if (options.device) args.push("--device", options.device);
  if (options.dpr !== undefined) args.push("--dpr", String(options.dpr));
  if (options.colorScheme) args.push("--color-scheme", options.colorScheme);
  if (options.fullPage) args.push("--full-page");
  if (options.guides) {
    for (const selector of options.guides.selectors!) args.push("--guide", selector);
    if (options.guides.lines) args.push("--guide-lines", options.guides.lines.join(","));
  }
  if (options.focus) {
    for (const selector of options.focus.selectors) args.push("--focus", selector);
    if (options.focus.padding !== undefined)
      args.push("--focus-padding", String(options.focus.padding));
  }
  args.push("--timeout", String(options.timeout ?? 30_000));
  return args.map((value) => `'${value.replaceAll("'", "'\\''")}'`).join(" ");
}

export async function capturePages(
  baseURL: string,
  planFactory: CapturePagePlan | undefined,
  options: LiveCaptureOptions,
): Promise<CaptureResult> {
  validatePageOptions(baseURL, options, Boolean(planFactory));
  if (planFactory !== undefined && typeof planFactory !== "function")
    throw new Error("Page plan must default-export a factory function");
  const started = performance.now();
  const environment = captureEnvironment(options);
  const timeout = options.timeout ?? 30_000;
  const output = resolve(options.out ?? "dist/meowbook/captures");
  const browser = options.cdp
    ? await chromium.connectOverCDP(options.cdp, { timeout })
    : await chromium.launch({
        channel: options.channel === "chrome" ? "chrome" : undefined,
        handleSIGINT: false,
        handleSIGTERM: false,
      });
  let context: BrowserContext | undefined;
  const cancel = () => {
    void context?.close().catch(() => {});
  };
  options.signal?.addEventListener("abort", cancel, { once: true });
  try {
    context = await browser.newContext(environment);
    const discovered = planFactory
      ? validateEntries(
          await bounded(
            Promise.resolve()
              .then(() => planFactory({ baseURL, request: context!.request }))
              .catch(() => {
                throw new Error("Page plan discovery failed");
              }),
            timeout,
            options.signal,
          ),
        )
      : [
          {
            id: "page",
            title: "Live page",
            ready: options.ready!,
            root: options.root,
            prepare: async (page: Page) => {
              await page.goto(baseURL, { waitUntil: "domcontentloaded", timeout });
            },
          },
        ];
    const entries = discovered.filter((entry) => !options.scene || entry.id === options.scene);
    if (!entries.length) throw new Error("No page plan entries matched the requested scene");
    await mkdir(output, { recursive: true });
    const directory = await mkdtemp(
      join(output, `run-${new Date().toISOString().replaceAll(/[:.]/g, "-")}-`),
    );
    const manifest: CaptureManifest = {
      version: 1,
      createdAt: new Date().toISOString(),
      status: "complete",
      input: {
        url: publicURL(baseURL),
        selection: options.all ? "all" : "page",
        scenes: entries.map((entry) => entry.id),
        planFile: options.planFile,
        timeout,
        fullPage: options.fullPage ?? false,
        guides: options.guides,
        focus: options.focus,
      },
      environment: {
        browser: options.channel ?? "chromium",
        transport: options.cdp ? "cdp" : "launch",
        browserVersion: browser.version(),
        ...environment,
      },
      scenes: entries.map((entry) => ({
        story: {
          id: entry.id,
          title: entry.title,
          file: options.planFile ?? publicURL(baseURL),
          exportName: "",
          line: 0,
        },
        status: "unexecuted",
        matched: 0,
        nodes: [],
        replay: replay(baseURL, entry, options),
      })),
    };
    for (const [index, entry] of entries.entries()) {
      if (options.signal?.aborted) break;
      const sceneStarted = performance.now();
      const prefix = `s${String(index + 1).padStart(3, "0")}`;
      const sceneDirectory = join(directory, prefix);
      let page: Page | undefined;
      let phase = "preparation";
      options.progress?.(`Capturing ${index + 1}/${entries.length}: ${entry.id}`);
      try {
        page = await bounded(context.newPage(), timeout, options.signal);
        page.setDefaultTimeout(timeout);
        page.setDefaultNavigationTimeout(timeout);
        await bounded(
          Promise.resolve(entry.prepare(page)),
          Math.max(1, Math.floor(timeout - (performance.now() - sceneStarted))),
          options.signal,
        );
        phase = "capture";
        const remaining = Math.max(1, Math.floor(timeout - (performance.now() - sceneStarted)));
        manifest.scenes[index] = await captureScene(page, {
          directory: sceneDirectory,
          pathPrefix: prefix,
          target: entry,
          fullPage: options.fullPage,
          guides: options.guides,
          focus: options.focus,
          timeout: remaining,
          signal: options.signal,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const category = /timed out|timeout/i.test(message)
          ? "timeout"
          : /page.goto|navigation|net::/i.test(message)
            ? "navigation"
            : /closed|browser|context/i.test(message)
              ? "browser"
              : "setup";
        const scene: CaptureScene = {
          ...manifest.scenes[index]!,
          status: "failed",
          error: options.signal?.aborted
            ? "Capture cancelled"
            : `Page ${phase} failed (${category})`,
          matched: 0,
          nodes: [],
        };
        await mkdir(sceneDirectory, { recursive: true });
        // Preparation errors may contain secret URLs or application content. Store only the stage.
        await writeFile(
          join(sceneDirectory, "diagnostic.json"),
          JSON.stringify({ stage: phase, error: scene.error }),
          { flag: "wx" },
        );
        scene.environment = { diagnosticMetadata: posix.join(prefix, "diagnostic.json") };
        if (page && !page.isClosed() && !options.signal?.aborted) {
          try {
            const bytes = await page.screenshot({ type: "png", timeout: 1000 });
            await writeFile(join(sceneDirectory, "diagnostic.png"), bytes, { flag: "wx" });
            scene.diagnostic = posix.join(prefix, "diagnostic.png");
          } catch {
            /* Keep preparation diagnostics when the page cannot be photographed. */
          }
        }
        manifest.scenes[index] = scene;
      } finally {
        await page?.close().catch(() => {});
        manifest.scenes[index]!.replay = replay(baseURL, entry, options);
        manifest.scenes[index]!.durationMs = Math.round(performance.now() - sceneStarted);
        if (manifest.scenes[index]!.status === "failed")
          options.progress?.(`Failed ${entry.id}: ${manifest.scenes[index]!.error}`);
      }
    }
    manifest.summary = summarizeCapture(manifest.scenes);
    manifest.status = options.signal?.aborted
      ? "cancelled"
      : manifest.summary.failed || manifest.summary.unexecuted
        ? "partial"
        : "complete";
    manifest.timings = { totalMs: Math.round(performance.now() - started) };
    const paths = await writeCaptureReport(directory, manifest);
    return { directory, ...paths, manifest };
  } finally {
    options.signal?.removeEventListener("abort", cancel);
    await context?.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}
