import { signal, type WritableSignal } from "meowjsx/signal";
import { activeElementInRoot } from "../shared/dom-root";

export interface FocusItem<T extends string = string> {
  key: T;
  el: HTMLElement;
  disabled?: boolean;
  focusable?: boolean;
}

export interface RovingFocusOptions<T extends string = string> {
  stop?: WritableSignal<T | null>;
  items?: readonly FocusItem<T>[] | (() => readonly FocusItem<T>[]);
  orientation?: "horizontal" | "vertical" | "both";
  loop?: boolean;
}

/** DOM state is read on each operation; callers reconcile after changing item state. */
export function isFocusItemEligible(item: FocusItem): boolean {
  const { el } = item;
  if (!el.isConnected || item.disabled || item.focusable === false) return false;
  if (el.matches(':disabled, [aria-disabled="true"]')) return false;
  for (let node: Element | null = el; node;) {
    if (node.matches("[hidden], [inert]")) return false;
    const style = el.ownerDocument.defaultView?.getComputedStyle(node);
    if (
      style?.display === "none" ||
      style?.visibility === "hidden" ||
      style?.visibility === "collapse"
    )
      return false;
    const root = node.getRootNode();
    node = node.parentElement ?? ("host" in root ? (root as ShadowRoot).host : null);
  }
  return true;
}

/** Supply a live ordered item list, or register items with bind in navigation order. */
export function createRovingFocus<T extends string = string>(options: RovingFocusOptions<T> = {}) {
  const stop = options.stop ?? signal<T | null>(null);
  const registered = new Map<T, FocusItem<T>>();
  const items = () =>
    options.items
      ? typeof options.items === "function"
        ? options.items()
        : options.items
      : [...registered.values()];
  const eligible = () => items().filter(isFocusItemEligible);
  const reconcile = () => {
    const available = eligible();
    const focused = available.find((item) => activeElementInRoot(item.el) === item.el);
    if (focused) stop.value = focused.key;
    else if (!available.some((item) => item.key === stop.value))
      stop.value = available[0]?.key ?? null;
    return stop.value;
  };
  const focus = (key: T) => {
    const item = eligible().find((entry) => entry.key === key);
    if (!item) return false;
    stop.value = key;
    item.el.focus();
    return true;
  };
  const keydown = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.isComposing
    )
      return false;
    reconcile();
    const available = eligible();
    if (!available.length) return false;
    const current = Math.max(
      0,
      available.findIndex((item) => item.key === stop.value),
    );
    const orientation = options.orientation ?? "both";
    const rtl =
      available[current]!.el.ownerDocument.defaultView?.getComputedStyle(available[current]!.el)
        .direction === "rtl";
    let next = current;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = available.length - 1;
    else if (orientation !== "vertical" && event.key === "ArrowRight") next += rtl ? -1 : 1;
    else if (orientation !== "vertical" && event.key === "ArrowLeft") next += rtl ? 1 : -1;
    else if (orientation !== "horizontal" && event.key === "ArrowDown") next++;
    else if (orientation !== "horizontal" && event.key === "ArrowUp") next--;
    else return false;
    next =
      options.loop === false
        ? Math.max(0, Math.min(available.length - 1, next))
        : (next + available.length) % available.length;
    event.preventDefault();
    return focus(available[next]!.key);
  };
  return {
    stop,
    bind(item: FocusItem<T>) {
      registered.set(item.key, item);
      reconcile();
      return () => {
        if (registered.get(item.key) === item) registered.delete(item.key);
        reconcile();
      };
    },
    tabIndex(key: T) {
      return stop.value === key && eligible().some((item) => item.key === key) ? 0 : -1;
    },
    keydown,
    focus,
    reconcile,
    dispose() {
      registered.clear();
    },
  };
}
