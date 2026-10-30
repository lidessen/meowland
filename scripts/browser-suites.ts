import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** One Playwright run in the CI browser matrix. */
export interface BrowserSuite {
  /** Unique name; also names the job and its failure artifact. */
  suite: string;
  config: string;
  /** Extra Playwright arguments, such as a shard. */
  args?: string;
  /** A build step the suite's server needs first. */
  prepare?: string;
  /** The workspace whose code the suite exercises, together with everything it depends on. */
  root: string;
}

const meowtail = "packages/meowtail";
const meowtailConfig = `${meowtail}/playwright.config.ts`;

/** Every browser suite. Meowtail, the largest, runs its tests and its story matrix as two shards each. */
export const browserSuites: readonly BrowserSuite[] = [
  { suite: "meowjsx", config: "packages/meowjsx/playwright.config.ts", root: "packages/meowjsx" },
  ...[1, 2].map((shard) => ({
    suite: `meowtail-${shard}`,
    config: meowtailConfig,
    args: `--grep-invert @story-matrix --shard=${shard}/2`,
    root: meowtail,
  })),
  ...[1, 2].map((shard) => ({
    suite: `meowtail-story-matrix-${shard}`,
    config: meowtailConfig,
    args: `--grep @story-matrix --shard=${shard}/2`,
    root: meowtail,
  })),
  {
    suite: "meowbook",
    config: "packages/meowbook/playwright.config.ts",
    root: "packages/meowbook",
  },
  {
    suite: "meowslides",
    config: "packages/meowslides/playwright.config.ts",
    root: "packages/meowslides",
  },
  {
    suite: "meowslides-presentation",
    config: "packages/meowslides/tests/browser/presentation/playwright.config.ts",
    root: "packages/meowslides",
  },
  {
    suite: "meowslides-authoring",
    config: "packages/meowslides/tests/browser/authoring/playwright.config.ts",
    root: "packages/meowslides",
  },
  { suite: "showcase", config: "apps/showcase/playwright.config.ts", root: "apps/showcase" },
  ...["image-loading", "sunshine-welcome", "protecting-pandas"].map((work) => ({
    suite: work,
    config: `examples/${work}/tests/playwright.config.ts`,
    // Example works serve their own build output.
    prepare: `bun examples/${work}/build.ts`,
    root: `examples/${work}`,
  })),
];

/** A workspace directory and the workspace package names it depends on. */
export interface Workspace {
  dir: string;
  name: string;
  dependencies: readonly string[];
}

/** The directories whose package.json files make up the dependency graph. */
const WORKSPACE_PARENTS = ["packages", "apps", "examples"];

/** Read every workspace's name and its dependencies on other workspaces. */
export function readWorkspaces(root: string): Workspace[] {
  const manifests = WORKSPACE_PARENTS.flatMap((parent) =>
    readdirSync(join(root, parent), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) => {
        const dir = `${parent}/${entry.name}`;
        try {
          return [{ dir, json: JSON.parse(readFileSync(join(root, dir, "package.json"), "utf8")) }];
        } catch {
          return [];
        }
      }),
  );
  const names = new Set(manifests.map((manifest) => manifest.json.name as string));
  return manifests.map(({ dir, json }) => ({
    dir,
    name: json.name,
    dependencies: Object.keys({
      ...json.dependencies,
      ...json.devDependencies,
      ...json.peerDependencies,
    }).filter((name) => names.has(name)),
  }));
}

/** Prose cannot change what a browser renders. */
const IGNORED = /\.md$/;

/**
 * The suites a change affects. A file inside a workspace affects the suites whose workspace is
 * that one or depends on it, directly or not; a file under its `tests/` folder affects only its
 * own suites, since no other workspace imports a test. A file outside every workspace (root
 * configuration, the lockfile, workflows, scripts) could affect anything, so it selects every suite.
 */
export function selectSuites(
  changed: readonly string[],
  workspaces: readonly Workspace[],
  suites: readonly BrowserSuite[] = browserSuites,
): BrowserSuite[] {
  const touched = new Set<string>();
  const tested = new Set<string>();
  for (const file of changed) {
    if (IGNORED.test(file)) continue;
    const owner = workspaces.find((workspace) => file.startsWith(`${workspace.dir}/`));
    if (!owner) return [...suites];
    (file.startsWith(`${owner.dir}/tests/`) ? tested : touched).add(owner.name);
  }
  const byName = new Map(workspaces.map((workspace) => [workspace.name, workspace]));
  const reaches = (start: Workspace): boolean => {
    const seen = new Set<string>();
    const visit = (name: string): boolean => {
      if (touched.has(name)) return true;
      if (seen.has(name)) return false;
      seen.add(name);
      return (byName.get(name)?.dependencies ?? []).some(visit);
    };
    return visit(start.name);
  };
  return suites.filter((suite) => {
    const workspace = workspaces.find((candidate) => candidate.dir === suite.root);
    // A suite outside the known workspaces cannot be judged, so it always runs.
    return !workspace || tested.has(workspace.name) || reaches(workspace);
  });
}

/** The files a pull request changes against its base commit. */
function changedSince(base: string): string[] {
  const diff = spawnSync("git", ["diff", "--name-only", `${base}...HEAD`], { encoding: "utf8" });
  if (diff.status !== 0) throw new Error(`git diff against ${base} failed: ${diff.stderr}`);
  return diff.stdout.split("\n").filter(Boolean);
}

// `bun scripts/browser-suites.ts [--base <sha>]` prints the GitHub Actions matrix output. Without a
// base (a push to main or a manual run) every suite runs.
if (import.meta.main) {
  const index = process.argv.indexOf("--base");
  const base = index >= 0 ? process.argv[index + 1] : undefined;
  const root = join(import.meta.dir, "..");
  const selected = base ? selectSuites(changedSince(base), readWorkspaces(root)) : browserSuites;
  const include = selected.map(({ root: _root, ...suite }) => suite);
  console.log(`matrix=${JSON.stringify({ include })}`);
  console.log(`count=${include.length}`);
  console.error(
    `${include.length} of ${browserSuites.length} browser suites: ${include.map((suite) => suite.suite).join(", ") || "none"}`,
  );
}
