import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { chmod, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  assertOIDC,
  inspect,
  main,
  npmEnvironment,
  release,
  run,
  type Channel,
  type Plan,
  type Result,
  type Runner,
} from "./release.ts";

const temporary: string[] = [];
afterEach(async () => {
  for (const directory of temporary.splice(0))
    await rm(directory, { recursive: true, force: true });
});
const encode = (value: string) => new TextEncoder().encode(value);
const result = (value = "", code = 0, stderr = ""): Result => ({
  code,
  stdout: encode(value),
  stderr,
});
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const commit = "a".repeat(40);

async function fixture(
  count = 2,
  dependencyRange = "^1.0.0",
  version = "1.2.3",
  optionalPeer = true,
  options: {
    names?: string[];
    selected?: string[];
    peers?: Record<string, Record<string, string>>;
    dependencies?: Record<string, Record<string, string>>;
    channel?: Channel;
  } = {},
) {
  const root = await mkdtemp(join(tmpdir(), "meowland-release-test-"));
  temporary.push(root);
  // This abbreviated text is isolated fixture data, not the project's license file.
  const license = "MIT License\nPermission is hereby granted (test fixture only).\n";
  await writeFile(join(root, "LICENSE"), license);
  const packages = [];
  for (const name of (options.names ?? ["meowjsx", "meowcss"]).slice(0, count)) {
    const directory = join(root, "packages", name);
    const packRoot = join(root, "staging", name);
    await mkdir(directory, { recursive: true });
    await mkdir(join(packRoot, "package", "dist"), { recursive: true });
    const manifest = {
      name,
      version,
      license: "MIT",
      repository: {
        type: "git",
        url: "git+https://github.com/example/meowland.git",
        directory: `packages/${name}`,
      },
      exports: { ".": "./dist/index.js" },
      ...(name === "meowcss"
        ? {
            peerDependencies: { meowjsx: dependencyRange },
            peerDependenciesMeta: { meowjsx: { optional: optionalPeer } },
          }
        : {}),
      ...(options.peers?.[name] ? { peerDependencies: options.peers[name] } : {}),
      ...(options.dependencies?.[name] ? { dependencies: options.dependencies[name] } : {}),
    };
    await writeFile(join(directory, "package.json"), JSON.stringify(manifest));
    await writeFile(join(packRoot, "package", "package.json"), JSON.stringify(manifest));
    await writeFile(join(packRoot, "package", "dist", "index.js"), "export const ready = true;\n");
    await writeFile(join(packRoot, "package", "LICENSE"), license);
    const file = `${name}-${version}.tgz`;
    const packed = await run(["tar", "-czf", join(root, file), "package"], packRoot);
    expect(packed.code).toBe(0);
    packages.push({ name, version, file, sha256: sha(await readFile(join(root, file))) });
  }
  const manifest = join(root, "release-input.json");
  await writeFile(manifest, JSON.stringify({ repository: "example/meowland", commit, packages }));
  const localCalls: string[][] = [];
  const local: Runner = async (args, cwd) => {
    localCalls.push(args);
    if (args[0] === "tar") return run(args, cwd);
    if (args.join(" ") === "git rev-parse HEAD") return result(commit);
    if (args[1] === "merge-base") return result();
    if (args[1] === "show")
      return result(await readFile(join(root, args[2]!.split(":")[1]!), "utf8"));
    if (args.includes("status")) return result();
    if (args[1] === "remote") return result("git@github.com:example/meowland.git");
    throw new Error(`Dry-run invoked a non-local command: ${args.join(" ")}`);
  };
  const plan = await inspect(
    root,
    manifest,
    options.selected ?? packages.map((item) => item.name),
    local,
    options.channel,
  );
  expect(plan.blockers).toEqual([]);
  return { root, manifest, plan, local, localCalls };
}

function external(plan: Plan, local: Runner) {
  const published = new Map<string, string>();
  const tags = new Map(
    plan.packages.map((item) => [item.name, { latest: "1.0.0" } as Record<string, string>]),
  );
  const calls: string[][] = [];
  const mutations: string[][] = [];
  let failing = "";
  const runner: Runner = async (args, cwd) => {
    calls.push(args);
    if (args[0] === "registry") {
      const name = args[2]!;
      const versions = Object.fromEntries(
        [...published.entries()]
          .filter(([tag]) => tag.startsWith(name + "@"))
          .map(([tag, integrity]) => [tag.slice(name.length + 1), { dist: { integrity } }]),
      );
      if (!tags.has(name))
        return result(
          JSON.stringify({ name, "dist-tags": { latest: "1.2.0" }, versions: { "1.2.0": {} } }),
        );
      return result(JSON.stringify({ name, "dist-tags": tags.get(name), versions }));
    }
    if (args[0] !== "npm") return local(args, cwd);
    if (args[1] === "whoami") return result('"tester"');
    if (args[1] === "access")
      return result(
        JSON.stringify(Object.fromEntries(plan.packages.map((item) => [item.name, "read-write"]))),
      );
    if (args[1] === "publish") {
      mutations.push(args);
      const item = plan.packages.find((candidate) => candidate.path === args[2])!;
      if (item.name === failing) {
        failing = "";
        return result("", 1);
      }
      published.set(item.tag, item.integrity);
      tags.get(item.name)![args[args.indexOf("--tag") + 1]!] = item.version;
      return result();
    }
    if (args[1] === "dist-tag") {
      mutations.push(args);
      const item = plan.packages.find((candidate) => candidate.tag === args[3])!;
      tags.get(item.name)![args[4]!] = item.version;
      return result();
    }
    throw new Error(`Unexpected npm call: ${args.join(" ")}`);
  };
  return {
    runner,
    calls,
    mutations,
    published,
    tags,
    fail: (name: string) => {
      failing = name;
    },
  };
}

test("default inspection is local and stable versions remain independent", async () => {
  const { plan, localCalls } = await fixture();
  expect(plan.channel).toBe("stable");
  expect(plan.distTag).toBe("latest");
  expect(localCalls.every((args) => ["git", "tar"].includes(args[0]!))).toBe(true);
  await expect(fixture(1, "^1.0.0", "1.2.3-alpha.0")).rejects.toThrow("stable");
});

test("alpha rejects arbitrary prerelease channels and never admits stable", async () => {
  for (const version of [
    "1.2.3",
    "1.2.3-beta.0",
    "1.2.3-alpha",
    "1.2.3-alpha.01",
    "1.2.3-alpha.0+meta",
    "0.2.0-slides.20261018.1",
  ])
    await expect(fixture(1, "*", version, true, { channel: "alpha" })).rejects.toThrow("alpha.N");
  const { plan } = await fixture(1, "*", "1.2.3-alpha.0", true, { channel: "alpha" });
  expect(plan.distTag).toBe("alpha");
});

test("dependency and peer contracts are checked separately with normal prerelease semantics", async () => {
  await expect(fixture(2, "^1.0.0", "1.2.3-alpha.0", true, { channel: "alpha" })).rejects.toThrow(
    "does not satisfy",
  );
  await expect(
    fixture(2, "^2.0.0", "1.2.3", true, { dependencies: { meowcss: { meowjsx: "^1.0.0" } } }),
  ).rejects.toThrow("does not satisfy");
  await expect(fixture(2, "not-a-range")).rejects.toThrow("Invalid dependency range");
  const { plan } = await fixture(2, "^1.2.3-alpha.0", "1.2.3-alpha.0", true, {
    channel: "alpha",
    selected: ["meowcss", "meowjsx"],
  });
  expect(plan.packages.map((item) => item.name)).toEqual(["meowjsx", "meowcss"]);
  await expect(
    fixture(2, "*", "1.2.3", true, { peers: { meowjsx: { meowcss: "*" } } }),
  ).rejects.toThrow("cycle");
});

test("alpha publishes explicit tags, preserves latest, and retries skip identical bytes", async () => {
  const { plan, local } = await fixture(2, "^1.2.3-alpha.0", "1.2.3-alpha.0", true, {
    channel: "alpha",
    selected: ["meowcss", "meowjsx"],
  });
  const remote = external(plan, local);
  remote.fail("meowcss");
  await expect(release(plan, remote.runner)).rejects.toThrow("npm publish failed");
  expect(remote.published.size).toBe(1);
  await release(plan, remote.runner);
  expect(remote.published.size).toBe(2);
  expect(
    remote.mutations.filter((args) => args[1] === "publish" && args[2] === plan.packages[0]!.path),
  ).toHaveLength(1);
  for (const args of remote.mutations) {
    expect(args).toContain("--tag");
    expect(args[args.indexOf("--tag") + 1]).toBe("alpha");
  }
  expect([...remote.tags.values()].every((tags) => tags.latest === "1.0.0")).toBe(true);
  expect(remote.calls.every((args) => !["gh", "push", "tag"].includes(args[0]!))).toBe(true);
});

test("same-byte versions repair only the chosen tag and preserve absent latest", async () => {
  const { plan, local } = await fixture(1, "*", "1.2.3-alpha.0", true, { channel: "alpha" });
  const remote = external(plan, local);
  remote.published.set(plan.packages[0]!.tag, plan.packages[0]!.integrity);
  remote.tags.set("meowjsx", { alpha: "1.2.2-alpha.0" });
  await release(plan, remote.runner);
  expect(remote.mutations).toEqual([["npm", "dist-tag", "add", "meowjsx@1.2.3-alpha.0", "alpha"]]);
  expect(remote.tags.get("meowjsx")!.latest).toBeUndefined();
  await release(plan, remote.runner);
  expect(remote.mutations).toHaveLength(1);
});

test("stable explicitly uses latest and check never mutates", async () => {
  const { plan, local } = await fixture(1);
  const remote = external(plan, local);
  await release(plan, remote.runner, "check");
  expect(remote.mutations).toHaveLength(0);
  await release(plan, remote.runner);
  expect(remote.mutations[0]).toContain("latest");
});

test("all packages preflight before mutation; conflicts and tag downgrades fail closed", async () => {
  for (const problem of ["bytes", "newer", "registry", "withdrawn", "dependency"] as const) {
    const { plan, local } = await fixture(2, "^1.0.0", "1.2.3", false);
    const remote = external(plan, local);
    const second = plan.packages[1]!;
    if (problem === "bytes") remote.published.set(second.tag, "sha512-different");
    if (problem === "newer") remote.tags.get(second.name)!.latest = "2.0.0";
    const runner: Runner = (args, cwd) => {
      if (problem === "registry" && args[0] === "registry")
        return Promise.resolve(result('{"error":{"code":"E403"}}', 1));
      if (problem === "withdrawn" && args[0] === "registry" && args[2] === second.name)
        return Promise.resolve(
          result(
            JSON.stringify({
              name: second.name,
              time: { unpublished: {} },
              "dist-tags": {},
              versions: {},
            }),
          ),
        );
      return remote.runner(args, cwd);
    };
    if (problem === "dependency") {
      const subset = await inspect(plan.root, plan.manifest, ["meowcss"], local);
      const subsetRemote = external(subset, local);
      await expect(
        release(subset, (args, cwd) =>
          args[0] === "registry" && args[2] === "meowjsx"
            ? Promise.resolve(
                result(
                  JSON.stringify({
                    name: "meowjsx",
                    "dist-tags": { latest: "0.9.0" },
                    versions: { "0.9.0": {} },
                  }),
                ),
              )
            : subsetRemote.runner(args, cwd),
        ),
      ).rejects.toThrow("compatible dependency");
      expect(subsetRemote.mutations).toHaveLength(0);
    } else {
      await expect(release(plan, runner)).rejects.toThrow();
      expect(remote.mutations).toHaveLength(0);
    }
  }
});

test("changed local inputs stop even when registry preflight passed", async () => {
  for (const problem of ["tarball", "input", "head", "tracked"] as const) {
    const { plan, local } = await fixture(1);
    const remote = external(plan, local);
    if (problem === "tarball") await writeFile(plan.packages[0]!.path, "changed");
    if (problem === "input") await writeFile(plan.manifest, "changed");
    const runner: Runner = (args, cwd) => {
      if (problem === "head" && args[1] === "rev-parse")
        return Promise.resolve(result("b".repeat(40)));
      if (problem === "tracked" && args.includes("status"))
        return Promise.resolve(result(" M package.json"));
      return remote.runner(args, cwd);
    };
    await expect(release(plan, runner)).rejects.toThrow("during preflight");
    expect(remote.mutations).toHaveLength(0);
  }
});

test("latest interference after alpha mutation fails without rollback", async () => {
  const { plan, local } = await fixture(1, "*", "1.2.3-alpha.0", true, { channel: "alpha" });
  const remote = external(plan, local);
  await expect(
    release(plan, async (args, cwd) => {
      const output = await remote.runner(args, cwd);
      if (args[1] === "publish") remote.tags.get("meowjsx")!.latest = "2.0.0";
      return output;
    }),
  ).rejects.toThrow("latest changed");
  expect(remote.mutations).toHaveLength(1);
});

test("selection stays explicit and an unselected optional peer does not expand it", async () => {
  const { root, manifest, local } = await fixture();
  const plan = await inspect(root, manifest, ["meowcss"], local);
  const remote = external(plan, local);
  await release(plan, remote.runner);
  expect([...remote.published.keys()]).toEqual(["meowcss@1.2.3"]);
  expect(remote.calls.some((args) => args[2]?.startsWith("meowjsx"))).toBe(false);
  for (const selected of [[], ["meowjsx", "meowjsx"], ["meowui"]])
    await expect(inspect(root, manifest, selected, local)).rejects.toThrow();
});

test("Slides alpha follows its explicitly selected runtime and UI peers", async () => {
  const { plan, root, manifest, local } = await fixture(3, "*", "0.1.0-alpha.0", false, {
    names: ["meowslides", "meowtail", "meowjsx"],
    peers: {
      meowslides: { meowtail: "^0.1.0-alpha.0", meowjsx: "^0.1.0-alpha.0" },
      meowtail: { meowjsx: "^0.1.0-alpha.0" },
    },
    channel: "alpha",
  });
  expect(plan.packages.map(({ name }) => name)).toEqual(["meowjsx", "meowtail", "meowslides"]);
  const subset = await inspect(root, manifest, ["meowjsx"], local, "alpha");
  expect(subset.packages.map(({ name }) => name)).toEqual(["meowjsx"]);
});

test("Press alpha accepts selected CSS and JSX peers without UI packages", async () => {
  const { plan } = await fixture(3, "^0.1.0-alpha.0", "0.1.0-alpha.0", false, {
    names: ["meowpress", "meowcss", "meowjsx"],
    peers: {
      meowpress: { meowjsx: "^0.1.0 || ^0.1.0-alpha.0", meowcss: "^0.1.0 || ^0.1.0-alpha.0" },
    },
    channel: "alpha",
  });
  expect(plan.packages.map(({ name }) => name)).toEqual(["meowjsx", "meowcss", "meowpress"]);
});

test("legacy GitHub flags are rejected and modes cannot be combined", async () => {
  for (const args of [
    ["--prepare-github"],
    ["--defer-finalize"],
    ["--acknowledge-unpublished", "meowpress"],
    ["--check", "--execute"],
    ["--execute", "--execute"],
    ["--channel", "beta"],
  ])
    await expect(main(args)).rejects.toThrow();
});

test("npm environment drops config overrides without reading or exposing credentials", () => {
  const env = npmEnvironment({
    PATH: "/tools",
    NPM_TOKEN: "fixture-placeholder",
    npm_config_registry: "https://wrong.invalid",
    NPM_CONFIG_USERCONFIG: "/wrong",
    npm_config__authToken: "wrong",
  });
  expect(env).toEqual({ PATH: "/tools" });
});

test("candidate Git files stay exact under a newer tool commit without consuming untracked data", async () => {
  const { root, manifest } = await fixture(1);
  const git = async (...args: string[]) => {
    const output = await run(["git", ...args], root);
    expect(output.code).toBe(0);
    return new TextDecoder().decode(output.stdout).trim();
  };
  const identity = [
    "-c",
    "user.name=Release Test",
    "-c",
    "user.email=release@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "-c",
    "core.hooksPath=/dev/null",
  ];
  await git("init", "--quiet");
  await git("add", "LICENSE", "packages/meowjsx/package.json");
  await git(...identity, "commit", "--quiet", "-m", "Candidate fixture");
  const candidate = await git("rev-parse", "HEAD");
  const input = JSON.parse(await readFile(manifest, "utf8"));
  input.commit = candidate;
  await writeFile(manifest, JSON.stringify(input));
  const source = join(root, "packages", "meowjsx", "package.json");
  const metadata = JSON.parse(await readFile(source, "utf8"));
  metadata.version = "9.9.9";
  await writeFile(source, JSON.stringify(metadata));
  await writeFile(join(root, "LICENSE"), "A different license in the tool commit\n");
  await git("add", "LICENSE", "packages/meowjsx/package.json");
  await git(...identity, "commit", "--quiet", "-m", "Tool fixture");
  const toolCommit = await git("rev-parse", "HEAD");
  await git("remote", "add", "origin", "https://github.com/example/meowland.git");
  await mkdir(join(root, "data"));
  await writeFile(join(root, "data", "untracked.txt"), "Not a release input\n");
  const calls: string[][] = [];
  const runner: Runner = (args, cwd) => {
    calls.push(args);
    return run(args, cwd);
  };
  const plan = await inspect(root, manifest, ["meowjsx"], runner);
  expect(plan.toolCommit).toBe(toolCommit);
  expect(plan.input.commit).toBe(candidate);
  expect(toolCommit).not.toBe(candidate);
  expect(plan.packages[0]!.version).toBe("1.2.3");
  expect(plan.blockers).toEqual([]);
  expect(calls).toContainEqual(["git", "show", `${candidate}:LICENSE`]);
  expect(calls).toContainEqual(["git", "show", `${candidate}:packages/meowjsx/package.json`]);
  expect(calls.find((args) => args.includes("status"))).toContain("--untracked-files=no");
  expect(calls.some((args) => args.some((arg) => arg.includes("data/")))).toBe(false);
  const tree = await git("rev-parse", `${candidate}^{tree}`);
  input.commit = await git(...identity, "commit-tree", tree, "-m", "Unrelated candidate fixture");
  await writeFile(manifest, JSON.stringify(input));
  const unrelated = await inspect(root, manifest, ["meowjsx"], runner);
  expect(unrelated.blockers).toEqual(["Reviewed commit is not an ancestor of the tool commit"]);
});

const oidc = {
  GITHUB_ACTIONS: "true",
  RUNNER_ENVIRONMENT: "github-hosted",
  GITHUB_REPOSITORY: "lidessen/meowland",
  GITHUB_EVENT_NAME: "workflow_dispatch",
  GITHUB_REF: "refs/heads/main",
  GITHUB_SHA: commit,
  GITHUB_WORKFLOW_REF: "lidessen/meowland/.github/workflows/npm-release.yml@refs/heads/main",
  ACTIONS_ID_TOKEN_REQUEST_URL: "https://fixture.invalid",
  ACTIONS_ID_TOKEN_REQUEST_TOKEN: "fixture-placeholder",
};
test("OIDC context fails closed outside the approved exact-source manual workflow", () => {
  assertOIDC(commit, oidc);
  for (const key of Object.keys(oidc))
    expect(() => assertOIDC(commit, { ...oidc, [key]: "" })).toThrow();
  expect(() => assertOIDC("b".repeat(40), oidc)).toThrow("SHA");
});

test("real subprocess excludes saved/token auth while preserving OIDC", async () => {
  const directory = await mkdtemp(join(tmpdir(), "meowland-npm-isolation-"));
  temporary.push(directory);
  const executable = join(directory, "npm");
  await writeFile(join(directory, ".npmrc"), "registry=https://wrong.invalid\n");
  await writeFile(
    executable,
    `#!${process.execPath}
import { readFile } from 'node:fs/promises';
const args = process.argv.slice(2);
const flag = (name) => args[args.indexOf(name) + 1];
console.log(JSON.stringify({
  isolated: process.cwd() !== ${JSON.stringify(directory)},
  configOverrides: Object.keys(process.env).some((key) => /^npm_config_/i.test(key)),
  traditionalAuth: ['NPM_TOKEN','NODE_AUTH_TOKEN','NPM_AUTH_TOKEN','NPM_ID_TOKEN'].some(key=>Boolean(process.env[key])),
  oidcPresent: Boolean(process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN),
  globalEmpty: await readFile(flag('--globalconfig'), 'utf8') === '',
  userEmpty: await readFile(flag('--userconfig'), 'utf8') === '',
  registry: flag('--registry') === 'https://registry.npmjs.org',
  scriptsOff: args.includes('--ignore-scripts'), workspacesOff: args.includes('--workspaces=false')
}));
`,
  );
  await chmod(executable, 0o700);
  const previous = Object.fromEntries(Object.keys(oidc).map((key) => [key, process.env[key]]));
  Object.assign(process.env, oidc);
  try {
    const output = await run([executable, "publish", "fixture.tgz"], directory);
    expect(output.code).toBe(0);
    expect(JSON.parse(new TextDecoder().decode(output.stdout))).toEqual({
      isolated: true,
      configOverrides: false,
      traditionalAuth: false,
      oidcPresent: true,
      globalEmpty: true,
      userEmpty: true,
      registry: true,
      scriptsOff: true,
      workspacesOff: true,
    });
    delete process.env.GITHUB_ACTIONS;
    await expect(run([executable, "publish", "fixture.tgz"], directory)).rejects.toThrow(
      "GitHub-hosted",
    );
    await expect(run([executable, "whoami"], directory)).rejects.toThrow("Unsupported OIDC");
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("public GET transport supports a first alpha with no latest and retries the same bytes", async () => {
  const { plan, local } = await fixture(1, "*", "1.2.3-alpha.0", true, { channel: "alpha" });
  const item = plan.packages[0]!;
  let published = false;
  let mutations = 0;
  let reads = 0;
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request) {
      expect(request.method).toBe("GET");
      expect(request.headers.get("authorization")).toBeNull();
      return published
        ? Response.json({
            name: item.name,
            "dist-tags": { alpha: item.version },
            versions: { [item.version]: { dist: { integrity: item.integrity } } },
          })
        : Response.json({ error: "Not found" }, { status: 404 });
    },
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((input, init) => {
    expect(input).toBe("https://registry.npmjs.org/meowjsx");
    reads++;
    return originalFetch(server.url, init);
  }) as typeof fetch;
  try {
    const runner: Runner = async (args, cwd) => {
      if (args[0] === "registry") return run(args, cwd);
      if (args[0] !== "npm") return local(args, cwd);
      if (args[1] === "whoami") return result('"tester"');
      if (args[1] === "access") return result('{"meowjsx":"read-write"}');
      expect(args[1]).toBe("publish");
      mutations++;
      published = true;
      return result();
    };
    await release(plan, runner);
    await release(plan, runner);
    expect(mutations).toBe(1);
    expect(reads).toBe(6);
  } finally {
    globalThis.fetch = originalFetch;
    await server.stop(true);
  }
});

test("registry status, malformed metadata and unknown 404 fail closed", async () => {
  const { plan, local } = await fixture(1);
  for (const reply of [
    result('{"error":"Not found"}', 401),
    result('{"error":"Not found"}', 500),
    result('{"error":"Unknown package"}', 404),
    result("{"),
    result('{"name":"wrong","dist-tags":{},"versions":{}}'),
    result('{"name":"meowjsx","dist-tags":{},"versions":[]}'),
  ]) {
    const remote = external(plan, local);
    await expect(
      release(plan, (args, cwd) =>
        args[0] === "registry" ? Promise.resolve(reply) : remote.runner(args, cwd),
      ),
    ).rejects.toThrow();
    expect(remote.mutations).toHaveLength(0);
  }
});
