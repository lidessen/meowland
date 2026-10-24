import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { h, type Props, type Context } from "meowjsx";

import { skeletonOptions } from "./skeleton.options";
export { skeletonOptions } from "./skeleton.options";

export interface SkeletonProps extends Props, ThemedProps<typeof skeletonOptions> {
  className?: Props["className"];
}
/** Decorative placeholder; the caller owns loading text and aria-busy on the content region. */
export function Skeleton(
  { className, ...props }: SkeletonProps,
  context: Context<typeof Skeleton>,
) {
  return (
    <span
      {...props}
      className={className}
      aria-hidden="true"
      ref={[context.parts.root, props.ref]}
    />
  );
}
Skeleton.meta = {
  name: "skeleton",
  parts: ["root"],
  style: defineStyleProps(skeletonOptions, { defaults: { shape: "line" } }),
} as const;
