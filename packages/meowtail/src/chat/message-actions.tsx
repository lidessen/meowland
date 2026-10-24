import { h, type Context, type Props } from "meowjsx";

export interface ChatMessageActionsProps extends Props {
  className?: Props["className"];
}

/** The row of actions under a message, such as copy or retry. */
export function ChatMessageActions(
  { children, className, ref, ...props }: ChatMessageActionsProps,
  context: Context<typeof ChatMessageActions>,
) {
  return (
    <div {...props} className={className} ref={[context.parts.root, ref]}>
      {children}
    </div>
  );
}

ChatMessageActions.meta = {
  name: "chat-message-actions",
  parts: ["root"],
} as const;
