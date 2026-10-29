import { h, keyed, type Child, type Context, type Props } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal, type ReadableSignal } from "meowjsx/signal";
import { Icon, type IconName } from "../icons/icon";
import { activeElementInRoot } from "../shared/dom-root";
import { elementId } from "../shared/element-id";
import { treeViewLevel } from "./tree-view.options";
export { treeViewLevel } from "./tree-view.options";

export interface TreeViewItem {
  /** Unique across the whole tree. */
  id: string;
  label: string;
  /** A neutral leading icon naming the item's type. Fixed for the item's mount. */
  icon?: IconName;
  description?: string;
  /** Focusable but not selectable. */
  disabled?: boolean;
  /** Present, even empty, for a branch. */
  children?: readonly TreeViewItem[];
}

export interface TreeViewProps extends Props {
  /** Accessible name of the tree. */
  label: string;
  /** The host owns the hierarchy; a Signal keeps it live and rows keep their DOM by id. */
  items: MaybeSignal<readonly TreeViewItem[]>;
  /** Controlled open branches. Omit it to keep them locally from defaultExpanded. */
  expanded?: MaybeSignal<readonly string[]>;
  defaultExpanded?: readonly string[];
  onExpandedChange?: (ids: readonly string[]) => void;
  /** Controlled selection. Omit it to keep it locally from defaultSelected. */
  selected?: MaybeSignal<string | undefined>;
  defaultSelected?: string;
  onSelectedChange?: (id: string) => void;
  className?: Props["className"];
}

/** Ids of the items a reader can reach: every root, and the children of each open branch. */
function visibleIds(items: readonly TreeViewItem[], open: ReadonlySet<string>): string[] {
  return items.flatMap((item) => [
    item.id,
    ...(item.children && open.has(item.id) ? visibleIds(item.children, open) : []),
  ]);
}

/** The ancestors of an item, nearest first; undefined when the item is not in the tree. */
function ancestorsOf(items: readonly TreeViewItem[], id: string): string[] | undefined {
  for (const item of items) {
    if (item.id === id) return [];
    const below = item.children ? ancestorsOf(item.children, id) : undefined;
    if (below) return [...below, item.id];
  }
  return undefined;
}

function find(items: readonly TreeViewItem[], id: string): TreeViewItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    const below = item.children ? find(item.children, id) : undefined;
    if (below) return below;
  }
  return undefined;
}

/** A hierarchy to explore and select from, with the tree keyboard model. */
export function TreeView(
  {
    label,
    items,
    expanded,
    defaultExpanded = [],
    onExpandedChange,
    selected,
    defaultSelected,
    onSelectedChange,
    className,
    ref,
    ...props
  }: TreeViewProps,
  context: Context<typeof TreeView>,
) {
  const base = elementId("tree");
  const localExpanded = signal<readonly string[]>(defaultExpanded);
  const openIds = expanded !== undefined ? expanded : localExpanded;
  const localSelected = signal<string | undefined>(defaultSelected);
  const current = selected !== undefined ? selected : localSelected;
  const openSet = derived(() => new Set(unwrap(openIds)));
  const visible = derived(() => visibleIds(unwrap(items), openSet.value));
  const stop = signal<string | undefined>(undefined);
  // The single tab stop: where the reader last stood, else the selection, else the first item.
  const tabStop = derived(() => {
    const ids = visible.value;
    const wanted = [stop.value, unwrap(current)].find((id) => id !== undefined && ids.includes(id));
    return wanted ?? ids[0];
  });
  const elements = new Map<string, HTMLElement>();
  let root: HTMLElement | undefined;
  // The item that holds focus and its ancestors, kept to repair focus if it disappears.
  let holder: { id: string; ancestors: readonly string[] } | undefined;
  let alive = true;
  context.onCleanup(() => {
    alive = false;
  });

  const domId = (id: string) => `${base}-${id}`;
  const focusItem = (id: string | undefined) => {
    if (id === undefined) return;
    stop.value = id;
    const element = elements.get(id);
    element?.focus();
    element?.scrollIntoView?.({ block: "nearest" });
  };
  const setOpen = (id: string, open: boolean) => {
    const ids = unwrap(openIds);
    if (ids.includes(id) === open) return;
    const next = open ? [...ids, id] : ids.filter((value) => value !== id);
    if (expanded === undefined) localExpanded.value = next;
    onExpandedChange?.(next);
  };
  const select = (id: string) => {
    const item = find(unwrap(items), id);
    if (!item || item.disabled) return;
    if (selected === undefined) localSelected.value = id;
    onSelectedChange?.(id);
  };
  // Focus that was inside the tree and lost its item moves to the nearest visible ancestor.
  const repair = () => {
    if (!holder || !root) return;
    const ids = visible.value;
    if (ids.includes(holder.id)) return;
    const active = activeElementInRoot(root);
    if (active && active !== root.ownerDocument.body && !root.contains(active)) return;
    focusItem(holder.ancestors.find((id) => ids.includes(id)) ?? ids[0]);
  };
  context.effect(() => {
    void visible.value;
    queueMicrotask(() => {
      if (alive) repair();
    });
  });

  const keydown = (event: KeyboardEvent) => {
    const element = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
    const id = element?.dataset.treeId;
    if (!element || id === undefined || event.altKey || event.ctrlKey || event.metaKey) return;
    const ids = visible.value;
    const index = ids.indexOf(id);
    const item = find(unwrap(items), id);
    const branch = item?.children !== undefined;
    const open = openSet.value.has(id);
    const handled = () => event.preventDefault();
    switch (event.key) {
      case "ArrowDown":
        handled();
        focusItem(ids[index + 1]);
        break;
      case "ArrowUp":
        handled();
        focusItem(ids[index - 1]);
        break;
      case "Home":
        handled();
        focusItem(ids[0]);
        break;
      case "End":
        handled();
        focusItem(ids.at(-1));
        break;
      case "ArrowRight":
        handled();
        if (branch && !open) setOpen(id, true);
        else if (branch && item!.children!.length > 0) focusItem(item!.children![0]!.id);
        break;
      case "ArrowLeft":
        handled();
        if (branch && open) setOpen(id, false);
        else focusItem(ancestorsOf(unwrap(items), id)?.[0]);
        break;
      case "Enter":
      case " ":
        handled();
        select(id);
        break;
      case "*": {
        handled();
        const parent = ancestorsOf(unwrap(items), id)?.[0];
        const siblings =
          parent === undefined ? unwrap(items) : (find(unwrap(items), parent)?.children ?? []);
        const add = siblings
          .filter((sibling) => sibling.children !== undefined)
          .map((sibling) => sibling.id);
        const next = [...new Set([...unwrap(openIds), ...add])];
        if (expanded === undefined) localExpanded.value = next;
        onExpandedChange?.(next);
        break;
      }
      default:
        if (event.key.length === 1 && event.key !== " ") {
          const letter = event.key.toLocaleLowerCase();
          const order = [...ids.slice(index + 1), ...ids.slice(0, index + 1)];
          const match = order.find((candidate) =>
            find(unwrap(items), candidate)?.label.toLocaleLowerCase().startsWith(letter),
          );
          if (match !== undefined) {
            handled();
            focusItem(match);
          }
        }
    }
  };

  const renderLevel = (level: number, siblings: MaybeSignal<readonly TreeViewItem[]>): Child =>
    keyed(
      siblings,
      (item) => item.id,
      (item: ReadableSignal<TreeViewItem>) => {
        const id = item.value.id;
        const branch = derived(() => item.value.children !== undefined);
        const open = derived(() => branch.value && openSet.value.has(id));
        const disabled = derived(() => Boolean(item.value.disabled));
        const children = derived(() => item.value.children ?? []);
        const position = derived(() => unwrap(siblings).findIndex((entry) => entry.id === id) + 1);
        const icon = item.value.icon;
        return (
          <li
            id={domId(id)}
            role="treeitem"
            data-tree-id={id}
            aria-level={String(level)}
            aria-setsize={derived(() => String(unwrap(siblings).length))}
            aria-posinset={derived(() => String(position.value))}
            aria-expanded={derived(() => (branch.value ? String(open.value) : undefined))}
            aria-selected={derived(() =>
              disabled.value ? undefined : String(unwrap(current) === id),
            )}
            aria-disabled={derived(() => (disabled.value ? "true" : undefined))}
            tabIndex={derived(() => (tabStop.value === id ? 0 : -1))}
            onFocus={(event: FocusEvent) => {
              if (event.target !== event.currentTarget) return;
              stop.value = id;
              holder = { id, ancestors: ancestorsOf(unwrap(items), id) ?? [] };
            }}
            ref={[
              context.parts.item,
              (element: HTMLElement) => {
                elements.set(id, element);
                return () => {
                  if (elements.get(id) === element) elements.delete(id);
                  queueMicrotask(() => {
                    if (alive) repair();
                  });
                };
              },
            ]}
          >
            <div
              style={{ [treeViewLevel.name]: level }}
              onClick={(event: MouseEvent) => {
                // A click inside a nested row belongs to that row.
                if ((event.target as HTMLElement).closest('[role="treeitem"]') !== elements.get(id))
                  return;
                focusItem(id);
                select(id);
              }}
              ref={context.parts.row}
            >
              {/* Pointer only: a treeitem holds no focusable control. */}
              <span
                aria-hidden="true"
                data-open={derived(() => String(open.value))}
                hidden={derived(() => !branch.value)}
                onClick={(event: MouseEvent) => {
                  event.stopPropagation();
                  focusItem(id);
                  setOpen(id, !open.value);
                }}
                ref={context.parts.toggle}
              >
                <Icon name="chevron-right" />
              </span>
              {icon ? (
                <span aria-hidden="true" ref={context.parts.icon}>
                  <Icon name={icon} />
                </span>
              ) : null}
              <span ref={context.parts.label}>{derived(() => item.value.label)}</span>
              <span hidden={derived(() => !item.value.description)} ref={context.parts.description}>
                {derived(() => item.value.description ?? "")}
              </span>
            </div>
            <ul
              role={derived(() => (branch.value ? "group" : undefined))}
              hidden={derived(() => !open.value)}
              ref={context.parts.group}
            >
              {renderLevel(level + 1, children)}
            </ul>
          </li>
        );
      },
    );

  return (
    <ul
      {...props}
      role="tree"
      aria-label={label}
      className={className}
      onKeyDown={keydown}
      onFocusOut={(event: FocusEvent) => {
        const left = event.target as HTMLElement;
        queueMicrotask(() => {
          // Focus the reader moved elsewhere on purpose is not repaired later.
          const active = root && activeElementInRoot(root);
          if (
            left.isConnected &&
            left.getClientRects().length > 0 &&
            !root?.contains(active ?? null)
          )
            holder = undefined;
        });
      }}
      ref={[
        context.parts.root,
        ref,
        (element: HTMLElement) => {
          root = element;
        },
      ]}
    >
      {renderLevel(1, items)}
    </ul>
  );
}
TreeView.meta = {
  name: "tree-view",
  parts: ["root", "item", "row", "toggle", "icon", "label", "description", "group"],
} as const;
