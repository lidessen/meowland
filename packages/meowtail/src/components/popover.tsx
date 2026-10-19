import {
  defineComponent,
  derived,
  isSignal,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { autoUpdate, computePosition, offset, flip, shift, size } from "@floating-ui/dom";
import { activeElementInRoot, elementByIdInRoot } from "../shared/dom-root";

export const popoverContract = {
  name: "popover",
  parts: ["root", "panel"],
} as const satisfies ComponentContract;
export interface PopoverTriggerBindings {
  id: string;
  "aria-controls": string;
  "aria-expanded": MaybeSignal<string>;
  onClick: (event: MouseEvent) => void;
}
export interface PopoverProps extends Props {
  id: string;
  triggerId?: string;
  trigger: (bindings: PopoverTriggerBindings) => Child;
  open?: MaybeSignal<boolean>;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  matchTriggerWidth?: boolean;
  align?: "start" | "end";
  placement?: "top" | "bottom" | "right";
  anchorRect?: () => DOMRect;
  /** Element whose layout defines a custom rect; observed by the same autoUpdate. */
  anchorElement?: () => HTMLElement | null;
  role?: string;
  labelledBy?: string;
  /** Prevent default on Escape to leave an inner pane before dismissing the layer. */
  onKeyDown?: (event: KeyboardEvent) => void;
  className?: string;
}

// Opening order, rather than DOM order, determines which nested layer dismisses.
const layers = new WeakMap<Document, HTMLElement[]>();
const dismissedEvents = new WeakSet<Event>();

export const Popover = defineComponent<PopoverProps, "popover", "root" | "panel">(
  popoverContract,
  (
    {
      id,
      triggerId = `${id}-trigger`,
      trigger,
      open,
      defaultOpen = false,
      onOpenChange,
      matchTriggerWidth = false,
      align = "start",
      placement = "bottom",
      anchorRect,
      anchorElement,
      role,
      labelledBy,
      onKeyDown,
      children,
      className,
    },
    context,
  ) => {
    const local = context.signal(defaultOpen);
    // A signal object is controlled even when its current value is false.
    const state = open !== undefined ? open : local;
    const expanded = derived(() => String(unwrap(state)));
    let panel: HTMLElement | undefined;
    let anchor: HTMLElement | null = null;
    let restore = true;
    let position = () => {};
    let stopPosition = () => {};
    const sync = () => {
      if (!panel?.isConnected) return;
      anchor ??= elementByIdInRoot(panel, triggerId);
      const next = unwrap(state);
      const shown = panel.matches(":popover-open");
      const stack = layers.get(panel.ownerDocument) ?? [];
      layers.set(panel.ownerDocument, stack);
      if (next && !shown && anchor) {
        if (typeof panel.showPopover !== "function")
          throw new Error("Popover requires the browser Popover API");
        panel.showPopover();
        stack.push(panel);
        stopPosition = autoUpdate(
          anchorRect
            ? { getBoundingClientRect: anchorRect, contextElement: anchorElement?.() ?? anchor }
            : anchor,
          panel,
          position,
        );
      } else if (!next && shown) {
        const hadFocus = panel.contains(activeElementInRoot(panel));
        panel.hidePopover();
        stopPosition();
        const index = stack.indexOf(panel);
        if (index >= 0) stack.splice(index, 1);
        if (restore && hadFocus && anchor?.isConnected) anchor.focus();
        restore = true;
      }
    };
    const request = (next: boolean, returnFocus = true) => {
      restore = returnFocus;
      if (open === undefined) local.value = next;
      onOpenChange?.(next);
      sync();
    };
    const bindings: PopoverTriggerBindings = {
      id: triggerId,
      "aria-controls": id,
      "aria-expanded": expanded,
      onClick: (event) => {
        anchor = event.currentTarget as HTMLElement;
        request(!unwrap(state));
      },
    };
    return context.part(
      "root",
      "div",
      { className },
      trigger(bindings),
      context.part(
        "panel",
        "div",
        {
          id,
          popover: "manual",
          role,
          "aria-labelledby": labelledBy,
          "data-popover-panel": "",
          tabIndex: -1,
          onKeyDown: (event: KeyboardEvent) => {
            if (event.key !== "Escape") onKeyDown?.(event);
          },
          ref: (element: HTMLElement) => {
            panel = element;
            const doc = element.ownerDocument;
            const win = doc.defaultView!;
            let alive = true;
            position = () => {
              if (!anchor || !element.matches(":popover-open")) return;
              // Measure a changed pane at its natural height before fitting it again.
              element.style.maxHeight = "";
              Object.assign(element.style, {
                position: "fixed",
                margin: "0",
                inset: "auto",
                boxSizing: "border-box",
                overflowY: "auto",
              });
              const reference = anchorRect
                ? { getBoundingClientRect: anchorRect, contextElement: anchorElement?.() ?? anchor }
                : anchor;
              void computePosition(reference, element, {
                strategy: "fixed",
                placement: `${placement}-${align}`,
                middleware: [
                  offset(6),
                  flip({ padding: 8 }),
                  shift({ padding: 8 }),
                  size({
                    padding: 8,
                    apply({ availableWidth, availableHeight, rects }) {
                      if (!alive) return;
                      element.style.maxWidth = `${Math.max(0, availableWidth)}px`;
                      element.style.maxHeight = `${Math.max(0, availableHeight)}px`;
                      if (matchTriggerWidth)
                        element.style.width = `${Math.min(rects.reference.width, Math.max(0, availableWidth))}px`;
                    },
                  }),
                ],
              }).then(({ x, y, placement }) => {
                if (!alive || !element.isConnected || !element.matches(":popover-open")) return;
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
                element.dataset.side = placement.split("-")[0]!;
                const focused = activeElementInRoot(element);
                if (topmost() && focused && focused !== element && element.contains(focused)) {
                  const bounds = element.getBoundingClientRect();
                  const child = focused.getBoundingClientRect();
                  const scale = bounds.height / element.offsetHeight || 1;
                  if (child.top < bounds.top)
                    element.scrollTop += Math.floor((child.top - bounds.top) / scale);
                  else if (child.bottom > bounds.bottom)
                    element.scrollTop += Math.ceil((child.bottom - bounds.bottom) / scale);
                }
              });
            };
            const topmost = () => layers.get(doc)?.at(-1) === element;
            const outside = (event: PointerEvent) => {
              if (
                !dismissedEvents.has(event) &&
                topmost() &&
                !event.composedPath().includes(element) &&
                (!anchor || !event.composedPath().includes(anchor))
              ) {
                dismissedEvents.add(event);
                request(false, false);
              }
            };
            const escape = (event: KeyboardEvent) => {
              if (event.key !== "Escape" || !topmost() || dismissedEvents.has(event)) return;
              dismissedEvents.add(event);
              // Capture only selects the original layer. Children handle the key first.
              const complete = (current: KeyboardEvent) => {
                if (current !== event) return;
                doc.removeEventListener("keydown", complete);
                win.clearTimeout(cleanup);
                if (event.defaultPrevented) return;
                // A child may close or unmount this layer during the same dispatch.
                // Reserve that one dismissal rather than cancelling its ancestor Dialog.
                if (
                  !alive ||
                  !element.isConnected ||
                  !element.matches(":popover-open") ||
                  !topmost()
                ) {
                  event.preventDefault();
                  return;
                }
                onKeyDown?.(event);
                if (event.defaultPrevented) return;
                event.preventDefault();
                if (
                  !alive ||
                  !element.isConnected ||
                  !element.matches(":popover-open") ||
                  !topmost()
                )
                  return;
                event.stopImmediatePropagation();
                const before = activeElementInRoot(element);
                request(false);
                const after = activeElementInRoot(element);
                if (
                  !element.matches(":popover-open") &&
                  anchor?.isConnected &&
                  after !== anchor &&
                  (!after || after === before || after === doc.body || element.contains(after))
                )
                  anchor.focus();
              };
              doc.addEventListener("keydown", complete);
              // stopPropagation alone does not cancel native Dialog's default action.
              // Native dispatch may run microtasks between capture and bubble listeners.
              const cleanup = win.setTimeout(() => doc.removeEventListener("keydown", complete), 0);
            };
            const focus = (event: FocusEvent) => {
              const path = event.composedPath();
              if (topmost() && !path.includes(element) && (!anchor || !path.includes(anchor)))
                request(false, false);
            };
            doc.addEventListener("pointerdown", outside, true);
            doc.addEventListener("keydown", escape, true);
            doc.addEventListener("focusin", focus);
            const contentObserver = new MutationObserver(position);
            contentObserver.observe(element, {
              childList: true,
              subtree: true,
              characterData: true,
            });
            win.visualViewport?.addEventListener("resize", position);
            win.visualViewport?.addEventListener("scroll", position);
            const unsubscribe = isSignal(state) ? state.subscribe(sync) : () => {};
            queueMicrotask(() => {
              if (!alive || !element.isConnected) return;
              anchor = elementByIdInRoot(element, triggerId);
              sync();
            });
            return () => {
              alive = false;
              unsubscribe();
              contentObserver.disconnect();
              stopPosition();
              doc.removeEventListener("pointerdown", outside, true);
              doc.removeEventListener("keydown", escape, true);
              doc.removeEventListener("focusin", focus);
              win.visualViewport?.removeEventListener("resize", position);
              win.visualViewport?.removeEventListener("scroll", position);
              const stack = layers.get(doc);
              const index = stack?.indexOf(element) ?? -1;
              if (index >= 0) stack!.splice(index, 1);
              if (element.matches(":popover-open")) element.hidePopover();
              panel = undefined;
            };
          },
        },
        children,
      ),
    );
  },
);
