import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { createContext, useContext, h, defineComponent, type Props } from "meowjsx";

const CardDepth = createContext(0);

export const cardOptions = defineOptions("card", { variant: ["auto", "surface", "embedded"] });

export const cardContract = {
  name: "card",
  parts: ["root"],
  styleProps: defineStyleProps(cardOptions, { defaults: { variant: "auto" } }),
} as const satisfies StyledComponentContract;

export interface CardProps extends Props, ThemedProps<typeof cardOptions> {
  as?: "div" | "article" | "section" | "button";
  className?: string;
}

export const Card = defineComponent<
  CardProps,
  typeof cardContract.name,
  (typeof cardContract.parts)[number]
>(cardContract, ({ as = "div", children, className, ...props }, context) => {
  const depth = useContext(CardDepth);
  return context.part(
    "root",
    as,
    {
      type: as === "button" ? "button" : undefined,
      ...props,
      className,
      "data-card-depth": depth,
    },
    <CardDepth.Provider value={depth + 1}>{children}</CardDepth.Provider>,
  );
});
