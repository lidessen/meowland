import { h, defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";
import { ChatBubble } from "./bubble";
import { StatusDot } from "../components/status-dot";
import { messageRoleContext } from "./message-context";

export const chatMessageContract = {
  name: "chat-message",
  parts: [
    "root",
    "avatar",
    "body",
    "meta",
    "author",
    "time",
    "status",
    "content",
    "actions",
    "header",
    "footer",
  ],
} as const satisfies ComponentContract;

export type ChatMessageRole = "user" | "assistant" | "system" | "tool";
export type ChatMessageStatus = "complete" | "streaming" | "error" | "pending";

export interface ChatMessageProps extends Props {
  role: ChatMessageRole;
  author: string;
  timestamp?: string;
  dateTime?: string;
  status?: ChatMessageStatus;
  avatar?: Child;
  actions?: Child;
  header?: Child;
  footer?: Child;
  /** Omit the automatic surface when composing multiple bubbles, files or process blocks. */
  surface?: "auto" | "none";
  className?: string;
  /** Joins a reply, retaining its author and the column of a supplied avatar. */
  continuation?: boolean;
}

/** The status badge's tone: work in progress, a failure, or a quiet standby. */
const messageStatusTone = (status: ChatMessageStatus) =>
  status === "streaming" ? "processing" : status === "error" ? "danger" : "idle";

export const ChatMessage = defineComponent<
  ChatMessageProps,
  typeof chatMessageContract.name,
  (typeof chatMessageContract.parts)[number]
>(
  chatMessageContract,
  (
    {
      children,
      role,
      author,
      timestamp,
      dateTime,
      status = "complete",
      avatar,
      actions,
      header,
      footer,
      surface = "auto",
      className,
      continuation = false,
      ...props
    },
    context,
  ) => (
    <messageRoleContext.Provider value={role}>
      {context.part(
        "root",
        "article",
        {
          ...props,
          className,
          "data-chat-role": role,
          "data-chat-status": status,
          "data-chat-continuation": continuation,
        },
        avatar !== undefined && avatar !== null
          ? context.part("avatar", "div", null, avatar)
          : null,
        context.part(
          "body",
          "div",
          null,
          header !== undefined
            ? context.part("header", "div", null, header)
            : context.part(
                "meta",
                "div",
                null,
                context.part("author", "strong", null, author),
                timestamp ? context.part("time", "time", { datetime: dateTime }, timestamp) : null,
                status !== "complete"
                  ? context.part(
                      "status",
                      "span",
                      { "data-tone": messageStatusTone(status) },
                      h(StatusDot, { state: messageStatusTone(status) }),
                      status === "streaming"
                        ? "Generating"
                        : status === "pending"
                          ? "Waiting"
                          : "Incomplete",
                    )
                  : null,
              ),
          context.part(
            "content",
            "div",
            null,
            surface === "none" ? children : <ChatBubble>{children}</ChatBubble>,
          ),
          footer !== undefined ? context.part("footer", "div", null, footer) : null,
          actions ? context.part("actions", "div", null, actions) : null,
        ),
      )}
    </messageRoleContext.Provider>
  ),
);
