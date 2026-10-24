import { h, type Context, type Props } from "meowjsx";

export interface ChatMessageListProps extends Props {
  ariaLabel?: string;
}

/** The ordered messages of a conversation, announced as a log. */
export function ChatMessageList(
  { children, ariaLabel = "Message log", ref, ...props }: ChatMessageListProps,
  context: Context<typeof ChatMessageList>,
) {
  return (
    <div
      {...props}
      role="log"
      aria-label={ariaLabel}
      aria-live="polite"
      ref={[context.parts.root, ref]}
    >
      {children}
    </div>
  );
}
ChatMessageList.meta = {
  name: "chat-message-list",
  parts: ["root", "content", "item", "date"],
} as const;

export interface ChatMessageListContentProps extends Props {}

/** The independently rendered message target inside a ChatMessageList. */
export function ChatMessageListContent(
  { children, ref, ...props }: ChatMessageListContentProps,
  context: Context<typeof ChatMessageListContent>,
) {
  return (
    <div {...props} ref={[context.parts.content, ref]}>
      {children}
    </div>
  );
}
ChatMessageListContent.meta = ChatMessageList.meta;

export interface ChatMessageListDateProps extends Props {
  label: string;
}

/** A date separator that keeps its visual treatment in the Chat theme. */
export function ChatMessageListDate(
  { label, children, ref, ...props }: ChatMessageListDateProps,
  context: Context<typeof ChatMessageListDate>,
) {
  return (
    <div
      {...props}
      role="separator"
      aria-label={props["aria-label"] ?? label}
      ref={[context.parts.date, ref]}
    >
      {children ?? label}
    </div>
  );
}
ChatMessageListDate.meta = ChatMessageList.meta;

/** Hosts one message; the caller determines continuity from its own message identity. */
export function ChatMessageListItem(
  { children, continuation = false, ref, ...props }: Props & { continuation?: boolean },
  context: Context<typeof ChatMessageListItem>,
) {
  return (
    <div {...props} data-chat-continuation={String(continuation)} ref={[context.parts.item, ref]}>
      {children}
    </div>
  );
}
ChatMessageListItem.meta = ChatMessageList.meta;
