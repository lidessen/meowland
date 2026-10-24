import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { valid } from "semver";
import { assertOIDC, run, type Runner } from "./release.ts";

/** The five immutable tarballs published from c6d6fd4. Slides was not published in that batch. */
export const devTargets = [
  {
    name: "meowjsx",
    version: "0.2.0-alpha.0",
    sha256: "108aec8f979ad035c9ca58b7756b7ff66ad515675edc0ec04acc8f85cde98146",
    integrity:
      "sha512-60ja909155njObDEE3GeyaRzbE2KqH3dxNf9wIgL4BP3a2Ymr92F6VWNC1OKlhA5FL2r1kxNVqp7OZp34IpIDA==",
  },
  {
    name: "meowcss",
    version: "0.2.0-alpha.0",
    sha256: "67f049403c22bde1443b50834603686a2a220ac6a1c10a135a48808ff21a827e",
    integrity:
      "sha512-yKr4Bl1Tg0tXEWPVssj3jdztzHrngWLxxznz3MFuAWXDfhmiwGxtJyK/xkVkCOdQmbd1ijDRnYkVWIJ1lbJ7rA==",
  },
  {
    name: "meowtail",
    version: "0.3.0-alpha.0",
    sha256: "f28e4d513bb8cf9d19a532c604e374f167268b37867f0f6c8295cfe4d4cf5e27",
    integrity:
      "sha512-ecFd5KXx85R1ZD8WL4q8hFzKqf2YjhXM7uLKoYek2viLJOCUCTZZ4vBIa+SLdVgoKjNsQsa3/aG79TvdeeQi/g==",
  },
  {
    name: "meowbook",
    version: "0.2.0-alpha.0",
    sha256: "21f67070e1d7d1ee0e4fad36fc484ee7a239bba55460b651e10f3d249903f9f1",
    integrity:
      "sha512-y6CJRHdRqXgoI3Ur/gQckuwbhFQGj0aobSOsK9cjby6e2+/Q97dL2r+ijXII63RllcqQWrO8Ca/DoSc1rD2l/A==",
  },
  {
    name: "meowpress",
    version: "0.2.0-alpha.0",
    sha256: "3f1f784281970b0be00eba87c921cac12266f8b587b805cf0d0bcfe82f7bfaa8",
    integrity:
      "sha512-Z2s7xL0jkM/VjV2682BFmiF/WupXtx8rd401y1lKfKQPUI2+K8al/kQMiPjgWEQ5fPgmrKJq+auCCEklC5mL4A==",
  },
] as const;

export type DevTarget = Readonly<{
  name: string;
  version: string;
  sha256: string;
  integrity: string;
}>;
export type Download = (url: string) => Promise<Uint8Array>;
export type Visibility = { reads?: number; pause?: (milliseconds: number) => Promise<void> };
export type TagResult = {
  name: string;
  version: string;
  action: "would-tag" | "already-tagged" | "tagged";
};

const root = resolve(import.meta.dir, "..");
const decoder = new TextDecoder();
const selected = devTargets.map((target) => target.name).join(",");
const statusArgs = [
  "git",
  "--no-optional-locks",
  "-c",
  "core.fsmonitor=false",
  "status",
  "--porcelain",
  "--untracked-files=no",
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function hash(bytes: Uint8Array, algorithm: "sha256" | "sha512") {
  return createHash(algorithm)
    .update(bytes)
    .digest(algorithm === "sha256" ? "hex" : "base64");
}

function tarballUrl(target: DevTarget) {
  return `https://registry.npmjs.org/${target.name}/-/${target.name}-${target.version}.tgz`;
}

export const downloadTarball: Download = async (url) => {
  const response = await fetch(url, {
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });
  assert(response.status === 200, `Tarball read failed (status ${response.status})`);
  return new Uint8Array(await response.arrayBuffer());
};

function equalTags(left: Record<string, string>, right: Record<string, string>) {
  const keys = Object.keys(left).sort();
  return (
    keys.length === Object.keys(right).length &&
    keys.every((key) => Object.hasOwn(right, key) && left[key] === right[key])
  );
}

async function readTags(target: DevTarget, runner: Runner): Promise<Record<string, string>> {
  const response = await runner(["registry", "get", target.name], root);
  assert(response.code === 0, `Registry read failed: ${target.name} (status ${response.code})`);
  let metadata: unknown;
  try {
    metadata = JSON.parse(decoder.decode(response.stdout));
  } catch {
    throw new Error(`Registry returned invalid JSON: ${target.name}`);
  }
  assert(
    metadata && typeof metadata === "object" && !Array.isArray(metadata),
    `Invalid registry metadata: ${target.name}`,
  );
  const record = metadata as Record<string, unknown>;
  assert(record.name === target.name, `Unexpected registry identity: ${target.name}`);
  assert(
    !(record.time as { unpublished?: unknown } | undefined)?.unpublished,
    `Unpublished package: ${target.name}`,
  );
  const versions = record.versions;
  assert(
    versions && typeof versions === "object" && !Array.isArray(versions),
    `Invalid registry versions: ${target.name}`,
  );
  const version = (versions as Record<string, unknown>)[target.version];
  assert(
    version && typeof version === "object" && !Array.isArray(version),
    `Missing published version: ${target.name}@${target.version}`,
  );
  const dist = (version as { dist?: unknown }).dist;
  assert(
    dist && typeof dist === "object" && !Array.isArray(dist),
    `Missing registry dist: ${target.name}`,
  );
  const recorded = dist as Record<string, unknown>;
  assert(
    recorded.integrity === target.integrity,
    `Registry integrity differs: ${target.name}@${target.version}`,
  );
  assert(
    recorded.tarball === tarballUrl(target),
    `Unexpected registry tarball URL: ${target.name}`,
  );
  const tags = record["dist-tags"];
  assert(
    tags && typeof tags === "object" && !Array.isArray(tags),
    `Invalid registry dist-tags: ${target.name}`,
  );
  assert(
    Object.entries(tags).every(
      ([tag, value]) => tag.length > 0 && typeof value === "string" && valid(value) === value,
    ),
    `Invalid registry dist-tags: ${target.name}`,
  );
  const copy = { ...(tags as Record<string, string>) };
  assert(copy.alpha === target.version, `Alpha tag moved: ${target.name}`);
  assert(
    copy.dev === undefined || copy.dev === target.version,
    `Dev tag already targets another version: ${target.name}`,
  );
  return copy;
}

async function assertCurrentSource(source: string, runner: Runner) {
  const head = await runner(["git", "rev-parse", "HEAD"], root);
  assert(
    head.code === 0 && decoder.decode(head.stdout).trim() === source,
    "Tool HEAD differs from the requested main SHA",
  );
  const status = await runner(statusArgs, root);
  assert(
    status.code === 0 && !decoder.decode(status.stdout).trim(),
    "Tracked working tree or index changed",
  );
}

/** Preflight the entire fixed batch before changing any tag. */
export async function tagDev(
  source: string,
  mode: "check" | "execute" = "check",
  options: {
    runner?: Runner;
    download?: Download;
    targets?: readonly DevTarget[];
    env?: NodeJS.ProcessEnv;
    visibility?: Visibility;
  } = {},
): Promise<TagResult[]> {
  assert(/^[a-f0-9]{40}$/.test(source), "A full main SHA is required");
  const runner = options.runner ?? run;
  const download = options.download ?? downloadTarball;
  const targets = options.targets ?? devTargets;
  const env = options.env ?? process.env;
  const reads = options.visibility?.reads ?? 41;
  const pause = options.visibility?.pause ?? ((milliseconds: number) => Bun.sleep(milliseconds));
  assert(Number.isInteger(reads) && reads > 0, "Invalid registry visibility read limit");
  assert(
    targets.length === devTargets.length &&
      targets.every((item, index) => item.name === devTargets[index]?.name),
    "The complete five-package set is required",
  );
  if (mode === "execute") assertOIDC(source, env);
  await assertCurrentSource(source, runner);
  const expected = new Map<string, Record<string, string>>();
  for (const target of targets) expected.set(target.name, await readTags(target, runner));
  for (const target of targets) {
    const bytes = await download(tarballUrl(target));
    assert(
      hash(bytes, "sha256") === target.sha256,
      `Published tarball SHA256 differs: ${target.name}`,
    );
    assert(
      `sha512-${hash(bytes, "sha512")}` === target.integrity,
      `Published tarball SHA512 differs: ${target.name}`,
    );
  }
  const verifyAll = async () => {
    await assertCurrentSource(source, runner);
    for (const target of targets)
      assert(
        equalTags(await readTags(target, runner), expected.get(target.name)!),
        `Registry tags changed during preflight: ${target.name}`,
      );
  };
  await verifyAll();
  if (mode === "check")
    return targets.map(({ name, version }) => ({
      name,
      version,
      action: expected.get(name)!.dev === version ? "already-tagged" : "would-tag",
    }));

  const results: TagResult[] = [];
  for (const target of targets) {
    assertOIDC(source, env);
    await verifyAll();
    if (expected.get(target.name)!.dev === target.version) {
      results.push({ name: target.name, version: target.version, action: "already-tagged" });
      continue;
    }
    let response;
    try {
      response = await runner(
        ["npm", "dist-tag", "add", `${target.name}@${target.version}`, "dev"],
        root,
      );
    } catch {
      throw new Error(
        `npm dist-tag outcome uncertain: ${target.name}; inspect registry before any retry`,
      );
    }
    assert(
      response.code === 0,
      `npm dist-tag outcome uncertain: ${target.name} (exit ${response.code}); inspect registry before any retry`,
    );
    const before = expected.get(target.name)!;
    const after = { ...before, dev: target.version };
    let visible = false;
    for (let index = 0; index < reads; index++) {
      const current = await readTags(target, runner);
      assert(
        equalTags(current, before) || equalTags(current, after),
        `Registry tags changed after dev tag action: ${target.name}`,
      );
      if (equalTags(current, after)) {
        visible = true;
        break;
      }
      if (index + 1 < reads) await pause(30000);
    }
    assert(
      visible,
      `Dev tag outcome uncertain after ${reads} reads: ${target.name}; inspect registry before any retry`,
    );
    expected.set(target.name, after);
    results.push({ name: target.name, version: target.version, action: "tagged" });
  }
  await verifyAll();
  return results;
}

export function parseTagDevRequest(args: string[]) {
  const values = new Map<string, string>();
  let execute = false;
  for (let index = 0; index < args.length; index++) {
    const key = args[index]!;
    if (key === "--execute") {
      assert(!execute, "Duplicate --execute");
      execute = true;
      continue;
    }
    assert(
      ["--commit", "--packages", "--channel"].includes(key) && !values.has(key),
      `Unknown or duplicate argument: ${key}`,
    );
    const value = args[++index];
    assert(value && !value.startsWith("--"), `Missing value: ${key}`);
    values.set(key, value);
  }
  assert(
    values.get("--packages") === selected,
    "Select the exact five published packages in order",
  );
  assert(values.get("--channel") === "alpha", "Tag-dev requires the alpha channel");
  const source = values.get("--commit") ?? "";
  assert(/^[a-f0-9]{40}$/.test(source), "A full main SHA is required");
  return { source, mode: execute ? ("execute" as const) : ("check" as const) };
}

export async function main(args: string[]) {
  const request = parseTagDevRequest(args);
  const results = await tagDev(request.source, request.mode);
  console.log(
    JSON.stringify({ mode: request.mode, commit: request.source, distTag: "dev", results }),
  );
}

if (import.meta.main) await main(process.argv.slice(2));
