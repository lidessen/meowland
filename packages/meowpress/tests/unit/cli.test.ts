import { expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const cli = resolve(import.meta.dir, "../../dist/src/cli.js");
const buildEntry = resolve(import.meta.dir, "../../dist/src/build.js");

function runCli(cwd: string, ...args: string[]) {
  return Bun.spawnSync([process.execPath, cli, ...args], {
    cwd,
    env: { ...process.env, TZ: "America/Los_Angeles" },
    timeout: 5_000,
  });
}

test("the CLI builds conventional directories without a config", async () => {
  const root = await mkdtemp(join(tmpdir(), "meowpress-default-"));
  const output = join(root, "dist");
  try {
    await mkdir(join(root, "content/posts"), { recursive: true });
    await mkdir(join(root, "skills/public"), { recursive: true });
    await mkdir(join(root, ".agents/skills/internal"), { recursive: true });
    await mkdir(join(root, ".generated"));
    await writeFile(join(root, ".generated/keep.txt"), "A pre-existing directory");
    await writeFile(
      join(root, "content/posts/hello.md"),
      "---\ndate: 2026-09-01\n---\n\n# Hello\n\nMy first **post**.",
    );
    await writeFile(join(root, "skills/public/SKILL.md"), "# Public skill\n\nA public fixture.");
    const privateSkill = join(root, ".agents/skills/internal/SKILL.md");
    await writeFile(privateSkill, "# Internal skill\n\nInternal-only fixture.");
    await symlink(privateSkill, join(root, "skills/public/linked.md"));

    const result = runCli(root);
    expect(result.stderr.toString()).toBe("");
    expect(result.exitCode).toBe(0);
    expect(await Bun.file(join(output, "posts/hello/index.html")).text()).toContain(
      "My first <strong>post</strong>.",
    );
    const home = await Bun.file(join(output, "index.html")).text();
    expect(home).toContain("September 1");
    expect(home).toMatch(/data-meowui-part="section\/description"[^>]*>2026 Tue<\/p>/);
    expect(await Bun.file(join(output, "skills/project/internal/index.html")).exists()).toBe(false);
    const publicPage = await Bun.file(join(output, "skills/public/index.html")).text();
    expect(publicPage).toContain("A public fixture.");
    expect(publicPage).not.toContain("Internal-only fixture");
    expect(await Bun.file(join(root, ".generated/keep.txt")).exists()).toBe(true);
    const notFound = await Bun.file(join(output, "404.html")).text();
    expect(notFound).toMatch(/<h1[^>]*>Page not found<\/h1>/);
    expect(notFound).toContain('<base href="/">');
    const stylesheet = notFound.match(/href="([^" ]+\.css)"/)?.[1];
    expect(stylesheet).toBeDefined();
    expect(await Bun.file(join(output, stylesheet!)).exists()).toBe(true);
    expect(await Bun.file(join(output, "llms.txt")).text()).not.toContain("404");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("the CLI preserves unrelated default output and refuses to preview project files", async () => {
  const root = await mkdtemp(join(tmpdir(), "meowpress-safe-output-"));
  const dist = join(root, "dist");
  try {
    await mkdir(dist);
    await writeFile(join(dist, "keep.txt"), "Unrelated output");
    const build = runCli(root, "build");
    expect(build.exitCode).toBe(1);
    expect(build.stderr.toString()).toContain("Move them or choose another outputDirectory");
    expect(await Bun.file(join(dist, "keep.txt")).text()).toBe("Unrelated output");
    const unbuilt = runCli(root, "preview");
    expect(unbuilt.exitCode).toBe(1);
    expect(unbuilt.stderr.toString()).toContain("Run meowpress build first");

    await rm(dist, { recursive: true });
    await symlink(root, dist, "dir");
    const preview = runCli(root, "preview");
    expect(preview.exitCode).toBe(1);
    expect(preview.stderr.toString()).toContain("Output directory overlaps project files");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("the CLI resolves config and its directories from an explicit project root", async () => {
  const root = await mkdtemp(join(tmpdir(), "meowpress-config-"));
  const site = join(root, "site");
  try {
    await mkdir(join(site, "blog/artwork"), { recursive: true });
    await mkdir(join(site, "notes"), { recursive: true });
    await mkdir(join(site, ".agents/skills/internal"), { recursive: true });
    await writeFile(join(site, "blog/hello.md"), "# A mapped post\n\nPost body.");
    await writeFile(join(site, "notes/note.md"), "# A mapped thought\n\nThought body.");
    await writeFile(join(site, "blog/artwork/readme.md"), "# An asset, not a post");
    await writeFile(join(site, ".agents/skills/internal/SKILL.md"), "# An opted-in skill");
    await writeFile(
      join(site, "site.config.ts"),
      'export const site = { outputDirectory: "legacy", notFound: false };',
    );
    await writeFile(
      join(site, "meowpress.config.ts"),
      `import { meowSite } from ${JSON.stringify(buildEntry)};
       export default meowSite({
         content: { directory: ".", postsDirectory: "blog", thoughtsDirectory: "notes", assetsDirectory: "blog/artwork" },
         outputDirectory: "public",
         includeProjectSkills: true,
         notFound: { title: "Lost page", message: "Try the home page.", homeLabel: "Go home" },
       });`,
    );

    const result = runCli(root, "build", "site");
    expect(result.stderr.toString()).toBe("");
    expect(result.exitCode).toBe(0);
    const output = join(site, "public");
    expect(await Bun.file(join(output, "posts/hello/index.html")).text()).toContain("Post body.");
    expect(await Bun.file(join(output, "thoughts/note/index.html")).text()).toContain(
      "Thought body.",
    );
    expect(await Bun.file(join(output, "posts/artwork/readme/index.html")).exists()).toBe(false);
    expect(await Bun.file(join(output, "skills/project/internal/index.html")).text()).toContain(
      "An opted-in skill",
    );
    const agentGuide = await Bun.file(join(output, "agents.md")).text();
    expect(agentGuide).toContain("[A mapped post](/posts/hello/)");
    expect(agentGuide).not.toContain("content/posts");
    const notFound = await Bun.file(join(output, "404.html")).text();
    expect(notFound).toMatch(/<h1[^>]*>Lost page<\/h1>/);
    expect(notFound).toContain("Try the home page.");
    expect(notFound).toContain('href="/">Go home</a>');
    expect(await Bun.file(join(site, "legacy/index.html")).exists()).toBe(false);

    expect(runCli(site, "--config", "./site.config.ts").exitCode).toBe(0);
    expect(await Bun.file(join(site, "legacy/index.html")).exists()).toBe(true);
    expect(await Bun.file(join(site, "legacy/404.html")).exists()).toBe(false);
    const missing = runCli(site, "--config", "missing.ts");
    expect(missing.exitCode).toBe(1);
    expect(missing.stderr.toString()).toContain("Site config not found");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
