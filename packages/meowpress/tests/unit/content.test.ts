import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { collectContentAssets, loadSection } from "../../src/content";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

async function contentRoot(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "meowland-site-content-"));
  temporaryDirectories.push(directory);
  await mkdir(join(directory, "posts"), { recursive: true });
  await mkdir(join(directory, "thoughts"), { recursive: true });
  return directory;
}

async function writePost(
  directory: string,
  name: string,
  title: string,
  date: string,
): Promise<void> {
  await writeFile(
    join(directory, "posts", name),
    `---\ntitle: ${title}\ndate: ${date}\n---\n\n${title} content.\n`,
  );
}

test("loadSection merges multiple content roots in source order", async () => {
  const primary = await contentRoot();
  const archive = await contentRoot();
  await writePost(primary, "shared.md", "Primary", "2026-09-01");
  await writePost(primary, "_draft.md", "Draft", "2026-09-02");
  await writePost(archive, "shared.md", "Archive shared", "2026-08-01");
  await writePost(archive, "old.md", "Archive old", "2026-08-02");

  const items = await loadSection([primary, { directory: archive, slugPrefix: "archive" }], "post");

  expect(items.map((item) => item.slug)).toEqual(["shared", "archive/old", "archive/shared"]);
  expect(items.find((item) => item.slug === "shared")?.title).toBe("Primary");
  expect(items.some((item) => item.title === "Draft")).toBe(false);
});

test("loadSection can reject duplicate slugs when strict merging is needed", async () => {
  const first = await contentRoot();
  const second = await contentRoot();
  await writePost(first, "same.md", "First", "2026-09-01");
  await writePost(second, "same.md", "Second", "2026-09-02");

  await expect(loadSection([first, second], "post", { duplicate: "error" })).rejects.toThrow(
    'Duplicate post slug "same"',
  );
});

test("collectContentAssets merges assets and keeps source namespaces", async () => {
  const primary = await contentRoot();
  const archive = await contentRoot();
  await mkdir(join(primary, "assets", "images"), { recursive: true });
  await mkdir(join(archive, "assets", "images"), { recursive: true });
  await writeFile(join(primary, "assets", "images", "cat.svg"), "primary");
  await writeFile(join(archive, "assets", "images", "cat.svg"), "archive");

  const assets = await collectContentAssets([
    primary,
    { directory: archive, slugPrefix: "archive" },
  ]);

  expect(assets.map((asset) => asset.relativePath)).toEqual([
    "images/cat.svg",
    "archive/images/cat.svg",
  ]);
});
