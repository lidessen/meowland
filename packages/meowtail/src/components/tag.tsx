import { defineComponent, type Props } from "meowjsx";
import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";

export const tagOptions = defineOptions("tag", {
  /** neutral: plain fact. accent: the current/default one. warning: needs the reader. */
  tone: ["neutral", "accent", "warning"],
  /** label: short text. count: a small number. path: a checkable monospace fact. */
  kind: ["label", "count", "path"],
});

export const tagContract = {
  name: "tag",
  parts: ["root"],
  styleProps: defineStyleProps(tagOptions, { defaults: { tone: "neutral", kind: "label" } }),
} as const satisfies StyledComponentContract;

export interface TagProps extends Props, ThemedProps<typeof tagOptions> {
  className?: string;
}

/** A static fact beside content. Choosing or filtering belongs to Pill, which is a button. */
export const Tag = defineComponent<
  TagProps,
  typeof tagContract.name,
  (typeof tagContract.parts)[number]
>(tagContract, ({ children, className, ...props }, context) =>
  context.part("root", "span", { ...props, className }, children),
);
