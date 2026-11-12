import { access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { StoryConfig } from "../types";

/** Config file names tried in the current directory, newest convention first. */
export const configNames = ["meowbook.config.ts", "story.config.ts"] as const;

/** Used when no config file exists: the working directory is the project root. */
export function builtinConfig(cwd: string): StoryConfig {
  return {
    root: resolve(cwd),
    stories: ["src/**/*.stories.{ts,tsx}"],
    tsconfig: "tsconfig.json",
  };
}

/**
 * `--config` when given, else `meowbook.config.ts`, then `story.config.ts` in the current
 * directory, else built-in defaults. `configFile` is undefined under the built-in defaults.
 */
export async function resolveConfig(
  explicit: string | undefined,
  cwd = process.cwd(),
): Promise<{ config: StoryConfig; configFile?: string }> {
  let configFile = explicit ? resolve(cwd, explicit) : undefined;
  if (!configFile)
    for (const name of configNames) {
      const candidate = resolve(cwd, name);
      if (
        await access(candidate).then(
          () => true,
          () => false,
        )
      ) {
        configFile = candidate;
        break;
      }
    }
  if (!configFile) return { config: builtinConfig(cwd) };
  const imported = (await import(pathToFileURL(configFile).href)).default as StoryConfig;
  if (
    !imported ||
    typeof imported.root !== "string" ||
    !Array.isArray(imported.stories) ||
    (imported.preview !== undefined && typeof imported.preview !== "string") ||
    typeof imported.tsconfig !== "string"
  )
    throw new Error("Invalid story config: expected root, stories, tsconfig and optional preview");
  return { config: { ...imported, root: resolve(dirname(configFile), imported.root) }, configFile };
}
