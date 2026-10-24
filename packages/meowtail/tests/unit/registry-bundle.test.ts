import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repository = resolve(import.meta.dir, "../../../..");
const engine = /(?:^|[\s"'/:])(?:shiki|@shikijs\/[^\s"']*|pele)(?:[\s"'/:]|$)/;

async function bundleSource(contents: string) {
  const directory = await mkdtemp(join(tmpdir(), "meowtail-bundle-"));
  const entry = join(directory, "entry.ts");
  await Bun.write(entry, contents);
  try {
    const result = await Bun.build({
      entrypoints: [entry],
      outdir: join(directory, "out"),
      splitting: true,
      format: "esm",
      target: "browser",
    });
    if (!result.success) throw new Error(result.logs.map((log) => log.message).join("\n"));
    return await Promise.all(
      result.outputs.map(async (output) => ({ path: output.path, text: await output.text() })),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("Button-only public registry bundle excludes optional engines from every output", async () => {
  const entryPath = Bun.resolveSync("meowtail", repository);
  const outputs = await bundleSource(`
    import { Button, createMeowUI } from ${JSON.stringify(entryPath)};
    export const plugin = createMeowUI({ components: [Button] });
  `);

  expect(outputs.length).toBeGreaterThan(0);
  for (const output of outputs) expect(output.text).not.toMatch(engine);
});

test("standard theme bundle excludes optional engines from every output", async () => {
  const themePath = Bun.resolveSync("meowtail/theme", repository);
  const outputs = await bundleSource(`
    import { standardTheme } from ${JSON.stringify(themePath)};
    export const cssText = standardTheme.cssText;
  `);

  expect(outputs.length).toBeGreaterThan(0);
  for (const output of outputs) expect(output.text).not.toMatch(engine);
});
