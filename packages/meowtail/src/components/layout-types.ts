import { type ThemedProps } from "meowcss/meowjsx";
import type { Props } from "meowjsx";
import { layoutOptions } from "./layout.options";
export { layoutOptions } from "./layout.options";
export type LayoutElement =
  | "div"
  | "span"
  | "section"
  | "nav"
  | "main"
  | "aside"
  | "header"
  | "footer"
  | "article"
  | "ol";
export type LayoutGap = (typeof layoutOptions.axes.gap)[number];
export type LayoutAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type LayoutJustify = "start" | "center" | "end" | "between";
export interface LayoutProps extends Props, ThemedProps<typeof layoutOptions> {
  as?: LayoutElement;
  align?: LayoutAlign;
  justify?: LayoutJustify;
}
export function justifyStyle(value: LayoutJustify) {
  return value === "between"
    ? "space-between"
    : value === "start" || value === "end"
      ? "flex-" + value
      : value;
}
