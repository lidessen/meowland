import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const cardActionContract = {
  name: "card-action",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface CardActionProps extends Props {
  className?: string;
}

/** The actions at the end of a card header. */
export const CardAction = defineComponent<CardActionProps, "card-action", "root">(
  cardActionContract,
  ({ children, className, ...props }, context) =>
    context.part("root", "div", { ...props, className }, children),
);
