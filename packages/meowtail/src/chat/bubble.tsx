import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { defineComponent, useContext, type Props } from "meowjsx";
import { messageRoleContext } from "./message-context";

export const chatBubbleOptions = defineOptions("chat-bubble", {
  variant: ["auto", "plain", "filled"],
});

export const chatBubbleContract = {
  name: "chat-bubble",
  parts: ["root"],
  styleProps: defineStyleProps(chatBubbleOptions, { defaults: { variant: "auto" } }),
} as const satisfies StyledComponentContract;
export interface ChatBubbleProps extends Props, ThemedProps<typeof chatBubbleOptions> {
  className?: string;
}

/** A message surface; placement and author metadata belong to ChatMessage. */
export const ChatBubble = defineComponent<ChatBubbleProps, "chat-bubble", "root">(
  chatBubbleContract,
  ({ children, className, ...props }, context) =>
    context.part(
      "root",
      "div",
      {
        ...props,
        className,
        "data-chat-role": useContext(messageRoleContext),
      },
      children,
    ),
);
