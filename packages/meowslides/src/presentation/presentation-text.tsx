import { defineComponent, type Props } from "meowjsx";
import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";

export const presentationTextOptions = defineOptions("presentation-text", {
  effect: ["plain", "editorial", "marker"],
});

export const presentationTextContract = {
  name: "presentation-text",
  parts: ["root", "content"],
  styleProps: defineStyleProps(presentationTextOptions, {
    defaults: { effect: "plain" },
  }),
} as const satisfies StyledComponentContract;

export interface PresentationTextProps extends Props, ThemedProps<typeof presentationTextOptions> {
  as?: "span" | "h1" | "h2" | "h3" | "p";
  className?: string;
}

/** Real text with optional presentation typography; its surrounding layout owns the scale. */
export const PresentationText = defineComponent<
  PresentationTextProps,
  typeof presentationTextContract.name,
  (typeof presentationTextContract.parts)[number]
>(presentationTextContract, ({ as = "span", className, children, ...props }, context) =>
  context.part(
    "root",
    as,
    { ...props, className },
    context.part("content", "span", null, children),
  ),
);
