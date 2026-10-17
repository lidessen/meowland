import { defineOptions, tokenRef } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { defineComponent, type Props } from "meowjsx";
import type { LayoutAlign, LayoutElement } from "./layout-types";
import { layoutStyle } from "../shared/layout-style";
export const gridOptions = defineOptions("grid", {
  gap: ["none", "compact", "normal", "relaxed"],
  rowGap: ["auto", "none", "compact", "normal", "relaxed"],
  columnGap: ["auto", "none", "compact", "normal", "relaxed"],
  minColumnWidth: ["compact", "normal", "wide"],
});
export const gridMinColumn = tokenRef("grid", "minColumn");
export const gridContract = {
  name: "grid",
  parts: ["root"],
  styleProps: defineStyleProps(gridOptions, {
    defaults: { gap: "normal", rowGap: "auto", columnGap: "auto", minColumnWidth: "normal" },
  }),
} as const satisfies StyledComponentContract;
export interface GridProps extends Props, ThemedProps<typeof gridOptions> {
  as?: LayoutElement;
  align?: LayoutAlign;
  className?: string;
  columns?: "auto" | 1 | 2 | 3 | 4;
}
export const Grid = defineComponent<GridProps, "grid", "root">(
  gridContract,
  ({ as = "div", align = "stretch", columns = "auto", children, ...props }, context) =>
    context.part(
      "root",
      as,
      {
        ...props,
        style: layoutStyle(props.style, {
          display: "grid",
          gridTemplateColumns:
            columns === "auto"
              ? `repeat(auto-fit, minmax(min(100%, var(${gridMinColumn.name}, 100%)), 1fr))`
              : `repeat(${columns}, minmax(0, 1fr))`,
          alignItems: align,
          minWidth: 0,
        }),
      },
      children,
    ),
);
