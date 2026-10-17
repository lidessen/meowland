import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
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
  "# Browser delivery\n\nServe this directory over local HTTP with Bun already installed. From the editable source checkout: `bun examples/presentation/serve.ts`. Entry: `http://127.0.0.1:13009/`. Do not assume file:// support.\n\nThe editable source is examples/presentation in the accompanying Meowland checkout, with the repository package.json and bun.lock. See its README for exact build, preview and source delivery instructions. No network/font/CDN resources are used.\n",
);
const source = join(outdir, "source");
await mkdir(source, { recursive: true });
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (["dist", "tests", "node_modules"].includes(entry.name) || entry.name.startsWith(".meowbook-"))
    continue;
  await cp(join(root, entry.name), join(source, entry.name), { recursive: true });
}
await mkdir(join(source, "workspace-reference"));
await cp(join(root, "../../package.json"), join(source, "workspace-reference/package.json"));
await cp(join(root, "../../bun.lock"), join(source, "workspace-reference/bun.lock"));
await writeFile(
  join(source, "workspace-reference/README.md"),
  "这两份文件记录同版本 Meowland workspace 的锁定依赖。作品源快照须放回该 checkout 的 examples/presentation 继续编辑；不是可独立 npm install 的工程，新 presentation API 尚未发布。详见上级 README。\n",
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
