import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { prerelease, satisfies, valid, validRange } from "semver";

const names = ["meowjsx", "meowcss", "meowui", "meowbook", "meowpress"];
const registry = "https://registry.npmjs.org";
const statusArgs = [
  "git",
  "--no-optional-locks",
  "-c",
  "core.fsmonitor=false",
  "status",
  "--porcelain",
  "--untracked-files=all",
];
const decoder = new TextDecoder();
export type Result = { code: number; stdout: Uint8Array; stderr: string };
export type Runner = (args: string[], cwd: string) => Promise<Result>;
type InputPackage = { name: string; version: string; file: string; sha256: string; notes?: string };
type Input = { repository: string; commit: string; packages: InputPackage[] };
type Package = InputPackage & {
  path: string;
  tag: string;
  integrity: string;
  dependencies: Record<string, { range: string; optional: boolean }>;
};
export type Plan = {
  root: string;
  manifest: string;
  manifestHash: string;
  input: Input;
  packages: Package[];
  blockers: string[];
};
const hash = (bytes: Uint8Array, algorithm = "sha256", encoding: "hex" | "base64" = "hex") =>
  createHash(algorithm).update(bytes).digest(encoding);
const text = (result: Result) => decoder.decode(result.stdout).trim();
function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
function releaseBody(item: Package, commit: string) {
  return `${item.notes ? `${item.notes}\n\n` : ""}Package ${item.tag}\nCommit ${commit}\nSHA256 ${item.sha256}`;
}

export const run: Runner = async (args, cwd) => {
  const child = Bun.spawn(args, { cwd, stdin: "ignore", stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).arrayBuffer(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { code, stdout: new Uint8Array(stdout), stderr };
};
async function checked(runner: Runner, args: string[], cwd: string) {
  const result = await runner(args, cwd);
  assert(result.code === 0, `${args[0]} ${args[1]} failed: ${result.stderr || text(result)}`);
  return result;
}
function repositoryOf(remote: string) {
  return /^(?:https:\/\/github\.com\/|git@github\.com:)([\w.-]+\/[\w.-]+?)(?:\.git)?$/.exec(
    remote,
  )?.[1];
}
async function originMatches(runner: Runner, root: string, repository: string) {
  for (const flags of [["--all"], ["--push", "--all"]]) {
    const result = await runner(["git", "remote", "get-url", ...flags, "origin"], root);
    if (
      result.code !== 0 ||
      !text(result) ||
      !text(result)
        .split("\n")
        .every((url) => repositoryOf(url) === repository)
    )
      return false;
  }
  return true;
}
function exportedFiles(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(exportedFiles);
}

/** Local-only inspection: no npm, gh, network, credentials, packing, or writes. */
export async function inspect(
  root: string,
  manifest: string,
  selected: string[],
  runner: Runner = run,
): Promise<Plan> {
  root = await realpath(root);
  manifest = resolve(manifest);
  assert(!manifest.includes("#"), "Manifest path cannot contain an asset label separator");
  assert(
    /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.json$/.test(basename(manifest)),
    "Use a plain JSON filename for the reviewed input",
  );
  const manifestBytes = new Uint8Array(await readFile(manifest));
  const input = JSON.parse(decoder.decode(manifestBytes)) as Input;
  assert(/^[\w.-]+\/[\w.-]+$/.test(input.repository), "Invalid GitHub repository");
  assert(/^[a-f0-9]{40}$/.test(input.commit), "A full reviewed commit is required");
  assert(Array.isArray(input.packages) && input.packages.length > 0, "No reviewed packages");
  assert(
    selected.length > 0 && new Set(selected).size === selected.length,
    "Select unique package names explicitly",
  );
  assert(
    new Set(input.packages.map((item) => item.name)).size === input.packages.length,
    "Duplicate reviewed package",
  );
  assert(
    input.packages.every((item) => names.includes(item.name)),
    "Unknown reviewed package",
  );
  const blockers: string[] = [];
  const head = text(await checked(runner, ["git", "rev-parse", "HEAD"], root));
  if (head !== input.commit) blockers.push("HEAD differs from the reviewed commit");
  if (text(await checked(runner, statusArgs, root)))
    blockers.push("Working tree or index is not clean");
  if (!(await originMatches(runner, root, input.repository)))
    blockers.push("origin must identify the exact GitHub repository");
  let license = "";
  try {
    license = await readFile(resolve(root, "LICENSE"), "utf8");
  } catch {
    /* Report together with package checks. */
  }
  if (!license.includes("MIT License") || !license.includes("Permission is hereby granted"))
    blockers.push("The reviewed root MIT LICENSE is missing");
  const packages: Package[] = [];
  for (const name of selected) {
    const item = input.packages.find((candidate) => candidate.name === name);
    assert(item, `Package is not in the reviewed input: ${name}`);
    assert(
      valid(item.version) === item.version && prerelease(item.version) === null,
      `Use a stable independent semver: ${name}`,
    );
    assert(
      item.notes === undefined || typeof item.notes === "string",
      `Notes must be a string: ${name}`,
    );
    assert(/^[a-f0-9]{64}$/.test(item.sha256), `Invalid SHA256: ${name}`);
    const path = await realpath(resolve(dirname(manifest), item.file));
    assert(!path.includes("#"), `Tarball path cannot contain an asset label separator: ${name}`);
    assert(
      basename(path) === `${name}-${item.version}.tgz`,
      `Unexpected tarball filename: ${name}`,
    );
    const bytes = new Uint8Array(await readFile(path));
    assert(hash(bytes) === item.sha256, `Reviewed tarball changed: ${name}`);
    const listing = text(await checked(runner, ["tar", "-tzf", path], root)).split("\n");
    assert(
      listing.every((file) => file.startsWith("package/") && !file.split("/").includes("..")),
      `Unsafe archive path: ${name}`,
    );
    assert(new Set(listing).size === listing.length, `Duplicate archive path: ${name}`);
    const packed = JSON.parse(
      text(await checked(runner, ["tar", "-xOf", path, "package/package.json"], root)),
    );
    const local = JSON.parse(
      await readFile(resolve(root, "packages", name, "package.json"), "utf8"),
    );
    assert(
      packed.name === name && packed.version === item.version && !packed.private,
      `Packed identity is invalid: ${name}`,
    );
    assert(
      !packed.publishConfig ||
        Object.entries(packed.publishConfig).every(
          ([key, value]) =>
            value ===
            ({ registry, access: "public", tag: "latest" } as Record<string, string>)[key],
        ),
      `Conflicting publishConfig: ${name}`,
    );
    assert(
      local.name === name && local.version === item.version,
      `Source version differs: ${name}`,
    );
    if (packed.license !== "MIT" || local.license !== "MIT" || !listing.includes("package/LICENSE"))
      blockers.push(`MIT package license or bundled LICENSE is missing: ${name}`);
    else {
      const bundled = text(await checked(runner, ["tar", "-xOf", path, "package/LICENSE"], root));
      if (bundled !== license.trim()) blockers.push(`Bundled LICENSE differs from root: ${name}`);
    }
    const targets = [...exportedFiles(packed.exports), ...exportedFiles(packed.bin)];
    assert(
      targets.length > 0 &&
        targets.every(
          (file) =>
            file.startsWith("./") &&
            !file.includes("*") &&
            listing.includes(`package/${file.slice(2)}`),
        ),
      `Missing exports or bin targets: ${name}`,
    );
    assert(
      !JSON.stringify([
        packed.dependencies,
        packed.peerDependencies,
        packed.optionalDependencies,
      ]).includes("workspace:"),
      `Unresolved workspace dependency: ${name}`,
    );
    const dependencies = Object.fromEntries(
      Object.entries({
        ...packed.peerDependencies,
        ...packed.optionalDependencies,
        ...packed.dependencies,
      })
        .filter(([dependency]) => names.includes(dependency))
        .map(([dependency, range]) => [
          dependency,
          {
            range: String(range),
            optional:
              !packed.dependencies?.[dependency] &&
              (Boolean(packed.optionalDependencies?.[dependency]) ||
                packed.peerDependenciesMeta?.[dependency]?.optional === true),
          },
        ]),
    );
    packages.push({
      ...item,
      path,
      tag: `${name}@${item.version}`,
      integrity: `sha512-${hash(bytes, "sha512", "base64")}`,
      dependencies,
    });
  }
  for (const item of packages) {
    for (const [dependency, { range }] of Object.entries(item.dependencies)) {
      assert(
        validRange(range) !== null,
        `Invalid dependency range: ${item.name} -> ${dependency}@${range}`,
      );
      const target = packages.find((candidate) => candidate.name === dependency);
      if (target)
        assert(
          satisfies(target.version, range),
          `Selected dependency version does not satisfy ${item.name}: ${dependency}@${range}`,
        );
    }
  }
  return { root, manifest, manifestHash: hash(manifestBytes), input, packages, blockers };
}

async function jsonCommand(
  runner: Runner,
  args: string[],
  root: string,
  absent: "github" | "npm" | null = null,
) {
  const result = await runner(args, root);
  if (result.code === 0) return JSON.parse(text(result));
  if (absent === "github" && /\(HTTP 404\)/.test(result.stderr)) return null;
  if (absent === "npm") {
    let error;
    try {
      error = JSON.parse(text(result)).error;
    } catch {
      /* Not a registry absence. */
    }
    if (error?.code === "E404" && !/unpublish/i.test(JSON.stringify(error))) return null;
  }
  throw new Error(`${args[0]} ${args[1]} read failed: ${result.stderr || text(result)}`);
}

/** Execute only after a separate human authorization; runner injection isolates mutation tests. */
export async function release(plan: Plan, runner: Runner = run) {
  assert(plan.blockers.length === 0, plan.blockers.join("\n"));
  const { root, input, packages } = plan;
  const command = (args: string[]) => checked(runner, args, root);
  const api = (path: string) =>
    jsonCommand(runner, ["gh", "api", "--hostname", "github.com", path], root, "github");
  const githubRepository = `github.com/${input.repository}`;
  const repo = await api(`repos/${input.repository}`);
  assert(
    repo?.full_name === input.repository && repo.permissions?.push === true,
    "GitHub repository identity or push permission differs",
  );
  const releasePages = await jsonCommand(
    runner,
    [
      "gh",
      "api",
      "--hostname",
      "github.com",
      "--paginate",
      "--slurp",
      `repos/${input.repository}/releases?per_page=100`,
    ],
    root,
  );
  assert(
    Array.isArray(releasePages) && releasePages.every(Array.isArray),
    "Invalid GitHub release list",
  );
  const releases = releasePages.flat();
  const branch = repo.default_branch;
  assert(typeof branch === "string" && branch.length > 0, "Missing remote default branch");
  const remoteHead = text(
    await command(["git", "ls-remote", "origin", `refs/heads/${branch}`]),
  ).split(/\s+/)[0];
  assert(
    remoteHead === input.commit,
    "Push the reviewed commit to the default branch before release",
  );
  const username = text(await command(["npm", "whoami", "--registry", registry]));
  assert(username.length > 0, "npm authentication is required; this script never logs in");
  const access = await jsonCommand(
    runner,
    ["npm", "access", "list", "packages", username, "--json", "--registry", registry],
    root,
  );
  const states: {
    item: Package;
    local: boolean;
    remote: boolean;
    release: any;
    published: boolean;
    missingAssets: string[];
  }[] = [];
  for (const item of packages) {
    const local = await runner(
      ["git", "show-ref", "--verify", "--quiet", `refs/tags/${item.tag}`],
      root,
    );
    assert(local.code === 0 || local.code === 1, `Cannot inspect local tag: ${item.tag}`);
    if (local.code === 0)
      assert(
        text(await command(["git", "rev-parse", "--verify", `refs/tags/${item.tag}^{commit}`])) ===
          input.commit,
        `Existing local tag differs: ${item.tag}`,
      );
    const tags = text(
      await command([
        "git",
        "ls-remote",
        "origin",
        `refs/tags/${item.tag}`,
        `refs/tags/${item.tag}^{}`,
      ]),
    );
    const tagRows = tags ? tags.split("\n").map((line) => line.split(/\s+/)) : [];
    const peeled = tagRows.find((row) => row[1]?.endsWith("^{}")) ?? tagRows[0];
    if (peeled) assert(peeled[0] === input.commit, `Existing remote tag differs: ${item.tag}`);
    const matches = releases.filter((entry: any) => entry.tag_name === item.tag);
    assert(matches.length < 2, `Ambiguous GitHub releases: ${item.tag}`);
    const existing = matches[0];
    const missingAssets: string[] = [];
    if (existing) {
      assert(peeled && existing.tag_name === item.tag, `Release tag differs: ${item.tag}`);
      assert(
        existing.body === releaseBody(item, input.commit),
        `Release provenance differs: ${item.tag}`,
      );
      for (const [asset, expected, source] of [
        [basename(item.path), item.sha256, item.path],
        [basename(plan.manifest), plan.manifestHash, plan.manifest],
      ] as const) {
        if (!existing.assets?.some((entry: any) => entry.name === asset)) {
          assert(existing.draft, `Public Release asset is missing: ${asset}`);
          missingAssets.push(source);
          continue;
        }
        const download = await command([
          "gh",
          "release",
          "download",
          item.tag,
          "--repo",
          githubRepository,
          "--pattern",
          asset,
          "--output",
          "-",
        ]);
        assert(hash(download.stdout) === expected, `Release asset differs: ${asset}`);
      }
    }
    const metadata = await jsonCommand(
      runner,
      ["npm", "view", item.name, "--json", "--registry", registry],
      root,
      "npm",
    );
    assert(
      !metadata?.time?.unpublished,
      `Unpublished package ownership must be resolved: ${item.name}`,
    );
    if (metadata)
      assert(
        access?.[item.name] === "read-write",
        `npm write access is not established: ${item.name}`,
      );
    const published = await jsonCommand(
      runner,
      [
        "npm",
        "view",
        `${item.name}@${item.version}`,
        "dist.integrity",
        "--json",
        "--registry",
        registry,
      ],
      root,
      "npm",
    );
    if (published !== null)
      assert(published === item.integrity, `Published version has different bytes: ${item.tag}`);
    if (existing && !existing.draft)
      assert(
        published === item.integrity,
        `Public Release is not backed by the reviewed npm package: ${item.tag}`,
      );
    for (const [dependency, { range, optional }] of Object.entries(item.dependencies)) {
      const selected = packages.find((candidate) => candidate.name === dependency);
      if (selected)
        assert(
          satisfies(selected.version, range),
          `Selected dependency version does not satisfy ${item.name}: ${dependency}@${range}`,
        );
      else if (!optional) {
        const available = await jsonCommand(
          runner,
          ["npm", "view", `${dependency}@${range}`, "version", "--json", "--registry", registry],
          root,
          "npm",
        );
        assert(
          (Array.isArray(available) ? available : [available]).some(
            (version) =>
              typeof version === "string" && valid(version) !== null && satisfies(version, range),
          ),
          `Publish a compatible dependency first or include it: ${dependency}@${range}`,
        );
      }
    }
    states.push({
      item,
      local: local.code === 0,
      remote: Boolean(peeled),
      release: existing,
      published: published !== null,
      missingAssets,
    });
  }
  // Every selected package passed preflight before the first tag or registry mutation.
  assert(
    text(await command(["git", "rev-parse", "HEAD"])) === input.commit &&
      !text(await command(statusArgs)),
    "Repository changed during preflight",
  );
  assert(
    hash(new Uint8Array(await readFile(plan.manifest))) === plan.manifestHash,
    "Reviewed manifest changed during preflight",
  );
  assert(await originMatches(runner, root, input.repository), "origin changed during preflight");
  for (const item of packages)
    assert(
      hash(new Uint8Array(await readFile(item.path))) === item.sha256,
      `Tarball changed during preflight: ${item.name}`,
    );
  for (const state of states) {
    const { item } = state;
    assert(
      hash(new Uint8Array(await readFile(item.path))) === item.sha256,
      `Tarball changed before publish: ${item.name}`,
    );
    if (!state.remote) {
      if (!state.local)
        await command([
          "git",
          "-c",
          "core.hooksPath=/dev/null",
          "tag",
          "--no-sign",
          item.tag,
          input.commit,
        ]);
      await command([
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "push",
        "origin",
        `refs/tags/${item.tag}:refs/tags/${item.tag}`,
      ]);
    }
    if (!state.release)
      await command([
        "gh",
        "release",
        "create",
        item.tag,
        item.path,
        plan.manifest,
        "--repo",
        githubRepository,
        "--verify-tag",
        "--draft",
        "--title",
        item.tag,
        "--notes",
        releaseBody(item, input.commit),
        "--latest=false",
      ]);
    else if (state.missingAssets.length)
      await command([
        "gh",
        "release",
        "upload",
        item.tag,
        ...state.missingAssets,
        "--repo",
        githubRepository,
      ]);
  }
  for (const { item, published } of states) {
    assert(
      hash(new Uint8Array(await readFile(item.path))) === item.sha256,
      `Tarball changed before publish: ${item.name}`,
    );
    if (!published)
      await command([
        "npm",
        "publish",
        item.path,
        "--registry",
        registry,
        "--access",
        "public",
        "--tag",
        "latest",
        "--ignore-scripts",
      ]);
  }
  for (const { item } of states) {
    const integrity = await jsonCommand(
      runner,
      [
        "npm",
        "view",
        `${item.name}@${item.version}`,
        "dist.integrity",
        "--json",
        "--registry",
        registry,
      ],
      root,
    );
    assert(integrity === item.integrity, `npm verification failed: ${item.tag}`);
  }
  for (const state of states)
    if (!state.release || state.release.draft)
      await command([
        "gh",
        "release",
        "edit",
        state.item.tag,
        "--repo",
        githubRepository,
        "--draft=false",
        "--latest=false",
        "--verify-tag",
      ]);
}

export async function main(args: string[]) {
  if (args.length === 1 && args[0] === "--help") {
    console.log(
      "Usage: bun scripts/release.ts --manifest <reviewed.json> --packages <name,name> [--execute]\nDefault: local-only dry-run; --execute changes Git tags, GitHub Releases, and npm.",
    );
    return;
  }
  const values = new Map<string, string>();
  let execute = false;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--execute") {
      assert(!execute, "Duplicate --execute");
      execute = true;
      continue;
    }
    assert(
      ["--manifest", "--packages"].includes(arg) && !values.has(arg),
      `Unknown or duplicate argument: ${arg}`,
    );
    const value = args[++index];
    assert(value && !value.startsWith("--"), `Missing value: ${arg}`);
    values.set(arg, value);
  }
  assert(
    values.has("--manifest") && values.has("--packages"),
    "Explicit --manifest and --packages are required",
  );
  const plan = await inspect(
    resolve(import.meta.dir, ".."),
    values.get("--manifest")!,
    values.get("--packages")!.split(","),
  );
  console.log(
    JSON.stringify(
      {
        mode: execute ? "execute" : "dry-run",
        repository: plan.input.repository,
        commit: plan.input.commit,
        packages: plan.packages.map((item) => ({
          name: item.name,
          version: item.version,
          tag: item.tag,
          sha256: item.sha256,
        })),
        blockers: plan.blockers,
        remoteState: "Not checked in dry-run; absence never proves registration rights",
      },
      null,
      2,
    ),
  );
  assert(plan.blockers.length === 0, plan.blockers.join("\n"));
  if (execute) await release(plan);
}
if (import.meta.main)
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
