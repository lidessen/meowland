import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { defineComponent, type Props } from "meowjsx";

export const skeletonOptions = defineOptions("skeleton", { shape: ["line", "circle", "block"] });

export const skeletonContract = {
  name: "skeleton",
  parts: ["root"],
  styleProps: defineStyleProps(skeletonOptions, { defaults: { shape: "line" } }),
} as const satisfies StyledComponentContract;
export interface SkeletonProps extends Props, ThemedProps<typeof skeletonOptions> {
  className?: string;
}
/** Decorative placeholder; the caller owns loading text and aria-busy on the content region. */
export const Skeleton = defineComponent<SkeletonProps, "skeleton", "root">(
  skeletonContract,
  ({ className, ...props }, context) =>
    context.part("root", "span", {
      ...props,
      className,
      "aria-hidden": "true",
    }),
);
