import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, symlink, utimes, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { collectContentAssets, loadSection, normalizeContentSources } from "../../src/content";

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

test("maps sections and both asset directories without staging the source tree", async () => {
  const root = await contentRoot();
  for (const directory of ["blog/topic/assets", "blog/media/images", "notes", "downloads"]) {
    await mkdir(join(root, directory), { recursive: true });
  }
  await writeFile(
    join(root, "blog/topic/story.MD"),
    "# Public Story\n\n![Cat](../../../images/cat.svg)\n",
  );
  await writeFile(join(root, "blog/topic/_draft.md"), "# Draft");
  await writeFile(join(root, "blog/topic/assets/reference.md"), "# Nested asset");
  await writeFile(join(root, "blog/media/reference.md"), "# Site asset");
  await writeFile(join(root, "blog/media/images/cat.svg"), "<svg/>");
  await writeFile(join(root, "notes/note.mdx"), "# Note\n\n<Callout>MDX thought</Callout>");
  await writeFile(join(root, "downloads/appendix.txt"), "Appendix");
  await writePost(root, "default.md", "Default post", "2026-09-02");

  const sources = normalizeContentSources(
    {
      directory: ".",
      postsDirectory: "blog",
      thoughtsDirectory: "notes",
      assetsDirectory: "blog/media",
      postAssetsDirectory: "downloads",
    },
    root,
  );
  const [posts, thoughts, assets, postAssets] = await Promise.all([
    loadSection(sources, "post"),
    loadSection(sources, "thought"),
    collectContentAssets(sources),
    collectContentAssets(sources, { directory: "posts/assets" }),
  ]);

  expect(posts.map((post) => post.slug)).toEqual(["topic/story"]);
  expect(posts[0]?.html).toContain('src="../../../images/cat.svg"');
  expect(thoughts.map((thought) => thought.slug)).toEqual(["note"]);
  expect(thoughts[0]?.html).toContain("MDX thought");
  expect(assets.map((asset) => asset.relativePath)).toEqual(["images/cat.svg", "reference.md"]);
  expect(postAssets.map((asset) => asset.relativePath)).toEqual(["appendix.txt"]);
});

test("keeps mapped content and assets inside the selected source tree", async () => {
  const root = await contentRoot();
  const privateRoot = await contentRoot();
  await writePost(privateRoot, "secret.md", "Secret", "2026-09-02");
  await symlink(join(privateRoot, "posts/secret.md"), join(root, "posts/linked.md"));
  await symlink(privateRoot, join(root, "linked"), "dir");
  await mkdir(join(root, "assets"));
  await symlink(join(privateRoot, "posts/secret.md"), join(root, "assets/linked.md"));

  const linkedSection = { directory: root, postsDirectory: "linked/posts" };
  const linkedAssets = { directory: root, assetsDirectory: "linked/posts" };
  expect(await loadSection(root, "post")).toEqual([]);
  expect(await loadSection(linkedSection, "post")).toEqual([]);
  expect(await collectContentAssets(root)).toEqual([]);
  expect(await collectContentAssets(linkedAssets)).toEqual([]);
  expect(() => normalizeContentSources({ directory: root, postsDirectory: "../outside" })).toThrow(
    "Content directory must stay inside its source root",
  );
  expect(() =>
    normalizeContentSources({ directory: root, slugPrefix: "archive/../../outside" }),
  ).toThrow("Content slug prefix");
});

test("falls back to a stable calendar key when frontmatter has an invalid date", async () => {
  const root = await contentRoot();
  await writePost(root, "invalid-date.md", "Invalid Date", "2026-13-01");
  const modified = new Date("2026-09-01T18:00:00Z");
  await utimes(join(root, "posts/invalid-date.md"), modified, modified);

  const posts = await loadSection(root, "post");

  expect(posts[0]?.dateKey).toBe("2026-09-02");
});
