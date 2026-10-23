import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const chatMessageListContract = {
  name: "chat-message-list",
  parts: ["root", "content", "item", "date"],
} as const satisfies ComponentContract;

export interface ChatMessageListProps extends Props {
  className?: string;
  ariaLabel?: string;
}

/** The ordered messages of a conversation, announced as a log. */
export const ChatMessageList = defineComponent<
  ChatMessageListProps,
  typeof chatMessageListContract.name,
  (typeof chatMessageListContract.parts)[number]
>(
  chatMessageListContract,
  ({ children, className, ariaLabel = "Message log", ...props }, context) =>
    context.part(
      "root",
      "div",
      {
        ...props,
        className,
        role: "log",
        "aria-label": ariaLabel,
        "aria-live": "polite",
      },
      children,
    ),
);

export interface ChatMessageListContentProps extends Props {
  className?: string;
}

/** The independently rendered message target inside a ChatMessageList. */
export const ChatMessageListContent = defineComponent<
  ChatMessageListContentProps,
  typeof chatMessageListContract.name,
  (typeof chatMessageListContract.parts)[number]
>(chatMessageListContract, ({ children, className, ...props }, context) =>
  context.part("content", "div", { ...props, className }, children),
);

export interface ChatMessageListDateProps extends Props {
  label: string;
  className?: string;
}

/** Hosts one message; the caller determines continuity from its own message identity. */
export const ChatMessageListItem = defineComponent<
  Props & { continuation?: boolean },
  typeof chatMessageListContract.name,
  (typeof chatMessageListContract.parts)[number]
>(chatMessageListContract, ({ children, continuation = false, ...props }, context) =>
  context.part(
    "item",
    "div",
    { ...props, "data-chat-continuation": String(continuation) },
    children,
  ),
);

/** A date separator that keeps its visual treatment in the Chat theme. */
export const ChatMessageListDate = defineComponent<
  ChatMessageListDateProps,
  typeof chatMessageListContract.name,
  (typeof chatMessageListContract.parts)[number]
>(chatMessageListContract, ({ label, children, className, ...props }, context) =>
  context.part(
    "date",
    "div",
    {
      ...props,
      className,
      role: "separator",
      "aria-label": props["aria-label"] ?? label,
    },
    children ?? label,
  ),
);
