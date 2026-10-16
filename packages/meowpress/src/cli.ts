#!/usr/bin/env bun
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildSite, type SiteConfig } from "./build";

function configPathFromArgs(args: string[]): string {
  const index = args.indexOf("--config");
  const configPath = index >= 0 ? args[index + 1] : undefined;
  if (!configPath || configPath.startsWith("--")) {
    throw new Error("Usage: meowpress --config <site-config.ts>");
  }
  return resolve(process.cwd(), configPath);
}

export async function runSiteCli(args: string[] = Bun.argv.slice(2)): Promise<void> {
  const configPath = configPathFromArgs(args);
  const module = (await import(pathToFileURL(configPath).href)) as {
    default?: SiteConfig;
    site?: SiteConfig;
  };
  const config = module.default ?? module.site;
  if (!config) throw new Error(`No default site config exported from ${configPath}`);
  await buildSite(config);
}

if (import.meta.main) await runSiteCli();
