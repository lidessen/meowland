import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

const root = resolve(import.meta.dir, "..");
const outdir = resolve(root, "../../artifacts/image-loading-source");
// Explicit source inputs: never recurse into dist, test results or a previous export.
const inputs = [
  "README.md",
  "package.json",
  "tsconfig.json",
  "index.html",
  "main.tsx",
  "deck.tsx",
  "transfer-estimate.tsx",
  "styles.ts",
  "assets.ts",
  "media-modules.d.ts",
  "build.ts",
  "serve.ts",
  "assets",
  "scripts",
  "tests",
  "records",
];
await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });
for (const input of inputs)
  await cp(resolve(root, input), resolve(outdir, input), {
    recursive: true,
    filter: (source) =>
      !source.split(sep).some((part) => ["test-results", "playwright-report"].includes(part)),
  });
const reference = resolve(outdir, "workspace-reference");
await mkdir(reference, { recursive: true });
await cp(resolve(root, "../../package.json"), resolve(reference, "package.json"));
await cp(resolve(root, "../../bun.lock"), resolve(reference, "bun.lock"));
await writeFile(
  resolve(reference, "README.md"),
  "Put this snapshot back into examples/image-loading of a same-version Meowland checkout to keep editing; workspace-reference only records locked dependencies and is not a standalone npm project.\n",
);
console.log(`Editable image-loading source: ${outdir}`);
