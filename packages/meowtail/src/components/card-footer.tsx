import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const cardFooterContract = {
  name: "card-footer",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface CardFooterProps extends Props {
  className?: string;
}

/** The row of actions at the end of a card. */
export const CardFooter = defineComponent<CardFooterProps, "card-footer", "root">(
  cardFooterContract,
  ({ children, className, ...props }, context) =>
    context.part("root", "div", { ...props, className }, children),
);
