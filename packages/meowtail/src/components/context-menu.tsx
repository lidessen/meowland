import {
  defineComponent,
  h,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Menu, type MenuEntry } from "./menu";

export const contextMenuContract = {
  name: "context-menu",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface ContextMenuProps extends Props {
  id: string;
  items: readonly MenuEntry[];
  open?: MaybeSignal<boolean>;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children?: Child;
}

/** Right-click or Shift+F10 opens the existing Menu, including nested items. */
export const ContextMenu = defineComponent<
  ContextMenuProps,
  typeof contextMenuContract.name,
  (typeof contextMenuContract.parts)[number]
>(
  contextMenuContract,
  ({ id, items, open, onOpenChange, className, children, ...props }, context) => {
    const local = context.signal(false);
    const state = open !== undefined ? open : local;
    let point = { x: 0, y: 0 };
    const request = (next: boolean) => {
      if (open === undefined) local.value = next;
      onOpenChange?.(next);
    };
    const openAt = (x: number, y: number) => {
      const reopen = unwrap(state);
      point = { x, y };
      if (reopen) {
        request(false);
        queueMicrotask(() => request(true));
        return;
      }
      request(true);
    };
    return (
      <Menu
        id={id}
        items={items}
        open={state}
        onOpenChange={request}
        anchorRect={() => new DOMRect(point.x, point.y, 0, 0)}
        trigger={(bindings) =>
          context.part(
            "root",
            "div",
            {
              ...props,
              id: bindings.id,
              "aria-controls": bindings["aria-controls"],
              "aria-expanded": bindings["aria-expanded"],
              "aria-haspopup": bindings["aria-haspopup"],
              className,
              tabIndex: -1,
              onContextMenu: (event: MouseEvent) => {
                event.preventDefault();
                openAt(event.clientX, event.clientY);
              },
              onKeyDown: (event: KeyboardEvent) => {
                if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
                if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) {
                  event.preventDefault();
                  const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
                  openAt(box.left, box.bottom);
                }
              },
            },
            children,
          )
        }
      />
    );
  },
);
