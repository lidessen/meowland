import { h, type Context, type Props } from "meowjsx";
import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { presentationTextOptions } from "./presentation-text.options";

export interface PresentationTextProps extends Props, ThemedProps<typeof presentationTextOptions> {
  as?: "span" | "h1" | "h2" | "h3" | "p";
}

/** Real text with optional presentation typography; its surrounding layout owns the scale. */
export function PresentationText(
  { as = "span", className, children, ref, ...props }: PresentationTextProps,
  context: Context<typeof PresentationText>,
) {
  const parts = context.parts;
  const Root = as;
  return (
    <Root {...props} ref={[parts.root, ref]} className={className}>
      <span ref={parts.content}>{children}</span>
    </Root>
  );
}

PresentationText.meta = {
  name: "presentation-text",
  parts: ["root", "content"],
  style: defineStyleProps(presentationTextOptions, { defaults: { effect: "plain" } }),
} as const;
