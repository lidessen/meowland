import { expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rewriteRelativeImports } from "./esm-specifiers";

test("emitted dotted modules, re-exports, lazy and directory imports load in native Node ESM", async () => {
  const directory = await mkdtemp(join(tmpdir(), "meowland-esm-"));
  try {
    await writeFile(join(directory, "package.json"), '{"type":"module"}');
    await mkdir(join(directory, "nested"));
    const sources = {
      "theme.tokens.ts": "export const token = { value: 42 };",
      "theme.styles.ts": 'export { token } from "./theme.tokens";',
      "nested/index.ts": 'export { token } from "../theme.tokens";',
      "effect.ts": "globalThis.meowEffect = true;",
      "index.ts":
        'import "./effect"; import { token } from "./theme.styles"; import { token as nested } from "./nested"; export { token } from "./theme.styles"; export async function verify() { const lazy = await import("./theme.tokens"); return token === lazy.token && token === nested && globalThis.meowEffect; }',
    };
    for (const [file, source] of Object.entries(sources))
      await writeFile(join(directory, file), source);
    const tsc = Bun.spawn(
      [
        "bun",
        join(import.meta.dir, "../node_modules/typescript/bin/tsc"),
        "--module",
        "esnext",
        "--moduleResolution",
        "bundler",
        "--target",
        "es2022",
        "--noCheck",
        "--ignoreConfig",
        "--outDir",
        join(directory, "dist"),
        ...Object.keys(sources).map((file) => join(directory, file)),
      ],
      { stdout: "pipe", stderr: "pipe" },
    );
    expect(await tsc.exited).toBe(0);
    const run = () =>
      Bun.spawn(
        [
          "node",
          "--input-type=module",
          "-e",
          'import { token, verify } from "./dist/index.js"; if (token.value !== 42 || !(await verify())) throw new Error("identity"); console.log("shared");',
        ],
        { cwd: directory, stdout: "pipe", stderr: "pipe" },
      );
    const before = run();
    expect(await before.exited).not.toBe(0);
    expect(await new Response(before.stderr).text()).toContain("ERR_MODULE_NOT_FOUND");
    for (const source of Object.keys(sources)) {
      const file = join(directory, "dist", source.replace(/\.ts$/, ".js"));
      await writeFile(file, await rewriteRelativeImports(file, await readFile(file, "utf8")));
    }
    const after = run();
    expect(await after.exited).toBe(0);
    expect(await new Response(after.stdout).text()).toBe("shared\n");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("existing resource and explicit JavaScript paths win over similarly named emitted modules", async () => {
  const directory = await mkdtemp(join(tmpdir(), "meowland-esm-resources-"));
  try {
    for (const file of [
      "theme.css",
      "theme.css.js",
      "data.json",
      "module.mjs",
      "typed.js",
      "missing.js.js",
    ])
      await writeFile(join(directory, file), "");
    const source =
      'import "./theme.css"; import data from "./data.json"; export * from "./module.mjs"; export type { T } from "./typed.ts"; import "./missing.js"; import "some.styles";';
    expect(await rewriteRelativeImports(join(directory, "index.d.ts"), source)).toBe(
      source.replace("./typed.ts", "./typed.js"),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
