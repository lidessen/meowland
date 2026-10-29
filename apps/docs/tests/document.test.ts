import { describe, expect, test } from "bun:test";
import { h } from "meowjsx";
import type { StoryEntry } from "meowbook";
import { buildCatalog } from "../catalog";
import { renderDocument } from "../document";
import { renderPageBody, type DocsState } from "../pages";
import type { DocsPackage } from "../packages";
import { docsTheme } from "../theme";

const stories: StoryEntry[] = [
  {
    id: "button",
    title: "Button · Actions",
    file: "/stories/button.stories.tsx",
    exportName: "ButtonStory",
    line: 1,
    component: "Button",
    group: "Basic controls",
    description: "Buttons trigger one action.",
  },
  {
    id: "workspace",
    title: "Workspace composition · Fixed header",
    file: "/stories/workspace.stories.tsx",
    exportName: "WorkspaceStory",
    line: 2,
    group: "Composition examples",
    description: "One page composition.",
  },
];

const catalog = buildCatalog(stories);

const packages: DocsPackage[] = [
  {
    name: "meowtail",
    title: "meowtail",
    version: "0.2.0",
    summary: "The component library.",
    path: "packages/meowtail",
  },
];

const state: DocsState = {
  catalog,
  packages,
  sources: new Map([
    [
      "button",
      {
        code: 'export const ButtonStory = defineStory({\n  render: () => <Button variant="quiet">Save</Button>,\n});',
        file: "packages/meowtail/stories/button.stories.tsx",
        line: 1,
      },
    ],
    [
      "workspace",
      {
        code: "const story = 1;",
        file: "packages/meowtail/stories/workspace.stories.tsx",
        line: 2,
      },
    ],
  ]),
};

const noContent = new Map();

function document(path: string): string {
  return renderDocument({
    theme: docsTheme,
    catalog,
    packages,
    path,
    title: "Button",
    trail: [{ label: "Basic controls" }, { label: "Button" }],
    children: h("p", null, "Body"),
  });
}

function page(path: string): string {
  return renderDocument({
    theme: docsTheme,
    catalog,
    packages,
    path,
    title: "Page",
    trail: [{ label: "Overview" }],
    children: renderPageBody(path, state, noContent),
  });
}

describe("the page document", () => {
  test("both navigation bars and the browser icon use the site mark", () => {
    const html = document("components/button");
    expect(html.match(/src="\.\.\/\.\.\/meowland-logo-3ef0fd67.png"/g)).toHaveLength(2);
    expect(html).toContain('href="/favicon.ico?v=9a311ad1"');
  });

  test("the catalog rail labels the full documentation navigation", () => {
    const html = document("components/button");
    expect(html).toContain('data-meowui-part="search-input/root"');
    expect(html).toContain("Filter navigation");
    expect(html).toContain('<div class="docs-catalog-label">Documentation</div>');
  });

  test("the rail is one NavList landmark with labelled groups", () => {
    const html = document("components/button");
    expect(html).toContain('data-meowui-part="nav-list/root"');
    expect(html).toContain('aria-label="Documentation"');
    expect(html).toContain('data-meowui-part="nav-list/groupTitle"');
    expect(html).toContain("Start here");
    expect(html).toContain("Packages");
    expect(html).toContain("Basic controls");
    expect(html).toContain('data-meowui-part="nav-list/item"');
  });

  test("the current page is marked in the rail", () => {
    const html = document("components/button");
    expect(html).toContain('href="/components/button/" aria-current="page"');
    const navStart = html.indexOf('data-meowui-part="nav-list/root"');
    const nav = html.slice(navStart, html.indexOf("</nav>", navStart));
    expect([...nav.matchAll(/aria-current="page"/g)]).toHaveLength(1);
  });

  test("the header carries the trail of the page", () => {
    const html = document("components/button");
    expect(html).toContain('data-meowui-part="breadcrumb/root"');
    expect(html).toContain("Basic controls");
  });

  test("the catalog filter runs against the NavList DOM in the page", () => {
    const html = document("components/button");
    expect(html).toContain("docs-catalog-empty");
    expect(html).toMatch(/<script>[\s\S]*search-input\/control[\s\S]*<\/script>/);
    expect(html).toMatch(/<script>[\s\S]*nav-list\/item[\s\S]*<\/script>/);
    expect(html).toMatch(/<script>[\s\S]*nav-list\/group[\s\S]*<\/script>/);
  });

  test("navigation stays reachable without JavaScript and has one disclosure control", () => {
    const html = document("components/button");
    expect(html).toMatch(/<aside[^>]*id="docs-navigation"[^>]*>/);
    expect(html).not.toMatch(/<aside[^>]*\shidden/);
    expect(html).toMatch(/<button[^>]*aria-controls="docs-navigation"[^>]*hidden/);
    expect([...html.matchAll(/data-meowui-part="nav-list\/root"/g)]).toHaveLength(1);
  });
});

describe("the docs pages", () => {
  test("the home page is built from the library page and section parts", () => {
    const html = page("");
    expect(html).toContain('data-meowui-part="page/root"');
    expect(html).toContain('data-meowui-part="page/header"');
    expect(html).toContain('data-meowui-part="page-header/title"');
    expect(html).toContain("Build interfaces with Meowland");
    expect(html).toContain('data-meowui-part="section/root"');
    expect(html).toContain('data-meowui-part="section/title"');
    expect(html).not.toContain("docs-eyebrow");
    expect(html).not.toContain("docs-section");
  });

  test("a component page is one page with section parts", () => {
    const html = page("components/button");
    expect(html).toContain('data-meowui-part="page/root"');
    expect(html).toContain('data-meowui-part="page-header/title"');
    expect(html).toContain("<h1");
    expect(html).toContain("Button");
    expect(html).toContain('data-meowui-part="section/root"');
    expect(html).toContain('data-meowui-part="section/title"');
    expect(html).toContain("API reference");
    expect(html).toContain("docs-preview-frame");
    expect(html).toContain("Component reference");
  });

  test("an example page shows the code through the library code surface", () => {
    const html = page("examples/workspace");
    expect(html).toContain('data-meowui-part="page/root"');
    expect(html).toContain('data-meowui-part="section/root"');
    expect(html).toContain('data-meowui-part="code-block/root"');
    expect(html).toContain('data-meowui-part="code-block/title"');
    expect(html).toContain('data-meowui-part="code-block/caption"');
    expect(html).toContain("packages/meowtail/stories/workspace.stories.tsx");
    expect(html).toContain("line 2");
    expect(html).toContain("const story = 1;");
    expect(html).toContain("Composition example");
    expect(html).not.toContain("docs-code-panel");
    expect(html).not.toContain("docs-code-head");
  });

  test("the home page offers a starting route before its package directory", () => {
    const html = page("");
    expect(html).toContain("Start with Meowtail");
    expect(html).toContain("Browse components");
    expect(html).toContain("bun add meowtail");
    expect(html.indexOf("Start building")).toBeLessThan(html.indexOf("Six packages"));
    expect(html).not.toContain("Six published packages");
  });

  test("a component table of contents only links to sections that exist", () => {
    const html = page("components/button");
    const toc = html.match(/<nav aria-label="On this page">([\s\S]*?)<\/nav>/)?.[1] ?? "";
    expect(toc).toContain('href="#preview"');
    expect(toc).toContain('href="#installation"');
    expect(toc).toContain('href="#usage"');
    expect(toc).toContain('href="#api-reference"');
    expect(toc).not.toContain('href="#examples"');
    for (const [, id] of toc.matchAll(/href="#([^"]+)"/g)) {
      expect(html).toMatch(new RegExp(`<section[^>]*id="${id}"`));
    }
    expect(html).toMatch(
      /<details class="docs-toc-disclosure"><summary>On this page<svg[^>]*data-icon="chevron-down"/,
    );
  });

  test("examples ship a preview and code tab pair, and usage shows a real first use", () => {
    const html = page("components/button");
    expect(html).toMatch(/<div class="docs-tabs" role="tablist"[^>]*hidden/);
    expect(html).toContain('data-docs-tab="preview"');
    expect(html).toContain('data-docs-panel="code"');
    expect(html).toContain(`example.setAttribute("data-docs-tabs", "ready")`);
    const usage = html.match(/<section[^>]*id="usage"[\s\S]*?<\/section>/)?.[0] ?? "";
    expect(usage).toContain("usage.tsx");
    expect(usage).toContain("Button");
  });

  test("the desktop and disclosure contents share links with unique section targets", () => {
    const html = page("components/button");
    const contents = [...html.matchAll(/<nav aria-label="On this page">([\s\S]*?)<\/nav>/g)];
    expect(contents).toHaveLength(2);
    expect(contents[0]?.[1]).toBe(contents[1]?.[1]);
    expect(html).toMatch(/<div class="docs-toc-desktop">[\s\S]*?<nav aria-label="On this page">/);
    for (const [, id] of contents[0]?.[1]?.matchAll(/href="#([^"]+)"/g) ?? []) {
      expect([...html.matchAll(new RegExp(`<section[^>]*id="${id}"`, "g"))]).toHaveLength(1);
    }
  });

  test("a package without authored content omits the overview from its table of contents", () => {
    const html = page("packages/meowtail");
    const toc = html.match(/<nav aria-label="On this page">([\s\S]*?)<\/nav>/)?.[1] ?? "";
    expect(toc).toContain('href="#installation"');
    expect(toc).toContain('href="#components"');
    expect(toc).not.toContain('href="#overview"');
    expect(html).toContain("Package guide");
  });
});

describe("the page sequence", () => {
  test("a page links the pages before and after it in sidebar order", () => {
    const html = document("packages/meowtail");
    const pager = html.slice(html.indexOf('class="docs-pager"'));
    expect(pager).toContain('href="/components/" rel="prev"');
    expect(pager).toContain("Components");
    expect(pager).toContain('rel="next"');
    expect(pager).not.toContain("/gallery/");
  });

  test("the home page has only a next link", () => {
    const html = document("");
    const pager = html.slice(html.indexOf('class="docs-pager"'));
    expect(pager).not.toContain('rel="prev"');
    expect(pager).toContain('href="/components/" rel="next"');
  });
});

describe("the reader's controls", () => {
  test("the appearance choice applies before the stylesheet and the switch waits for script", () => {
    const html = document("packages/meowtail");
    const head = html.slice(0, html.indexOf("</head>"));
    expect(head.indexOf("meowland-docs-appearance")).toBeGreaterThan(-1);
    expect(head.indexOf("meowland-docs-appearance")).toBeLessThan(head.indexOf('rel="stylesheet"'));
    expect(html).toMatch(/<button class="docs-appearance" id="docs-appearance"[^>]*hidden/);
  });

  test("the theme choice applies before the stylesheet and previews name their theme", () => {
    const html = document("packages/meowtail");
    const head = html.slice(0, html.indexOf("</head>"));
    expect(head.indexOf("meowland-docs-theme")).toBeGreaterThan(-1);
    expect(head.indexOf("meowland-docs-theme")).toBeLessThan(head.indexOf('rel="stylesheet"'));
    expect(html).not.toMatch(/<html[^>]*data-docs-theme/);
  });

  test("one appearance menu holds the theme and scheme choices", () => {
    const html = document("packages/meowtail");
    expect(html).toMatch(/<button class="docs-appearance" id="docs-appearance"[^>]*hidden/);
    const panel = html.slice(html.indexOf('id="docs-appearance-panel"'));
    expect(panel).toMatch(/^id="docs-appearance-panel" hidden/);
    for (const value of ["standard", "journal", "meow"])
      expect(panel).toContain(`name="docs-theme" value="${value}"`);
    for (const value of ["auto", "light", "dark"])
      expect(panel).toContain(`name="docs-scheme" value="${value}"`);
  });

  test("code actions stay hidden until the page wires them", () => {
    const html = document("packages/meowtail");
    expect(html).toContain('setAttribute("data-docs-code-actions"');
    expect(html).not.toMatch(/<html[^>]*data-docs-code-actions/);
  });

  test("search waits for script, and its dialog precedes the script that wires it", () => {
    const html = document("packages/meowtail");
    expect(html).toMatch(/<button class="docs-search-open" id="docs-search-open"[^>]*hidden/);
    expect(html.indexOf('id="docs-search-dialog"')).toBeGreaterThan(-1);
    expect(html.indexOf('id="docs-search-dialog"')).toBeLessThan(html.indexOf("search-index.json"));
    // The query splits on whitespace: the regex escape survives into the page.
    expect(html).toContain("split(/\\s+/)");
  });

  test("the navigation filter shows its keyboard shortcut", () => {
    expect(document("packages/meowtail")).toContain(
      '<kbd class="docs-search-key" aria-hidden="true">/</kbd>',
    );
  });
});
