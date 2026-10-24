import { defineStyleProps } from "meowcss/meowjsx";
import { h, type Context } from "meowjsx";
import { layoutOptions, justifyStyle, type LayoutProps } from "./layout-types";
import { layoutStyle } from "../shared/layout-style";

export interface StackProps extends LayoutProps {}
/** Lays out children in a column, with a gap from the spacing scale. */
export function Stack(
  { as = "div", align = "stretch", justify = "start", children, ...props }: StackProps,
  context: Context<typeof Stack>,
) {
  return h(
    as,
    {
      ...props,
      ref: [context.parts.root, props.ref],
      style: layoutStyle(props.style, {
        display: "flex",
        flexDirection: "column",
        alignItems: align,
        justifyContent: justifyStyle(justify),
        minWidth: 0,
        minHeight: 0,
      }),
    },
    children,
  );
}
Stack.meta = {
  name: "stack",
  parts: ["root"],
  style: defineStyleProps(layoutOptions, {
    defaults: { gap: "normal", rowGap: "auto", columnGap: "auto" },
  }),
} as const;
