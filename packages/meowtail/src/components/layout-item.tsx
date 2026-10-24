import { h, type Props, type Context } from "meowjsx";
import type { LayoutAlign, LayoutElement } from "./layout-types";
import { layoutStyle } from "../shared/layout-style";

/** Placement belongs to the direct child, independently of its content's layout. */
export interface LayoutItemProps extends Props {
  as?: LayoutElement;
  grow?: boolean;
  shrink?: boolean;
  basis?: string | number;
  alignSelf?: LayoutAlign | "auto";
}

/** A wrapper that sets how one child of a Stack or Inline grows, shrinks and aligns. */
export function LayoutItem(
  {
    as = "div",
    grow = false,
    shrink = true,
    basis = "auto",
    alignSelf = "auto",
    children,
    ...props
  }: LayoutItemProps,
  context: Context<typeof LayoutItem>,
) {
  return h(
    as,
    {
      ...props,
      ref: [context.parts.root, props.ref],
      style: layoutStyle(props.style, {
        flexGrow: grow ? 1 : 0,
        flexShrink: shrink ? 1 : 0,
        flexBasis: typeof basis === "number" ? `${basis}px` : basis,
        alignSelf,
        minWidth: 0,
        minHeight: 0,
      }),
    },
    children,
  );
}
LayoutItem.meta = { name: "layout-item", parts: ["root"] } as const;
