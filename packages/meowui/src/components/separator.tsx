import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const separatorContract = {
  name: "separator",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface SeparatorProps extends Props {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const Separator = defineComponent<
  SeparatorProps,
  typeof separatorContract.name,
  (typeof separatorContract.parts)[number]
>(separatorContract, ({ orientation = "horizontal", className, ...props }, context) =>
  context.part("root", "div", {
    ...props,
    className,
    role: "separator",
    "aria-orientation": orientation,
  }),
);
