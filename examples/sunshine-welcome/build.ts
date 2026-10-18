import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
const root = import.meta.dir;
const outdir = resolve(root, process.env.SUNSHINE_OUTDIR ?? "dist");
if (outdir !== join(root, "dist") && !outdir.startsWith(resolve(root, "../../artifacts") + sep))
  throw new Error(
    "SUNSHINE_OUTDIR must be this example's dist or a dedicated artifacts subdirectory",
  );
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
await cp(join(root, "SOURCES.md"), join(outdir, "SOURCES.md"));
await writeFile(
  join(outdir, "DELIVERY.md"),
  "# Browser delivery\n\nServe this directory over local HTTP with Bun already installed. From the editable source checkout: `bun examples/sunshine-welcome/serve.ts`. Entry: `http://127.0.0.1:13012/`. Do not assume file:// support.\n\nThe editable source is examples/sunshine-welcome in the accompanying Meowland checkout, with the repository package.json and bun.lock. See its README for exact build, preview and source delivery instructions. No network/font/CDN resources are used.\n",
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
  "These two files record the locked dependencies of the same-version Meowland workspace. The work source snapshot must be put back into that checkout's examples/sunshine-welcome to continue editing; it is not a project that can be installed independently with npm, and the new presentation APIs are not published yet. See the parent README for details.\n",
);
const assets = result.outputs.map((entry) => ({
  path: entry.path.slice(outdir.length + 1),
  bytes: entry.size,
}));
await writeFile(
  join(outdir, "build-manifest.json"),
  JSON.stringify({ entry: "index.html", sourceVersion: "sunshine-welcome-a3", assets }, null, 2),
);
console.log(JSON.stringify({ outdir, assets: assets.length }));
