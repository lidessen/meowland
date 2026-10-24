import { h, type Props, type Context } from "meowjsx";

export interface CardTitleProps extends Props {
  as?: "h2" | "h3" | "h4" | "h5" | "h6";
  className?: Props["className"];
}

/** The title of a card. */
export function CardTitle(
  { as = "h2", children, className, ...props }: CardTitleProps,
  context: Context<typeof CardTitle>,
) {
  return h(as, { ...props, className, ref: [context.parts.root, props.ref] }, children);
}
CardTitle.meta = { name: "card-title", parts: ["root"] } as const;
