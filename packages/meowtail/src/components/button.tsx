import { h, type Child, type Props, type Context } from "meowjsx";
import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";

import { buttonOptions } from "./button.options";
export { buttonOptions } from "./button.options";

export interface ButtonProps extends Props, ThemedProps<typeof buttonOptions> {
  className?: Props["className"];
}

/** Triggers one action, in one of six levels and three sizes. */
export function Button(
  { children, className, ref, ...props }: ButtonProps,
  context: Context<typeof Button>,
) {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={className}
      ref={[context.parts.root, ref]}
    >
      {children}
    </button>
  );
}
Button.meta = {
  name: "button",
  parts: ["root"],
  style: defineStyleProps(buttonOptions, {
    defaults: { variant: "primary", size: "default" },
  }),
} as const;

export interface AddButtonProps extends Omit<ButtonProps, "children"> {
  children?: Child;
}
