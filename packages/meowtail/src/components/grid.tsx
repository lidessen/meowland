import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { h, type Props, type Context } from "meowjsx";
import type { LayoutAlign, LayoutElement } from "./layout-types";
import { layoutStyle } from "../shared/layout-style";
import { gridMinColumn, gridOptions } from "./grid.options";
export { gridMinColumn, gridOptions } from "./grid.options";

export interface GridProps extends Props, ThemedProps<typeof gridOptions> {
  as?: LayoutElement;
  align?: LayoutAlign;
  className?: Props["className"];
  columns?: "auto" | 1 | 2 | 3 | 4;
}
/** Lays out children in responsive columns. */
export function Grid(
  { as = "div", align = "stretch", columns = "auto", children, ...props }: GridProps,
  context: Context<typeof Grid>,
) {
  return h(
    as,
    {
      ...props,
      ref: [context.parts.root, props.ref],
      style: layoutStyle(props.style, {
        display: "grid",
        gridTemplateColumns:
          columns === "auto"
            ? `repeat(auto-fit, minmax(min(100%, var(${gridMinColumn.name}, 100%)), 1fr))`
            : `repeat(${columns}, minmax(0, 1fr))`,
        alignItems: align,
        minWidth: 0,
        minHeight: 0,
      }),
    },
    children,
  );
}
Grid.meta = {
  name: "grid",
  parts: ["root"],
  style: defineStyleProps(gridOptions, {
    defaults: { gap: "normal", rowGap: "auto", columnGap: "auto", minColumnWidth: "normal" },
  }),
} as const;
