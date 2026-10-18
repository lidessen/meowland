import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { inspect, repository, run, type Runner } from "./release.ts";
import { checkVersion, request } from "./release-request.ts";

/** Packs already-built outputs. Version selection is explicit and never rewritten. */
export async function prepare(
  args: string[],
  runner: Runner = run,
  root = resolve(import.meta.dir, ".."),
) {
  const input = request(args, ["--out"]);
  const out = resolve(root, input.values.get("--out") ?? "artifacts/npm-release");
  const command = async (args: string[]) => {
    const result = await runner(args, root);
    if (result.code !== 0) throw new Error(`${args[0]} ${args[1]} failed`);
    return new TextDecoder().decode(result.stdout).trim();
  };
  if ((await command(["git", "rev-parse", "HEAD"])) !== input.commit)
    throw new Error("Prepare source must equal HEAD");
  if (
    await command([
      "git",
      "--no-optional-locks",
      "-c",
      "core.fsmonitor=false",
      "status",
      "--porcelain",
      "--untracked-files=no",
    ])
  )
    throw new Error("Tracked files must be clean");
  const candidates = await Promise.all(
    input.packages.map(async (name) => {
      const metadata = JSON.parse(
        await readFile(join(root, "packages", name, "package.json"), "utf8"),
      );
      checkVersion(name, metadata.version, input.channel);
      if (metadata.name !== name || metadata.private)
        throw new Error(`Not a public package: ${name}`);
      return { name, version: metadata.version as string };
    }),
  );
  await mkdir(dirname(out), { recursive: true });
  await mkdir(out); // Never overwrite a previously inspected batch.
  const packages = [];
  for (const item of candidates) {
    await command(["bun", "scripts/pack.ts", "--package", item.name]);
    const file = `${item.name}-${item.version}.tgz`;
    await copyFile(join(root, "artifacts", file), join(out, file));
    packages.push({
      ...item,
      file,
      sha256: createHash("sha256")
        .update(await readFile(join(out, file)))
        .digest("hex"),
    });
  }
  const manifest = join(out, "release-input.json");
  await Bun.write(
    manifest,
    JSON.stringify({ repository, commit: input.commit, packages }, null, 2) + "\n",
  );
  const plan = await inspect(root, manifest, input.packages, runner, input.channel);
  if (plan.blockers.length) throw new Error(plan.blockers.join("\n"));
  console.log(
    JSON.stringify(
      {
        manifest,
        source: input.commit,
        channel: input.channel,
        packages: plan.packages.map(({ name, version, sha256 }) => ({ name, version, sha256 })),
      },
      null,
      2,
    ),
  );
}
if (import.meta.main)
  prepare(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
