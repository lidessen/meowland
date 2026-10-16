import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { inspect, release, run, type Plan, type Result, type Runner } from "./release.ts";

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
) {
  const root = await mkdtemp(join(tmpdir(), "meowland-release-test-"));
  temporary.push(root);
  // This text is fixture data, not the project's unapproved license file.
  const license = "MIT License\nPermission is hereby granted (test fixture only).\n";
  await writeFile(join(root, "LICENSE"), license);
  const packages = [];
  for (const name of ["meowjsx", "meowcss"].slice(0, count)) {
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
    if (args.includes("status")) return result();
    if (args[1] === "remote") return result("git@github.com:example/meowland.git");
    throw new Error(`Dry-run invoked a non-local command: ${args.join(" ")}`);
  };
  const plan = await inspect(
    root,
    manifest,
    packages.map((item) => item.name),
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
      if (args[1] === "rev-parse" && args[2] === "HEAD") return result(commit);
      if (args.includes("status")) return result();
      if (args[1] === "show-ref")
        return result("", localTags.has(args.at(-1)!.slice("refs/tags/".length)) ? 0 : 1);
      if (args[1] === "rev-parse")
        return result(
          localTags.get(args.at(-1)!.slice("refs/tags/".length).replace("^{commit}", ""))!,
        );
      if (args[1] === "ls-remote") {
        if (args[3]?.startsWith("refs/heads/")) return result(`${commit}\trefs/heads/main`);
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
  for (const problem of ["head", "dirty", "origin", "push-origin"] as const) {
    const blocked = await inspect(root, manifest, ["meowjsx"], async (args, cwd) => {
      if (problem === "head" && args.join(" ") === "git rev-parse HEAD")
        return result("c".repeat(40));
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
