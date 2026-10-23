import { defineComponent, type ComponentContract, type Props } from "meowjsx";
import { actionRowRef } from "../shared/action-row-fit";

export const cardFooterContract = {
  name: "card-footer",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface CardFooterProps extends Props {
  className?: string;
}

/** The row of actions at the end of a card; it stacks whole when it does not fit, like ActionRow. */
export const CardFooter = defineComponent<CardFooterProps, "card-footer", "root">(
  cardFooterContract,
  ({ children, className, ...props }, context) =>
    context.part("root", "div", { ...props, className, ref: actionRowRef(props.ref) }, children),
);
