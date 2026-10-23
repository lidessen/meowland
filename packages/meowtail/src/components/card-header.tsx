import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const cardHeaderContract = {
  name: "card-header",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface CardHeaderProps extends Props {
  className?: string;
}

/** The top of a card: its title, description and actions. */
export const CardHeader = defineComponent<CardHeaderProps, "card-header", "root">(
  cardHeaderContract,
  ({ children, className, ...props }, context) =>
    context.part("root", "div", { ...props, className }, children),
);
