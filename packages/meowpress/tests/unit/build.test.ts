import { css, defineOptions, defineTheme, defineTokens } from "meowcss";
import { expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildSite } from "meowpress/build";
import { blogTokens } from "../../src/theme";

test("builds Markdown and MDX while excluding draft pages and assets", async () => {
  const root = await mkdtemp(join(tmpdir(), "meowpress-build-"));
  const content = join(root, "content");
  const output = join(root, "dist");
  try {
    await mkdir(join(content, "posts/assets/_draft"), { recursive: true });
    await mkdir(join(content, "thoughts"), { recursive: true });
    await mkdir(join(root, "skills"), { recursive: true });
    const tokens = defineTokens("custom-blog", { ink: ["black", "white"] });
    const theme = defineTheme({
      options: defineOptions("custom-blog", {}),
      defaults: { scheme: "dark" },
      tokens: [tokens],
      styles: css`
        body {
          color: ${tokens.ink};
        }
      `,
    });
    const document = (title: string, body: string) =>
      `---\ntitle: ${title}\ndate: 2026-09-01\n---\n\n${body}\n`;
    await writeFile(
      join(content, "posts/public.md"),
      document("Public Markdown", "A **bold statement**."),
    );
    await writeFile(
      join(content, "posts/component.mdx"),
      document("Public MDX", "<Callout>MDX fixture content</Callout>"),
    );
    await writeFile(join(content, "posts/_secret.mdx"), document("Draft secret", "DO_NOT_PUBLISH"));
    await writeFile(
      join(content, "thoughts/note.md"),
      document("Thought fixture", "A short thought."),
    );
    await writeFile(join(content, "posts/assets/public.txt"), "public asset");
    await writeFile(join(content, "posts/assets/_draft/secret.txt"), "secret asset");
    await buildSite({
      content,
      skillsDirectory: root,
      outputDirectory: output,
      theme,
    });
    const markdown = await Bun.file(join(output, "posts/public/index.html")).text();
    const mdx = await Bun.file(join(output, "posts/component/index.html")).text();
    expect(markdown).toContain("<strong>bold statement</strong>");
    expect(markdown).toContain('data-meowui-theme-root="custom-blog"');
    expect(markdown).toContain('data-meowui-color-scheme="dark"');
    const styleHref = markdown.match(/href="([^" ]+\.css)"/)![1]!;
    const cssText = await Bun.file(join(output, "posts/public", styleHref)).text();
    expect(cssText).toContain(tokens.ink.name);
    expect(cssText).not.toContain(blogTokens.bg.name);
    // A theme without fonts publishes no font files or licenses.
    expect(await Bun.file(join(output, "licenses/geist-OFL.txt")).exists()).toBe(false);
    expect(cssText).not.toContain("@font-face");
    expect(mdx).toContain("MDX fixture content");
    expect(mdx).toContain("mdx-callout");
    expect(await Bun.file(join(output, "thoughts/note/index.html")).text()).toContain(
      "A short thought.",
    );
    expect(await Bun.file(join(output, "posts/_secret/index.html")).exists()).toBe(false);
    expect(await Bun.file(join(output, "posts/secret/index.html")).exists()).toBe(false);
    expect(await Bun.file(join(output, "posts/assets/public.txt")).text()).toBe("public asset");
    expect(await Bun.file(join(output, "posts/assets/_draft/secret.txt")).exists()).toBe(false);
    for (const file of ["index.html", "posts/index.html", "llms.txt", "agents.md"]) {
      const text = await Bun.file(join(output, file)).text();
      expect(text).not.toContain("Draft secret");
      expect(text).not.toContain("DO_NOT_PUBLISH");
    }
    // The default font must also build from a consumer outside this workspace.
    await buildSite({ content, skillsDirectory: root, outputDirectory: output });
    const home = await Bun.file(join(output, "index.html")).text();
    expect(home).toContain('data-meowui-theme-root="blog"');
    expect(home).not.toContain("<img");
    const about = await Bun.file(join(output, "about/index.html")).text();
    expect(about).toContain('class="avatar-initial"');
    expect(about).not.toContain("<img");
    const defaultHref = home.match(/href="([^" ]+\.css)"/)![1]!;
    const defaultCSS = await Bun.file(join(output, defaultHref)).text();
    expect(defaultCSS).toContain("@font-face");
    expect(defaultCSS).toContain("unicode-range");
    expect(defaultCSS).not.toContain("data:font");
    expect(defaultCSS).not.toContain("@import");
    // Each subset is its own published file, referenced next to the stylesheet at the root.
    const fontFiles = [...defaultCSS.matchAll(/url\(\.\/(fonts\/[^)]+\.woff2)\)/g)].map(
      (match) => match[1]!,
    );
    expect(fontFiles.some((file) => /geist-latin-wght-normal-[0-9a-f]{8}\.woff2$/.test(file))).toBe(
      true,
    );
    for (const file of fontFiles) expect(await Bun.file(join(output, file)).exists()).toBe(true);
    expect(defaultCSS).not.toContain("node_modules");
    expect(await Bun.file(join(output, "licenses/geist-OFL.txt")).text()).toContain(
      "SIL OPEN FONT LICENSE Version 1.1",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("builds explicit site artwork from the content assets root across page depths", async () => {
  const root = await mkdtemp(join(tmpdir(), "meowpress-artwork-"));
  try {
    const content = join(root, "content");
    const output = join(root, "dist");
    await mkdir(join(content, "assets/images"), { recursive: true });
    const artwork =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="6" fill="navy"/></svg>';
    await writeFile(join(content, "assets/images/site.svg"), artwork);
    await buildSite({
      content,
      skillsDirectory: root,
      outputDirectory: output,
      site: {
        images: { hero: "images/site.svg", feed: "images/site.svg", about: "images/site.svg" },
      },
    });
    const home = await Bun.file(join(output, "index.html")).text();
    const about = await Bun.file(join(output, "about/index.html")).text();
    const homeImage = home.match(/class="hero-image"[^>]*src="([^"]+)"/)?.[1];
    const aboutImage = about.match(/<img[^>]*src="([^"]+)"/)?.[1];
    expect(homeImage).toBeDefined();
    expect(aboutImage).toBeDefined();
    expect(await Bun.file(join(output, homeImage!)).text()).toBe(artwork);
    expect(await Bun.file(join(output, "about", aboutImage!)).text()).toBe(artwork);
    expect(home).toContain('class="feed-image"');
    expect(about).not.toContain('class="avatar-initial"');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
