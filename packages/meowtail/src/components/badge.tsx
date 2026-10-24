import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { h, type Props, type Context } from "meowjsx";

import { badgeOptions } from "./badge.options";
export { badgeOptions } from "./badge.options";

export interface BadgeProps extends Props, ThemedProps<typeof badgeOptions> {
  className?: Props["className"];
}

/** A small label that names a category, such as a version or a release stage. */
export function Badge(
  { children, className, ref, ...props }: BadgeProps,
  context: Context<typeof Badge>,
) {
  return (
    <span {...props} className={className} ref={[context.parts.root, ref]}>
      {children}
    </span>
  );
}
Badge.meta = {
  name: "badge",
  parts: ["root"],
  style: defineStyleProps(badgeOptions, { defaults: { tone: "neutral", size: "default" } }),
} as const;
