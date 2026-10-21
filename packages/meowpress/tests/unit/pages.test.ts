import { expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { h, type Child, type Props } from "meowjsx/runtime";
import { buildSite, type SitePage } from "meowpress/build";

function Canvas(props: Props): Child {
  return h("iframe", {
    src: `/gallery/canvas.html?story=${String(props.story)}`,
    loading: "lazy",
  });
}

test("consumer pages replace the package's own routes and reach the MDX content", async () => {
  const root = await mkdtemp(join(tmpdir(), "meowpress-pages-"));
  try {
    const content = join(root, "content");
    const output = join(root, "dist");
    await mkdir(join(content, "posts/packages"), { recursive: true });
    await writeFile(
      join(content, "posts/packages/meowtail.mdx"),
      ["---", "title: Meowtail", "---", "", '<Canvas story="button" />', ""].join("\n"),
    );

    const pages: SitePage[] = [
      {
        path: "",
        title: "Meowland",
        html: "<!doctype html><html><body><h1>Meowland</h1></body></html>",
      },
      {
        path: "components/button",
        title: "Button",
        group: "Basic controls",
        html: "<!doctype html><html><body><h1>Button</h1></body></html>",
      },
    ];

    await buildSite({
      content,
      skillsDirectory: root,
      outputDirectory: output,
      mdxComponents: { Canvas },
      pages: () => pages,
    });

    expect(await Bun.file(join(output, "index.html")).text()).toContain("Meowland");
    const component = await Bun.file(join(output, "components/button/index.html")).text();
    expect(component).toContain("Button");
    // The package's own blog routes are not published next to consumer pages.
    for (const file of ["about/index.html", "posts/index.html", "thoughts/index.html"]) {
      expect(await Bun.file(join(output, file)).exists()).toBe(false);
    }
    const llm = await Bun.file(join(output, "llm.txt")).text();
    expect(llm).toContain("- Button: /components/button/");
    expect(llm).not.toContain("- Posts: /posts/");
    // The content has no route of its own once the consumer owns the site map.
    expect(llm).not.toContain("/posts/packages/meowtail/");
    const agents = await Bun.file(join(output, "agents.md")).text();
    expect(agents).not.toContain("/posts/packages/meowtail/");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("the theme stylesheet name reaches the built-in pages", async () => {
  const root = await mkdtemp(join(tmpdir(), "meowpress-stylesheet-"));
  try {
    const content = join(root, "content");
    const output = join(root, "dist");
    await mkdir(content, { recursive: true });

    await buildSite({
      content,
      skillsDirectory: root,
      outputDirectory: output,
      themeStylesheet: "site-theme.css",
    });

    const home = await Bun.file(join(output, "index.html")).text();
    // The page must not link a stylesheet the build never wrote.
    expect(home).not.toContain("blog-theme.css");
    expect(home).toMatch(/<link rel="stylesheet"[^>]*href="\.\/[^"]+\.css"/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a consumer MDX component reaches the content page", async () => {
  const root = await mkdtemp(join(tmpdir(), "meowpress-mdx-"));
  try {
    const content = join(root, "content");
    const output = join(root, "dist");
    await mkdir(join(content, "posts/packages"), { recursive: true });
    await writeFile(
      join(content, "posts/packages/meowtail.mdx"),
      ["---", "title: Meowtail", "---", "", '<Canvas story="button" />', ""].join("\n"),
    );

    await buildSite({
      content,
      skillsDirectory: root,
      outputDirectory: output,
      mdxComponents: { Canvas },
      pages: ({ posts }) =>
        posts.map((post) => ({
          path: post.slug,
          title: post.title,
          html: `<!doctype html><html><body>${post.html}</body></html>`,
        })),
    });

    const page = await Bun.file(join(output, "packages/meowtail/index.html")).text();
    expect(page).toContain("/gallery/canvas.html?story=button");
    expect(page).toContain('loading="lazy"');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a consumer page path stays inside the site root", async () => {
  const root = await mkdtemp(join(tmpdir(), "meowpress-escape-"));
  try {
    const content = join(root, "content");
    const output = join(root, "dist");
    await mkdir(content, { recursive: true });

    const build = (path: string) =>
      buildSite({
        content,
        skillsDirectory: root,
        outputDirectory: output,
        pages: () => [
          {
            path,
            title: "Escape",
            html: "<!doctype html><html><body><h1>Escape</h1></body></html>",
          },
        ],
      });

    await expect(build("../escaped")).rejects.toThrow("stays inside the site root");
    expect(await Bun.file(join(root, "escaped/index.html")).exists()).toBe(false);
    await expect(build("components/../../escaped")).rejects.toThrow("stays inside the site root");
    expect(await Bun.file(join(root, "escaped/index.html")).exists()).toBe(false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
