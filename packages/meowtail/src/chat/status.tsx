import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { h, type Context, type Props } from "meowjsx";
import { chatStatusOptions } from "./status.options";

export type ChatStatusTone = (typeof chatStatusOptions.axes.tone)[number];

export interface ChatStatusProps extends Props, ThemedProps<typeof chatStatusOptions> {
  label: string;
}

/** The connection or activity state of a conversation, as a dot and a word. */
export function ChatStatus(
  { label, tone, ref, ...props }: ChatStatusProps,
  context: Context<typeof ChatStatus>,
) {
  const parts = context.parts;
  return (
    <span {...props} tone={tone} role="status" data-tone={tone ?? "idle"} ref={[parts.root, ref]}>
      <i aria-hidden="true" ref={parts.dot} />
      <span data-chat-status-label ref={parts.label}>
        {label}
      </span>
    </span>
  );
}

ChatStatus.meta = {
  name: "chat-status",
  parts: ["root", "dot", "label"],
  style: defineStyleProps(chatStatusOptions, { defaults: { tone: "idle" } }),
} as const;
