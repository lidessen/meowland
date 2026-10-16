import { constants } from "node:fs";
import { copyFile, mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const output = join(root, "artifacts");
await mkdir(output, { recursive: true });
const allPackages = ["meowjsx", "meowcss", "meowui", "meowbook", "meowpress"];
const selected = process.argv.indexOf("--package");
const packages = selected < 0 ? allPackages : [process.argv[selected + 1]!];
if (packages.some((name) => !allPackages.includes(name))) throw new Error("Unknown package");
for (const name of packages) {
  const directory = join(root, "packages", name);
  const packageLicense = join(directory, "LICENSE");
  // Bun does not inherit the workspace license. Never overwrite a package-owned notice.
  await copyFile(join(root, "LICENSE"), packageLicense, constants.COPYFILE_EXCL);
  try {
    const child = Bun.spawn(["bun", "pm", "pack", "--destination", output], {
      cwd: directory,
      stdout: "inherit",
      stderr: "inherit",
    });
    if ((await child.exited) !== 0) throw new Error(name + " packing failed");
  } finally {
    await rm(packageLicense);
  }
}
