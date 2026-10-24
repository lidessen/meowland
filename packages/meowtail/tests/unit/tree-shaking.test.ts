import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repository = resolve(import.meta.dir, "../../../..");
// Literals that only appear when the default runtime, a style-props binding or the theme rules stay in.
const runtimeMarker = "meowjsx renderer received an invalid child";
const stylePropsMarker = "Invalid style option";
const themeRulesMarker = '"chat-composer"';

/** The markers a bundle contains, so a failure names them instead of printing the bundle. */
function found(text: string, markers: readonly string[]): string[] {
  return markers.filter((marker) => text.includes(marker));
}

async function bundle(specifier: string, names: readonly string[]): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "meowland-shake-"));
  const entry = join(directory, "entry.ts");
  const path = Bun.resolveSync(specifier, repository);
  await Bun.write(
    entry,
    `import { ${names.join(", ")} } from ${JSON.stringify(path)};\nconsole.log(${names.join(", ")});\n`,
  );
  try {
    const result = await Bun.build({ entrypoints: [entry], format: "esm", target: "browser" });
    if (!result.success) throw new Error(result.logs.map((log) => log.message).join("\n"));
    return (await Promise.all(result.outputs.map((output) => output.text()))).join("\n");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("a Signal-only import leaves the default runtime and renderer out", async () => {
  for (const entry of ["meowjsx", "meowjsx/signal"])
    expect(found(await bundle(entry, ["signal"]), [runtimeMarker])).toEqual([]);
});

test("token and class-value imports leave components, the runtime and theme rules out", async () => {
  for (const names of [["uiTokens"], ["ui"]]) {
    const text = await bundle("meowtail/theme", names);
    expect(found(text, [runtimeMarker, stylePropsMarker, themeRulesMarker])).toEqual([]);
  }
});

test("presentation options leave the assembled presentation theme out", async () => {
  const text = await bundle("meowslides/theme", ["presentationOptions"]);
  expect(found(text, [runtimeMarker, themeRulesMarker])).toEqual([]);
});

test("the assembled standard theme still carries its rules", async () => {
  const text = await bundle("meowtail/theme", ["standardTheme"]);
  expect(found(text, [themeRulesMarker])).toEqual([themeRulesMarker]);
});

test("a Dialog import leaves the other dialog pieces out", async () => {
  const text = await bundle("meowtail", ["Dialog"]);
  expect(
    found(text, ['"dialog"', '"dialog-panel"', '"dialog-header"', '"dialog-actions"']),
  ).toEqual(['"dialog"']);
});
