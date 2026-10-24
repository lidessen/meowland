import {
  derived,
  h,
  keyed,
  unwrap,
  type Child,
  type MaybeSignal,
  type Props,
  type Context,
} from "meowjsx";
import { Checkbox } from "./checkbox";
import { Icon } from "../icons/icon";
import { tableMinWidth } from "./table.options";
export { tableMinWidth } from "./table.options";

export type TableSortDirection = "asc" | "desc";

export interface TableSort {
  columnId: string;
  direction: TableSortDirection;
}

export interface TableColumn {
  id: string;
  header: Child;
  /**
   * Preferred width in px. The last column fills the remaining width, so its
   * width only counts toward the table's minimum.
   */
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
  className?: Props["className"];
}

const defaultMinWidth = 80;
const selectColumnWidth = 44;

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
export function Table(
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
  }: TableProps,
  context: Context<typeof Table>,
) {
  const localSort = context.signal<TableSort | undefined>(defaultSort);
  const localSelected = context.signal<readonly string[]>(defaultSelected);
  const rowsView = derived(() => unwrap(rows));
  const sortState = derived(() => (sort === undefined ? localSort.value : unwrap(sort)));
  const selectedState = derived(() =>
    selected === undefined ? localSelected.value : unwrap(selected),
  );
  const widths = context.signal<Record<string, number>>(
    Object.fromEntries(
      columns.flatMap((column) => (column.width !== undefined ? [[column.id, column.width]] : [])),
    ),
  );
  const requestSort = (column: TableColumn) => {
    const next = sortFor(column, sortState.value);
    if (!next) return;
    if (sort === undefined) localSort.value = next;
    onSortChange?.(next);
  };
  const requestSelected = (ids: readonly string[]) => {
    if (selected === undefined) localSelected.value = ids;
    onSelectedChange?.(ids);
  };
  const toggleRow = (id: string, checked: boolean) => {
    const next = new Set(selectedState.value);
    if (checked) next.add(id);
    else next.delete(id);
    requestSelected([...next]);
  };
  const enabledIds = () => rowsView.value.filter((row) => !row.disabled).map((row) => row.id);
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
  const lastColumn = columns.at(-1);
  const columnWidth = (column: TableColumn) =>
    widths.value[column.id] ?? column.width ?? column.minWidth ?? defaultMinWidth;
  const minTableWidth = derived(
    () =>
      `${columns.reduce((sum, column) => sum + columnWidth(column), selectable ? selectColumnWidth : 0)}px`,
  );
  const headerCell = (column: TableColumn) => {
    const heading = column.sortable ? (
      <button type={"button"} onClick={() => requestSort(column)} ref={[context.parts.sort]}>
        {column.header}
        {
          <span
            hidden={derived(
              () => sortState.value?.columnId !== column.id || sortState.value.direction !== "asc",
            )}
          >
            <Icon name="arrow-up" size={12} />
          </span>
        }
        {
          <span
            hidden={derived(
              () => sortState.value?.columnId !== column.id || sortState.value.direction !== "desc",
            )}
          >
            <Icon name="arrow-down" size={12} />
          </span>
        }
      </button>
    ) : (
      column.header
    );
    return (
      <th
        scope={"col"}
        aria-sort={derived(() => ariaSort(column, sortState.value))}
        data-align={column.align}
        /* The last column takes the space the fixed widths leave; otherwise */ /* a fixed layout scales every column, the selection column included. */ style={derived(
          () =>
            column !== lastColumn && widths.value[column.id] !== undefined
              ? { width: `${widths.value[column.id]}px` }
              : undefined,
        )}
        ref={[context.parts.heading]}
      >
        {heading}
        {column.resizable === false ? null : (
          <span
            role={"separator"}
            aria-orientation={"vertical"}
            aria-label={"Resize column"}
            onPointerDown={(event: PointerEvent) => {
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
            }}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeUp}
            onPointerCancel={onResizeUp}
            ref={[context.parts.resize]}
          ></span>
        )}
      </th>
    );
  };
  return (
    <div {...props} className={className} ref={[context.parts.root, props.ref]}>
      {
        <div ref={[context.parts.scroller]}>
          {
            <table
              aria-label={label}
              style={derived(() => ({ [tableMinWidth.name]: minTableWidth.value }))}
              ref={[context.parts.table]}
            >
              {
                <thead ref={[context.parts.header]}>
                  {
                    <tr ref={[context.parts.row]}>
                      {selectable ? (
                        <th scope={"col"} ref={[context.parts.heading]}>
                          {
                            <div ref={[context.parts.select]}>
                              {
                                <Checkbox
                                  label="Select all rows"
                                  labelHidden
                                  checked={derived(() => {
                                    const enabled = enabledIds();
                                    const chosen = selectedState.value;
                                    return (
                                      enabled.length > 0 &&
                                      enabled.every((id) => chosen.includes(id))
                                    );
                                  })}
                                  indeterminate={derived(() => {
                                    const enabled = enabledIds();
                                    const count = enabled.filter((id) =>
                                      selectedState.value.includes(id),
                                    ).length;
                                    return count > 0 && count < enabled.length;
                                  })}
                                  onChange={(event: Event) => {
                                    const box = event.currentTarget as HTMLInputElement;
                                    requestSelected(box.checked ? enabledIds() : []);
                                  }}
                                />
                              }
                            </div>
                          }
                        </th>
                      ) : null}
                      {columns.map(headerCell)}
                    </tr>
                  }
                </thead>
              }
              {
                <tbody ref={[context.parts.body]}>
                  {keyed(
                    rowsView,
                    (row) => row.id,
                    (row) => (
                      <tr
                        data-row-id={derived(() => row.value.id)}
                        data-selected={derived(() =>
                          selectedState.value.includes(row.value.id) ? "true" : undefined,
                        )}
                        ref={[context.parts.row]}
                      >
                        {selectable ? (
                          <td data-table-select={""} ref={[context.parts.cell]}>
                            {
                              <div ref={[context.parts.select]}>
                                {
                                  <Checkbox
                                    label={derived(() => {
                                      const current = row.value;
                                      if (current.label) return current.label;
                                      const index = rowsView.value.findIndex(
                                        (item) => item.id === current.id,
                                      );
                                      return `Select row ${index + 1}`;
                                    })}
                                    labelHidden
                                    disabled={derived(() => Boolean(row.value.disabled))}
                                    checked={derived(() =>
                                      selectedState.value.includes(row.value.id),
                                    )}
                                    onChange={(event: Event) => {
                                      toggleRow(
                                        row.value.id,
                                        (event.currentTarget as HTMLInputElement).checked,
                                      );
                                    }}
                                  />
                                }
                              </div>
                            }
                          </td>
                        ) : null}
                        {columns.map((column, index) => (
                          <td data-align={column.align} ref={[context.parts.cell]}>
                            {derived(() => row.value.cells[index])}
                          </td>
                        ))}
                      </tr>
                    ),
                  )}
                </tbody>
              }
            </table>
          }
        </div>
      }
    </div>
  );
}
Table.meta = {
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
} as const;
