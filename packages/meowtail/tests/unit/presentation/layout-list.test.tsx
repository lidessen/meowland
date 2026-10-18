import { expect, test } from "bun:test";
import { createRuntime, h, type Child } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { PresentationLayout } from "../../../src/presentation/layout";
import { PresentationList } from "../../../src/presentation/list";

const html = (child: Child) => createWebRenderer(createRuntime()).renderToHtml(child);

test("numeric presentation columns reuse the existing named allocations", () => {
  for (const [columns, normalized] of [
    [1, "single"],
    [2, "equal"],
    [3, "3"],
  ] as const) {
    const rendered = html(
      <PresentationLayout
        columns={columns}
        header={<h2>Heading</h2>}
        footer={<small>Source</small>}
      >
        <p>Body</p>
      </PresentationLayout>,
    );
    expect(rendered).toContain(`data-columns="${normalized}"`);
    expect(rendered).toContain("<header><h2>Heading</h2></header>");
    expect(rendered).toContain("<div><p>Body</p></div>");
    expect(rendered).toContain("<footer><small>Source</small></footer>");
  }
});

test("presentation lists retain native unordered and ordered list semantics", () => {
  const unordered = html(
    <PresentationList items={["First <fact>", <strong>Second fact</strong>]} />,
  );
  expect(unordered).toStartWith("<ul>");
  expect(unordered.match(/<li(?:\s|>)/g)).toHaveLength(2);
  expect(unordered).toContain("First &lt;fact&gt;");
  expect(unordered).toContain("<strong>Second fact</strong>");
  const ordered = html(
    <PresentationList as="ol" start={4} reversed aria-label="Steps" items={["Last", "Earlier"]} />,
  );
  expect(ordered).toStartWith("<ol ");
  expect(ordered).toContain('start="4"');
  expect(ordered).toContain("reversed");
  expect(ordered).toContain('aria-label="Steps"');
});

test("nested lists stay inside their parent list item and empty lists add no placeholder", () => {
  const rendered = html(
    <PresentationList
      items={[
        <div>
          Evidence
          <PresentationList as="ol" items={["First source", "Second source"]} />
        </div>,
      ]}
    />,
  );
  expect(rendered).toMatch(/<li[^>]*><div>Evidence<ol/);
  expect(rendered.match(/<li(?:\s|>)/g)).toHaveLength(3);
  expect(html(<PresentationList items={[]} />)).not.toContain("<li");
});

test("static absent list items create no empty marker and numeric zero stays visible", () => {
  const rendered = html(<PresentationList items={["A", false, null, undefined, true, 0]} />);
  expect(rendered.match(/<li(?:\s|>)/g)).toHaveLength(2);
  expect(rendered).toContain("<li>A</li>");
  expect(rendered).toContain("<li>0</li>");
});
