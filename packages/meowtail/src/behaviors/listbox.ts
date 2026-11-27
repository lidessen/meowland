import { signal, type WritableSignal } from "meowjsx/signal";
import { elementByIdInRoot } from "../shared/dom-root";
import { isFocusItemEligible, type FocusItem } from "./roving-focus";
import { createTypeahead, isTypeaheadKey } from "./typeahead";

export interface ListboxItem<T extends string = string> extends FocusItem<T> {
  label: string;
}

export interface ListboxOptions<T extends string = string> {
  items: readonly ListboxItem<T>[] | (() => readonly ListboxItem<T>[]);
  highlighted?: WritableSignal<T | null>;
  focus: "real" | "virtual";
  controller?: HTMLElement;
  id: string;
  loop?: boolean;
  pageSize?: number;
}

/** Set each virtual option element's id to idForKey(key), and bind activeId() to the controller. */
export function createListbox<T extends string = string>(options: ListboxOptions<T>) {
  const highlighted = options.highlighted ?? signal<T | null>(null);
  const typeahead = createTypeahead();
  const items = () => (typeof options.items === "function" ? options.items() : options.items);
  const eligible = () => items().filter(isFocusItemEligible);
  const idForKey = (key: T) => `${options.id}-option-${encodeURIComponent(key)}`;
  const activeId = (key: T | null = highlighted.value) => {
    if (key === null || !options.controller) return undefined;
    const item = eligible().find((entry) => entry.key === key);
    if (!item) return undefined;
    const id = idForKey(key);
    return elementByIdInRoot(options.controller, id) === item.el ? id : undefined;
  };
  const highlight = (key: T) => {
    const item = eligible().find((entry) => entry.key === key);
    if (!item) return false;
    highlighted.value = key;
    if (options.focus === "real") item.el.focus();
    return true;
  };
  const reconcile = () => {
    const available = eligible();
    if (!available.some((item) => item.key === highlighted.value))
      highlighted.value = available[0]?.key ?? null;
    return highlighted.value;
  };
  const keydown = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.isComposing
    )
      return false;
    const available = eligible();
    if (!available.length) return false;
    let current = available.findIndex((item) => item.key === highlighted.value);
    let next = current;
    const page = Math.max(1, Math.floor(options.pageSize ?? 10));
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = available.length - 1;
    else if (event.key === "ArrowDown") next = current < 0 ? 0 : current + 1;
    else if (event.key === "ArrowUp") next = current < 0 ? available.length - 1 : current - 1;
    else if (event.key === "PageDown") next = current < 0 ? 0 : current + page;
    else if (event.key === "PageUp") next = current < 0 ? available.length - 1 : current - page;
    else if (
      options.focus === "real" &&
      isTypeaheadKey(event) &&
      (event.key !== " " || typeahead.active())
    ) {
      next = typeahead(
        event.key,
        available.map((item) => item.label),
        current,
      );
      if (next < 0) {
        event.preventDefault();
        return true;
      }
    } else return false;
    if (next < 0 || next >= available.length) {
      if (options.loop && (event.key === "ArrowUp" || event.key === "ArrowDown"))
        next = (next + available.length) % available.length;
      else next = Math.max(0, Math.min(available.length - 1, next));
    }
    event.preventDefault();
    return highlight(available[next]!.key);
  };
  return {
    highlighted,
    idForKey,
    activeId,
    highlight,
    reconcile,
    keydown,
    dispose: typeahead.reset,
  };
}
