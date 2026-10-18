import { chmod, cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const allPackages = ["meowjsx", "meowcss", "meowtail", "meowslides", "meowbook", "meowpress"];
const selected = process.argv.indexOf("--package");
const packages = selected < 0 ? allPackages : [process.argv[selected + 1]!];
if (packages.some((name) => !allPackages.includes(name))) throw new Error("Unknown package");
const checking = process.argv.includes("--check");

async function files(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const file = join(directory, entry.name);
        return entry.isDirectory() ? files(file) : [file];
      }),
    )
  ).flat();
}

async function existing(file: string): Promise<boolean> {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

if (checking && selected < 0) {
  for (const config of [
    "meowjsx/tsconfig.core.json",
    "meowjsx/tsconfig.renderer.json",
    "meowjsx/tsconfig.web.json",
    "meowcss/tsconfig.core.json",
  ]) {
    const child = Bun.spawn(
      ["bun", join(root, "node_modules/typescript/bin/tsc"), "-p", join(root, "packages", config)],
      { cwd: root, stdout: "inherit", stderr: "inherit" },
    );
    if ((await child.exited) !== 0) throw new Error(config + " environment check failed");
  }
}

for (const name of packages) {
  const directory = join(root, "packages", name);
  if (!checking) await rm(join(directory, "dist"), { recursive: true, force: true });
  const child = Bun.spawn(
    [
      "bun",
      join(root, "node_modules/typescript/bin/tsc"),
      "-p",
      join(directory, "tsconfig.build.json"),
      ...(checking ? ["--noEmit"] : []),
    ],
    { cwd: root, stdout: "inherit", stderr: "inherit" },
  );
  if ((await child.exited) !== 0) throw new Error(name + " TypeScript compilation failed");
  if (checking) continue;
  for (const source of await files(join(directory, "src"))) {
    if ([".ts", ".tsx"].includes(extname(source))) continue;
    const target = join(directory, "dist", source.slice(directory.length + 1));
    await mkdir(dirname(target), { recursive: true });
    await cp(source, target);
  }
  // Preserve one ESM module graph while making emitted relative imports usable in Node.
  for (const file of await files(join(directory, "dist"))) {
    if (!file.endsWith(".js") && !file.endsWith(".d.ts")) continue;
    const original = await readFile(file, "utf8");
    const pattern = /((?:from\s*|import\s*|import\s*\(\s*)["'])(\.[^"']+)(["'])/g;
    let updated = original;
    for (const match of original.matchAll(pattern)) {
      const specifier = match[2]!;
      let replacement = specifier.replace(/\.(tsx?|jsx)$/, ".js");
      if (!extname(replacement)) {
        if (await existing(resolve(dirname(file), replacement + ".js"))) replacement += ".js";
        else if (await existing(resolve(dirname(file), replacement, "index.js")))
          replacement += "/index.js";
      }
      if (replacement !== specifier)
        updated = updated.replace(match[0], match[1] + replacement + match[3]);
    }
    if (updated !== original) await writeFile(file, updated);
  }
  const manifest = JSON.parse(await readFile(join(directory, "package.json"), "utf8")) as {
    bin?: Record<string, string>;
  };
  for (const executable of Object.values(manifest.bin ?? {})) {
    await chmod(resolve(directory, executable), 0o755);
  }
}

if (checking && selected < 0) {
  for (const name of ["meowcss", "meowtail", "meowslides"]) {
    const child = Bun.spawn(
      [
        "bun",
        join(root, "node_modules/typescript/bin/tsc"),
        "-p",
        join(root, "packages", name, "tsconfig.types.json"),
      ],
      { cwd: root, stdout: "inherit", stderr: "inherit" },
    );
    if ((await child.exited) !== 0) throw new Error(name + " public type contracts failed");
  }
}
