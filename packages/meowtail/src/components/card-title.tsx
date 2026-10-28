import { h, type Props, type Context } from "meowjsx";
import { nestedHeadingLevel } from "./heading-level";

export interface CardTitleProps extends Props {
  /** Defaults to one level below the surrounding `Page` or `Section` heading (h2 at the top). */
  as?: "h2" | "h3" | "h4" | "h5" | "h6";
  className?: Props["className"];
}

/** The title of a card. */
export function CardTitle(
  {
    as = `h${nestedHeadingLevel()}` as NonNullable<CardTitleProps["as"]>,
    children,
    className,
    ...props
  }: CardTitleProps,
  context: Context<typeof CardTitle>,
) {
  return h(as, { ...props, className, ref: [context.parts.root, props.ref] }, children);
}
CardTitle.meta = { name: "card-title", parts: ["root"] } as const;
