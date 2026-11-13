import { expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { buildSite } from "meowpress/build";
import { listTextFiles, normalizeOutput, writeFixtureSite } from "../fixtures/site";

/**
 * Pins the generated English output of a site that configures no `locales`. The snapshot files
 * were generated from the source before the theme moved to message tables, so this test proves
 * that single-locale output is byte-identical. Regenerate deliberately with
 * `MEOWPRESS_UPDATE_SNAPSHOTS=1 bun test tests/unit/output-snapshot.test.ts`.
 */
const SNAPSHOT_ROOT = join(import.meta.dir, "../fixtures/snapshots");

async function snapshotScenario(
  name: string,
  options: {
    populate: boolean;
    config: (root: string, output: string) => Parameters<typeof buildSite>[0];
  },
): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "meowpress-snapshot-"));
  const snapshots = join(SNAPSHOT_ROOT, name);
  try {
    if (options.populate) await writeFixtureSite(root);
    else await mkdir(join(root, "content"), { recursive: true });
    const output = join(root, "dist");
    await buildSite(options.config(root, output));
    const generated = new Map<string, string>();
    for (const file of await listTextFiles(output)) {
      generated.set(relative(output, file), normalizeOutput(await Bun.file(file).text()));
    }
    expect([...generated.keys()]).toContain("index.html");
    expect([...generated.keys()]).toContain("404.html");
    if (process.env.MEOWPRESS_UPDATE_SNAPSHOTS === "1") {
      await rm(snapshots, { recursive: true, force: true });
      for (const [path, text] of generated) {
        await mkdir(dirname(join(snapshots, path)), { recursive: true });
        await writeFile(`${join(snapshots, path)}.snap`, text);
      }
      return;
    }
    const expected = (await listTextFiles(snapshots)).map((file) =>
      relative(snapshots, file).replace(/\.snap$/, ""),
    );
    expect([...generated.keys()].sort()).toEqual(expected);
    for (const [path, text] of generated) {
      expect(text).toBe(await Bun.file(`${join(snapshots, path)}.snap`).text());
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("a site without locales keeps its generated English output byte for byte", () =>
  snapshotScenario("en", {
    populate: true,
    config: (root, output) => ({
      content: join(root, "content"),
      skillsDirectory: root,
      projectRootDirectory: root,
      includeProjectSkills: true,
      outputDirectory: output,
      site: {
        name: "Snapshot site",
        description: "A fixture site.",
        skillsPackage: "example/skills",
        repositorySourceUrl: "https://github.com/example/site/tree/main",
        images: { hero: "images/site.svg", feed: "images/site.svg", about: "images/site.svg" },
        about: {
          heading: "About the author",
          paragraphs: ["First paragraph.", "Second paragraph."],
          links: [{ label: "GitHub", handle: "@author", href: "https://github.com/author" }],
        },
      },
      notFound: { title: "Gone", message: "Nothing lives here.", homeLabel: "Return home" },
    }),
  }));

test("an empty site with default copy keeps its generated English output byte for byte", () =>
  snapshotScenario("en-empty", {
    populate: false,
    config: (root, output) => ({
      content: join(root, "content"),
      skillsDirectory: root,
      outputDirectory: output,
    }),
  }));
