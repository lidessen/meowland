import {
  defineComponent,
  h,
  mapSignal,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Checkbox } from "./checkbox";
import { Icon } from "../icons/icon";

export const tableContract = {
  name: "table",
  parts: [
    "root",
    "scroller",
    "table",
    "header",
    "heading",
    "sort",
    "resize",
    "body",
    "row",
    "cell",
    "select",
  ],
} as const satisfies ComponentContract;

export type TableSortDirection = "asc" | "desc";

export interface TableSort {
  columnId: string;
  direction: TableSortDirection;
}

export interface TableColumn {
  id: string;
  header: Child;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  resizable?: boolean;
  align?: "start" | "end";
}

export interface TableRow {
  id: string;
  cells: readonly Child[];
  /** Accessible name for the row checkbox when the table is selectable. */
  label?: string;
  disabled?: boolean;
}

export interface TableProps extends Props {
  label: string;
  columns: readonly TableColumn[];
  rows: MaybeSignal<readonly TableRow[]>;
  sort?: MaybeSignal<TableSort | undefined>;
  defaultSort?: TableSort;
  onSortChange?: (sort: TableSort) => void;
  selected?: MaybeSignal<readonly string[]>;
  defaultSelected?: readonly string[];
  onSelectedChange?: (ids: readonly string[]) => void;
  selectable?: boolean;
  className?: string;
}

const defaultMinWidth = 80;

function sortFor(column: TableColumn, current: TableSort | undefined): TableSort | undefined {
  if (!column.sortable) return current;
  if (current?.columnId !== column.id) return { columnId: column.id, direction: "asc" };
  return { columnId: column.id, direction: current.direction === "asc" ? "desc" : "asc" };
}

function ariaSort(column: TableColumn, current: TableSort | undefined): string | undefined {
  if (!column.sortable) return undefined;
  if (current?.columnId !== column.id) return "none";
  return current.direction === "asc" ? "ascending" : "descending";
}

/** Data table. Sorting and selection are reported; row order and records stay with the caller. */
export const Table = defineComponent<
  TableProps,
  typeof tableContract.name,
  (typeof tableContract.parts)[number]
>(
  tableContract,
  (
    {
      label,
      columns,
      rows,
      sort,
      defaultSort,
      onSortChange,
      selected,
      defaultSelected = [],
      onSelectedChange,
      selectable = false,
      className,
      ...props
    },
    context,
  ) => {
    const localSort = context.signal<TableSort | undefined>(defaultSort);
    const localSelected = context.signal<readonly string[]>(defaultSelected);
    const currentSort = () => (sort === undefined ? localSort.value : unwrap(sort));
    const currentSelected = () => (selected === undefined ? localSelected.value : unwrap(selected));
    const currentRows = context.signal<readonly TableRow[]>(unwrap(rows));
    const sortState = context.signal<TableSort | undefined>(currentSort());
    const selectedState = context.signal<readonly string[]>(currentSelected());
    const widths = context.signal<Record<string, number>>(
      Object.fromEntries(
        columns.flatMap((column) =>
          column.width !== undefined ? [[column.id, column.width]] : [],
        ),
      ),
    );
    context.effect(() => {
      currentRows.value = unwrap(rows);
      sortState.value = currentSort();
      selectedState.value = currentSelected();
    });
    const requestSort = (column: TableColumn) => {
      const next = sortFor(column, currentSort());
      if (!next) return;
      if (sort === undefined) localSort.value = next;
      onSortChange?.(next);
    };
    const requestSelected = (ids: readonly string[]) => {
      if (selected === undefined) localSelected.value = ids;
      onSelectedChange?.(ids);
    };
    const toggleRow = (id: string, checked: boolean) => {
      const next = new Set(currentSelected());
      if (checked) next.add(id);
      else next.delete(id);
      requestSelected([...next]);
    };
    const enabledIds = () => currentRows.value.filter((row) => !row.disabled).map((row) => row.id);
    let resize: { id: string; startX: number; startWidth: number; minWidth: number } | undefined;
    const onResizeMove = (event: PointerEvent) => {
      if (!resize) return;
      const delta = event.clientX - resize.startX;
      const next = Math.max(resize.minWidth, resize.startWidth + delta);
      widths.value = { ...widths.value, [resize.id]: next };
    };
    const onResizeUp = (event: PointerEvent) => {
      if (!resize) return;
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
      resize = undefined;
    };
    const headerCell = (column: TableColumn) => {
      const heading = column.sortable
        ? context.part(
            "sort",
            "button",
            {
              type: "button",
              onClick: () => requestSort(column),
            },
            column.header,
            mapSignal(sortState, (current) =>
              current?.columnId === column.id ? (
                <Icon name={current.direction === "asc" ? "arrow-up" : "arrow-down"} size={12} />
              ) : null,
            ),
          )
        : column.header;
      return context.part(
        "heading",
        "th",
        {
          scope: "col",
          "aria-sort": mapSignal(sortState, (current) => ariaSort(column, current)),
          "data-align": column.align,
          style: mapSignal(widths, (current) =>
            current[column.id] !== undefined ? { width: `${current[column.id]}px` } : undefined,
          ),
        },
        heading,
        column.resizable === false
          ? null
          : context.part("resize", "span", {
              role: "separator",
              "aria-orientation": "vertical",
              "aria-label": "Resize column",
              onPointerDown: (event: PointerEvent) => {
                if (event.button !== 0) return;
                event.preventDefault();
                (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
                const startWidth = widths.value[column.id] ?? column.width ?? defaultMinWidth;
                resize = {
                  id: column.id,
                  startX: event.clientX,
                  startWidth,
                  minWidth: column.minWidth ?? defaultMinWidth,
                };
              },
              onPointerMove: onResizeMove,
              onPointerUp: onResizeUp,
              onPointerCancel: onResizeUp,
            }),
      );
    };
    return context.part(
      "root",
      "div",
      { ...props, className },
      context.part(
        "scroller",
        "div",
        null,
        context.part(
          "table",
          "table",
          { "aria-label": label },
          context.part(
            "header",
            "thead",
            null,
            context.part(
              "row",
              "tr",
              null,
              selectable
                ? context.part(
                    "heading",
                    "th",
                    { scope: "col" },
                    context.part(
                      "select",
                      "div",
                      null,
                      mapSignal(selectedState, (chosen) => {
                        const enabled = enabledIds();
                        const selectedEnabled = enabled.filter((id) => chosen.includes(id));
                        const all = enabled.length > 0 && selectedEnabled.length === enabled.length;
                        const mixed = selectedEnabled.length > 0 && !all;
                        return (
                          <Checkbox
                            label="Select all rows"
                            labelHidden
                            checked={all}
                            indeterminate={mixed}
                            onChange={(event: Event) => {
                              const box = event.currentTarget as HTMLInputElement;
                              requestSelected(box.checked ? enabledIds() : []);
                            }}
                          />
                        );
                      }),
                    ),
                  )
                : null,
              ...columns.map(headerCell),
            ),
          ),
          context.part(
            "body",
            "tbody",
            null,
            mapSignal(currentRows, (list) =>
              list.map((row, rowIndex) =>
                context.part(
                  "row",
                  "tr",
                  {
                    "data-row-id": row.id,
                    "data-selected": mapSignal(selectedState, (chosen) =>
                      chosen.includes(row.id) ? "true" : undefined,
                    ),
                  },
                  selectable
                    ? context.part(
                        "cell",
                        "td",
                        { "data-table-select": "" },
                        context.part(
                          "select",
                          "div",
                          null,
                          mapSignal(selectedState, (chosen) => (
                            <Checkbox
                              label={row.label ?? `Select row ${rowIndex + 1}`}
                              labelHidden
                              disabled={row.disabled}
                              checked={chosen.includes(row.id)}
                              onChange={(event: Event) => {
                                toggleRow(
                                  row.id,
                                  (event.currentTarget as HTMLInputElement).checked,
                                );
                              }}
                            />
                          )),
                        ),
                      )
                    : null,
                  ...columns.map((column, index) =>
                    context.part("cell", "td", { "data-align": column.align }, row.cells[index]),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  },
);
