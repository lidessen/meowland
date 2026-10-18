import { defineComponent, type ComponentContract, type Props } from "meowjsx";
import { createChatScroll } from "./conversation-scroll";

export const chatConversationContract = {
  name: "chat-conversation",
  parts: ["root", "viewport", "content", "latest"],
} as const satisfies ComponentContract;
export interface ChatConversationProps extends Props {
  ariaLabel?: string;
  latestLabel?: string;
  className?: string;
}

/** A normal-flow action for hosts that already own transcript scrolling.
 * Place it beside the host viewport in a height-constrained column; the host
 * owns visibility, returning to the end and restoring viewport focus.
 */
export const ChatConversationLatest = defineComponent<
  Props,
  "chat-conversation",
  (typeof chatConversationContract.parts)[number]
>(chatConversationContract, ({ children, ...props }, context) =>
  context.part("latest", "button", { type: "button", ...props }, children ?? "回到最新消息"),
);

/** Optional scroll owner for append-only transcripts. Give the root a constrained height.
 * Do not combine with an application-owned scroll controller. Children can use ChatMessageList.
 */
export const ChatConversation = defineComponent<
  ChatConversationProps,
  "chat-conversation",
  "root" | "viewport" | "content" | "latest"
>(
  chatConversationContract,
  (
    { children, ariaLabel = "对话阅读区", latestLabel = "回到最新消息", className, ...props },
    context,
  ) => {
    const hidden = context.signal(true);
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
    return context.part(
      "root",
      "div",
      { ...props, className, ref: mount },
      context.part(
        "viewport",
        "div",
        {
          role: "region",
          "aria-label": ariaLabel,
          tabIndex: 0,
          style: { overflowY: "auto", minHeight: 0, overflowAnchor: "none" },
        },
        context.part("content", "div", { style: { display: "flow-root" } }, children),
      ),
      context.part(
        "latest",
        "button",
        { type: "button", hidden, onClick: () => jump?.() },
        latestLabel,
      ),
    );
  },
);
