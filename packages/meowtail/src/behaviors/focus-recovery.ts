import { activeElementInRoot } from "../shared/dom-root";
import { isFocusItemEligible, type FocusItem } from "./roving-focus";

export interface FocusRecoveryOptions<T extends string = string> {
  root: HTMLElement;
  items: () => readonly FocusItem<T>[];
  fallback?: HTMLElement;
}

/** Call reconcile after non-DOM item state changes; DOM mutations are observed automatically. */
export function createFocusRecovery<T extends string = string>(options: FocusRecoveryOptions<T>) {
  const { root } = options;
  let previous = [...options.items()];
  let last: FocusItem<T> | undefined;
  let disposed = false;
  const remember = () => {
    const active = activeElementInRoot(root);
    const item = options.items().find((entry) => entry.el === active || entry.el.contains(active));
    if (item) last = item;
  };
  const onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && !root.contains(next)) last = undefined;
  };
  const reconcile = () => {
    if (disposed) return;
    const current = [...options.items()];
    const active = activeElementInRoot(root);
    const tracked = last && current.find((item) => item.key === last!.key && item.el === last!.el);
    if (last && (!tracked || !isFocusItemEligible(tracked))) {
      const oldIndex = previous.findIndex((item) => item.key === last!.key && item.el === last!.el);
      const candidates = [
        ...previous.slice(oldIndex + 1),
        ...previous.slice(0, Math.max(0, oldIndex)).reverse(),
      ];
      const target = candidates
        .map((old) => current.find((item) => item.key === old.key))
        .find((item) => item && isFocusItemEligible(item));
      if (
        !active ||
        active === root.ownerDocument.body ||
        active === last.el ||
        root.contains(active)
      ) {
        (target?.el ?? options.fallback ?? root).focus();
        last = target;
      } else last = undefined;
    } else remember();
    previous = current;
  };
  root.addEventListener("focusin", remember);
  root.addEventListener("focusout", onFocusOut);
  const observer = new root.ownerDocument.defaultView!.MutationObserver(reconcile);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["disabled", "aria-disabled", "hidden", "inert", "style", "class"],
  });
  remember();
  return {
    reconcile,
    dispose() {
      disposed = true;
      observer.disconnect();
      root.removeEventListener("focusin", remember);
      root.removeEventListener("focusout", onFocusOut);
    },
  };
}
