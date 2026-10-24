import { h, type Context, type Props } from "meowjsx";
import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";

import { tagOptions } from "./tag.options";
export { tagOptions } from "./tag.options";

export interface TagProps extends Props, ThemedProps<typeof tagOptions> {
  className?: Props["className"];
}

/** A static fact beside content. Choosing or filtering belongs to Pill, which is a button. */
export function Tag(
  { children, className, ref, ...props }: TagProps,
  context: Context<typeof Tag>,
) {
  return (
    <span {...props} className={className} ref={[context.parts.root, ref]}>
      {children}
    </span>
  );
}
Tag.meta = {
  name: "tag",
  parts: ["root"],
  style: defineStyleProps(tagOptions, { defaults: { tone: "neutral", kind: "label" } }),
} as const;
