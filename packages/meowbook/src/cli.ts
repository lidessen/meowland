#!/usr/bin/env bun
import { resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import type { StoryConfig } from "./types";
import type { GuideOptions } from "./capture/types";
import {
  capturePages,
  validatePageOptions,
  type CapturePagePlan,
  type LiveCaptureOptions,
} from "./bun/pages";
import {
  captureEnvironment,
  captureStories,
  checkStories,
  discoverStories,
  serveStories,
  type CaptureOptions,
  type TemporaryStory,
} from "./bun";

const usage = [
  "Usage: meowbook list|check|serve|capture --config <file> [--json]",
  "Capture: --story <id> | --all | --component <file> --export <name> [--props-file <file>]",
  "Live capture: --url <HTTP(S) URL> --ready <CSS selector> [--root <CSS selector>]",
  "  or --url <HTTP(S) URL> --pages <local plan file> (--all | --scene <id>) [--channel <chrome|chromium> | --cdp <loopback URL>]",
  "  [--select <name>] [--depth <n|all>] [--viewport <width>x<height>] [--device <name>] [--dpr <number>]",
  "  [--color-scheme <light|dark>] [--full-page] [--guides | --guide <CSS selector> (repeatable)]",
  "  [--guide-lines <left,right,top,bottom,center-x,center-y>] [--out <directory>] [--timeout <ms>]",
  "  [--focus <CSS selector> (repeatable)] [--focus-padding <0..128 CSS px>]",
  "Focus: preserves selected regions and skeletonizes peripheral details, with 12 CSS px context padding by default.",
  "Guides: --guides uses selected components; --guide uses explicit DOM groups. Choose any comma-separated guide lines (default: all). Saves annotated PNGs and CSS-pixel measurements beside originals.",
  "Serve: [--port <port>] [--capture] [--component <file> --export <name> --props-file <file>]",
  "List: [--query <text>] filters story id, title, group, component and variant (case-insensitive).",
  "Use list --json to discover available stories; narrow large catalogs with --query.",
].join("\n");

export function parseCLI(argv: readonly string[]) {
  const [command, ...args] = argv;
  if (!["list", "check", "serve", "capture"].includes(command ?? "")) throw new Error(usage);
  const values = new Map<string, string>();
  const flags = new Set<string>();
  const guideSelectors: string[] = [];
  const focusSelectors: string[] = [];
  const common = ["--config"];
  const temporaryFlags = ["--component", "--export", "--props-file"];
  const allowed =
    command === "capture"
      ? [
          ...common,
          ...temporaryFlags,
          "--story",
          "--select",
          "--depth",
          "--viewport",
          "--device",
          "--dpr",
          "--color-scheme",
          "--out",
          "--timeout",
          "--guide-lines",
          "--focus-padding",
          "--url",
          "--pages",
          "--scene",
          "--ready",
          "--root",
          "--channel",
          "--cdp",
        ]
      : command === "serve"
        ? [...common, ...temporaryFlags, "--port"]
        : command === "list"
          ? [...common, "--query"]
          : common;
  for (let index = 0; index < args.length; index++) {
    const flag = args[index]!;
    if (command === "capture" && (flag === "--guide" || flag === "--focus")) {
      const selector = args[++index];
      if (!selector || selector.startsWith("--")) throw new Error(`Missing value: ${flag}`);
      (flag === "--guide" ? guideSelectors : focusSelectors).push(selector);
      continue;
    }
    if (values.has(flag) || flags.has(flag)) throw new Error(`Duplicate option: ${flag}`);
    if (
      flag === "--json" ||
      (command === "capture" && flag === "--all") ||
      (command === "capture" && flag === "--full-page") ||
      (command === "capture" && flag === "--guides") ||
      (command === "serve" && flag === "--capture")
    ) {
      flags.add(flag);
      continue;
    }
    if (!allowed.includes(flag)) throw new Error(`Unknown option for ${command}: ${flag}`);
    const value = args[++index];
    if (!value || value.startsWith("--")) throw new Error(`Missing value: ${flag}`);
    values.set(flag, value);
  }
  let temporary: TemporaryStory | undefined;
  if (temporaryFlags.some((flag) => values.has(flag))) {
    if (!values.has("--component") || !values.has("--export"))
      throw new Error("Temporary preview requires --component <file> --export <name>");
    temporary = {
      component: values.get("--component")!,
      exportName: values.get("--export")!,
      propsFile: values.get("--props-file"),
    };
  }
  const capture: CaptureOptions = {
    focus: focusSelectors.length ? { selectors: focusSelectors } : undefined,
    guides: guideSelectors.length
      ? { selectors: guideSelectors }
      : flags.has("--guides")
        ? {}
        : undefined,
    story: values.get("--story"),
    all: flags.has("--all"),
    fullPage: flags.has("--full-page"),
    temporary,
    select: values.get("--select"),
    depth: values.has("--depth")
      ? values.get("--depth") === "all"
        ? "all"
        : Number(values.get("--depth"))
      : undefined,
    device: values.get("--device"),
    dpr: values.has("--dpr") ? Number(values.get("--dpr")) : undefined,
    out: values.get("--out"),
    timeout: values.has("--timeout") ? Number(values.get("--timeout")) : undefined,
  };
  if (values.has("--focus-padding")) {
    if (!capture.focus) throw new Error("--focus-padding requires --focus");
    if (values.has("--focus-padding"))
      capture.focus.padding = Number(values.get("--focus-padding"));
  }
  if (values.has("--guide-lines")) {
    if (!capture.guides) throw new Error("--guide-lines requires --guides or --guide");
    capture.guides.lines = values.get("--guide-lines")!.split(",") as GuideOptions["lines"];
  }
  if (values.has("--viewport")) {
    const match = /^(\d+)x(\d+)$/.exec(values.get("--viewport")!);
    if (!match) throw new Error("Viewport must use <width>x<height>, such as 390x844");
    capture.viewport = { width: Number(match[1]), height: Number(match[2]) };
  }
  if (values.has("--color-scheme")) {
    const scheme = values.get("--color-scheme");
    if (scheme !== "light" && scheme !== "dark")
      throw new Error("Color scheme must be light or dark");
    capture.colorScheme = scheme;
  }
  const live = values.has("--url")
    ? {
        ...capture,
        channel: values.get("--channel") as LiveCaptureOptions["channel"],
        cdp: values.get("--cdp"),
        ready: values.get("--ready"),
        root: values.get("--root"),
        scene: values.get("--scene"),
        planFile: values.has("--pages") ? resolve(values.get("--pages")!) : undefined,
      }
    : undefined;
  if (command === "capture") {
    if (flags.has("--guides") && guideSelectors.length)
      throw new Error("Use either --guides or explicit --guide selectors");
    if (live) {
      if (values.has("--config")) throw new Error("Live capture cannot use --config");
      validatePageOptions(values.get("--url")!, live, values.has("--pages"));
    } else if (
      ["--pages", "--scene", "--ready", "--root", "--channel", "--cdp"].some((flag) =>
        values.has(flag),
      )
    ) {
      throw new Error("Page capture options require --url");
    } else if (
      [values.has("--story"), capture.all, Boolean(temporary)].filter(Boolean).length !== 1
    )
      throw new Error(`Capture requires exactly one selection entry.\n${usage}`);
    captureEnvironment(capture);
  }
  const port = values.has("--port") ? Number(values.get("--port")) : undefined;
  if (port !== undefined && (!Number.isInteger(port) || port < 0 || port > 65535))
    throw new Error("Invalid port");
  const query = values.get("--query")?.trim();
  if (values.has("--query") && (!query || query.length > 256))
    throw new Error("List query must contain between 1 and 256 characters");
  return {
    command: command!,
    configFile: resolve(values.get("--config") ?? "story.config.ts"),
    json: flags.has("--json"),
    port,
    temporary,
    capture,
    observeCapture: flags.has("--capture"),
    query,
    live,
    url: values.get("--url"),
  };
}

async function main() {
  const parsed = parseCLI(process.argv.slice(2));
  const { command, configFile, json, temporary, port } = parsed;
  let config: StoryConfig | undefined;
  if (!parsed.live) {
    const imported = (await import(pathToFileURL(configFile).href)).default as StoryConfig;
    if (
      !imported ||
      typeof imported.root !== "string" ||
      !Array.isArray(imported.stories) ||
      typeof imported.preview !== "string" ||
      typeof imported.tsconfig !== "string"
    )
      throw new Error("Invalid story config: expected root, stories, preview and tsconfig");
    config = { ...imported, root: resolve(dirname(configFile), imported.root) };
  }
  if (command === "list") {
    const query = parsed.query?.toLocaleLowerCase();
    const entries = (await discoverStories(config!))
      .filter(
        (entry) =>
          !query ||
          [entry.id, entry.title, entry.group, entry.component, entry.variant].some((value) =>
            value?.toLocaleLowerCase().includes(query),
          ),
      )
      .map(({ generated: _generated, ...entry }) => entry);
    console.log(
      json
        ? JSON.stringify(entries)
        : entries.map((entry) => `${entry.id}\t${entry.file}:${entry.line}`).join("\n"),
    );
    return;
  }
  if (command === "check") {
    const entries = await checkStories(config!);
    console.log(
      json
        ? JSON.stringify({ status: "checked", stories: entries.length })
        : `Checked ${entries.length} stories`,
    );
    return;
  }
  if (command === "capture") {
    const controller = new AbortController();
    const stopCapture = () => controller.abort();
    process.once("SIGINT", stopCapture);
    process.once("SIGTERM", stopCapture);
    try {
      const shared = {
        ...parsed.capture,
        signal: controller.signal,
        progress: (message: string) => console.error(message),
      };
      let planFactory: CapturePagePlan | undefined;
      if (parsed.live?.planFile) {
        const imported = (await import(pathToFileURL(parsed.live.planFile).href)).default;
        if (typeof imported !== "function")
          throw new Error("Page plan must default-export a factory function");
        planFactory = imported;
      }
      const result = parsed.live
        ? await capturePages(parsed.url!, planFactory, { ...parsed.live, ...shared })
        : await captureStories(config!, { ...shared, configFile });
      const { manifest } = result;
      const summary = {
        status: manifest.status,
        ...manifest.summary,
        directory: result.directory,
        manifestPath: result.manifestPath,
        reportPath: result.reportPath,
        artifacts: manifest.scenes.map((scene) => ({
          story: scene.story.id,
          frame: scene.frame ? resolve(result.directory, scene.frame) : undefined,
          fullPage: scene.fullPage ? resolve(result.directory, scene.fullPage) : undefined,
          focus: scene.focus
            ? {
                frame: resolve(result.directory, scene.focus.frame),
                fullPage: scene.focus.fullPage
                  ? resolve(result.directory, scene.focus.fullPage)
                  : undefined,
                guides: scene.focus.guides
                  ? resolve(result.directory, scene.focus.guides)
                  : undefined,
                fullPageGuides: scene.focus.fullPageGuides
                  ? resolve(result.directory, scene.focus.fullPageGuides)
                  : undefined,
                metadata: resolve(result.directory, scene.focus.metadata),
              }
            : undefined,
          guides: scene.guides
            ? {
                frame: resolve(result.directory, scene.guides.frame),
                fullPage: scene.guides.fullPage
                  ? resolve(result.directory, scene.guides.fullPage)
                  : undefined,
                measurements: resolve(result.directory, scene.guides.measurements),
              }
            : undefined,
        })),
        failures: manifest.scenes
          .filter((scene) => scene.status === "failed")
          .map((scene) => ({ story: scene.story.id, error: scene.error })),
        selectionError: manifest.input.selectionError,
        notPhotographed: manifest.scenes.reduce(
          (count, scene) => count + scene.nodes.filter((node) => !node.image).length,
          0,
        ),
      };
      console.log(
        json
          ? JSON.stringify(summary)
          : `${manifest.status}: ${manifest.summary!.successful} successful, ${manifest.summary!.failed} failed, ${manifest.summary!.unexecuted} unexecuted; ${manifest.summary!.matched} matched instances, ${manifest.summary!.images} local images, ${summary.notPhotographed} nodes without local images, ${manifest.summary!.unmatched} unmatched stories\nReport: ${result.reportPath}\nManifest: ${result.manifestPath}`,
      );
      if (summary.selectionError) console.error(summary.selectionError);
      if (manifest.status !== "complete") process.exitCode = controller.signal.aborted ? 130 : 1;
    } finally {
      process.off("SIGINT", stopCapture);
      process.off("SIGTERM", stopCapture);
    }
    return;
  }
  let requestedStop = false;
  let finish: (() => void) | undefined;
  const stop = () => {
    requestedStop = true;
    finish?.();
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  let served: Awaited<ReturnType<typeof serveStories>> | undefined;
  try {
    served = await serveStories(config!, { port, temporary, capture: parsed.observeCapture });
    if (requestedStop) return;
    const url = temporary ? `${served.url}canvas.html?story=temporary%2Fcomponent` : served.url;
    console.log(
      json
        ? JSON.stringify({ status: "ready", url, stories: served.manifest.length })
        : `Meowbook: ${url}`,
    );
    await new Promise<void>((done) => {
      finish = done;
    });
  } finally {
    process.off("SIGINT", stop);
    process.off("SIGTERM", stop);
    await served?.stop();
  }
}

if (import.meta.main)
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
