import { defineStyleProps, type StyledComponentContract } from "meowcss/meowjsx";
import { layoutOptions } from "./layout-types";
import { defineComponent } from "meowjsx";
import { justifyStyle, type LayoutProps } from "./layout-types";
import { layoutStyle } from "../shared/layout-style";
export const inlineContract = {
  name: "inline",
  parts: ["root"],
  styleProps: defineStyleProps(layoutOptions, {
    defaults: { gap: "normal", rowGap: "auto", columnGap: "auto" },
  }),
} as const satisfies StyledComponentContract;
export interface InlineProps extends LayoutProps {
  wrap?: boolean;
}
export const Inline = defineComponent<InlineProps, "inline", "root">(
  inlineContract,
  ({ as = "div", align = "center", justify = "start", wrap = true, children, ...props }, context) =>
    context.part(
      "root",
      as,
      {
        ...props,
        style: layoutStyle(props.style, {
          display: "flex",
          flexDirection: "row",
          flexWrap: wrap ? "wrap" : "nowrap",
          alignItems: align,
          justifyContent: justifyStyle(justify),
          minWidth: 0,
        }),
      },
      children,
    ),
);
