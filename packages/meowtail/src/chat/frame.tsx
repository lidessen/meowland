import { h, type Context, type Props } from "meowjsx";

export interface ChatFrameProps extends Props {
  className?: Props["className"];
}

/** The outer surface of a conversation that holds its header, messages and composer. */
export function ChatFrame(
  { children, className, ref, ...props }: ChatFrameProps,
  context: Context<typeof ChatFrame>,
) {
  return (
    <section {...props} className={className} ref={[context.parts.root, ref]}>
      {children}
    </section>
  );
}

ChatFrame.meta = {
  name: "chat-frame",
  parts: ["root"],
} as const;
