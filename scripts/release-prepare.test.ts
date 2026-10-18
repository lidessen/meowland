import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prepare } from "./release-prepare.ts";
import { run, type Runner } from "./release.ts";

const temporary: string[] = [];
afterEach(async () => {
  for (const path of temporary.splice(0)) await rm(path, { recursive: true, force: true });
});
test("prepare freezes selected actual tarball bytes and refuses to overwrite a batch", async () => {
  const root = await mkdtemp(join(tmpdir(), "meowland-prepare-test-"));
  temporary.push(root);
  const commit = "a".repeat(40);
  const source = join(root, "packages/meowjsx");
  const staging = join(root, "staging");
  await mkdir(source, { recursive: true });
  await mkdir(join(root, "artifacts"));
  await mkdir(join(staging, "package/dist"), { recursive: true });
  const pkg = {
    name: "meowjsx",
    version: "0.1.1-alpha.0",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/lidessen/meowland.git",
      directory: "packages/meowjsx",
    },
    exports: { ".": "./dist/index.js" },
  };
  const license = "MIT License\nPermission is hereby granted (fixture only).\n";
  await writeFile(join(root, "LICENSE"), license);
  await writeFile(join(source, "package.json"), JSON.stringify(pkg));
  await writeFile(join(staging, "package/package.json"), JSON.stringify(pkg));
  await writeFile(join(staging, "package/LICENSE"), license);
  await writeFile(join(staging, "package/dist/index.js"), "export const ready=true;");
  let packCalls = 0;
  const runner: Runner = async (args, cwd) => {
    let output = "";
    if (args[0] === "tar") return run(args, cwd);
    if (args[0] === "bun") {
      packCalls++;
      return run(
        ["tar", "-czf", join(root, "artifacts/meowjsx-0.1.1-alpha.0.tgz"), "package"],
        staging,
      );
    }
    if (args[1] === "rev-parse") output = commit;
    else if (args[1] === "show")
      output = await readFile(join(root, args[2]!.split(":")[1]!), "utf8");
    else if (args[1] === "remote") output = "https://github.com/lidessen/meowland.git";
    return { code: 0, stdout: new TextEncoder().encode(output), stderr: "" };
  };
  const args = [
    "--commit",
    commit,
    "--packages",
    "meowjsx",
    "--channel",
    "alpha",
    "--out",
    "artifacts/batch",
  ];
  await prepare(args, runner, root);
  const manifest = JSON.parse(
    await readFile(join(root, "artifacts/batch/release-input.json"), "utf8"),
  );
  expect(manifest.commit).toBe(commit);
  expect(manifest.packages).toHaveLength(1);
  expect(manifest.packages[0].version).toBe(pkg.version);
  expect(await readFile(join(root, "artifacts/batch", manifest.packages[0].file))).toEqual(
    await readFile(join(root, "artifacts/meowjsx-0.1.1-alpha.0.tgz")),
  );
  await expect(prepare(args, runner, root)).rejects.toThrow();
  expect(packCalls).toBe(1);
  await expect(
    prepare(
      args.map((value) => (value === commit ? "b".repeat(40) : value)),
      runner,
      root,
    ),
  ).rejects.toThrow("HEAD");
  expect(packCalls).toBe(1);
});
