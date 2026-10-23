import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { defineComponent, type Props } from "meowjsx";

export const chatStatusOptions = defineOptions("chat-status", {
  tone: ["online", "busy", "waiting", "error", "idle"],
});

export const chatStatusContract = {
  name: "chat-status",
  parts: ["root", "dot", "label"],
  styleProps: defineStyleProps(chatStatusOptions, { defaults: { tone: "idle" } }),
} as const satisfies StyledComponentContract;

export type ChatStatusTone = (typeof chatStatusOptions.axes.tone)[number];

export interface ChatStatusProps extends Props, ThemedProps<typeof chatStatusOptions> {
  label: string;
  className?: string;
}

export const ChatStatus = defineComponent<
  ChatStatusProps,
  typeof chatStatusContract.name,
  (typeof chatStatusContract.parts)[number]
>(chatStatusContract, ({ label, className, tone, ...props }, context) =>
  context.part(
    "root",
    "span",
    {
      ...props,
      tone,
      className,
      role: "status",
      "data-tone": tone ?? "idle",
    },
    context.part("dot", "i", { "aria-hidden": "true" }),
    context.part("label", "span", { "data-chat-status-label": true }, label),
  ),
);
