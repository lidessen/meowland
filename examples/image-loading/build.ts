import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
const root = import.meta.dir;
const outdir = join(root, "dist");
await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });
const result = await Bun.build({
  entrypoints: [join(root, "index.html")],
  outdir,
  target: "browser",
  minify: true,
  sourcemap: "external",
});
if (!result.success) throw new Error(result.logs.map(String).join("\n"));
await cp(join(root, "assets/NOTICES.md"), join(outdir, "NOTICES.md"));
await writeFile(
  join(outdir, "DELIVERY.md"),
  "# Image loading: browser delivery\n\nServe this directory over local HTTP. From the source checkout: `bun examples/image-loading/serve.ts`, then open http://127.0.0.1:13009/. No external network/font/CDN resources are used. Do not assume file:// support.\n\nEditable work: examples/image-loading in the same-version Meowland checkout. For an explicit editable snapshot run `bun examples/image-loading/scripts/export-source.ts`. Normal browser builds do not copy source, test fixtures or workspace lockfiles.\n",
);
const assets = result.outputs.map((entry) => ({
  path: entry.path.slice(outdir.length + 1),
  bytes: entry.size,
}));
await writeFile(
  join(outdir, "build-manifest.json"),
  JSON.stringify({ entry: "index.html", sourceVersion: "image-waiting-b3", assets }, null, 2),
);
const imageStats = await Promise.all(
  ["coast-original.png", "coast-delivery.jpg"].map(async (name) => ({
    name,
    bytes: (await readFile(join(root, "assets", name))).byteLength,
  })),
);
console.log(JSON.stringify({ outdir, assets: assets.length, images: imageStats }));
