import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { defineComponent, type Props } from "meowjsx";

export const proseOptions = defineOptions("prose", {
  /** `reading` caps lines at the reading measure; `fill` takes the width the parent gives. */
  measure: ["reading", "fill"],
});

export const proseContract = {
  name: "prose",
  parts: ["root"],
  styleProps: defineStyleProps(proseOptions, { defaults: { measure: "reading" } }),
} as const satisfies StyledComponentContract;

export interface ProseProps extends Props, ThemedProps<typeof proseOptions> {
  as?: "div" | "article" | "section";
  className?: string;
}

/**
 * Long-form reading content. Native headings, paragraphs, lists, quotes, code,
 * rules and tables inside it take the same reading rhythm as chat markdown;
 * arranging controls and cards stays with Stack, Inline and Grid.
 */
export const Prose = defineComponent<
  ProseProps,
  typeof proseContract.name,
  (typeof proseContract.parts)[number]
>(proseContract, ({ as = "div", className, children, ...props }, context) =>
  context.part("root", as, { ...props, className }, children),
);
