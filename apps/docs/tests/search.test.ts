import { describe, expect, test } from "bun:test";
import { searchEntryFor } from "../search";

const page = `<html><head><meta name="description" content="Buttons trigger one action."><title>Button · Meowland</title></head><body>
<aside class="docs-sidebar"><h2>Basic controls</h2></aside>
<article class="docs-article"><p data-meowui-part="page/eyebrow">Component reference</p>
<h1 data-meowui-part="page-header/title">Button</h1>
<aside class="docs-toc"><p>On this page</p><a href="#preview">Preview</a></aside>
<section id="preview"><header data-meowui-part="section/header"><h2 data-meowui-part="section/title">Preview</h2></header>
<p>Three sizes &amp; six levels.</p>
<figure data-meowui-part="code-block/root"><pre><code>render: () =&gt; null</code></pre></figure>
</section>
<section id="api-reference"><header><h2>API reference</h2></header><p>variant</p></section>
</article></body></html>`;

describe("the search index", () => {
  test("an entry carries the title, group, description and linkable sections", () => {
    const entry = searchEntryFor("/components/button/", page);
    expect(entry).toMatchObject({
      url: "/components/button/",
      title: "Button",
      group: "Component reference",
      description: "Buttons trigger one action.",
      sections: [
        { id: "preview", title: "Preview" },
        { id: "api-reference", title: "API reference" },
      ],
    });
  });

  test("the text keeps the words and drops code, the table of contents and the sidebar", () => {
    const text = searchEntryFor("/components/button/", page)!.text;
    expect(text).toContain("Three sizes & six levels.");
    expect(text).not.toContain("render:");
    expect(text).not.toContain("On this page");
    expect(text).not.toContain("Basic controls");
  });

  test("a page without an article is not indexed", () => {
    expect(searchEntryFor("/gallery/", "<html><body>Workbench</body></html>")).toBeUndefined();
  });
});
