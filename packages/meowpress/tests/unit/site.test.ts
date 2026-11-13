import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import type { ContentItem } from "../../src/content";
import { aboutPage, homePage, listPage, postPage, skillPage, thoughtPage } from "../../src/site";
import { DEFAULT_SITE } from "../../src/identity";
import type { Skill } from "../../src/skills";

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
  locale: "en",
  translations: [],
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

test("profile and post navigation use decorative SVG icons without changing links or labels", () => {
  const dom = document(
    aboutPage(undefined, {
      ...DEFAULT_SITE,
      about: {
        heading: "Author",
        paragraphs: [],
        links: [{ label: "GitHub", handle: "@author", href: "https://github.com/author" }],
      },
    }),
  );
  const profile = dom.querySelector('a[rel="me noopener noreferrer"]');
  expect(profile?.getAttribute("href")).toBe("https://github.com/author");
  expect(profile?.getAttribute("target")).toBe("_blank");
  // The link sits inside an entry title, so it carries the site's own link class for the theme.
  expect(profile?.classList.contains("site-link")).toBe(true);
  expect(profile?.textContent?.trim()).toBe("@author");
  expect(profile?.querySelector('svg[data-icon="arrow-up-right"]')).not.toBeNull();

  const newer = { ...post, slug: "newer", title: "Newer post" };
  const older = { ...post, slug: "older", title: "Older post" };
  const navigation = document(postPage(post, [newer, post, older], []));
  const entries = navigation.querySelectorAll('.post-nav [data-meowui-part="entry/root"]');
  expect(entries).toHaveLength(2);
  for (const [index, label, icon, href] of [
    [0, "Previous post (older)", "chevron-left", "/posts/older/"],
    [1, "Next post (newer)", "chevron-right", "/posts/newer/"],
  ] as const) {
    expect(
      entries[index]?.querySelector('[data-meowui-part="entry/eyebrow"]')?.textContent?.trim(),
    ).toBe(label);
    expect(entries[index]?.querySelector(`svg[data-icon="${icon}"]`)).not.toBeNull();
    expect(entries[index]?.querySelector("a")?.getAttribute("href")).toBe(href);
  }
  for (const page of [dom, navigation]) {
    for (const icon of page.querySelectorAll("svg.meow-icon")) {
      expect(icon.namespaceURI).toBe("http://www.w3.org/2000/svg");
      expect(icon.getAttribute("aria-hidden")).toBe("true");
      expect(icon.getAttribute("focusable")).toBe("false");
      expect(icon.getAttribute("stroke")).toBe("currentColor");
      expect(icon.querySelector("path")).not.toBeNull();
    }
  }
});

test("skill chrome renders Lucide directions and separate GitHub brand artwork during SSR", () => {
  const skill: Skill = {
    slug: "writing",
    name: "Writing",
    description: "A writing guide.",
    scope: "public",
    sourceBasePath: "skills/writing",
    files: [
      {
        path: "SKILL.md",
        role: "entry",
        detail: "Entry",
        content: "# Writing",
        reachable: true,
        depth: 0,
      },
      {
        path: "reference.md",
        role: "reference",
        detail: "Reference",
        content: "# Reference",
        reachable: true,
        depth: 1,
      },
    ],
    externalNodes: [],
    relations: [{ source: "SKILL.md", target: "reference.md", label: "Reference", contexts: [] }],
  };
  const html = skillPage(skill, undefined, {
    ...DEFAULT_SITE,
    repositorySourceUrl: "https://github.com/example/writing/tree/main",
  });
  const dom = document(html);
  const source = dom.querySelector(".skill-browser-actions a");
  expect(source?.textContent?.trim()).toBe("GitHub");
  expect(source?.getAttribute("href")).toBe(
    "https://github.com/example/writing/tree/main/skills/writing",
  );
  expect(source?.getAttribute("rel")).toBe("noopener noreferrer");
  expect(source?.querySelector("svg.meow-github-icon path")).not.toBeNull();
  expect(source?.querySelector('svg[data-icon="arrow-up-right"]')).not.toBeNull();
  expect(dom.querySelector('.skill-back svg[data-icon="arrow-left"]')).not.toBeNull();
  expect(dom.querySelector('.skill-reading-edge svg[data-icon="arrow-right"]')).not.toBeNull();
  for (const icon of dom.querySelectorAll("svg.meow-icon, svg.meow-github-icon")) {
    expect(icon.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("focusable")).toBe("false");
  }
  expect(html).not.toMatch(/[↗←→]/);
  expect(document(skillPage(skill)).querySelector(".skill-browser-actions a")).toBeNull();
});
