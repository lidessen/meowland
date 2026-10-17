import { defineComponent, type Props, type ComponentContract } from "meowjsx";
import type { LayoutAlign, LayoutElement } from "./layout-types";
import { layoutStyle } from "../shared/layout-style";

export const layoutItemContract = {
  name: "layout-item",
  parts: ["root"],
} as const satisfies ComponentContract;

/** Placement belongs to the direct child, independently of its content's layout. */
export interface LayoutItemProps extends Props {
  as?: LayoutElement;
  grow?: boolean;
  shrink?: boolean;
  basis?: string | number;
  alignSelf?: LayoutAlign | "auto";
}

export const LayoutItem = defineComponent<LayoutItemProps, "layout-item", "root">(
  layoutItemContract,
  (
    {
      as = "div",
      grow = false,
      shrink = true,
      basis = "auto",
      alignSelf = "auto",
      children,
      ...props
    },
    context,
  ) =>
    context.part(
      "root",
      as,
      {
        ...props,
        style: layoutStyle(props.style, {
          flexGrow: grow ? 1 : 0,
          flexShrink: shrink ? 1 : 0,
          flexBasis: basis,
          alignSelf,
          minWidth: 0,
        }),
      },
      children,
    ),
);
