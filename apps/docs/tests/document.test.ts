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
  test("the catalog rail carries a search field and the reference count", () => {
    const html = document("components/button");
    expect(html).toContain('data-meowui-part="search-input/root"');
    expect(html).toContain("Find components");
    expect(html).toContain("Component reference");
  });

  test("the rail is one NavList landmark with labelled groups", () => {
    const html = document("components/button");
    expect(html).toContain('data-meowui-part="nav-list/root"');
    expect(html).toContain('aria-label="Documentation"');
    expect(html).toContain('data-meowui-part="nav-list/groupTitle"');
    expect(html).toContain("Overview");
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
});

describe("the docs pages", () => {
  test("the home page is built from the library page and section parts", () => {
    const html = page("");
    expect(html).toContain('data-meowui-part="page/root"');
    expect(html).toContain('data-meowui-part="page/header"');
    expect(html).toContain('data-meowui-part="page/eyebrow"');
    expect(html).toContain('data-meowui-part="page-header/title"');
    expect(html).toContain("A small UI capability library");
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
    // The breadcrumb names the group; the page does not repeat it as an eyebrow.
    expect(html).not.toContain('data-meowui-part="page/eyebrow"');
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
    expect(html).not.toContain('data-meowui-part="page/eyebrow"');
    expect(html).not.toContain("docs-code-panel");
    expect(html).not.toContain("docs-code-head");
  });
});
