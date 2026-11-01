import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { valid } from "semver";
import { assertOIDC, run, type Runner } from "./release.ts";

/** The five inspected tarballs of the published alpha cohort. */
export const devTargets = [
  {
    name: "meowjsx",
    version: "0.3.0-alpha.0",
    previousDev: "0.3.0-alpha.0",
    sha256: "db1c7aec34dde0bbe3734681f02713eb02f1168741b63aaf1121e4a494fa4c4c",
    integrity:
      "sha512-XldoWxfBjao6+NRkZo5G0x8nkXyg2Gd0qC797DVbw9aYdDjt3rLgibWdCs0gzSwGrUaqrNy0HD6X3cj3HgLZAQ==",
  },
  {
    name: "meowcss",
    version: "0.3.0-alpha.1",
    previousDev: "0.3.0-alpha.0",
    sha256: "1e25d23720e64f76b2c005c7d8a803d4051dbf76e4432af75682923e5e6e604a",
    integrity:
      "sha512-zeR1RZkVwihwhBYEKUjSyoKawIJo/BQ21AOfCiUXJZAdJdwzx5RwUwF/WwFJXaT+DsER9CgFSQU+56+y2mBrag==",
  },
  {
    name: "meowtail",
    version: "0.4.0-alpha.1",
    previousDev: "0.4.0-alpha.0",
    sha256: "d0d8450014d1a4b8a56770b13da66419fd2f9ca2fd93db65978af42e2a1ba859",
    integrity:
      "sha512-2HB9x9HJH3p/fdE0CKzB8cCqeP2bmOHWi75xm+Jv8cpyxnYBIK7xfjA+V8HF7xdE/YACGmUnjl9hCGil+EYH1A==",
  },
  {
    name: "meowbook",
    version: "0.3.0-alpha.1",
    previousDev: "0.3.0-alpha.0",
    sha256: "c0c46c6becb275eb6f1f4c124fb9a1a1306213dee036c75278a8563f1d53eeaa",
    integrity:
      "sha512-GzQ8WInrQiSfwpgj0oPMvQK0p1pOS5Cx8YyXS/PWgzyWIgeHyy3gd/fepM+FoydJivaQXAPc5Wj/e6xvSMZhRQ==",
  },
  {
    name: "meowpress",
    version: "0.3.0-alpha.1",
    previousDev: "0.3.0-alpha.0",
    sha256: "683866862417a82d5d3b866b487fa46a0f8fafb122f25d6918e2bb5f9ead71a4",
    integrity:
      "sha512-I2rBhokL7pnkhnN0QorZiRNWllVSJOKX2kttKue4IRiXvL4evzUGZlxHB0GhPNS8+ilVbeqpLSYLw7uCmf3dEg==",
  },
] as const;

/** The separately published Slides tarball, selected only by an exact one-package request. */
export const slidesDevTargets = [
  {
    name: "meowslides",
    version: "0.2.0-alpha.0",
    previousDev: "0.1.0-alpha.1",
    sha256: "7a24cdb013d3c3cb52ae7b04490ea4421447ec27ed62c542d50e5407f23df23f",
    integrity:
      "sha512-OXIjAx7gzlL/DyICuGjB0SvXG9knV3iRZ2a/zT5CqtRODv9f0zML+zD09nMvruiRf4AZF6WU9MzvQOdi7ivEnw==",
  },
] as const;

export type DevTarget = Readonly<{
  name: string;
  version: string;
  previousDev: string;
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
const selectedFive = devTargets.map((target) => target.name).join(",");
const selectedSlides = slidesDevTargets[0].name;
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
    copy.dev === target.previousDev || copy.dev === target.version,
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

/** Preflight the entire selected fixed batch before changing any tag. */
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
    (targets.length === devTargets.length &&
      targets.every((item, index) => item.name === devTargets[index]?.name)) ||
      (targets.length === 1 && targets[0]?.name === selectedSlides),
    "Select the complete five-package set or meowslides alone",
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
  const packages = values.get("--packages");
  assert(
    packages === selectedFive || packages === selectedSlides,
    "Select the exact five published packages in order or meowslides alone",
  );
  assert(values.get("--channel") === "alpha", "Tag-dev requires the alpha channel");
  const source = values.get("--commit") ?? "";
  assert(/^[a-f0-9]{40}$/.test(source), "A full main SHA is required");
  return {
    source,
    mode: execute ? ("execute" as const) : ("check" as const),
    targets: packages === selectedSlides ? slidesDevTargets : devTargets,
  };
}

export async function main(args: string[]) {
  const request = parseTagDevRequest(args);
  const results = await tagDev(request.source, request.mode, { targets: request.targets });
  console.log(
    JSON.stringify({ mode: request.mode, commit: request.source, distTag: "dev", results }),
  );
}

if (import.meta.main) await main(process.argv.slice(2));
