#!/usr/bin/env bun
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildSite, meowSite, type SiteConfig } from "./build";
import { loadSection, type ContentItem, type ContentLocales } from "./content";
import { loadLocaleCatalogs } from "./locales";
import { hasBuiltSite, validateOutputDirectory } from "./output";
import { serveSite } from "./preview";
import {
  formatReport,
  stampTranslation,
  translationReport,
  type TranslationReport,
} from "./translations";

const USAGE = [
  "Usage: meowpress [--config <file>] [--root <dir>]",
  "       meowpress build [root] [--config <file>]",
  "       meowpress preview [root] [--config <file>] [--port <port>]",
  "       meowpress locales [--json] [--root <dir>] [--config <file>]",
  "       meowpress locales stamp <file> [--root <dir>] [--config <file>]",
].join("\n");
const CONFIG_FILES = ["meowpress.config.ts", "site.config.ts"];

type Mode = "build" | "preview" | "locales" | "stamp";

interface Options {
  mode: Mode;
  root: string;
  config?: string;
  port?: number;
  json: boolean;
  /** The translation file to stamp, for `locales stamp`. */
  file?: string;
}

function parseArgs(args: readonly string[]): Options {
  const first = args[0];
  const hasCommand = first === "build" || first === "preview" || first === "locales";
  let mode: Mode = hasCommand ? (first as Mode) : "build";
  let index = hasCommand ? 1 : 0;
  let file: string | undefined;
  if (mode === "locales" && args[index] === "stamp") {
    const value = args[++index];
    if (!value || value.startsWith("-")) throw new Error("Missing file for locales stamp");
    file = value;
    mode = "stamp";
    index++;
  }
  let root: string | undefined;
  let config: string | undefined;
  let port: number | undefined;
  let json = false;
  for (; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--config" && config === undefined) {
      const value = args[++index];
      if (!value || value.startsWith("-")) throw new Error("Missing file for --config");
      config = value;
    } else if (arg === "--root" && root === undefined) {
      const value = args[++index];
      if (!value || value.startsWith("-")) throw new Error("Missing directory for --root");
      root = value;
    } else if (arg === "--port" && mode === "preview" && port === undefined) {
      const value = args[++index];
      port = Number(value);
      if (!Number.isInteger(port) || port < 1 || port > 65535)
        throw new Error("Port must be an integer between 1 and 65535");
    } else if (arg === "--json" && mode === "locales" && !json) {
      json = true;
    } else if (
      (mode === "build" || mode === "preview") &&
      !arg.startsWith("-") &&
      root === undefined
    ) {
      root = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}\n${USAGE}`);
    }
  }
  return { mode, root: resolve(root ?? "."), config, port, json, file };
}

/** The locale configuration the content loader needs, or undefined on a single-locale site. */
function contentLocales(config: ReturnType<typeof meowSite>): ContentLocales | undefined {
  return config.locales
    ? { source: config.locales.source, targets: config.locales.targets.map((target) => target.tag) }
    : undefined;
}

async function loadConfig(config: string | undefined): Promise<SiteConfig> {
  for (const candidate of config === undefined ? CONFIG_FILES : [config]) {
    const configPath = resolve(candidate);
    try {
      if (!(await stat(configPath)).isFile())
        throw new Error(`Site config is not a file: ${configPath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      if (config !== undefined) throw new Error(`Site config not found: ${configPath}`);
      continue;
    }
    const module = (await import(pathToFileURL(configPath).href)) as {
      default?: SiteConfig;
      site?: SiteConfig;
    };
    const site = module.default ?? module.site;
    if (typeof site !== "object" || site === null || Array.isArray(site))
      throw new Error(
        `Expected a default site config object or a named site export in ${configPath}`,
      );
    return site;
  }
  return {};
}

/** Load the content and catalogs a work-list command needs, without building the site. */
async function loadTranslationInput(
  config: ReturnType<typeof meowSite>,
): Promise<{ posts: ContentItem[]; thoughts: ContentItem[]; report: TranslationReport }> {
  const locales = config.locales;
  if (!locales)
    throw new Error(
      "This site configures no locales. Add `locales` to meowpress.config.ts, then run meowpress locales again.",
    );
  const options = {
    components: config.mdxComponents,
    timeZone: config.site.timeZone,
    locales: contentLocales(config),
  };
  const [posts, thoughts, catalogs] = await Promise.all([
    loadSection(config.content, "post", options),
    loadSection(config.content, "thought", options),
    loadLocaleCatalogs(locales, config.localesDirectory),
  ]);
  const report = translationReport({
    locales,
    catalogs,
    site: config.site,
    notFound: config.notFound,
    posts,
    thoughts,
  });
  return { posts, thoughts, report };
}

async function runLocales(options: Options): Promise<void> {
  const config = meowSite(await loadConfig(options.config));
  if (options.mode === "stamp") {
    const locales = config.locales;
    if (!locales)
      throw new Error(
        "This site configures no locales. Add `locales` to meowpress.config.ts before stamping a translation.",
      );
    const stampOptions = {
      components: config.mdxComponents,
      timeZone: config.site.timeZone,
      locales: contentLocales(config),
    };
    const [posts, thoughts] = await Promise.all([
      loadSection(config.content, "post", stampOptions),
      loadSection(config.content, "thought", stampOptions),
    ]);
    const file = resolve(options.file!);
    const stamped = await stampTranslation(file, [...posts, ...thoughts]);
    console.log(`Stamped ${stamped.file} with ${stamped.hash}.`);
    return;
  }
  const { report } = await loadTranslationInput(config);
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  const text = formatReport(report);
  if (text) console.log(text);
}

export async function runSiteCli(args: string[] = Bun.argv.slice(2)): Promise<void> {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(USAGE);
    return;
  }
  const options = parseArgs(args);
  if (options.root !== process.cwd()) {
    if (!(await stat(options.root).catch(() => undefined))?.isDirectory())
      throw new Error(`Project root is not a directory: ${options.root}`);
    const childArgs = [
      options.mode === "stamp" ? "locales" : options.mode,
      ...(options.mode === "stamp" ? ["stamp", options.file!] : []),
      ...(options.json ? ["--json"] : []),
      ...(options.config ? ["--config", options.config] : []),
      ...(options.port ? ["--port", String(options.port)] : []),
    ];
    // Trusted config can call meowSite while loading, so it and its imports need the selected cwd.
    const child = Bun.spawn([process.execPath, import.meta.path, ...childArgs], {
      cwd: options.root,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });
    const interrupt = () => child.kill("SIGINT");
    const terminate = () => child.kill("SIGTERM");
    process.once("SIGINT", interrupt);
    process.once("SIGTERM", terminate);
    try {
      process.exitCode = await child.exited;
    } finally {
      process.off("SIGINT", interrupt);
      process.off("SIGTERM", terminate);
    }
    return;
  }

  if (options.mode === "locales" || options.mode === "stamp") {
    await runLocales(options);
    return;
  }
  const config = await loadConfig(options.config);
  if (options.mode === "preview") {
    const resolved = meowSite(config);
    await validateOutputDirectory(resolved);
    if (!(await hasBuiltSite(resolved.outputDirectory))) {
      throw new Error(
        `Built site not found at ${resolved.outputDirectory}. Run meowpress build first.`,
      );
    }
    const server = await serveSite(resolved.outputDirectory, options.port);
    console.log(`Meowpress preview: ${server.url}`);
    return;
  }
  await buildSite(config);
}

if (import.meta.main) {
  await runSiteCli().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
