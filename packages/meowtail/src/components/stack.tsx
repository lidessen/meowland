import { defineStyleProps, type StyledComponentContract } from "meowcss/meowjsx";
import { layoutOptions } from "./layout-types";
import { defineComponent } from "meowjsx";
import { justifyStyle, type LayoutProps } from "./layout-types";
import { layoutStyle } from "../shared/layout-style";
export const stackContract = {
  name: "stack",
  parts: ["root"],
  styleProps: defineStyleProps(layoutOptions, {
    defaults: { gap: "normal", rowGap: "auto", columnGap: "auto" },
  }),
} as const satisfies StyledComponentContract;
export interface StackProps extends LayoutProps {}
export const Stack = defineComponent<StackProps, "stack", "root">(
  stackContract,
  ({ as = "div", align = "stretch", justify = "start", children, ...props }, context) =>
    context.part(
      "root",
      as,
      {
        ...props,
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
    ),
);
