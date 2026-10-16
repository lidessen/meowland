import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const cardDescriptionContract = {
  name: "card-description",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface CardDescriptionProps extends Props {
  className?: string;
}

export const CardDescription = defineComponent<CardDescriptionProps, "card-description", "root">(
  cardDescriptionContract,
  ({ children, className, ...props }, context) =>
    context.part("root", "p", { ...props, className }, children),
);
