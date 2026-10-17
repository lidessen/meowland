import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { chmod, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { inspect, main, release, run, type Plan, type Result, type Runner } from "./release.ts";

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
      exports: { ".": "./dist/index.js" },
      ...(name === "meowcss"
        ? {
            peerDependencies: { meowjsx: dependencyRange },
            peerDependenciesMeta: { meowjsx: { optional: optionalPeer } },
          }
        : {}),
      ...(options.peers?.[name] ? { peerDependencies: options.peers[name] } : {}),
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
  );
  expect(plan.blockers).toEqual([]);
  return { root, manifest, plan, local, localCalls };
}

type RemoteRelease = { tag_name: string; draft: boolean; body: string; assets: { name: string }[] };
function external(plan: Plan) {
  const localTags = new Map<string, string>();
  const remoteTags = new Map<string, string>();
  const releases = new Map<string, RemoteRelease>();
  const assets = new Map<string, Uint8Array>();
  const published = new Map<string, string>();
  const mutations: string[][] = [];
  let failPublish = "";
  let failFinalize = "";
  let failUpload = false;
  let failRead = false;
  const notFound = () => result(JSON.stringify({ error: { code: "E404" } }), 1);
  const runner: Runner = async (args) => {
    if (args[0] === "git") {
      if (args[1] === "remote") return result("git@github.com:example/meowland.git");
      if (args[1] === "rev-parse" && args[2] === "HEAD") return result(plan.toolCommit);
      if (args.includes("status")) return result();
      if (args[1] === "show-ref")
        return result("", localTags.has(args.at(-1)!.slice("refs/tags/".length)) ? 0 : 1);
      if (args[1] === "rev-parse")
        return result(
          localTags.get(args.at(-1)!.slice("refs/tags/".length).replace("^{commit}", ""))!,
        );
      if (args[1] === "ls-remote") {
        if (args[3]?.startsWith("refs/heads/"))
          return result(`${plan.toolCommit}\trefs/heads/main`);
        const tag = args[3]!.slice("refs/tags/".length);
        return result(
          remoteTags.has(tag)
            ? `${"b".repeat(40)}\trefs/tags/${tag}\n${remoteTags.get(tag)}\trefs/tags/${tag}^{}`
            : "",
        );
      }
      if (args[3] === "tag") {
        mutations.push(args);
        localTags.set(args[5]!, args[6]!);
        return result();
      }
      if (args[3] === "push") {
        mutations.push(args);
        const tag = args[5]!.split(":")[0]!.slice("refs/tags/".length);
        remoteTags.set(tag, localTags.get(tag)!);
        return result();
      }
    }
    if (args[0] === "gh") {
      if (args[1] === "api") {
        if (failRead) return result("", 1, "HTTP 401 authentication failed");
        if (args.includes("--paginate")) return result(JSON.stringify([[...releases.values()]]));
        return result(
          JSON.stringify({
            full_name: "example/meowland",
            default_branch: "main",
            permissions: { push: true },
          }),
        );
      }
      const tag = args[3]!;
      if (args[2] === "download")
        return {
          code: 0,
          stdout: assets.get(`${tag}/${args[args.indexOf("--pattern") + 1]}`)!,
          stderr: "",
        };
      if (args[2] === "create") {
        mutations.push(args);
        const entry = {
          tag_name: tag,
          draft: true,
          body: args[args.indexOf("--notes") + 1]!,
          assets: [],
        };
        releases.set(tag, entry);
        if (failUpload) {
          failUpload = false;
          return result("", 1, "Upload interrupted after draft creation");
        }
        for (const path of args.slice(4, 6)) {
          const name = basename(path);
          assets.set(`${tag}/${name}`, await readFile(path));
          releases.get(tag)!.assets.push({ name });
        }
        return result();
      }
      if (args[2] === "upload") {
        mutations.push(args);
        for (const path of args.slice(4, args.indexOf("--repo"))) {
          const name = basename(path);
          expect(assets.has(`${tag}/${name}`)).toBe(false);
          assets.set(`${tag}/${name}`, await readFile(path));
          releases.get(tag)!.assets.push({ name });
        }
        return result();
      }
      if (args[2] === "edit") {
        mutations.push(args);
        if (failFinalize === tag) {
          failFinalize = "";
          return result("", 1, "Finalize interrupted");
        }
        releases.get(tag)!.draft = false;
        return result();
      }
    }
    if (args[0] === "npm") {
      if (args[1] === "whoami") return result("maintainer");
      if (args[1] === "access") return result(JSON.stringify({}));
      if (args[1] === "view")
        return published.has(args[2]!)
          ? result(JSON.stringify(published.get(args[2]!)))
          : notFound();
      if (args[1] === "publish") {
        mutations.push(args);
        const item = plan.packages.find((candidate) => candidate.path === args[2])!;
        expect(args).toContain("--ignore-scripts");
        expect(published.has(item.tag)).toBe(false);
        if (failPublish === item.name) {
          failPublish = "";
          return result("", 1, "Publish interrupted");
        }
        published.set(item.tag, item.integrity);
        return result();
      }
    }
    throw new Error(`Unexpected external command: ${args.join(" ")}`);
  };
  return {
    runner,
    localTags,
    remoteTags,
    releases,
    assets,
    published,
    mutations,
    failPublish(name: string) {
      failPublish = name;
    },
    failFinalize(tag: string) {
      failFinalize = tag;
    },
    failUpload() {
      failUpload = true;
    },
    failRead() {
      failRead = true;
    },
  };
}

test("dry-run reads real reviewed archives without network, credentials, or mutation", async () => {
  const { root, manifest, local, plan, localCalls } = await fixture();
  expect(plan.packages.map((item) => item.tag)).toEqual(["meowjsx@1.2.3", "meowcss@1.2.3"]);
  await expect(inspect(root, manifest, ["meowjsx", "meowjsx"], local)).rejects.toThrow("unique");
  expect(localCalls.every((args) => args[0] === "git" || args[0] === "tar")).toBe(true);
  await writeFile(plan.packages[0]!.path, "changed bytes");
  await expect(inspect(root, manifest, ["meowjsx"], local)).rejects.toThrow("tarball changed");
});

test("meowtail archives use their exact new candidate path and identity", async () => {
  const { plan, localCalls } = await fixture(1, "^0.1.0", "0.1.0", true, {
    names: ["meowtail"],
  });
  expect(plan.packages.map((item) => item.tag)).toEqual(["meowtail@0.1.0"]);
  expect(localCalls).toContainEqual(["git", "show", `${commit}:packages/meowtail/package.json`]);
  expect(localCalls.some((args) => args.some((value) => value.includes("meowui")))).toBe(false);
});

test("historical unselected meowui input stays readable for Press but cannot be released", async () => {
  const { root, manifest, plan, local } = await fixture(2, "^0.1.0", "0.1.0", true, {
    names: ["meowui", "meowpress"],
    selected: ["meowpress"],
  });
  const original = await readFile(manifest);
  expect(plan.manifestHash).toBe(sha(original));
  expect(plan.packages.map((item) => item.name)).toEqual(["meowpress"]);
  await expect(inspect(root, manifest, ["meowui"], local)).rejects.toThrow("retired");
  const remote = external(plan);
  await expect(
    release({ ...plan, packages: [{ ...plan.packages[0]!, name: "meowui" }] }, remote.runner),
  ).rejects.toThrow("retired");
  expect(remote.mutations).toEqual([]);
  expect(await readFile(manifest)).toEqual(original);
});

test("historical Book dependencies on meowui remain explicit release dependencies", async () => {
  const { plan } = await fixture(1, "^0.1.0", "0.1.0", true, {
    names: ["meowbook"],
    peers: { meowbook: { meowui: "^0.1.0" } },
  });
  expect(plan.packages[0]!.dependencies).toEqual({
    meowui: { range: "^0.1.0", optional: false },
  });
  const remote = external(plan);
  await expect(release(plan, remote.runner)).rejects.toThrow("meowui");
  expect(remote.mutations).toEqual([]);
});

test("GitHub preparation never invokes npm and complete execution reuses its exact drafts", async () => {
  const { plan } = await fixture();
  const remote = external(plan);
  const githubOnly: Runner = (args, cwd) => {
    if (args[0] === "npm") throw new Error("GitHub preparation must not invoke npm");
    return remote.runner(args, cwd);
  };
  await release(plan, githubOnly, "prepare-github");
  expect(remote.remoteTags.size).toBe(2);
  expect(remote.releases.size).toBe(2);
  expect([...remote.releases.values()].every((entry) => entry.draft)).toBe(true);
  expect(remote.published.size).toBe(0);
  expect(remote.mutations.some((args) => args[2] === "edit")).toBe(false);
  const preparedMutations = remote.mutations.length;
  await release(plan, githubOnly, "prepare-github");
  expect(remote.mutations).toHaveLength(preparedMutations);
  await release(plan, remote.runner);
  expect(remote.published.size).toBe(2);
  expect([...remote.releases.values()].every((entry) => !entry.draft)).toBe(true);
  expect(remote.mutations.filter((args) => args[2] === "create")).toHaveLength(2);
  expect(remote.mutations.filter((args) => args[3] === "tag")).toHaveLength(2);
});

test("GitHub preparation checks all selected identities before mutation and refuses public releases", async () => {
  const { plan } = await fixture();
  const conflicted = external(plan);
  conflicted.remoteTags.set(plan.packages[1]!.tag, "c".repeat(40));
  await expect(release(plan, conflicted.runner, "prepare-github")).rejects.toThrow(
    "Existing remote tag differs",
  );
  expect(conflicted.mutations).toHaveLength(0);
  const prepared = external(plan);
  await release(plan, prepared.runner, "prepare-github");
  const before = prepared.mutations.length;
  const asset = `${plan.packages[1]!.tag}/${basename(plan.packages[1]!.path)}`;
  prepared.assets.set(asset, encode("mismatching second package"));
  await expect(release(plan, prepared.runner, "prepare-github")).rejects.toThrow("asset differs");
  expect(prepared.mutations).toHaveLength(before);
  prepared.assets.set(asset, await readFile(plan.packages[1]!.path));
  prepared.releases.get(plan.packages[1]!.tag)!.draft = false;
  await expect(release(plan, prepared.runner, "prepare-github")).rejects.toThrow(
    "requires a draft Release",
  );
  expect(prepared.mutations).toHaveLength(before);
});

test("release mode flags are mutually exclusive and cannot repeat", async () => {
  for (const args of [
    ["--execute", "--prepare-github"],
    ["--prepare-github", "--execute"],
    ["--prepare-github", "--prepare-github"],
    ["--execute", "--execute"],
  ])
    await expect(main(args)).rejects.toThrow("Choose only one release mode");
});

test("native publish inherits real process stdio while metadata stays captured", async () => {
  const root = await mkdtemp(join(tmpdir(), "meowland-release-stdio-"));
  temporary.push(root);
  const executable = join(root, "npm");
  const evidence = join(root, "stdio.json");
  await writeFile(
    executable,
    `#!${process.execPath}
import { writeFileSync } from "node:fs";
if (process.argv[2] === "publish") {
  writeFileSync(process.argv[3], JSON.stringify({
    stdin: Boolean(process.stdin.isTTY),
    stdout: Boolean(process.stdout.isTTY),
    stderr: Boolean(process.stderr.isTTY),
  }));
  process.stdout.write("Isolated fake publish stdout\\n");
  process.stderr.write("Isolated fake publish stderr\\n");
  process.exit(7);
}
process.stdout.write(JSON.stringify({ metadata: true }));
`,
  );
  await chmod(executable, 0o755);
  const published = await run([executable, "publish", evidence], root);
  expect(published).toEqual({ code: 7, stdout: new Uint8Array(), stderr: "" });
  expect(JSON.parse(await readFile(evidence, "utf8"))).toEqual({
    stdin: Boolean(process.stdin.isTTY),
    stdout: Boolean(process.stdout.isTTY),
    stderr: Boolean(process.stderr.isTTY),
  });
  const metadata = await run([executable, "view", "fixture@1.2.3"], root);
  expect(metadata.code).toBe(0);
  expect(JSON.parse(new TextDecoder().decode(metadata.stdout))).toEqual({ metadata: true });
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

test("tool identity changes and an unpushed tool commit prevent all release mutations", async () => {
  const { root, manifest, local } = await fixture(1);
  const plan = await inspect(root, manifest, ["meowjsx"], (args, cwd) =>
    args.join(" ") === "git rev-parse HEAD"
      ? Promise.resolve(result("c".repeat(40)))
      : local(args, cwd),
  );
  for (const changed of ["head", "tracked", "remote"] as const) {
    const remote = external(plan);
    await expect(
      release(plan, (args, cwd) => {
        if (changed === "head" && args.join(" ") === "git rev-parse HEAD")
          return Promise.resolve(result("d".repeat(40)));
        if (changed === "tracked" && args.includes("status"))
          return Promise.resolve(result(" M scripts/release.ts"));
        if (changed === "remote" && args[1] === "ls-remote" && args[3]?.startsWith("refs/heads/"))
          return Promise.resolve(result(`${commit}\trefs/heads/main`));
        return remote.runner(args, cwd);
      }),
    ).rejects.toThrow(changed === "remote" ? "inspected tool commit" : "during preflight");
    expect(remote.mutations).toHaveLength(0);
  }
});

test("deferred finalization leaves verified packages in drafts and reentry never republishes", async () => {
  const { plan } = await fixture();
  const remote = external(plan);
  await release(plan, remote.runner, "execute", true);
  expect(remote.published.size).toBe(2);
  expect([...remote.releases.values()].every((entry) => entry.draft)).toBe(true);
  expect(remote.mutations.some((args) => args[2] === "edit")).toBe(false);
  await release(plan, remote.runner);
  expect([...remote.releases.values()].every((entry) => !entry.draft)).toBe(true);
  expect(remote.mutations.filter((args) => args[1] === "publish")).toHaveLength(2);
  expect(remote.mutations.filter((args) => args[3] === "tag")).toHaveLength(2);
  for (const args of [
    ["--defer-finalize"],
    ["--prepare-github", "--defer-finalize"],
    ["--execute", "--defer-finalize", "--defer-finalize"],
  ])
    await expect(main(args)).rejects.toThrow("defer-finalize");
  await expect(release(plan, remote.runner, "prepare-github", true)).rejects.toThrow(
    "requires --execute",
  );
});

test("all selected packages are verified before any public Release; partial npm success resumes", async () => {
  const { plan } = await fixture();
  const remote = external(plan);
  remote.failPublish("meowcss");
  await expect(release(plan, remote.runner)).rejects.toThrow("Publish interrupted");
  expect(remote.published.size).toBe(1);
  expect([...remote.releases.values()].every((entry) => entry.draft)).toBe(true);
  await release(plan, remote.runner);
  expect([...remote.releases.values()].every((entry) => !entry.draft)).toBe(true);
  expect(
    remote.mutations.filter((args) => args[1] === "publish" && args[2] === plan.packages[0]!.path),
  ).toHaveLength(1);
  expect(
    remote.mutations.some((args) => args.includes("--force") || args.includes("--clobber")),
  ).toBe(false);
});

test("explicit subset releases only that package and does not require an unselected optional peer", async () => {
  const { root, manifest, local } = await fixture();
  const plan = await inspect(root, manifest, ["meowcss"], local);
  const remote = external(plan);
  await release(plan, remote.runner);
  expect([...remote.remoteTags.keys()]).toEqual(["meowcss@1.2.3"]);
  expect([...remote.published.keys()]).toEqual(["meowcss@1.2.3"]);
});

test("local blockers and an altered second tarball prevent all external mutations", async () => {
  const { root, manifest, local, plan } = await fixture();
  for (const problem of ["candidate", "dirty", "origin", "push-origin"] as const) {
    const blocked = await inspect(root, manifest, ["meowjsx"], async (args, cwd) => {
      if (problem === "candidate" && args[1] === "merge-base") return result("", 1);
      if (problem === "dirty" && args.includes("status")) return result(" M package.json");
      if (problem === "origin" && args[1] === "remote") return result("", 2, "No such remote");
      if (problem === "push-origin" && args[1] === "remote" && args.includes("--push"))
        return result("git@github.com:someone/another-repository.git");
      return local(args, cwd);
    });
    expect(blocked.blockers).toHaveLength(1);
    let calls = 0;
    await expect(
      release(blocked, async () => {
        calls++;
        throw new Error("Must not invoke external tools");
      }),
    ).rejects.toThrow();
    expect(calls).toBe(0);
  }
  const remote = external(plan);
  await writeFile(plan.packages[1]!.path, "changed second archive");
  await expect(release(plan, remote.runner)).rejects.toThrow("during preflight");
  expect(remote.mutations).toHaveLength(0);
});

test("incomplete draft upload and partial finalization resume through existing authority state", async () => {
  const { plan } = await fixture();
  const remote = external(plan);
  remote.failUpload();
  await expect(release(plan, remote.runner)).rejects.toThrow("Upload interrupted");
  expect(remote.published.size).toBe(0);
  remote.failFinalize(plan.packages[1]!.tag);
  await expect(release(plan, remote.runner)).rejects.toThrow("Finalize interrupted");
  expect(remote.releases.get(plan.packages[0]!.tag)!.draft).toBe(false);
  await release(plan, remote.runner);
  expect(remote.mutations.filter((args) => args[2] === "create")).toHaveLength(2);
  expect(remote.mutations.filter((args) => args[1] === "publish")).toHaveLength(2);
  expect(remote.mutations.filter((args) => args[2] === "upload")).toHaveLength(1);
});

test("conflicting tag, published bytes, release assets, and authorization errors fail without new mutations", async () => {
  const { plan } = await fixture(1);
  for (const conflict of ["tag", "npm", "auth", "manifest"] as const) {
    const remote = external(plan);
    if (conflict === "tag") remote.remoteTags.set(plan.packages[0]!.tag, "c".repeat(40));
    if (conflict === "npm") remote.published.set(plan.packages[0]!.tag, "sha512-different");
    if (conflict === "auth") remote.failRead();
    if (conflict === "manifest") await writeFile(plan.manifest, "changed manifest");
    await expect(release(plan, remote.runner)).rejects.toThrow();
    expect(remote.mutations).toHaveLength(0);
  }
});

test("a resumed draft never overwrites mismatching uploaded assets", async () => {
  const { plan } = await fixture(1);
  const remote = external(plan);
  remote.failPublish("meowjsx");
  await expect(release(plan, remote.runner)).rejects.toThrow();
  remote.assets.set(
    `${plan.packages[0]!.tag}/${basename(plan.packages[0]!.path)}`,
    encode("wrong asset"),
  );
  const before = remote.mutations.length;
  await expect(release(plan, remote.runner)).rejects.toThrow("asset differs");
  expect(remote.mutations).toHaveLength(before);
});

test("strict semver rejects malformed ranges and explicit target mismatches without inferred bumps", async () => {
  await expect(fixture(2, "not-a-range")).rejects.toThrow("Invalid dependency range");
  await expect(fixture(2, "^0.3.0", "0.2.3")).rejects.toThrow(
    "Selected dependency version does not satisfy",
  );
  const compatible = await fixture(2, "^0.2.0 || ^1.0.0", "0.2.3");
  expect(compatible.plan.packages.map((item) => item.version)).toEqual(["0.2.3", "0.2.3"]);
  const source = join(compatible.root, "packages", "meowjsx", "package.json");
  const metadata = JSON.parse(await readFile(source, "utf8"));
  metadata.version = "0.2.4";
  await writeFile(source, JSON.stringify(metadata));
  await expect(
    inspect(compatible.root, compatible.manifest, ["meowjsx"], compatible.local),
  ).rejects.toThrow("Source version differs");
  const required = await fixture(2, "^1.0.0", "1.2.3", false);
  const selected = await inspect(required.root, required.manifest, ["meowcss"], required.local);
  for (const versions of [[], ["0.9.0"], ["1.2.0"]]) {
    const remote = external(selected);
    const attempt = release(selected, async (args, cwd) =>
      args[0] === "npm" &&
      args[1] === "view" &&
      args[2] === "meowjsx@^1.0.0" &&
      args[3] === "version"
        ? result(JSON.stringify(versions))
        : remote.runner(args, cwd),
    );
    if (versions[0] === "1.2.0") await attempt;
    else {
      await expect(attempt).rejects.toThrow("compatible dependency");
      expect(remote.mutations).toHaveLength(0);
    }
  }
});

test("release notes come from reviewed input and changed notes cannot overwrite a resumed draft", async () => {
  const { root, manifest, local } = await fixture(1);
  const input = JSON.parse(await readFile(manifest, "utf8"));
  input.packages[0].notes = "Operator-provided release explanation.";
  await writeFile(manifest, JSON.stringify(input));
  const plan = await inspect(root, manifest, ["meowjsx"], local);
  const remote = external(plan);
  remote.failPublish("meowjsx");
  await expect(release(plan, remote.runner)).rejects.toThrow("Publish interrupted");
  expect(remote.releases.get("meowjsx@1.2.3")?.body).toStartWith(
    "Operator-provided release explanation.\n\nPackage meowjsx@1.2.3",
  );
  const before = remote.mutations.length;
  input.packages[0].notes = "A different explanation.";
  await writeFile(manifest, JSON.stringify(input));
  const changed = await inspect(root, manifest, ["meowjsx"], local);
  await expect(release(changed, remote.runner)).rejects.toThrow("Release provenance differs");
  expect(remote.mutations).toHaveLength(before);
});

const oldWithdrawal = "2023-12-21T10:27:53.097Z";
const withdrawnLookup = (time = oldWithdrawal) =>
  result(JSON.stringify({ error: { code: "E404", summary: `Unpublished on ${time}` } }), 1);

test("unpublished acknowledgement is scoped to selected execute packages and reuses the original publish path", async () => {
  const { plan } = await fixture(1);
  const item = plan.packages[0]!;
  for (const rootResult of [
    withdrawnLookup(),
    result(
      JSON.stringify({
        name: item.name,
        time: { unpublished: { time: oldWithdrawal, versions: ["1.0.0", "1.0.1"] } },
      }),
    ),
  ]) {
    const remote = external(plan);
    const runner: Runner = (args, cwd) => {
      if (args[0] === "npm" && args[1] === "view") {
        if (args[2] === item.name) return Promise.resolve(rootResult);
        if (args[2] === item.tag && !remote.published.has(item.tag))
          return Promise.resolve(withdrawnLookup());
      }
      return remote.runner(args, cwd);
    };
    await expect(release(plan, runner, "execute", true)).rejects.toThrow(/unpublished|Unpublished/);
    expect(remote.mutations).toHaveLength(0);
    await release(plan, runner, "execute", true, [item.name]);
    expect(remote.published.get(item.tag)).toBe(item.integrity);
    expect(remote.releases.get(item.tag)!.draft).toBe(true);
    await release(plan, runner, "execute", false, [item.name]);
    expect(remote.releases.get(item.tag)!.draft).toBe(false);
    expect(remote.mutations.filter((args) => args[1] === "publish")).toHaveLength(1);
  }
  for (const acknowledged of [["meowcss"], [item.name, item.name]])
    await expect(
      release(plan, external(plan).runner, "execute", true, acknowledged),
    ).rejects.toThrow("unique selected");
  await expect(
    release(plan, external(plan).runner, "prepare-github", false, [item.name]),
  ).rejects.toThrow("only with --execute");
  for (const args of [
    ["--acknowledge-unpublished", item.name],
    ["--prepare-github", "--acknowledge-unpublished", item.name],
    ["--execute", "--acknowledge-unpublished", item.name, "--acknowledge-unpublished", item.name],
  ])
    await expect(main(args)).rejects.toThrow(/requires --execute|duplicate argument/);
  const group = await fixture();
  const remote = external(group.plan);
  await expect(
    release(
      group.plan,
      (args, cwd) =>
        args[0] === "npm" && args[1] === "view"
          ? Promise.resolve(withdrawnLookup())
          : remote.runner(args, cwd),
      "execute",
      true,
      [group.plan.packages[0]!.name],
    ),
  ).rejects.toThrow("explicit acknowledgement");
  expect(remote.mutations).toHaveLength(0);
});

test("unpublished acknowledgement preserves withdrawal policy, metadata, permission and integrity failures", async () => {
  const { plan } = await fixture(1);
  const item = plan.packages[0]!;
  const recent = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const metadata = (unpublished: unknown) =>
    result(JSON.stringify({ name: item.name, time: { unpublished } }));
  for (const failure of [
    { root: withdrawnLookup(recent), expected: "within 24 hours" },
    {
      root: metadata({ time: oldWithdrawal, versions: [item.version] }),
      expected: "cannot be reused",
    },
    { root: metadata({ time: recent, versions: [] }), expected: "within 24 hours" },
    { root: metadata({ time: oldWithdrawal }), expected: "withdrawn versions" },
    {
      root: metadata({ time: oldWithdrawal, versions: ["not-a-version"] }),
      expected: "withdrawn versions",
    },
    { root: metadata({ time: "invalid", versions: [] }), expected: "withdrawal time" },
    { root: result("[]"), expected: "Invalid package metadata" },
    {
      root: result(JSON.stringify({ name: item.name, time: "invalid" })),
      expected: "Invalid package time metadata",
    },
    { root: result("{"), expected: "JSON" },
    { root: result(JSON.stringify({ name: item.name })), expected: "write access" },
    {
      root: result(
        JSON.stringify({
          name: item.name,
          versions: [item.version],
          "dist-tags": { latest: item.version },
          time: { unpublished: { time: oldWithdrawal, versions: ["1.0.0"] } },
        }),
      ),
      expected: "write access",
    },
    { root: result("", 1, "ETIMEDOUT"), expected: "read failed" },
    { root: result(JSON.stringify({ error: { code: "E403" } }), 1), expected: "read failed" },
    {
      root: result(
        JSON.stringify({ error: { code: "E404", summary: "Unpublished for unknown reasons" } }),
        1,
      ),
      expected: "read failed",
    },
    {
      root: withdrawnLookup(),
      exact: withdrawnLookup("2023-12-22T10:27:53.097Z"),
      expected: "lookup changed",
    },
    {
      root: withdrawnLookup(),
      exact: result(JSON.stringify("sha512-different")),
      expected: "different bytes",
    },
    {
      root: withdrawnLookup(),
      exact: result("", 1, "E401 authentication failed"),
      expected: "read failed",
    },
  ]) {
    const remote = external(plan);
    await expect(
      release(
        plan,
        (args, cwd) => {
          if (args[0] === "npm" && args[1] === "view") {
            if (args[2] === item.name) return Promise.resolve(failure.root);
            if (args[2] === item.tag && failure.exact) return Promise.resolve(failure.exact);
          }
          return remote.runner(args, cwd);
        },
        "execute",
        true,
        [item.name],
      ),
    ).rejects.toThrow(failure.expected);
    expect(remote.mutations).toHaveLength(0);
  }
});

test("unpublished acknowledgement cannot hide a publish denial or a failed post-publish verification", async () => {
  const { plan } = await fixture(1);
  const item = plan.packages[0]!;
  for (const failure of ["publish", "verification"] as const) {
    const remote = external(plan);
    let attempts = 0;
    await expect(
      release(
        plan,
        (args, cwd) => {
          if (
            args[0] === "npm" &&
            args[1] === "view" &&
            (args[2] === item.name || args[2] === item.tag)
          )
            return Promise.resolve(withdrawnLookup());
          if (args[0] === "npm" && args[1] === "publish") {
            attempts++;
            if (failure === "publish")
              return Promise.resolve(result("", 1, "E403 registry denied publish"));
          }
          return remote.runner(args, cwd);
        },
        "execute",
        true,
        [item.name],
      ),
    ).rejects.toThrow(
      failure === "publish" ? "E403 registry denied publish" : "npm view read failed",
    );
    expect(attempts).toBe(1);
    expect(remote.releases.get(item.tag)!.draft).toBe(true);
    expect(remote.mutations.some((args) => args[2] === "edit")).toBe(false);
  }
});
