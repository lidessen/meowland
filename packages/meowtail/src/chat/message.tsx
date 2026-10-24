import { h, type Child, type Context, type Props } from "meowjsx";
import { ChatBubble } from "./bubble";
import { StatusDot } from "../components/status-dot";
import { messageRoleContext } from "./message-context";

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
  /** Joins a reply, retaining its author and the column of a supplied avatar. */
  continuation?: boolean;
}

/** The status badge's tone: work in progress, a failure, or a quiet standby. */
const messageStatusTone = (status: ChatMessageStatus) =>
  status === "streaming" ? "processing" : status === "error" ? "danger" : "idle";

/** One message in a conversation: the author, the time, the body and its actions. */
export function ChatMessage(
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
    continuation = false,
    ref,
    ...props
  }: ChatMessageProps,
  context: Context<typeof ChatMessage>,
) {
  const parts = context.parts;
  return (
    <messageRoleContext.Provider value={role}>
      <article
        {...props}
        data-chat-role={role}
        data-chat-status={status}
        data-chat-continuation={continuation}
        ref={[parts.root, ref]}
      >
        {avatar !== undefined && avatar !== null ? <div ref={parts.avatar}>{avatar}</div> : null}
        <div ref={parts.body}>
          {header !== undefined ? (
            <div ref={parts.header}>{header}</div>
          ) : (
            <div ref={parts.meta}>
              <strong ref={parts.author}>{author}</strong>
              {timestamp ? (
                <time datetime={dateTime} ref={parts.time}>
                  {timestamp}
                </time>
              ) : null}
              {status !== "complete" ? (
                <span data-tone={messageStatusTone(status)} ref={parts.status}>
                  <StatusDot state={messageStatusTone(status)} />
                  {status === "streaming"
                    ? "Generating"
                    : status === "pending"
                      ? "Waiting"
                      : "Incomplete"}
                </span>
              ) : null}
            </div>
          )}
          <div ref={parts.content}>
            {surface === "none" ? children : <ChatBubble>{children}</ChatBubble>}
          </div>
          {footer !== undefined ? <div ref={parts.footer}>{footer}</div> : null}
          {actions ? <div ref={parts.actions}>{actions}</div> : null}
        </div>
      </article>
    </messageRoleContext.Provider>
  );
}

ChatMessage.meta = {
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
} as const;
