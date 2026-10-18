import { resolve } from "node:path";
import { repository, run, workflow, type Runner } from "./release.ts";
import { checkVersion, request } from "./release-request.ts";

export async function dispatch(
  args: string[],
  runner: Runner = run,
  root = resolve(import.meta.dir, ".."),
) {
  const execute = args.includes("--execute");
  if (args.filter((arg) => arg === "--execute").length > 1) throw new Error("Duplicate --execute");
  const input = request(args.filter((arg) => arg !== "--execute"));
  const command = async (args: string[]) => {
    const result = await runner(args, root);
    if (result.code !== 0) throw new Error(`${args[0]} ${args[1]} failed`);
    return new TextDecoder().decode(result.stdout).trim();
  };
  if ((await command(["git", "rev-parse", "HEAD"])) !== input.commit)
    throw new Error("Dispatch source must equal local HEAD");
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
  const packages = [];
  for (const name of input.packages) {
    const metadata = JSON.parse(
      await command(["git", "show", `${input.commit}:packages/${name}/package.json`]),
    );
    checkVersion(name, metadata.version, input.channel);
    if (metadata.private || metadata.name !== name)
      throw new Error(`Not a public package: ${name}`);
    packages.push({ name, version: metadata.version });
  }
  const invocation = [
    "gh",
    "workflow",
    "run",
    workflow,
    "--repo",
    repository,
    "--ref",
    "main",
    "-f",
    `source_sha=${input.commit}`,
    "-f",
    `packages=${input.packages.join(",")}`,
    "-f",
    `channel=${input.channel}`,
  ];
  console.log(
    JSON.stringify(
      {
        mode: execute ? "dispatch" : "dry-run",
        source: input.commit,
        packages,
        channel: input.channel,
        command: invocation,
      },
      null,
      2,
    ),
  );
  if (!execute) return;
  const remote = await command([
    "gh",
    "api",
    `repos/${repository}/branches/main`,
    "--jq",
    ".commit.sha",
  ]);
  if (remote !== input.commit)
    throw new Error("Remote main must equal the selected source SHA; no push is performed");
  await command(invocation);
  console.log(
    "Dispatch requested; publication is not yet confirmed. Inspect the Actions run and registry receipt.",
  );
}
if (import.meta.main)
  dispatch(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
