import { h, type Context, type Props } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createChatScroll } from "./conversation-scroll";

export interface ChatConversationProps extends Props {
  ariaLabel?: string;
  latestLabel?: string;
}

/**
 * A normal-flow action for hosts that already own transcript scrolling.
 * Place it beside the host viewport in a height-constrained column; the host
 * owns visibility, returning to the end and restoring viewport focus.
 */
export function ChatConversationLatest(
  { children, ref, ...props }: Props,
  context: Context<typeof ChatConversationLatest>,
) {
  return (
    <button type="button" {...props} ref={[context.parts.latest, ref]}>
      {children ?? "Back to latest message"}
    </button>
  );
}

/**
 * A scrolling transcript that follows new messages.
 * Optional scroll owner for append-only transcripts. Give the root a constrained height.
 * Do not combine with an application-owned scroll controller. Children can use ChatMessageList.
 */
export function ChatConversation(
  {
    children,
    ariaLabel = "Conversation reading area",
    latestLabel = "Back to latest message",
    ref,
    ...props
  }: ChatConversationProps,
  context: Context<typeof ChatConversation>,
) {
  const hidden = signal(true);
  let jump: (() => void) | undefined;
  const mount = (root: Element) => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    queueMicrotask(() => {
      if (disposed || !root.isConnected) return;
      const viewport = root.children[0] as HTMLElement;
      const content = viewport.firstElementChild as HTMLElement;
      const position = createChatScroll(viewport);
      const update = () => {
        hidden.value = position.atLatest();
      };
      const resize = () => {
        position.restore();
        update();
      };
      const scroll = () => {
        position.read();
        update();
      };
      jump = () => {
        viewport.focus({ preventScroll: true });
        position.latest();
        update();
      };
      viewport.addEventListener("scroll", scroll, { passive: true });
      const observer = new ResizeObserver(resize);
      observer.observe(viewport);
      observer.observe(content);
      resize();
      cleanup = () => {
        observer.disconnect();
        viewport.removeEventListener("scroll", scroll);
        jump = undefined;
      };
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  };
  const parts = context.parts;
  return (
    <div {...props} ref={[parts.root, mount, ref]}>
      <div
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        style={{ overflowY: "auto", minHeight: 0, overflowAnchor: "none" }}
        ref={parts.viewport}
      >
        <div style={{ display: "flow-root" }} ref={parts.content}>
          {children}
        </div>
      </div>
      <button type="button" hidden={hidden} onClick={() => jump?.()} ref={parts.latest}>
        {latestLabel}
      </button>
    </div>
  );
}

const conversationMeta = {
  name: "chat-conversation",
  parts: ["root", "viewport", "content", "latest"],
} as const;
ChatConversation.meta = conversationMeta;
ChatConversationLatest.meta = conversationMeta;
