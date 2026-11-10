import { buildSite } from "meowpress/build";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { serveSite } from "../../src/preview";

const root = await mkdtemp(join(tmpdir(), "meowpress-browser-"));
const content = join(root, "content");
const output = join(root, "dist");
const wideContent = `
| Column one | Column two | Column three | Column four | Column five |
| --- | --- | --- | --- | --- |
| ${"LongUnbrokenValue".repeat(12)} | Second value | Third value | Fourth value | Fifth value |

\`\`\`text
${"a_long_line_of_code_".repeat(24)}
\`\`\`
`;
const files = {
  "content/posts/nested/first.md": `---\ntitle: First post\ndate: 2026-09-01\n---\n# First post\n\nA post with a wide table and code.\n${wideContent}`,
  "content/thoughts/note.md":
    "---\ntitle: Linked thought\ndate: 2026-09-02\n---\n# Linked thought\n\nRead [the first post](/posts/nested/first/).",
  "skills/writing/SKILL.md":
    "---\nname: Writing guide\ndescription: A browser regression skill.\n---\n# Writing guide\n\nRead [the reference](reference.md).",
  "skills/writing/reference.md": `# Reference notes\n\nReturn to [the entry](SKILL.md).\n${wideContent}`,
};
for (const [path, text] of Object.entries(files)) {
  const target = join(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, text);
}
await buildSite({
  content,
  skillsDirectory: root,
  outputDirectory: output,
  site: {
    name: "Journal fixture",
    skillsPackage: "example/writing",
    repositorySourceUrl: "https://github.com/example/writing/tree/main",
    about: {
      heading: "Journal author",
      paragraphs: ["An author profile with an external link."],
      links: [{ label: "GitHub", handle: "@example", href: "https://github.com/example" }],
    },
  },
});
const server = await serveSite(output, 13016);
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, async () => {
    await server.stop(true);
    await rm(root, { recursive: true, force: true });
    process.exit(0);
  });
}
