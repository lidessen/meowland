import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const cardHeaderContract = {
  name: "card-header",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface CardHeaderProps extends Props {
  className?: string;
}

export const CardHeader = defineComponent<CardHeaderProps, "card-header", "root">(
  cardHeaderContract,
  ({ children, className, ...props }, context) =>
    context.part("root", "div", { ...props, className }, children),
);
