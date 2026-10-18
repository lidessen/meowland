import { createHash } from "node:crypto";
import { mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { gt, prerelease, satisfies, valid, validRange } from "semver";

import { tmpdir } from "node:os";

export type Channel = "stable" | "alpha";
export const publishNames = [
  "meowjsx",
  "meowcss",
  "meowtail",
  "meowbook",
  "meowslides",
  "meowpress",
];
export const workflow = "npm-release.yml";
export const repository = "lidessen/meowland";
const names = ["meowjsx", "meowcss", "meowtail", "meowslides", "meowbook", "meowpress"];
// Historical inputs remain readable, but retired packages cannot be selected for release.
const reviewedNames = [...names, "meowui"];
const registry = "https://registry.npmjs.org";
const statusArgs = [
  "git",
  "--no-optional-locks",
  "-c",
  "core.fsmonitor=false",
  "status",
  "--porcelain",
  "--untracked-files=no",
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
  dependencies: { name: string; range: string; optional: boolean; kind: string }[];
};
export type Plan = {
  root: string;
  channel: Channel;
  distTag: "latest" | "alpha";
  toolCommit: string;
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
/** OIDC is the only publishing credential; never fall back to saved npm auth. */
export function npmEnvironment(source: NodeJS.ProcessEnv) {
  return Object.fromEntries(
    Object.entries(source).filter(
      ([key]) =>
        !/^npm_config_/i.test(key) &&
        !["NPM_TOKEN", "NODE_AUTH_TOKEN", "NPM_AUTH_TOKEN", "NPM_ID_TOKEN"].includes(
          key.toUpperCase(),
        ),
    ),
  );
}
export function assertOIDC(source?: string, env: NodeJS.ProcessEnv = process.env) {
  assert(
    env.GITHUB_ACTIONS === "true" && env.RUNNER_ENVIRONMENT === "github-hosted",
    "Publishing requires a GitHub-hosted Actions runner",
  );
  assert(
    env.GITHUB_REPOSITORY === repository &&
      env.GITHUB_EVENT_NAME === "workflow_dispatch" &&
      env.GITHUB_REF === "refs/heads/main" &&
      env.GITHUB_WORKFLOW_REF === `${repository}/.github/workflows/${workflow}@refs/heads/main`,
    "Publishing requires the approved manual main workflow",
  );
  assert(
    /^[a-f0-9]{40}$/.test(env.GITHUB_SHA ?? "") && (!source || source === env.GITHUB_SHA),
    "Source SHA must equal the workflow SHA",
  );
  assert(
    Boolean(env.ACTIONS_ID_TOKEN_REQUEST_URL) && Boolean(env.ACTIONS_ID_TOKEN_REQUEST_TOKEN),
    "OIDC request context is missing; grant id-token: write to the publishing job",
  );
}
export const run: Runner = async (args, cwd) => {
  if (args[0] === "registry") {
    assert(
      args[1] === "get" && args.length === 3 && reviewedNames.includes(args[2]!),
      "Invalid registry read",
    );
    const response = await fetch(`${registry}/${encodeURIComponent(args[2]!)}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(15000),
      redirect: "error",
      cache: "no-store",
    });
    return {
      code: response.status === 200 ? 0 : response.status,
      stdout: new Uint8Array(await response.arrayBuffer()),
      stderr: "",
    };
  }
  let isolated: string | undefined;
  let env: NodeJS.ProcessEnv | undefined;
  const npm = basename(args[0] ?? "") === "npm";
  if (npm) {
    assert(
      args[1] === "publish" || (args[1] === "dist-tag" && args[2] === "add"),
      "Unsupported OIDC operation",
    );
    assertOIDC();
    isolated = await mkdtemp(join(tmpdir(), "meowland-npm-"));
    await writeFile(join(isolated, "user.npmrc"), "");
    await writeFile(join(isolated, "global.npmrc"), "");
    cwd = isolated;
    env = npmEnvironment(process.env);
    args = [
      ...args,
      "--registry",
      registry,
      "--userconfig",
      join(isolated, "user.npmrc"),
      "--globalconfig",
      join(isolated, "global.npmrc"),
      "--ignore-scripts",
      "--workspaces=false",
    ];
  }
  try {
    const child = Bun.spawn(args, { cwd, env, stdin: "ignore", stdout: "pipe", stderr: "pipe" });
    const [stdout, stderr, code] = await Promise.all([
      new Response(child.stdout).arrayBuffer(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    return { code, stdout: new Uint8Array(stdout), stderr: npm ? "" : stderr };
  } finally {
    if (isolated) await rm(isolated, { recursive: true, force: true });
  }
};
async function checked(runner: Runner, args: string[], cwd: string) {
  const result = await runner(args, cwd);
  assert(
    result.code === 0,
    args[0] === "npm"
      ? `npm ${args[1]} failed (exit ${result.code}); verify trusted publisher configuration, allowed actions and registry availability`
      : `${args[0]} ${args[1]} failed (exit ${result.code}): ${result.stderr || text(result)}`,
  );
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
  channel: Channel = "stable",
): Promise<Plan> {
  root = await realpath(root);
  manifest = resolve(manifest);
  assert(channel === "stable" || channel === "alpha", "Unknown release channel");
  const distTag = channel === "alpha" ? "alpha" : "latest";
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
    selected.every((name) => names.includes(name)),
    "Unknown or retired selected package",
  );
  assert(
    new Set(input.packages.map((item) => item.name)).size === input.packages.length,
    "Duplicate reviewed package",
  );
  assert(
    input.packages.every((item) => reviewedNames.includes(item.name)),
    "Unknown reviewed package",
  );
  const blockers: string[] = [];
  const toolCommit = text(await checked(runner, ["git", "rev-parse", "HEAD"], root));
  assert(/^[a-f0-9]{40}$/.test(toolCommit), "A full tool commit is required");
  const ancestor = await runner(
    ["git", "merge-base", "--is-ancestor", input.commit, toolCommit],
    root,
  );
  assert(ancestor.code === 0 || ancestor.code === 1, "Cannot inspect reviewed commit ancestry");
  if (ancestor.code !== 0) blockers.push("Reviewed commit is not an ancestor of the tool commit");
  if (text(await checked(runner, statusArgs, root)))
    blockers.push("Tracked working tree or index is not clean");
  if (!(await originMatches(runner, root, input.repository)))
    blockers.push("origin must identify the exact GitHub repository");
  const candidateFile = async (path: string) =>
    text(await checked(runner, ["git", "show", `${input.commit}:${path}`], root));
  const license = await candidateFile("LICENSE");
  if (!license.includes("MIT License") || !license.includes("Permission is hereby granted"))
    blockers.push("The reviewed root MIT LICENSE is missing");
  const packages: Package[] = [];
  for (const name of selected) {
    const item = input.packages.find((candidate) => candidate.name === name);
    assert(item, `Package is not in the reviewed input: ${name}`);
    assert(
      valid(item.version) === item.version &&
        (channel === "stable"
          ? prerelease(item.version) === null
          : /^\d+\.\d+\.\d+-alpha\.\d+$/.test(item.version)),
      `Use an independent ${channel === "alpha" ? "x.y.z-alpha.N" : "stable"} semver: ${name}`,
    );
    assert(
      item.notes === undefined || typeof item.notes === "string",
      `Notes must be a string: ${name}`,
    );
    assert(/^[a-f0-9]{64}$/.test(item.sha256), `Invalid SHA256: ${name}`);
    const path = await realpath(resolve(dirname(manifest), item.file));
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
    const local = JSON.parse(await candidateFile(`packages/${name}/package.json`));
    assert(
      packed.name === name && packed.version === item.version && !packed.private,
      `Packed identity is invalid: ${name}`,
    );
    assert(
      !packed.publishConfig ||
        Object.entries(packed.publishConfig).every(
          ([key, value]) =>
            value === ({ registry, access: "public", tag: distTag } as Record<string, string>)[key],
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
    if (publishNames.includes(name)) {
      const expectedURL = `git+https://github.com/${input.repository}.git`;
      assert(
        local.repository?.url === expectedURL &&
          packed.repository?.url === expectedURL &&
          local.repository?.type === "git" &&
          packed.repository?.type === "git" &&
          local.repository?.directory === `packages/${name}` &&
          packed.repository?.directory === `packages/${name}`,
        `Repository metadata must match the reviewed source: ${name}`,
      );
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
    const dependencies = ["dependencies", "optionalDependencies", "peerDependencies"].flatMap(
      (kind) =>
        Object.entries(packed[kind] ?? {})
          .filter(([dependency]) => reviewedNames.includes(dependency))
          .map(([dependency, range]) => ({
            name: dependency,
            range: String(range),
            kind,
            optional:
              kind === "optionalDependencies" ||
              (kind === "peerDependencies" &&
                packed.peerDependenciesMeta?.[dependency]?.optional === true),
          })),
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
    for (const { name: dependency, range } of item.dependencies) {
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
  return {
    root,
    channel,
    distTag,
    toolCommit,
    manifest,
    manifestHash: hash(manifestBytes),
    input,
    packages: publishOrder(packages),
    blockers,
  };
}

/** Dependencies precede consumers regardless of the operator's selection order. */
function publishOrder(packages: Package[]) {
  const ordered: Package[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (item: Package) => {
    assert(!visiting.has(item.name), `Selected dependency cycle: ${item.name}`);
    if (visited.has(item.name)) return;
    visiting.add(item.name);
    for (const dependency of item.dependencies) {
      const target = packages.find((candidate) => candidate.name === dependency.name);
      if (target) visit(target);
    }
    visiting.delete(item.name);
    visited.add(item.name);
    ordered.push(item);
  };
  packages.forEach(visit);
  return ordered;
}

async function unchanged(plan: Plan, runner: Runner) {
  assert(
    text(await checked(runner, ["git", "rev-parse", "HEAD"], plan.root)) === plan.toolCommit,
    "Tool HEAD changed during preflight",
  );
  assert(
    !text(await checked(runner, statusArgs, plan.root)),
    "Tracked files changed during preflight",
  );
  assert(
    await originMatches(runner, plan.root, plan.input.repository),
    "origin changed during preflight",
  );
  assert(
    hash(await readFile(plan.manifest)) === plan.manifestHash,
    "Input changed during preflight",
  );
  for (const item of plan.packages)
    assert(
      hash(await readFile(item.path)) === item.sha256,
      `Tarball changed during preflight: ${item.name}`,
    );
}
function tagsOf(metadata: unknown): Record<string, string> {
  if (metadata === null) return {};
  assert(typeof metadata === "object" && !Array.isArray(metadata), "Invalid package metadata");
  const record = metadata as Record<string, unknown>;
  assert(
    !(record.time as { unpublished?: unknown } | undefined)?.unpublished,
    "Unpublished package requires manual investigation",
  );
  const tags = record["dist-tags"];
  assert(
    tags &&
      typeof tags === "object" &&
      !Array.isArray(tags) &&
      Object.values(tags).every((version) => typeof version === "string" && valid(version)),
    "Invalid package dist-tags",
  );
  return tags as Record<string, string>;
}

/** Public packuments do not depend on latest and never receive publishing credentials. */
async function metadata(runner: Runner, root: string, name: string) {
  const response = await runner(["registry", "get", name], root);
  let value;
  try {
    value = JSON.parse(text(response));
  } catch {
    throw new Error(`Registry returned invalid JSON: ${name}`);
  }
  if (response.code === 404 && value?.error === "Not found") return null;
  assert(response.code === 0, `Registry read failed: ${name} (status ${response.code})`);
  assert(value?.name === name, `Unexpected registry identity: ${name}`);
  tagsOf(value);
  assert(
    value.versions && typeof value.versions === "object" && !Array.isArray(value.versions),
    `Invalid registry versions: ${name}`,
  );
  return value;
}
function integrityOf(value: Awaited<ReturnType<typeof metadata>>, item: Package): string | null {
  if (value === null || !Object.hasOwn(value.versions, item.version)) return null;
  const integrity = value.versions[item.version]?.dist?.integrity;
  assert(typeof integrity === "string", `Missing registry integrity: ${item.tag}`);
  return integrity;
}

/** check is read-only; execute is the sole registry mutation path. No GitHub or push operations. */
export async function release(
  plan: Plan,
  runner: Runner = run,
  mode: "check" | "execute" = "execute",
  onVerified: (record: Record<string, unknown>) => void = () => {},
) {
  assert(plan.blockers.length === 0, plan.blockers.join("\n"));
  await unchanged(plan, runner);
  const states: { item: Package; exists: boolean; tags: Record<string, string> }[] = [];
  for (const item of plan.packages) {
    const packageMetadata = await metadata(runner, plan.root, item.name);
    const tags = tagsOf(packageMetadata);
    const current = tags[plan.distTag];
    assert(
      !current || !gt(current, item.version),
      `Refusing to move ${item.name} ${plan.distTag} backwards`,
    );
    const integrity = integrityOf(packageMetadata, item);
    assert(
      integrity === null || integrity === item.integrity,
      `Registry has different bytes: ${item.tag}`,
    );
    for (const dependency of item.dependencies) {
      if (
        dependency.optional ||
        plan.packages.some((candidate) => candidate.name === dependency.name)
      )
        continue;
      const dependencyMetadata = await metadata(runner, plan.root, dependency.name);
      const versions = Object.keys(dependencyMetadata?.versions ?? {});
      assert(
        versions.some(
          (version) =>
            typeof version === "string" && valid(version) && satisfies(version, dependency.range),
        ),
        `No compatible dependency: ${item.name} ${dependency.kind} ${dependency.name}@${dependency.range}`,
      );
    }
    states.push({ item, exists: integrity !== null, tags });
  }
  // All selected packages, bytes and dependencies have passed before the first mutation.
  await unchanged(plan, runner);
  if (mode === "check") return;
  for (const state of states) {
    const { item } = state;
    await unchanged(plan, runner);
    // Fail if another publisher changed any tag since preflight, rather than overwrite it.
    const before = tagsOf(await metadata(runner, plan.root, item.name));
    assert(
      before[plan.distTag] === state.tags[plan.distTag] && before.latest === state.tags.latest,
      `Registry tags changed during preflight: ${item.name}`,
    );
    if (!state.exists)
      await checked(
        runner,
        [
          "npm",
          "publish",
          item.path,
          "--access",
          "public",
          "--tag",
          plan.distTag,
          "--ignore-scripts",
        ],
        plan.root,
      );
    else if (before[plan.distTag] !== item.version)
      await checked(runner, ["npm", "dist-tag", "add", item.tag, plan.distTag], plan.root);
    const published = await metadata(runner, plan.root, item.name);
    assert(
      integrityOf(published, item) === item.integrity,
      `Registry verification failed: ${item.tag}`,
    );
    const after = tagsOf(published);
    assert(after[plan.distTag] === item.version, `Dist-tag verification failed: ${item.tag}`);
    if (plan.channel === "alpha")
      assert(
        after.latest === state.tags.latest,
        `latest changed during alpha release: ${item.name}; investigate without automatic rollback`,
      );
    onVerified({
      name: item.name,
      version: item.version,
      integrity: item.integrity,
      distTag: plan.distTag,
      latestBefore: state.tags.latest ?? null,
      latestAfter: after.latest ?? null,
      action: state.exists ? "reuse" : "publish",
    });
  }
}

export async function main(args: string[]) {
  if (args.length === 1 && args[0] === "--help") {
    console.log(
      "Usage: bun run release --manifest <reviewed.json> --packages <name,name> [--channel stable|alpha] [--check | --execute]\nDefault: local-only dry-run. --check reads public registry metadata; --execute publishes exact reviewed bytes. alpha never targets latest. Execution requires the approved manual GitHub Actions OIDC workflow; use release:dispatch locally.",
    );
    return;
  }
  const values = new Map<string, string>();
  let mode: "check" | "execute" | undefined;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--check" || arg === "--execute") {
      assert(!mode, "Choose one release mode without repetition");
      mode = arg === "--check" ? "check" : "execute";
    } else {
      assert(
        ["--manifest", "--packages", "--channel"].includes(arg) && !values.has(arg),
        `Unknown or duplicate argument: ${arg}`,
      );
      const value = args[++index];
      assert(value && !value.startsWith("--"), `Missing value: ${arg}`);
      values.set(arg, value);
    }
  }
  const channel = values.get("--channel") ?? "stable";
  assert(channel === "stable" || channel === "alpha", "Unknown release channel");
  assert(
    values.has("--manifest") && values.has("--packages"),
    "Explicit --manifest and --packages are required",
  );
  const plan = await inspect(
    resolve(import.meta.dir, ".."),
    values.get("--manifest")!,
    values.get("--packages")!.split(","),
    run,
    channel,
  );
  console.log(
    JSON.stringify(
      {
        mode: mode ?? "dry-run",
        channel,
        distTag: plan.distTag,
        repository: plan.input.repository,
        commit: plan.input.commit,
        toolCommit: plan.toolCommit,
        packages: plan.packages.map(({ name, version, sha256, integrity }) => ({
          name,
          version,
          sha256,
          integrity,
        })),
        blockers: plan.blockers,
        remoteState: mode
          ? "Checking registry; OIDC trust is verified only by the intended publish/tag operation"
          : "Not checked; dry-run uses no registry or credentials",
      },
      null,
      2,
    ),
  );
  assert(plan.blockers.length === 0, plan.blockers.join("\n"));
  if (mode === "execute") {
    assertOIDC(plan.input.commit);
    assert(plan.toolCommit === plan.input.commit, "Tool/source SHA must match in Actions");
  }
  if (mode) await release(plan, run, mode, (verified) => console.log(JSON.stringify({ verified })));
}
if (import.meta.main)
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
