import { h, type Context, type Props } from "meowjsx";
import { activeElementInRoot } from "../shared/dom-root";

export interface ToolbarProps extends Props {
  /** Every toolbar needs an accessible name, even when its controls are icon-only. */
  label: string;
  orientation?: "horizontal" | "vertical";
  className?: Props["className"];
}

const actionSelector =
  'button, a[href], input[type="button"], input[type="submit"], input[type="reset"]';
const compositeSelector =
  '[role="toolbar"], [role="menu"], [role="menubar"], [role="tablist"], [role="listbox"], [role="tree"], [role="grid"], [role="radiogroup"], [role="combobox"], [contenteditable]:not([contenteditable="false"])';

/** Rove native actions only; editing and composite controls keep their own keyboard contract. */
function mountToolbar(root: HTMLElement) {
  const attributes = new Map<HTMLElement, { original: string | null; applied: string | null }>();
  let actions: HTMLElement[] = [];
  let current: HTMLElement | undefined;
  let disposed = false;
  const view = root.ownerDocument.defaultView!;
  const absorb = (records: MutationRecord[]) => {
    for (const record of records) {
      if (record.type !== "attributes" || record.attributeName !== "tabindex") continue;
      const element = record.target as HTMLElement;
      const owned = attributes.get(element);
      if (owned) {
        // Even a caller writing the same -1 is an explicit opt-out, not our own mutation.
        owned.original = element.getAttribute("tabindex");
        owned.applied = null;
      }
    }
  };
  const restore = (element: HTMLElement) => {
    const owned = attributes.get(element)!;
    if (owned.applied !== null && element.getAttribute("tabindex") === owned.applied) {
      if (owned.original === null) element.removeAttribute("tabindex");
      else element.setAttribute("tabindex", owned.original);
    }
    attributes.delete(element);
  };
  const eligible = (element: HTMLElement) => {
    const boundary = element.closest(compositeSelector);
    const owned = attributes.get(element);
    const original = owned ? owned.original : element.getAttribute("tabindex");
    const style = view.getComputedStyle(element);
    return (
      boundary === root &&
      !(original !== null && Number(original) < 0) &&
      !element.matches(':disabled, [aria-disabled="true"]') &&
      !element.closest("[hidden], [inert]") &&
      style.visibility !== "hidden" &&
      style.visibility !== "collapse" &&
      element.getClientRects().length > 0
    );
  };
  const observe = () =>
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        "tabindex",
        "disabled",
        "aria-disabled",
        "hidden",
        "inert",
        "class",
        "style",
        "role",
        "href",
        "type",
        "contenteditable",
      ],
    });
  const reconcile = (records: MutationRecord[] = []) => {
    if (disposed) return;
    absorb([...records, ...observer.takeRecords()]);
    observer.disconnect();
    actions = [...root.querySelectorAll<HTMLElement>(actionSelector)].filter(eligible);
    for (const element of attributes.keys()) if (!actions.includes(element)) restore(element);
    const focused = activeElementInRoot(root);
    current =
      actions.find((element) => element === focused) ??
      (current && actions.includes(current) ? current : actions[0]);
    for (const element of actions) {
      let owned = attributes.get(element);
      if (!owned) {
        owned = { original: element.getAttribute("tabindex"), applied: null };
        attributes.set(element, owned);
      }
      const value = element === current ? "0" : "-1";
      if (element.getAttribute("tabindex") !== value) element.setAttribute("tabindex", value);
      owned.applied = value;
    }
    observe();
  };
  const observer = new view.MutationObserver(reconcile);
  const onFocus = () => reconcile();
  const onResize = () => reconcile();
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    reconcile();
    const target = (event.target as Element).closest<HTMLElement>(actionSelector);
    const index = target ? actions.indexOf(target) : -1;
    if (index < 0) return;
    const vertical = root.getAttribute("aria-orientation") === "vertical";
    const rtl = view.getComputedStyle(root).direction === "rtl";
    let next: number;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = actions.length - 1;
    else if (event.key === (vertical ? "ArrowDown" : "ArrowRight"))
      next = index + (vertical || !rtl ? 1 : -1);
    else if (event.key === (vertical ? "ArrowUp" : "ArrowLeft"))
      next = index + (vertical || !rtl ? -1 : 1);
    else return;
    event.preventDefault();
    actions[(next + actions.length) % actions.length]!.focus();
  };
  root.addEventListener("focusin", onFocus);
  root.addEventListener("keydown", onKeyDown);
  view.addEventListener("resize", onResize);
  observe();
  queueMicrotask(() => reconcile());
  return () => {
    absorb(observer.takeRecords());
    disposed = true;
    observer.disconnect();
    root.removeEventListener("focusin", onFocus);
    root.removeEventListener("keydown", onKeyDown);
    view.removeEventListener("resize", onResize);
    for (const element of attributes.keys()) restore(element);
  };
}

/** A group of related controls that shares one Tab stop; the arrow keys move between them. */
export function Toolbar(
  { children, label, orientation = "horizontal", className, ref, ...props }: ToolbarProps,
  context: Context<typeof Toolbar>,
) {
  return (
    <div
      {...props}
      className={className}
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      data-orientation={orientation}
      ref={[context.parts.root, ref, (root: HTMLElement) => mountToolbar(root)]}
    >
      {children}
    </div>
  );
}
Toolbar.meta = { name: "toolbar", parts: ["root"] } as const;
