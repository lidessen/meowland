import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { TreeView, installMeowUI, meowUIComponents } from "../../../src/index";

function html(view: unknown) {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  return createWebRenderer(runtime).renderToHtml(view as never);
}

test("tree items carry level, position, expansion and selection; closed groups stay mounted", () => {
  const output = html(
    <TreeView
      label="Files"
      defaultExpanded={["src"]}
      defaultSelected="index"
      items={[
        {
          id: "src",
          label: "src",
          children: [
            { id: "index", label: "index.ts" },
            { id: "lib", label: "lib", children: [{ id: "deep", label: "deep.ts" }] },
          ],
        },
        { id: "locked", label: ".env", disabled: true },
      ]}
    />,
  );
  const item = (id: string) => new RegExp(`<li [^>]*data-tree-id="${id}"[^>]*>`).exec(output)![0];
  expect(output).toContain('role="tree" aria-label="Files"');
  expect(item("src")).toContain('aria-level="1"');
  expect(item("src")).toContain('aria-expanded="true"');
  expect(item("src")).toContain('aria-setsize="2"');
  expect(item("index")).toContain('aria-level="2"');
  expect(item("index")).toContain('aria-selected="true"');
  // The selection is the tab stop.
  expect(item("index")).toContain('tabindex="0"');
  expect(output.match(/tabindex="0"/g)).toHaveLength(1);
  expect(item("lib")).toContain('aria-expanded="false"');
  expect(item("lib")).toContain('aria-posinset="2"');
  // A closed branch keeps its subtree mounted and hidden.
  expect(item("deep")).toContain('aria-level="3"');
  expect(item("locked")).toContain('aria-disabled="true"');
  expect(item("locked")).not.toContain("aria-selected");
  expect(item("index")).not.toContain("aria-expanded");
});
