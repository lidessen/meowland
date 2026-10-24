import { h } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Stack, Table, type TableRow, type TableSort } from "meowtail";
import { Note } from "./specimen";

const files = [
  { id: "alpha", name: "alpha.md", kind: "Markdown", size: 12 },
  { id: "notes", name: "notes.txt", kind: "Plain text", size: 4 },
  { id: "theme", name: "theme.ts", kind: "TypeScript", size: 28 },
  { id: "locked", name: "secrets.env", kind: "Environment", size: 1 },
] as const;

function rowsFor(sort: TableSort | undefined): TableRow[] {
  const rows = files.map((file) => ({
    id: file.id,
    label: `Select ${file.name}`,
    disabled: file.id === "locked",
    cells: [file.name, file.kind, `${file.size} KB`],
  }));
  if (!sort) return rows;
  const factor = sort.direction === "asc" ? 1 : -1;
  const value = (row: (typeof files)[number]) => {
    if (sort.columnId === "kind") return row.kind;
    if (sort.columnId === "size") return row.size;
    return row.name;
  };
  return [...rows].sort((left, right) => {
    const a = files.find((file) => file.id === left.id)!;
    const b = files.find((file) => file.id === right.id)!;
    const av = value(a);
    const bv = value(b);
    if (av < bv) return -1 * factor;
    if (av > bv) return 1 * factor;
    return 0;
  });
}

export const TableStory = defineStory({
  id: "data-table",
  title: "Table · Sort, resize and select",
  component: "Table",
  group: "Navigation and layout",
  groupOrder: 40,
  description:
    "A data table of host records. Column headers sort; their edges resize; checkboxes select several rows. The caller still owns the row order.",
  covers: ["Table sort", "Table resize", "Table multi-select"],
  render: () => {
    const sort = signal<TableSort | undefined>({ columnId: "name", direction: "asc" });
    const selected = signal<readonly string[]>(["alpha"]);
    const rows = mapSignal(sort, rowsFor);
    return (
      <Stack>
        <Table
          label="Workspace files"
          selectable
          columns={[
            { id: "name", header: "Name", sortable: true, width: 180 },
            { id: "kind", header: "Kind", sortable: true, width: 140 },
            { id: "size", header: "Size", sortable: true, align: "end", width: 88 },
          ]}
          rows={rows}
          sort={sort}
          onSortChange={(next) => {
            sort.value = next;
          }}
          selected={selected}
          onSelectedChange={(ids) => {
            selected.value = ids;
          }}
        />
        <Note role="status">
          {mapSignal(selected, (ids) =>
            ids.length === 0 ? "No files selected." : `Selected: ${ids.join(", ")}.`,
          )}
        </Note>
      </Stack>
    );
  },
});
