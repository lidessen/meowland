import {
  defineComponent,
  h,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Popover, type PopoverTriggerBindings } from "./popover";
import { Icon } from "../icons/icon";
import { activeElementInRoot, elementByIdInRoot } from "../shared/dom-root";

export interface MenuAction {
  id: string;
  label: string;
  icon?: Child;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
  children?: readonly MenuEntry[];
}
export type MenuEntry =
  | MenuAction
  | { type: "separator"; id: string }
  | { type: "group"; id: string; label: string; items: readonly MenuAction[] };
export interface MenuTriggerBindings extends PopoverTriggerBindings {
  "aria-haspopup": "menu";
  onKeyDown: (event: KeyboardEvent) => void;
}
export interface MenuProps extends Props {
  id: string;
  trigger: (bindings: MenuTriggerBindings) => Child;
  items: readonly MenuEntry[];
  open?: MaybeSignal<boolean>;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "end";
  className?: string;
}
export const menuContract = {
  name: "menu",
  parts: ["root", "item", "icon", "label", "shortcut", "group", "heading", "separator", "branch"],
} as const satisfies ComponentContract;

/** Action menu. Popover owns placement, outside dismissal, Escape and focus return. */
interface MenuLevelProps extends MenuProps {
  placement?: "bottom" | "right";
  closeAncestors?: () => void;
}
export const Menu = defineComponent<MenuLevelProps, "menu", (typeof menuContract.parts)[number]>(
  menuContract,
  (
    {
      id,
      trigger,
      items,
      open,
      onOpenChange,
      align,
      className,
      placement = "bottom",
      closeAncestors,
    },
    context,
  ) => {
    const local = context.signal(false);
    const state = open ?? local;
    let root: HTMLElement | undefined;
    let search = "";
    let searchTime = 0;
    const children: Array<() => void> = [];
    const buttons = () =>
      Array.from(
        root?.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)') ?? [],
      ).filter((button) => button.closest('[role="menu"]') === root);
    const request = (next: boolean) => {
      if (open === undefined) local.value = next;
      onOpenChange?.(next);
      if (!next) {
        search = "";
        children.forEach((close) => close());
      }
    };
    context.effect(() => {
      if (!unwrap(state)) children.forEach((close) => close());
    });
    const focusEdge = (last = false) =>
      queueMicrotask(() => {
        if (!unwrap(state) || !root?.isConnected) return;
        const rows = buttons();
        (last ? rows.at(-1) : rows[0])?.focus();
      });
    const renderAction = (item: MenuAction): Child => {
      const contents = [
        item.icon ? context.part("icon", "span", { "aria-hidden": "true" }, item.icon) : null,
        context.part("label", "span", null, item.label),
        item.shortcut
          ? context.part("shortcut", "span", { "aria-hidden": "true" }, item.shortcut)
          : null,
      ];
      if (item.children) {
        const childOpen = context.signal(false);
        let timer: ReturnType<typeof setTimeout> | undefined;
        const clear = () => {
          clearTimeout(timer);
          timer = undefined;
        };
        const close = () => {
          clear();
          childOpen.value = false;
        };
        children.push(close);
        context.onCleanup(clear);
        const childId = `${id}-submenu-${item.id}`;
        const openChild = () => {
          if (item.disabled) return;
          clear();
          children.forEach((other) => {
            if (other !== close) other();
          });
          childOpen.value = true;
        };
        const focusChild = () =>
          queueMicrotask(() => {
            if (root)
              elementByIdInRoot(root, childId)
                ?.querySelector<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)')
                ?.focus();
          });
        return context.part(
          "branch",
          "div",
          {
            onPointerEnter: (event: PointerEvent) => {
              if (event.pointerType !== "touch") openChild();
            },
            onPointerLeave: () => {
              clear();
              timer = setTimeout(close, 180);
            },
          },
          <Menu
            id={childId}
            items={item.children}
            open={childOpen}
            placement="right"
            onOpenChange={(next) => {
              if (next) openChild();
              else close();
            }}
            closeAncestors={() => {
              request(false);
              closeAncestors?.();
            }}
            trigger={(bindings) =>
              context.part(
                "item",
                "button",
                {
                  ...bindings,
                  role: "menuitem",
                  type: "button",
                  tabIndex: -1,
                  disabled: item.disabled,
                  "data-menu-id": item.id,
                  "data-menu-label": item.label,
                  onClick: () => {
                    openChild();
                    focusChild();
                  },
                  onKeyDown: (event: KeyboardEvent) => {
                    if (event.key === "ArrowRight" && !event.isComposing) {
                      event.preventDefault();
                      event.stopPropagation();
                      openChild();
                      focusChild();
                    }
                  },
                },
                ...contents,
                <Icon name="chevron-right" />,
              )
            }
          />,
        );
      }
      return context.part(
        "item",
        "button",
        {
          type: "button",
          role: "menuitem",
          tabIndex: -1,
          disabled: item.disabled,
          "data-menu-id": item.id,
          "data-menu-label": item.label,
          "data-danger": item.danger ? "true" : undefined,
          onClick: () => {
            if (item.disabled) return;
            // Close before invoking the action so its own focus move remains authoritative.
            request(false);
            closeAncestors?.();
            item.onSelect?.();
          },
        },
        ...contents,
      );
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as Element | null;
      if (target?.closest && target.closest('[role="menu"]') !== root) return;
      if (event.key === "ArrowLeft" && placement === "right") {
        event.preventDefault();
        event.stopPropagation();
        request(false);
        return;
      }
      const rows = buttons();
      const current = rows.findIndex((row) => root && row === activeElementInRoot(root));
      let next: number | undefined;
      if (event.key === "ArrowDown") next = (current + 1) % rows.length;
      if (event.key === "ArrowUp")
        next = current < 0 ? rows.length - 1 : (current - 1 + rows.length) % rows.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = rows.length - 1;
      if (event.key === "Tab") {
        // Dismiss the whole action surface, then let native Tab continue from
        // its restored trigger. Moving focus must never activate an action.
        request(false);
        closeAncestors?.();
        event.stopPropagation();
        return;
      }
      if (event.key.length === 1 && event.key !== " ") {
        const now = Date.now();
        search = now - searchTime > 500 ? event.key : search + event.key;
        searchTime = now;
        const needle = search.toLocaleLowerCase();
        for (let step = 1; step <= rows.length; step++) {
          const index = (current + step) % rows.length;
          const label = rows[index]?.dataset.menuLabel ?? "";
          if (label.trim().toLocaleLowerCase().startsWith(needle)) {
            next = index;
            break;
          }
        }
      }
      if (next !== undefined) {
        event.preventDefault();
        rows[next]?.focus();
      }
    };
    return (
      <Popover
        id={id}
        open={state}
        align={align}
        placement={placement}
        onOpenChange={(next) => {
          request(next);
          if (next) focusEdge();
        }}
        trigger={(bindings) =>
          trigger({
            ...bindings,
            "aria-haspopup": "menu",
            onKeyDown: (event) => {
              if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
              if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
              event.preventDefault();
              request(true);
              focusEdge(event.key === "ArrowUp");
            },
          })
        }
      >
        {context.part(
          "root",
          "div",
          {
            className,
            role: "menu",
            "aria-labelledby": `${id}-trigger`,
            onKeyDown: keydown,
            ref: (element: HTMLElement) => {
              root = element;
              // A menu tree dismisses as one action surface on outside pointer input.
              // Escape still delegates one level at a time to Popover's layer stack.
              const outside = (event: PointerEvent) => {
                if (placement !== "bottom" || !unwrap(state)) return;
                const anchor = elementByIdInRoot(element, `${id}-trigger`);
                const path = event.composedPath();
                if (!path.includes(element) && (!anchor || !path.includes(anchor))) request(false);
              };
              element.ownerDocument.addEventListener("pointerdown", outside, true);
              return () => {
                element.ownerDocument.removeEventListener("pointerdown", outside, true);
                root = undefined;
              };
            },
          },
          ...items.map((item) => {
            if (!("type" in item)) return renderAction(item);
            if (item.type === "separator")
              return context.part("separator", "div", { role: "separator" });
            return context.part(
              "group",
              "div",
              { role: "group", "aria-labelledby": `${id}-group-${item.id}` },
              context.part("heading", "div", { id: `${id}-group-${item.id}` }, item.label),
              ...item.items.map(renderAction),
            );
          }),
        )}
      </Popover>
    );
  },
);
