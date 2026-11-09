#!/usr/bin/env bun
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildSite, meowSite, type SiteConfig } from "./build";
import { hasBuiltSite, validateOutputDirectory } from "./output";
import { serveSite } from "./preview";

const USAGE = [
  "Usage: meowpress [--config <file>]",
  "       meowpress build [root] [--config <file>]",
  "       meowpress preview [root] [--config <file>] [--port <port>]",
].join("\n");
const CONFIG_FILES = ["meowpress.config.ts", "site.config.ts"];

function parseArgs(args: readonly string[]) {
  const command = args[0] === "preview" ? "preview" : "build";
  const hasCommand = args[0] === command;
  let root: string | undefined;
  let config: string | undefined;
  let port: number | undefined;
  for (let index = hasCommand ? 1 : 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--config" && config === undefined) {
      const value = args[++index];
      if (!value || value.startsWith("-")) throw new Error("Missing file for --config");
      config = value;
    } else if (arg === "--port" && command === "preview" && port === undefined) {
      const value = args[++index];
      port = Number(value);
      if (!Number.isInteger(port) || port < 1 || port > 65535)
        throw new Error("Port must be an integer between 1 and 65535");
    } else if (hasCommand && !arg.startsWith("-") && root === undefined) {
      root = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}\n${USAGE}`);
    }
  }
  return { command, root: resolve(root ?? "."), config, port };
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

export async function runSiteCli(args: string[] = Bun.argv.slice(2)): Promise<void> {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(USAGE);
    return;
  }
  const options = parseArgs(args);
  if (options.root !== process.cwd()) {
    if (!(await stat(options.root).catch(() => undefined))?.isDirectory())
      throw new Error(`Project root is not a directory: ${options.root}`);
    // Trusted config can call meowSite while loading, so it and its imports need the selected cwd.
    const child = Bun.spawn(
      [
        process.execPath,
        import.meta.path,
        options.command,
        ...(options.config ? ["--config", options.config] : []),
        ...(options.port ? ["--port", String(options.port)] : []),
      ],
      { cwd: options.root, stdin: "inherit", stdout: "inherit", stderr: "inherit" },
    );
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

  const config = await loadConfig(options.config);
  if (options.command === "preview") {
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
