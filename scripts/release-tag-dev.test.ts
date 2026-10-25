import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
  devTargets,
  parseTagDevRequest,
  slidesDevTargets,
  tagDev,
  type DevTarget,
  type Download,
} from "./release-tag-dev.ts";
import type { Result, Runner } from "./release.ts";

const commit = "a".repeat(40);
const encoded = (value: string) => new TextEncoder().encode(value);
const result = (value = "", code = 0): Result => ({ code, stdout: encoded(value), stderr: "" });
const oidc = {
  GITHUB_ACTIONS: "true",
  RUNNER_ENVIRONMENT: "github-hosted",
  GITHUB_REPOSITORY: "lidessen/meowland",
  GITHUB_EVENT_NAME: "workflow_dispatch",
  GITHUB_REF: "refs/heads/main",
  GITHUB_WORKFLOW_REF: "lidessen/meowland/.github/workflows/npm-release.yml@refs/heads/main",
  GITHUB_SHA: commit,
  ACTIONS_ID_TOKEN_REQUEST_URL: "fixture-url",
  ACTIONS_ID_TOKEN_REQUEST_TOKEN: "fixture-token",
};

function fixture(selectedTargets: readonly DevTarget[] = devTargets) {
  const bytes = new Map<string, Uint8Array>(
    selectedTargets.map(({ name }) => [name, encoded(`published ${name}`)]),
  );
  const targets: DevTarget[] = selectedTargets.map(({ name, version, previousDev }) => {
    const content = bytes.get(name)!;
    return {
      name,
      version,
      previousDev,
      sha256: createHash("sha256").update(content).digest("hex"),
      integrity: `sha512-${createHash("sha512").update(content).digest("base64")}`,
    };
  });
  const tags = new Map(
    targets.map((target) => [
      target.name,
      {
        alpha: target.version,
        dev: target.previousDev,
        latest: target.name === "meowslides" ? "0.1.0-alpha.1" : "0.1.0",
        legacy: "0.0.1",
      } as Record<string, string>,
    ]),
  );
  const calls: string[][] = [];
  const mutations: string[][] = [];
  let afterMutation: ((name: string) => void) | undefined;
  let npmFailure = false;
  const runner: Runner = async (args) => {
    calls.push(args);
    if (args[0] === "git" && args[1] === "rev-parse") return result(commit);
    if (args[0] === "git" && args.includes("status")) return result();
    if (args[0] === "registry") {
      const target = targets.find((item) => item.name === args[2]);
      if (!target) throw new Error("Unexpected registry target");
      return result(
        JSON.stringify({
          name: target.name,
          "dist-tags": tags.get(target.name),
          versions: {
            [target.version]: {
              dist: {
                integrity: target.integrity,
                tarball: `https://registry.npmjs.org/${target.name}/-/${target.name}-${target.version}.tgz`,
              },
            },
          },
        }),
      );
    }
    if (args[0] === "npm") {
      mutations.push(args);
      if (args[1] !== "dist-tag" || args[2] !== "add" || args[4] !== "dev")
        throw new Error("Unexpected npm mutation");
      const target = targets.find((item) => `${item.name}@${item.version}` === args[3]);
      if (!target) throw new Error("Unexpected npm package");
      tags.get(target.name)!.dev = target.version;
      afterMutation?.(target.name);
      return result("", npmFailure ? 1 : 0);
    }
    throw new Error(`Unexpected command: ${args.join(" ")}`);
  };
  const download: Download = async (url) => {
    const target = targets.find(
      (item) =>
        url === `https://registry.npmjs.org/${item.name}/-/${item.name}-${item.version}.tgz`,
    );
    if (!target) throw new Error("Unexpected tarball URL");
    return bytes.get(target.name)!;
  };
  const options = () => ({
    runner,
    download,
    targets,
    env: oidc,
    visibility: { reads: 2, pause: async () => {} },
  });
  return {
    targets,
    bytes,
    tags,
    calls,
    mutations,
    runner,
    download,
    options,
    onMutation(callback: (name: string) => void) {
      afterMutation = callback;
    },
    failNpm() {
      npmFailure = true;
    },
  };
}

test("request selects exactly five published alphas and requires an explicit mutation flag", () => {
  const args = [
    "--commit",
    commit,
    "--packages",
    devTargets.map((target) => target.name).join(","),
    "--channel",
    "alpha",
  ];
  expect(parseTagDevRequest(args)).toEqual({
    source: commit,
    mode: "check",
    targets: devTargets,
  });
  expect(parseTagDevRequest([...args, "--execute"]).mode).toBe("execute");
  expect(
    parseTagDevRequest(["--commit", commit, "--packages", "meowslides", "--channel", "alpha"])
      .targets,
  ).toEqual(slidesDevTargets);
  for (const invalid of [
    args.slice(0, -2),
    [...args.slice(0, -1), "stable"],
    [...args.slice(0, 3), "meowjsx,meowcss", ...args.slice(4)],
    [...args.slice(0, 3), "meowslides,meowjsx", ...args.slice(4)],
    [...args, "--execute", "--execute"],
    [...args, "--operation", "publish"],
    ["--commit", "main", ...args.slice(2)],
  ])
    expect(() => parseTagDevRequest(invalid)).toThrow();
});

test("Slides-only execution moves its pinned dev tag and preserves latest", async () => {
  const setup = fixture(slidesDevTargets);
  const target = setup.targets[0]!;
  expect(await tagDev(commit, "check", setup.options())).toEqual([
    { name: "meowslides", version: target.version, action: "would-tag" },
  ]);
  expect(setup.mutations).toEqual([]);

  expect(await tagDev(commit, "execute", setup.options())).toEqual([
    { name: "meowslides", version: target.version, action: "tagged" },
  ]);
  expect(setup.mutations).toEqual([["npm", "dist-tag", "add", "meowslides@0.2.0-alpha.0", "dev"]]);
  expect(setup.tags.get("meowslides")).toEqual({
    alpha: "0.2.0-alpha.0",
    dev: "0.2.0-alpha.0",
    latest: "0.1.0-alpha.1",
    legacy: "0.0.1",
  });
  expect(
    setup.calls.filter((args) => args[0] === "registry").every((args) => args[2] === "meowslides"),
  ).toBe(true);
  expect(await tagDev(commit, "execute", setup.options())).toEqual([
    { name: "meowslides", version: target.version, action: "already-tagged" },
  ]);
  expect(setup.mutations).toHaveLength(1);
});

test("Slides-only preflight rejects changed tags or tarball bytes before mutation", async () => {
  const alpha = fixture(slidesDevTargets);
  alpha.tags.get("meowslides")!.alpha = "0.1.0-alpha.1";
  await expect(tagDev(commit, "execute", alpha.options())).rejects.toThrow("Alpha tag moved");
  expect(alpha.mutations).toEqual([]);

  const dev = fixture(slidesDevTargets);
  dev.tags.get("meowslides")!.dev = "0.0.0-stage";
  await expect(tagDev(commit, "execute", dev.options())).rejects.toThrow(
    "Dev tag already targets another version",
  );
  expect(dev.mutations).toEqual([]);

  const tarball = fixture(slidesDevTargets);
  tarball.targets[0] = { ...tarball.targets[0]!, sha256: "0".repeat(64) };
  await expect(tagDev(commit, "execute", tarball.options())).rejects.toThrow("SHA256 differs");
  expect(tarball.mutations).toEqual([]);
});

test("check mode verifies all five tarballs and reports planned tags without mutation", async () => {
  const setup = fixture();
  const results = await tagDev(commit, "check", setup.options());
  expect(results.map((item) => item.action)).toEqual(Array(5).fill("would-tag"));
  expect(setup.mutations).toEqual([]);
  expect(setup.calls.filter((args) => args[0] === "registry").length).toBeGreaterThan(5);
});

test("execution moves five pinned dev tags and preserves every other dist-tag", async () => {
  const setup = fixture();
  const results = await tagDev(commit, "execute", setup.options());
  expect(results.map((item) => item.action)).toEqual(Array(5).fill("tagged"));
  expect(setup.mutations).toEqual(
    setup.targets.map(({ name, version }) => [
      "npm",
      "dist-tag",
      "add",
      `${name}@${version}`,
      "dev",
    ]),
  );
  for (const target of setup.targets)
    expect(setup.tags.get(target.name)).toEqual({
      alpha: target.version,
      latest: "0.1.0",
      legacy: "0.0.1",
      dev: target.version,
    });
  const second = await tagDev(commit, "execute", setup.options());
  expect(second.map((item) => item.action)).toEqual(Array(5).fill("already-tagged"));
  expect(setup.mutations).toHaveLength(5);
});

test("an interrupted move resumes only the still-old dev tags", async () => {
  const setup = fixture();
  setup.tags.get("meowjsx")!.dev = setup.targets[0]!.version;
  const results = await tagDev(commit, "execute", setup.options());
  expect(results.map((item) => item.action)).toEqual([
    "already-tagged",
    "tagged",
    "tagged",
    "tagged",
    "tagged",
  ]);
  expect(setup.mutations).toHaveLength(4);
  for (const target of setup.targets) {
    expect(setup.tags.get(target.name)!.dev).toBe(target.version);
    expect(setup.tags.get(target.name)!.latest).toBe("0.1.0");
  }
});

test("OIDC context is required before any execution read or mutation", async () => {
  const setup = fixture();
  await expect(
    tagDev(commit, "execute", {
      ...setup.options(),
      env: { ...oidc, GITHUB_REF: "refs/heads/other" },
    }),
  ).rejects.toThrow("approved manual main workflow");
  expect(setup.calls).toEqual([]);
});

test("a later package integrity or tarball mismatch blocks the entire batch", async () => {
  const integrity = fixture();
  integrity.targets[4] = { ...integrity.targets[4]!, integrity: "sha512-wrong" };
  await expect(tagDev(commit, "execute", integrity.options())).rejects.toThrow("SHA512 differs");
  expect(integrity.mutations).toEqual([]);

  const tarball = fixture();
  tarball.targets[4] = { ...tarball.targets[4]!, sha256: "0".repeat(64) };
  await expect(tagDev(commit, "execute", tarball.options())).rejects.toThrow("SHA256 differs");
  expect(tarball.mutations).toEqual([]);
});

test("an altered alpha or preexisting dev target blocks all mutations", async () => {
  const alpha = fixture();
  alpha.tags.get("meowpress")!.alpha = "0.1.1-alpha.1";
  await expect(tagDev(commit, "execute", alpha.options())).rejects.toThrow("Alpha tag moved");
  expect(alpha.mutations).toEqual([]);

  const dev = fixture();
  dev.tags.get("meowbook")!.dev = "0.1.1";
  await expect(tagDev(commit, "execute", dev.options())).rejects.toThrow(
    "Dev tag already targets another version",
  );
  expect(dev.mutations).toEqual([]);

  const missing = fixture();
  delete missing.tags.get("meowbook")!.dev;
  await expect(tagDev(commit, "execute", missing.options())).rejects.toThrow(
    "Dev tag already targets another version",
  );
  expect(missing.mutations).toEqual([]);
});

test("a concurrent change stops before the next tag without rolling the first one back", async () => {
  const setup = fixture();
  setup.onMutation((name) => {
    if (name === "meowjsx") setup.tags.get("meowcss")!.legacy = "0.0.2";
  });
  await expect(tagDev(commit, "execute", setup.options())).rejects.toThrow(
    "Registry tags changed during preflight: meowcss",
  );
  expect(setup.mutations).toHaveLength(1);
  expect(setup.tags.get("meowjsx")!.dev).toBe("0.3.0-alpha.0");
});

test("a failed npm response is uncertain and never causes an automatic retry", async () => {
  const setup = fixture();
  setup.failNpm();
  await expect(tagDev(commit, "execute", setup.options())).rejects.toThrow("outcome uncertain");
  expect(setup.mutations).toHaveLength(1);
});

test("a post-mutation change to another tag fails verification", async () => {
  const setup = fixture();
  setup.onMutation((name) => {
    if (name === "meowjsx") setup.tags.get(name)!.latest = "0.2.0";
  });
  await expect(tagDev(commit, "execute", setup.options())).rejects.toThrow(
    "Registry tags changed after dev tag action",
  );
  expect(setup.mutations).toHaveLength(1);
});
