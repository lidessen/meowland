import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const chatMessageActionsContract = {
  name: "chat-message-actions",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface ChatMessageActionsProps extends Props {
  className?: string;
}

/** The row of actions under a message, such as copy or retry. */
export const ChatMessageActions = defineComponent<
  ChatMessageActionsProps,
  typeof chatMessageActionsContract.name,
  (typeof chatMessageActionsContract.parts)[number]
>(chatMessageActionsContract, ({ children, className, ...props }, context) =>
  context.part("root", "div", { ...props, className }, children),
);
