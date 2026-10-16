import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const chatFrameContract = {
  name: "chat-frame",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface ChatFrameProps extends Props {
  className?: string;
}

export const ChatFrame = defineComponent<
  ChatFrameProps,
  typeof chatFrameContract.name,
  (typeof chatFrameContract.parts)[number]
>(chatFrameContract, ({ children, className, ...props }, context) =>
  context.part("root", "section", { ...props, className }, children),
);
