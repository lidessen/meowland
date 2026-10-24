import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { h, type Props, type Context } from "meowjsx";
import { layoutStyle } from "../shared/layout-style";
import { containerOptions } from "./container.options";
export { containerOptions } from "./container.options";

export interface ContainerProps extends Props, ThemedProps<typeof containerOptions> {
  as?: "div" | "section" | "main" | "article" | "aside";
  className?: Props["className"];
}
/** Centers content at one of the page widths. */
export function Container(
  { as = "div", children, ...props }: ContainerProps,
  context: Context<typeof Container>,
) {
  return h(
    as,
    {
      ...props,
      ref: [context.parts.root, props.ref],
      style: layoutStyle(props.style, { width: "100%", minWidth: 0, marginInline: "auto" }),
    },
    children,
  );
}
Container.meta = {
  name: "container",
  parts: ["root"],
  style: defineStyleProps(containerOptions, { defaults: { width: "content" } }),
} as const;
