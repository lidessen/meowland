import { h, type Child, type Props, type Context } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { createRovingFocus, createTypeahead, isTypeaheadKey } from "../behaviors";
import { Popover, type PopoverTriggerBindings } from "./popover";
import { Icon } from "../icons/icon";
import { activeElementInRoot, elementByIdInRoot } from "../shared/dom-root";
import { elementId } from "../shared/element-id";

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
  /** Base id for the ARIA references this component wires; generated when omitted. */
  id?: string;
  trigger: (bindings: MenuTriggerBindings) => Child;
  items: readonly MenuEntry[];
  open?: MaybeSignal<boolean>;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "end";
  /** Position against a point such as a right-click, instead of the trigger box. */
  anchorRect?: () => DOMRect;
  /** Element whose layout defines a custom rect; observed by the same autoUpdate. */
  anchorElement?: () => HTMLElement | null;
  className?: Props["className"];
}

/** Action menu. Popover owns placement, outside dismissal, Escape and focus return. */
interface MenuLevelProps extends MenuProps {
  placement?: "bottom" | "right";
  closeAncestors?: () => void;
}
/** A list of actions in a popover, with keyboard navigation and nested submenus. */
export function Menu(
  {
    id = elementId("menu"),
    trigger,
    items,
    open,
    onOpenChange,
    align,
    className,
    placement = "bottom",
    closeAncestors,
    anchorRect,
    anchorElement,
  }: MenuLevelProps,
  context: Context<typeof Menu>,
) {
  const local = signal(false);
  const state = open !== undefined ? open : local;
  let root: HTMLElement | undefined;
  const actions = items.flatMap((item) =>
    !("type" in item) ? [item] : item.type === "group" ? item.items : [],
  );
  const first = actions.find((item) => !item.disabled)?.id ?? null;
  const stop = signal<string | null>(first);
  const search = createTypeahead(500);
  const children: Array<() => void> = [];
  const buttons = () =>
    Array.from(
      root?.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)') ?? [],
    ).filter((button) => button.closest('[role="menu"]') === root);
  const roving = createRovingFocus({
    stop,
    orientation: "vertical",
    loop: true,
    items: () => buttons().map((el) => ({ key: el.dataset.menuId!, el })),
  });
  context.onCleanup(() => roving.dispose());
  const request = (next: boolean) => {
    if (open === undefined) local.value = next;
    onOpenChange?.(next);
    if (!next) {
      search.reset();
      stop.value = first;
      children.forEach((close) => close());
    }
  };
  context.effect(() => {
    if (!unwrap(state)) {
      children.forEach((close) => close());
      search.reset();
      stop.value = first;
    }
  });
  const focusEdge = (last = false) =>
    queueMicrotask(() => {
      if (!unwrap(state) || !root?.isConnected) return;
      const rows = buttons();
      (last ? rows.at(-1) : rows[0])?.focus();
    });
  const renderAction = (item: MenuAction): Child => {
    const contents = [
      item.icon ? (
        <span aria-hidden={"true"} ref={[context.parts.icon]}>
          {item.icon}
        </span>
      ) : null,
      <span ref={[context.parts.label]}>{item.label}</span>,
      item.shortcut ? (
        <span aria-hidden={"true"} ref={[context.parts.shortcut]}>
          {item.shortcut}
        </span>
      ) : null,
    ];
    if (item.children) {
      const childOpen = signal(false);
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
      return (
        <div
          onPointerEnter={(event: PointerEvent) => {
            if (event.pointerType !== "touch") openChild();
          }}
          onPointerLeave={() => {
            clear();
            timer = setTimeout(close, 180);
          }}
          ref={[context.parts.branch]}
        >
          {
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
              trigger={(bindings) => (
                <button
                  {...bindings}
                  role={"menuitem"}
                  type={"button"}
                  tabIndex={derived(() => (unwrap(state) && stop.value === item.id ? 0 : -1))}
                  onFocus={() => {
                    stop.value = item.id;
                  }}
                  disabled={item.disabled}
                  data-menu-id={item.id}
                  data-menu-label={item.label}
                  onClick={() => {
                    openChild();
                    focusChild();
                  }}
                  onKeyDown={(event: KeyboardEvent) => {
                    if (event.key === "ArrowRight" && !event.isComposing) {
                      event.preventDefault();
                      event.stopPropagation();
                      openChild();
                      focusChild();
                    }
                  }}
                  ref={[context.parts.item]}
                >
                  {contents}
                  {<Icon name="chevron-right" />}
                </button>
              )}
            />
          }
        </div>
      );
    }
    return (
      <button
        type={"button"}
        role={"menuitem"}
        tabIndex={derived(() => (unwrap(state) && stop.value === item.id ? 0 : -1))}
        onFocus={() => {
          stop.value = item.id;
        }}
        disabled={item.disabled}
        data-menu-id={item.id}
        data-menu-label={item.label}
        data-danger={item.danger ? "true" : undefined}
        onClick={() => {
          if (item.disabled) return;
          // Close before invoking the action so its own focus move remains authoritative.
          request(false);
          closeAncestors?.();
          item.onSelect?.();
        }}
        ref={[context.parts.item]}
      >
        {contents}
      </button>
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
    if (event.key === "Tab") {
      // Dismiss the whole action surface and let native Tab continue.
      request(false);
      closeAncestors?.();
      event.stopPropagation();
      return;
    }
    if (roving.keydown(event)) return;
    if (isTypeaheadKey(event) && (event.key !== " " || search.active())) {
      const next = search(
        event.key,
        rows.map((row) => row.dataset.menuLabel ?? ""),
        current,
      );
      if (next >= 0) {
        event.preventDefault();
        roving.focus(rows[next]!.dataset.menuId!);
      }
    }
  };
  return (
    <Popover
      id={id}
      open={state}
      align={align}
      placement={placement}
      anchorRect={anchorRect}
      anchorElement={anchorElement}
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
      {
        <div
          className={className}
          role={"menu"}
          aria-labelledby={`${id}-trigger`}
          onKeyDown={keydown}
          ref={[
            context.parts.root,
            (element: HTMLElement) => {
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
          ]}
        >
          {items.map((item) => {
            if (!("type" in item)) return renderAction(item);
            if (item.type === "separator")
              return <div role={"separator"} ref={[context.parts.separator]}></div>;
            return (
              <div
                role={"group"}
                aria-labelledby={`${id}-group-${item.id}`}
                ref={[context.parts.group]}
              >
                {
                  <div id={`${id}-group-${item.id}`} ref={[context.parts.heading]}>
                    {item.label}
                  </div>
                }
                {item.items.map(renderAction)}
              </div>
            );
          })}
        </div>
      }
    </Popover>
  );
}
Menu.meta = {
  name: "menu",
  parts: ["root", "item", "icon", "label", "shortcut", "group", "heading", "separator", "branch"],
} as const;
