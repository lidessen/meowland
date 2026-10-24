import { defineStyleProps } from "meowcss/meowjsx";
import { h, type Context } from "meowjsx";
import { layoutOptions, justifyStyle, type LayoutProps } from "./layout-types";
import { layoutStyle } from "../shared/layout-style";

export interface InlineProps extends LayoutProps {
  wrap?: boolean;
}
/** Lays out children in a row that wraps, with a gap from the spacing scale. */
export function Inline(
  { as = "div", align = "center", justify = "start", wrap = true, children, ...props }: InlineProps,
  context: Context<typeof Inline>,
) {
  return h(
    as,
    {
      ...props,
      ref: [context.parts.root, props.ref],
      style: layoutStyle(props.style, {
        display: "flex",
        flexDirection: "row",
        flexWrap: wrap ? "wrap" : "nowrap",
        alignItems: align,
        justifyContent: justifyStyle(justify),
        minWidth: 0,
        minHeight: 0,
      }),
    },
    children,
  );
}
Inline.meta = {
  name: "inline",
  parts: ["root"],
  style: defineStyleProps(layoutOptions, {
    defaults: { gap: "normal", rowGap: "auto", columnGap: "auto" },
  }),
} as const;
