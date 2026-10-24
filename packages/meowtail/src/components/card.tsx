import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { createContext, useContext, h, type Props, type Context } from "meowjsx";

const CardDepth = createContext(0);

import { cardOptions } from "./card.options";
export { cardOptions } from "./card.options";

export interface CardProps extends Props, ThemedProps<typeof cardOptions> {
  as?: "div" | "article" | "section" | "button";
  className?: Props["className"];
}

/** A bordered surface that groups one object's title, content and actions. */
export function Card(
  { as = "div", children, className, ref, ...props }: CardProps,
  context: Context<typeof Card>,
) {
  const depth = useContext(CardDepth);
  return h(
    as,
    {
      type: as === "button" ? "button" : undefined,
      ...props,
      className,
      "data-card-depth": depth,
      ref: [context.parts.root, ref],
    },
    <CardDepth.Provider value={depth + 1}>{children}</CardDepth.Provider>,
  );
}
Card.meta = {
  name: "card",
  parts: ["root"],
  style: defineStyleProps(cardOptions, { defaults: { variant: "auto" } }),
} as const;
