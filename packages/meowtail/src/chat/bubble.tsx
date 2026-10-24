import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { h, useContext, type Context, type Props } from "meowjsx";
import { chatBubbleOptions } from "./bubble.options";
import { messageRoleContext } from "./message-context";

export interface ChatBubbleProps extends Props, ThemedProps<typeof chatBubbleOptions> {}

/** A message surface; placement and author metadata belong to ChatMessage. */
export function ChatBubble(
  { children, ref, ...props }: ChatBubbleProps,
  context: Context<typeof ChatBubble>,
) {
  return (
    <div {...props} data-chat-role={useContext(messageRoleContext)} ref={[context.parts.root, ref]}>
      {children}
    </div>
  );
}

ChatBubble.meta = {
  name: "chat-bubble",
  parts: ["root"],
  style: defineStyleProps(chatBubbleOptions, { defaults: { variant: "auto" } }),
} as const;
