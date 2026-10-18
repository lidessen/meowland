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
  "把该快照放回同版本 Meowland checkout 的 examples/image-loading 继续编辑；workspace-reference 仅记录锁定依赖，不是独立 npm 工程。\n",
);
console.log(`Editable image-loading source: ${outdir}`);
