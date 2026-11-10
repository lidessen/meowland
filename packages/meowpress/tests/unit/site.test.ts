import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import type { ContentItem } from "../../src/content";
import { homePage, listPage, postPage, thoughtPage } from "../../src/site";

const post: ContentItem = {
  kind: "post",
  slug: "nested/first",
  sourcePath: "posts/nested/first.md",
  title: "First post",
  excerpt: "A public summary.",
  body: "# First post\n\nBody content.",
  html: "<h1>First post</h1><p>Body content.</p>",
  metadata: {},
  dateKey: "2026-09-01",
  timeLabel: "09:30",
  tags: ["Writing"],
  readingMinutes: 1,
  characterCount: 13,
};
const thought: ContentItem = {
  ...post,
  kind: "thought",
  slug: "note",
  title: "A short note",
  html: "<h1>A short note</h1><p>A thought body.</p>",
};

function document(html: string) {
  const window = new Window();
  return new window.DOMParser().parseFromString(html, "text/html");
}

test("the home feed renders real Journal component parts and option carriers", () => {
  const dom = document(homePage([post, thought]));
  expect(dom.documentElement.getAttribute("data-meowui-theme-root")).toBe("meowui");
  expect(dom.documentElement.getAttribute("data-meowui-color-scheme")).toBe("auto");
  expect(dom.querySelectorAll("h1")).toHaveLength(1);
  expect(dom.querySelector('[data-meowui-part="page-header/title"]')?.tagName).toBe("H1");
  expect(dom.querySelector('[data-meowui-part="section/root"]')).not.toBeNull();
  const entry = dom.querySelector('[data-kind="post"]');
  expect(entry?.getAttribute("data-meowui-part")).toBe("entry/root");
  expect(entry?.getAttribute("data-option-entry-size")).toBe("feature");
  expect(entry?.querySelector("a")?.getAttribute("href")).toBe("/posts/nested/first/");
  expect(
    dom.querySelector('[data-kind="thought"] [data-meowui-part="prose/root"]')?.textContent,
  ).toBe("A thought body.");
  for (const filter of ["all", "post", "thought"]) {
    const button = dom.querySelector(`button[data-filter="${filter}"]`);
    expect(button?.getAttribute("data-meowui-part")).toBe("button/root");
    expect(button?.getAttribute("data-option-button-variant")).toBe("quiet");
    expect(button?.getAttribute("aria-pressed")).toBe(String(filter === "all"));
  }
});

test("article and archive routes keep one title, prose semantics, and depth-aware stylesheets", () => {
  for (const [item, html, stylesheet] of [
    [post, postPage(post, [post], [thought]), "../../../blog-theme.css"],
    [thought, thoughtPage(thought), "../../blog-theme.css"],
  ] as const) {
    const dom = document(html);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("h1")?.textContent).toBe(item.title);
    expect(dom.querySelector('article[data-meowui-part="prose/root"]')).not.toBeNull();
    expect(dom.querySelector('link[rel="stylesheet"]')?.getAttribute("href")).toBe(stylesheet);
    expect(dom.querySelector('nav [aria-current="page"]')?.getAttribute("href")).toBe(
      `/${item.kind}s/`,
    );
  }
  const archive = document(listPage("thought", [thought]));
  expect(archive.querySelectorAll("h1")).toHaveLength(1);
  expect(archive.querySelector('[data-kind="thought"] a')?.getAttribute("href")).toBe(
    "/thoughts/note/",
  );
  expect(archive.querySelector('link[rel="stylesheet"]')?.getAttribute("href")).toBe(
    "../blog-theme.css",
  );
});
