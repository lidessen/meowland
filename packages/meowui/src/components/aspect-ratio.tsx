import { defineComponent, type ComponentContract, type Props } from "meowjsx";
import { layoutStyle } from "../shared/layout-style";

export const aspectRatioContract = {
  name: "aspect-ratio",
  parts: ["root"],
} as const satisfies ComponentContract;
export interface AspectRatioProps extends Props {
  ratio?: number;
  className?: string;
}
/** The ratio is layout, not a theme surface. Children choose their own media fitting. */
export const AspectRatio = defineComponent<AspectRatioProps, "aspect-ratio", "root">(
  aspectRatioContract,
  ({ ratio = 16 / 9, children, className, style, ...props }, context) => {
    if (!Number.isFinite(ratio) || ratio <= 0)
      throw new Error("AspectRatio requires a finite positive ratio");
    return context.part(
      "root",
      "div",
      {
        ...props,
        className,
        style: layoutStyle(style, {
          aspectRatio: String(ratio),
          minWidth: "0",
        }),
      },
      children,
    );
  },
);
