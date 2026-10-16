import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { defineComponent, type Props } from "meowjsx";
import { layoutStyle } from "../shared/layout-style";
export const containerOptions = defineOptions("container", {
  width: ["narrow", "content", "wide", "page", "full"],
});

export const containerContract = {
  name: "container",
  parts: ["root"],
  styleProps: defineStyleProps(containerOptions, { defaults: { width: "content" } }),
} as const satisfies StyledComponentContract;
export interface ContainerProps extends Props, ThemedProps<typeof containerOptions> {
  as?: "div" | "section" | "main" | "article" | "aside";
  className?: string;
}
export const Container = defineComponent<ContainerProps, "container", "root">(
  containerContract,
  ({ as = "div", children, ...props }, context) =>
    context.part(
      "root",
      as,
      {
        ...props,
        style: layoutStyle(props.style, { width: "100%", minWidth: 0, marginInline: "auto" }),
      },
      children,
    ),
);
