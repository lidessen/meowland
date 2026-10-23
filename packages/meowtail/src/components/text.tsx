import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { defineComponent, type Props } from "meowjsx";

/**
 * The text roles a host places between components. Each role is one the theme
 * already uses: body copy, secondary (supporting) copy, a label that names
 * something in a compact surface, caption-size notes, and the small-caps
 * eyebrow that labels a group. Field labels stay with Field, headings with
 * Section and PageHeader, and code with the code components.
 */
export const textOptions = defineOptions("text", {
  variant: ["body", "secondary", "label", "caption", "eyebrow"],
});

export const textContract = {
  name: "text",
  parts: ["root"],
  styleProps: defineStyleProps(textOptions, { defaults: { variant: "body" } }),
} as const satisfies StyledComponentContract;

export interface TextProps extends Props, ThemedProps<typeof textOptions> {
  /** A paragraph by default; `span` for a run inside a line, `div` for a block that holds other blocks. */
  as?: "p" | "span" | "div";
  className?: string;
}

/**
 * One run of copy in a theme text role. Emphasis and fine print keep their
 * native elements (`strong`, `em`, `small`) inside it.
 */
export const Text = defineComponent<
  TextProps,
  typeof textContract.name,
  (typeof textContract.parts)[number]
>(textContract, ({ as = "p", className, children, ...props }, context) =>
  context.part("root", as, { ...props, className }, children),
);
