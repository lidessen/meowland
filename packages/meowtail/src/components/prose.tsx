import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { h, type Props, type Context } from "meowjsx";

import { proseOptions } from "./prose.options";
export { proseOptions } from "./prose.options";

export interface ProseProps extends Props, ThemedProps<typeof proseOptions> {
  as?: "div" | "article" | "section";
  className?: Props["className"];
}

/**
 * Long-form reading content. Native headings, paragraphs, lists, quotes, code,
 * rules and tables inside it take the same reading rhythm as chat markdown;
 * arranging controls and cards stays with Stack, Inline and Grid.
 */
export function Prose(
  { as = "div", className, children, ...props }: ProseProps,
  context: Context<typeof Prose>,
) {
  return h(as, { ...props, className, ref: [context.parts.root, props.ref] }, children);
}
Prose.meta = {
  name: "prose",
  parts: ["root"],
  style: defineStyleProps(proseOptions, { defaults: { measure: "reading" } }),
} as const;
