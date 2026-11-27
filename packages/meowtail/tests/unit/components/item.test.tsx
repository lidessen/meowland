import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Item } from "../../../src/components/item";

test("item preserves native control semantics and consumer navigation attributes", () => {
  const web = createWebRenderer(createRuntime());
  const html = web.renderToHtml(
    <Item
      as="button"
      disabled
      selected
      data-source="source-1"
      aria-expanded="false"
      title="File"
      description="path/to/file"
      trailing="L1–4"
    />,
  );
  expect(html).toContain("<button");
  expect(html).toContain('type="button"');
  expect(html).toContain("disabled");
  expect(html).toContain('data-source="source-1"');
  expect(html).toContain('aria-expanded="false"');
  expect(html).toContain('data-selected="true"');
  expect(html).toContain("path/to/file");
  expect(web.renderToHtml(<Item title="Static" />)).not.toContain("<button");
});

test("an item with href is a link that marks the selected destination as current", () => {
  const web = createWebRenderer(createRuntime());
  const current = web.renderToHtml(
    <Item as="button" href="/tasks/t-1" selected title="Ship" trailing="3m" />,
  );
  expect(current).toContain('<a href="/tasks/t-1"');
  expect(current).toContain('aria-current="page"');
  expect(current).not.toContain("<button");
  expect(current).not.toContain('type="button"');
  const other = web.renderToHtml(<Item href="/tasks/t-2" title="Review" />);
  expect(other).not.toContain("aria-current");
  expect(web.renderToHtml(<Item as="button" selected title="Choice" />)).not.toContain(
    "aria-current",
  );
});
