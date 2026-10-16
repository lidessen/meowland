import { defineComponent, h, type Child, type ComponentContract, type Props } from "meowjsx";
import { Popover } from "./popover";

export const tooltipContract = {
  name: "tooltip",
  parts: ["root", "content"],
} as const satisfies ComponentContract;
export interface TooltipTriggerBindings {
  id: string;
  "aria-describedby": string;
}
export interface TooltipProps extends Props {
  id: string;
  content: string;
  /** Use a focusable control with its own accessible name; this is supplementary text. */
  trigger: (bindings: TooltipTriggerBindings) => Child;
  delay?: number;
  className?: string;
}
/** Non-interactive help. Popover owns positioning, top-layer dismissal and cleanup. */
export const Tooltip = defineComponent<TooltipProps, "tooltip", "root" | "content">(
  tooltipContract,
  ({ id, content, trigger, delay = 350, className }, context) => {
    const open = context.signal(false);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let hovered = false;
    let focused = false;
    let dismissed = false;
    let touchInteraction = false;
    const clear = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
    };
    const close = () => {
      clear();
      open.value = false;
    };
    context.onCleanup(clear);
    return context.part(
      "root",
      "span",
      {
        className,
        ref: () => () => clear(),
        onPointerEnter: (event: PointerEvent) => {
          if (event.pointerType === "touch") return;
          touchInteraction = false;
          hovered = true;
          clear();
          if (!dismissed)
            timer = setTimeout(
              () => {
                open.value = true;
              },
              Math.max(0, delay),
            );
        },
        onPointerDown: (event: PointerEvent) => {
          touchInteraction = event.pointerType === "touch";
          if (touchInteraction) close();
        },
        onPointerLeave: () => {
          hovered = false;
          dismissed = false;
          clear();
          // A small transit interval lets the pointer cross the anchor-panel gap.
          if (!focused) timer = setTimeout(close, 120);
        },
        onFocusIn: () => {
          focused = true;
          clear();
          if (!dismissed && !touchInteraction) open.value = true;
        },
        onFocusOut: (event: FocusEvent) => {
          if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null))
            return;
          focused = false;
          touchInteraction = false;
          dismissed = false;
          if (!hovered) close();
        },
      },
      h(Popover, {
        id,
        triggerId: `${id}-trigger`,
        open,
        role: "tooltip",
        onOpenChange: (next: boolean) => {
          if (!next) {
            dismissed = true;
            close();
          }
        },
        trigger: () => trigger({ id: `${id}-trigger`, "aria-describedby": id }),
        children: context.part("content", "span", null, content),
      }),
    );
  },
);
