import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { h, type Context, type Props } from "meowjsx";

/**
 * The text roles a host places between components. Each role is one the theme
 * already uses: body copy, secondary (supporting) copy, a label that names
 * something in a compact surface, caption-size notes, and the small-caps
 * eyebrow that labels a group. Field labels stay with Field, headings with
 * Section and PageHeader, and code with the code components.
 */
import { textOptions } from "./text.options";
export { textOptions } from "./text.options";

export interface TextProps extends Props, ThemedProps<typeof textOptions> {
  /** A paragraph by default; `span` for a run inside a line, `div` for a block that holds other blocks. */
  as?: "p" | "span" | "div";
  className?: Props["className"];
}

/**
 * One run of copy in a theme text role. Emphasis and fine print keep their
 * native elements (`strong`, `em`, `small`) inside it.
 */
export function Text(
  { as = "p", className, children, ref, ...props }: TextProps,
  context: Context<typeof Text>,
) {
  const Tag = as;
  return (
    <Tag {...props} className={className} ref={[context.parts.root, ref]}>
      {children}
    </Tag>
  );
}
Text.meta = {
  name: "text",
  parts: ["root"],
  style: defineStyleProps(textOptions, { defaults: { variant: "body" } }),
} as const;
