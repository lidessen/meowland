import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const output = join(root, "artifacts");
await mkdir(output, { recursive: true });
const allPackages = ["meowjsx", "meowcss", "meowui", "meowbook", "meowpress"];
const selected = process.argv.indexOf("--package");
const packages = selected < 0 ? allPackages : [process.argv[selected + 1]!];
if (packages.some((name) => !allPackages.includes(name))) throw new Error("Unknown package");
for (const name of packages) {
  const child = Bun.spawn(["bun", "pm", "pack", "--destination", output],
    { cwd: join(root, "packages", name), stdout: "inherit", stderr: "inherit" });
  if (await child.exited !== 0) throw new Error(name + " packing failed");
}
