import { expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { builtinConfig, resolveConfig } from "./config";

async function project(run: (directory: string) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), "meowbook-config-"));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
const source = (stories: string) =>
  `export default { root: ".", stories: [${JSON.stringify(stories)}], tsconfig: "tsconfig.json" };`;

test("resolves --config, then meowbook.config.ts, then story.config.ts, then built-in defaults", () =>
  project(async (directory) => {
    expect(await resolveConfig(undefined, directory)).toEqual({
      config: builtinConfig(directory),
    });
    expect(builtinConfig(directory)).toEqual({
      root: resolve(directory),
      stories: ["src/**/*.stories.{ts,tsx}"],
      tsconfig: "tsconfig.json",
    });
    await writeFile(join(directory, "story.config.ts"), source("legacy"));
    const legacy = await resolveConfig(undefined, directory);
    expect(legacy.configFile).toBe(join(directory, "story.config.ts"));
    expect(legacy.config.stories).toEqual(["legacy"]);
    await writeFile(join(directory, "meowbook.config.ts"), source("current"));
    const current = await resolveConfig(undefined, directory);
    expect(current.configFile).toBe(join(directory, "meowbook.config.ts"));
    expect(current.config).toMatchObject({ root: directory, stories: ["current"] });
    const explicit = await resolveConfig("story.config.ts", directory);
    expect(explicit.config.stories).toEqual(["legacy"]);
  }));

test("a config file may omit preview but must be well formed", () =>
  project(async (directory) => {
    await writeFile(join(directory, "meowbook.config.ts"), source("a"));
    expect((await resolveConfig(undefined, directory)).config.preview).toBeUndefined();
    await writeFile(
      join(directory, "bad.config.ts"),
      'export default { root: ".", stories: [], preview: 1, tsconfig: "t.json" };',
    );
    await expect(resolveConfig("bad.config.ts", directory)).rejects.toThrow("Invalid story config");
  }));
