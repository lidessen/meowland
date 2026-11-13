import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const TEXT_FILES = /(\.html|llms\.txt|llm\.txt|agents\.md)(\.snap)?$/;

/** Every generated HTML page and agent index below a directory, sorted. */
export async function listTextFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listTextFiles(path)));
    else if (TEXT_FILES.test(entry.name)) files.push(path);
  }
  return files.sort();
}

/**
 * Two values differ between otherwise identical builds and are normalised: the footer prints the
 * build year, and Bun names the empty script chunk it emits for every page after a hash of the
 * temporary build path. Stylesheet names are content hashes and stay verbatim.
 */
export function normalizeOutput(text: string): string {
  return text
    .replaceAll(/©\s*\d{4}/g, "© YEAR")
    .replaceAll(/chunk-[a-z0-9]+\.js/g, "chunk-HASH.js");
}
/** The content, skills and artwork of the fixture site the output tests build. */
export async function writeFixtureSite(root: string): Promise<void> {
  const files: Record<string, string> = {
    "content/posts/first.md": [
      "---",
      "title: First post",
      "date: 2026-09-01",
      "category: Notes",
      "tags: [Writing, Tools]",
      "---",
      "",
      "# First post",
      "",
      `A **bold** opening. ${"This sentence makes the post longer. ".repeat(30)}`,
      "",
    ].join("\n"),
    "content/posts/nested/second.md": [
      "---",
      "title: Second post",
      "date: 2026-08-15",
      "---",
      "",
      "A short second post.",
      "",
    ].join("\n"),
    "content/thoughts/note.md": [
      "---",
      "title: A short note",
      "date: 2026-09-01T09:30:00Z",
      "tags: [Quick]",
      "---",
      "",
      "A thought about <b>things</b>.",
      "",
    ].join("\n"),
    "content/thoughts/later.md": [
      "---",
      "title: Later thought",
      "date: 2026-09-03",
      "---",
      "",
      "Another thought.",
      "",
    ].join("\n"),
    "content/assets/images/site.svg":
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="6" fill="navy"/></svg>',
    "skills/writing/SKILL.md": [
      "---",
      "name: Writing",
      "description: A writing guide.",
      "lang: en",
      "---",
      "",
      "# Writing",
      "",
      "Read the [reference](reference.md) next.",
      "",
    ].join("\n"),
    "skills/writing/reference.md": "# Reference\n\nDetails.\n",
    "skills/broken/SKILL.md": [
      "---",
      "name: Broken",
      "description: A skill with reference problems.",
      "---",
      "",
      "# Broken",
      "",
      "See [missing](missing.md) and [outside](https://example.com/guide).",
      "",
    ].join("\n"),
    "skills/broken/orphan.md": "# Orphan\n\nNobody links here.\n",
    ".agents/skills/internal/SKILL.md": "# Internal skill\n\nA project fixture.\n",
  };
  for (const [path, text] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), text);
  }
}
