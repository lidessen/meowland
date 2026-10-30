import { h, type Child, type Props, type Context } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { Popover, type PopoverTriggerBindings } from "./popover";
import { copyTextToClipboard } from "../clipboard";
import { Icon } from "../icons/icon";
import { elementId } from "../shared/element-id";

export interface HoverCardProps extends Props {
  /** Base id for the ARIA references this component wires; generated when omitted. */
  id?: string;
  trigger: (bindings: PopoverTriggerBindings) => Child;
  content: Child;
  openDelay?: number;
  disabled?: boolean;
  className?: Props["className"];
  variant?: "compact" | "preview";
  widthAnchor?: () => HTMLElement | null;
  copyText?: string;
  copyLabel?: string;
  copiedLabel?: string;
  onCopy?: (text: string) => Promise<void>;
}
/**
 * A preview card that opens while a trigger is hovered or focused; its text stays selectable.
 * Popover owns positioning, Escape, outside dismissal and focus.
 */
export function HoverCard(
  {
    id = elementId("hover-card"),
    trigger,
    content,
    openDelay = 500,
    disabled = false,
    className,
    variant = "compact",
    widthAnchor,
    copyText,
    copyLabel = "Copy",
    copiedLabel = "Copied",
    onCopy,
  }: HoverCardProps,
  context: Context<typeof HoverCard>,
) {
  const open = signal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let hovered = false;
  let focused = false;
  let dismissed = false;
  // Open state when the latest touch began; undefined after a mouse or pen press.
  let touchStartedOpen: boolean | undefined;
  let root: HTMLElement | undefined;
  let alive = true;
  let copying = false;
  let copySession = {};
  let feedbackTimer: ReturnType<typeof setTimeout> | undefined;
  const feedback = signal("");
  // The cue turns into the result in place; a failure stays until the next attempt or close.
  const copyState = signal<"idle" | "copied" | "failed">("idle");
  const cueLabel = mapSignal(copyState, (state) => (state === "copied" ? copiedLabel : copyLabel));
  const clear = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
  const close = () => {
    clear();
    open.value = false;
    copySession = {};
    clearTimeout(feedbackTimer);
    feedback.value = "";
    copyState.value = "idle";
  };
  context.onCleanup(clear);
  context.onCleanup(() => {
    alive = false;
    clearTimeout(feedbackTimer);
  });
  const copy = async (event: Event) => {
    if (copyText === undefined || copying) return;
    const selection = root?.ownerDocument.getSelection();
    if (selection && !selection.isCollapsed && event.currentTarget instanceof Node) {
      for (let index = 0; index < selection.rangeCount; index++)
        if (selection.getRangeAt(index).intersectsNode(event.currentTarget)) return;
    }
    copying = true;
    const session = copySession;
    clearTimeout(feedbackTimer);
    feedback.value = "";
    copyState.value = "idle";
    try {
      await (onCopy ?? copyTextToClipboard)(copyText);
      if (alive && open.value && session === copySession) {
        feedback.value = copiedLabel;
        copyState.value = "copied";
        feedbackTimer = setTimeout(() => {
          feedback.value = "";
          copyState.value = "idle";
        }, 1500);
      }
    } catch {
      if (alive && open.value && session === copySession) {
        feedback.value = "Copy failed; select the text and try again.";
        copyState.value = "failed";
      }
    } finally {
      copying = false;
    }
  };
  return (
    <span
      className={className}
      data-variant={variant}
      onPointerDown={(event: PointerEvent) => {
        touchStartedOpen = event.pointerType === "touch" ? open.value : undefined;
      }}
      onPointerEnter={(event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        hovered = true;
        clear();
        if (!disabled && !dismissed)
          timer = setTimeout(
            () => {
              open.value = true;
            },
            Math.max(0, openDelay),
          );
      }}
      onPointerLeave={(event: PointerEvent) => {
        // A lifted finger leaves at once; touch cards close by tap, outside tap or Escape.
        if (event.pointerType === "touch") return;
        hovered = false;
        dismissed = false;
        clear();
        if (!focused) timer = setTimeout(close, 120);
      }}
      onFocusIn={() => {
        focused = true;
        clear();
        if (!disabled && !dismissed) open.value = true;
      }}
      onFocusOut={(event: FocusEvent) => {
        if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null))
          return;
        focused = false;
        dismissed = false;
        if (!hovered) close();
      }}
      ref={[
        context.parts.root,
        (element: HTMLElement) => {
          root = element;
          return () => {
            root = undefined;
          };
        },
      ]}
    >
      {
        <Popover
          id={id}
          open={open}
          labelledBy={`${id}-trigger`}
          matchTriggerWidth={variant === "preview"}
          anchorElement={variant === "preview" ? () => widthAnchor?.() ?? root ?? null : undefined}
          anchorRect={
            variant === "preview"
              ? () => {
                  const triggerRect = root!.ownerDocument
                    .getElementById(`${id}-trigger`)!
                    .getBoundingClientRect();
                  const wide = (widthAnchor?.() ?? root!).getBoundingClientRect();
                  // A narrow host has no room to spare, so the card lines up with its edges.
                  const inset = wide.width < 480 ? 0 : 24;
                  return new DOMRect(
                    wide.left + inset,
                    triggerRect.top,
                    Math.max(0, wide.width - inset * 2),
                    triggerRect.height,
                  );
                }
              : undefined
          }
          onOpenChange={(next) => {
            if (!next) {
              dismissed = true;
              close();
            } else if (!disabled) open.value = true;
          }}
          trigger={(bindings) =>
            trigger({
              ...bindings,
              onClick: () => {
                if (disabled) return;
                // A tap toggles; the state at touch start ignores a focus that opened it mid-tap.
                if (touchStartedOpen) close();
                else open.value = true;
                touchStartedOpen = undefined;
              },
            })
          }
        >
          {
            <div
              data-variant={variant}
              role={copyText === undefined ? undefined : "button"}
              tabIndex={copyText === undefined ? undefined : 0}
              aria-label={copyText === undefined ? undefined : `${copyLabel}: ${copyText}`}
              onClick={
                copyText === undefined
                  ? undefined
                  : (event: Event) => {
                      void copy(event);
                    }
              }
              onKeyDown={
                copyText === undefined
                  ? undefined
                  : (event: KeyboardEvent) => {
                      if (
                        event.target !== event.currentTarget ||
                        (event.key !== "Enter" && event.key !== " ")
                      )
                        return;
                      event.preventDefault();
                      void copy(event);
                    }
              }
              data-copy-state={copyText === undefined ? undefined : copyState}
              ref={[context.parts.content]}
            >
              {copyText === undefined ? content : <div ref={[context.parts.body]}>{content}</div>}
              {copyText === undefined ? null : (
                // Says what a click or tap does; the card's own label already names the action.
                <span aria-hidden={"true"} ref={[context.parts.hint]}>
                  <Icon name="copy" />
                  <Icon name="check" />
                  {cueLabel}
                </span>
              )}
              {
                <span role={"status"} aria-live={"polite"} ref={[context.parts.feedback]}>
                  {feedback}
                </span>
              }
            </div>
          }
        </Popover>
      }
    </span>
  );
}
HoverCard.meta = {
  name: "hover-card",
  parts: ["root", "content", "body", "hint", "feedback"],
} as const;
