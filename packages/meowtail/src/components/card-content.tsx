import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const cardContentContract = {
  name: "card-content",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface CardContentProps extends Props {
  className?: string;
}

/** The body of a card. */
export const CardContent = defineComponent<CardContentProps, "card-content", "root">(
  cardContentContract,
  ({ children, className, ...props }, context) =>
    context.part("root", "div", { ...props, className }, children),
);
