import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const cardTitleContract = {
  name: "card-title",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface CardTitleProps extends Props {
  as?: "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
}

export const CardTitle = defineComponent<CardTitleProps, "card-title", "root">(
  cardTitleContract,
  ({ as = "h2", children, className, ...props }, context) =>
    context.part("root", as, { ...props, className }, children),
);
