import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { removeLegacyIsFallbacks } from "meowcss/bundle";
import { resolve, join, sep } from "node:path";
const root = import.meta.dir;
const outdir = resolve(root, process.env.PANDA_OUTDIR ?? "dist");
if (outdir !== join(root, "dist") && !outdir.startsWith(resolve(root, "../../artifacts") + sep))
  throw new Error("PANDA_OUTDIR must be this example's dist or a dedicated artifacts subdirectory");
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
// Bun writes legacy :-webkit-any()/:-moz-any() copies of every :is() rule; Safari misreads them.
for (const output of result.outputs)
  if (output.path.endsWith(".css"))
    await writeFile(output.path, removeLegacyIsFallbacks(await readFile(output.path, "utf8")));
await writeFile(
  join(outdir, "SOURCES.md"),
  (await Bun.file(join(root, "SOURCES.md")).text()).replaceAll(
    "(assets/NOTICES.md)",
    "(./NOTICES.md)",
  ),
);
await writeFile(
  join(outdir, "NOTICES.md"),
  (await Bun.file(join(root, "assets/NOTICES.md")).text()).replaceAll(
    "(../SOURCES.md)",
    "(./SOURCES.md)",
  ),
);
await writeFile(
  join(outdir, "build-manifest.json"),
  JSON.stringify(
    {
      entry: "index.html",
      sourceVersion: "protecting-pandas-a5",
      assets: result.outputs.map((entry) => ({
        path: entry.path.slice(outdir.length + 1),
        bytes: entry.size,
      })),
    },
    null,
    2,
  ),
);
console.log(JSON.stringify({ outdir, assets: result.outputs.length }));
