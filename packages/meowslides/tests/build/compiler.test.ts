import { describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { h, type Child } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { compileSlides } from "../../src/build/compiler";

describe("local MDX authoring compiler", () => {
  test("includes the author entry in metadata and MDX parser errors", async () => {
    const entry = "/tmp/author/deck.mdx";
    for (const source of ["# Same\n\n---\n\n# Same", "# Invalid\n\n<Unclosed>"])
      await expect(compileSlides(source, entry)).rejects.toThrow(`${entry}:`);
  });

  test("splits only root thematic breaks and preserves fenced, quoted and nested separators", async () => {
    const source =
      "# First\n\n```md\n---\n```\n\n> ---\n\n<div>\n\n---\n\n</div>\n\n---\n\n# Second\n\nSetext title\n---";
    const result = await compileSlides(source, "/tmp/slides.mdx");
    expect(result.slides.map((slide) => slide.id)).toEqual(["first", "second"]);
  });

  test("reads only static finite metadata, derives Unicode ids and rejects collisions", async () => {
    const result = await compileSlides(
      '<Slide id="habitat" columns={2} steps={3} notes="Pause" />\n\n# 栖息地\n\n<div>One</div>\n\n<div>Two</div>',
      "/tmp/slides.mdx",
    );
    expect(result.slides).toEqual([
      { id: "habitat", title: "栖息地", columns: 2, steps: 3, notes: "Pause" },
    ]);
    expect((await compileSlides("# 栖息地", "/tmp/slides.mdx")).slides[0]?.id).toBe("栖息地");
    await expect(compileSlides("# Same\n\n---\n\n# Same", "/tmp/slides.mdx")).rejects.toThrow(
      "Duplicate slide id",
    );
  });

  test("diagnoses invalid pages and metadata at their source", async () => {
    const invalid: [string, string][] = [
      ["# A\n\n---", "empty"],
      ["Plain body", "first-level heading"],
      ["<Slide steps={1 + 2} />\n\n# A", "static string or number literals"],
      ["<Slide columns={4} />\n\n# A", "columns"],
      ["<Slide steps={-1} />\n\n# A", "static string or number literals"],
      ['<Slide other="x" />\n\n# A', "Unknown Slide metadata"],
      ['# A\n\n<Slide id="a" />', "empty first node"],
      ['<Slide id="a" />\n\n# A\n\n<Slide id="b" />', "only one"],
      ["# Hello {props.session.name}", "Dynamic page headings"],
      ["<Slide columns={2} />\n\n# A\n\nOne\n\nTwo", "top-level <div>"],
      ["export const state = 1\n\n# A", "put state and components"],
      ["export { createSession }\n\n# A", "parse import/exports"],
    ];
    for (const [source, message] of invalid)
      await expect(compileSlides(source, "/tmp/slides.mdx")).rejects.toThrow(message);
  });

  test("does not execute imports while compiling metadata", async () => {
    const result = await compileSlides(
      'import "./does-not-exist.js"\n\n# Static title',
      "/tmp/slides.mdx",
    );
    expect(result.slides[0]?.title).toBe("Static title");
  });

  test("evaluates shared ESM once, creates isolated sessions and defers page expressions", async () => {
    const directory = await mkdtemp(join(import.meta.dir, ".compiler-"));
    try {
      await writeFile(
        join(directory, "session.js"),
        "globalThis.__meowslidesProbeLoads=(globalThis.__meowslidesProbeLoads??0)+1;export function createSession(){return {count:0}}",
      );
      const compiled = await compileSlides(
        'export { createSession } from "./session.js"\n\n# First\n\n<Probe session={props.session} />\n\n---\n\n# Second\n\n<Probe session={props.session} />',
        join(directory, "slides.mdx"),
      );
      await writeFile(join(directory, "slides.js"), compiled.code);
      const { createDeck } = await import(join(directory, "slides.js"));
      const sessions: { count: number }[] = [];
      const components = {
        MDXSlidePage: ({ children }: { children: Child }) => children,
        Probe: ({ session }: { session: { count: number } }) => {
          sessions.push(session);
          return h("p", null, ++session.count);
        },
      };
      const first = createDeck({ components });
      const second = createDeck({ components });
      expect(sessions).toHaveLength(0);
      expect(renderToHtml(first.slides[0].render())).toContain("1");
      expect(renderToHtml(first.slides[1].render())).toContain("2");
      expect(renderToHtml(second.slides[0].render())).toContain("1");
      expect(sessions[0]).toBe(sessions[1]);
      expect(sessions[0]).not.toBe(sessions[2]);
      expect(
        (globalThis as typeof globalThis & { __meowslidesProbeLoads: number })
          .__meowslidesProbeLoads,
      ).toBe(1);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test("standalone/reference images are figures while inline images remain inside paragraphs", async () => {
    const directory = await mkdtemp(join(import.meta.dir, ".compiler-"));
    try {
      const source =
        '# Images\n\n![Forest](https://example.test/forest.jpg "Credit")\n\nText ![inline][icon].\n\n![Reference][forest]\n\n[icon]: https://example.test/icon.jpg\n[forest]: https://example.test/forest.jpg';
      const compiled = await compileSlides(source, join(directory, "slides.mdx"));
      await writeFile(join(directory, "slides.js"), compiled.code);
      const { createDeck } = await import(join(directory, "slides.js"));
      const deck = createDeck({
        components: {
          MDXSlidePage: ({ children }: { children: Child }) => children,
          PresentationImage: ({ src, alt }: { src: string; alt: string }) =>
            h("figure", null, h("img", { src, alt })),
        },
      });
      const html = renderToHtml(deck.slides[0].render());
      expect(html.match(/<figure>/g)).toHaveLength(2);
      expect(html).toContain("<p>Text <img");
      expect(html).not.toMatch(/<p>\s*<figure/);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test("local standalone and reference images use static asset imports", async () => {
    const result = await compileSlides(
      "# Images\n\n![Forest](./forest.jpg)\n\n![Other][forest]\n\n[forest]: ./forest.jpg",
      "/tmp/slides.mdx",
    );
    expect(result.code.match(/from "meowslides-asset:/g)).toHaveLength(1);
    expect(result.code).toContain("meowjsx/jsx-runtime");
    expect(result.code).not.toContain("react/jsx-runtime");
  });
});
