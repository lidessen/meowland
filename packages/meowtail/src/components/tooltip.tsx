import { h, type Child, type Context, type Props } from "meowjsx";
import { signal } from "meowjsx/signal";
import { Popover } from "./popover";
import { elementId } from "../shared/element-id";

export interface TooltipTriggerBindings {
  id: string;
  "aria-describedby": string;
}
export interface TooltipProps extends Props {
  /** Base id for the ARIA references this component wires; generated when omitted. */
  id?: string;
  content: string;
  /** Use a focusable control with its own accessible name; this is supplementary text. */
  trigger: (bindings: TooltipTriggerBindings) => Child;
  delay?: number;
  className?: Props["className"];
}
/** Non-interactive help. Popover owns positioning, top-layer dismissal and cleanup. */
export function Tooltip(
  { id = elementId("tooltip"), content, trigger, delay = 350, className, ref }: TooltipProps,
  context: Context<typeof Tooltip>,
) {
  const open = signal(false);
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
  return (
    <span
      className={className}
      ref={[context.parts.root, ref, () => () => clear()]}
      onPointerEnter={(event: PointerEvent) => {
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
      }}
      onPointerDown={(event: PointerEvent) => {
        touchInteraction = event.pointerType === "touch";
        if (touchInteraction) close();
      }}
      onPointerLeave={() => {
        hovered = false;
        dismissed = false;
        clear();
        // A small transit interval lets the pointer cross the anchor-panel gap.
        if (!focused) timer = setTimeout(close, 120);
      }}
      onFocusIn={() => {
        focused = true;
        clear();
        if (!dismissed && !touchInteraction) open.value = true;
      }}
      onFocusOut={(event: FocusEvent) => {
        if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null))
          return;
        focused = false;
        touchInteraction = false;
        dismissed = false;
        if (!hovered) close();
      }}
    >
      <Popover
        id={id}
        triggerId={`${id}-trigger`}
        open={open}
        role="tooltip"
        onOpenChange={(next: boolean) => {
          if (!next) {
            dismissed = true;
            close();
          }
        }}
        trigger={() => trigger({ id: `${id}-trigger`, "aria-describedby": id })}
      >
        <span ref={context.parts.content}>{content}</span>
      </Popover>
    </span>
  );
}
Tooltip.meta = { name: "tooltip", parts: ["root", "content"] } as const;
