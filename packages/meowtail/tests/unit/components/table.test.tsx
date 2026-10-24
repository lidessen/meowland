import { expect, test } from "bun:test";
import { createRuntime, h, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Table, installMeowUI, meowUIComponents } from "../../../src/index";

const columns = [
  { id: "name", header: "Name", sortable: true, width: 160 },
  { id: "size", header: "Size", sortable: true, align: "end" as const, resizable: true },
];
const rows = [
  { id: "alpha", label: "Select alpha.md", cells: ["alpha.md", "12 KB"] },
  { id: "notes", label: "Select notes.txt", cells: ["notes.txt", "4 KB"] },
];

test("table names the grid and marks the active sort", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const html = createWebRenderer(runtime).renderToHtml(
    <Table
      label="Workspace files"
      columns={columns}
      rows={rows}
      defaultSort={{ columnId: "name", direction: "asc" }}
    />,
  );
  expect(html).toContain('aria-label="Workspace files"');
  expect(html).toContain('aria-sort="ascending"');
  expect(html).toContain("alpha.md");
  expect(html).not.toContain("Select all rows");
});

test("sortable headers report the next direction to the caller", () => {
  const runtime = createRuntime();
  const buttons: Props[] = [];
  runtime.use({
    render({ vnode }, next) {
      if (vnode.type === "button" && vnode.props.type === "button") buttons.push(vnode.props);
      return next(vnode);
    },
  });
  const seen: string[] = [];
  createWebRenderer(runtime).renderToHtml(
    <Table
      label="Files"
      columns={columns}
      rows={rows}
      defaultSort={{ columnId: "name", direction: "asc" }}
      onSortChange={(sort) => seen.push(`${sort.columnId}:${sort.direction}`)}
    />,
  );
  (buttons[0]!.onClick as () => void)();
  expect(seen).toEqual(["name:desc"]);
});

test("selectable tables toggle rows and the header mixed state", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const html = createWebRenderer(runtime).renderToHtml(
    <Table label="Files" selectable columns={columns} rows={rows} defaultSelected={["alpha"]} />,
  );
  expect(html).toContain("Select all rows");
  expect(html).toContain("Select alpha.md");
  expect(html).toContain('data-row-id="alpha"');
});

test("the last column fills the row while the table keeps a minimum width", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const html = createWebRenderer(runtime).renderToHtml(
    <Table
      label="Files"
      selectable
      columns={[columns[0]!, { ...columns[1]!, width: 120 }]}
      rows={rows}
    />,
  );
  expect(html).toContain("width:160px");
  expect(html).not.toContain("width:120px");
  // Selection column + both preferred widths.
  expect(html).toContain("--table-min-width:324px");
});
