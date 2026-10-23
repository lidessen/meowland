import { defineComponent, type Child, type Props } from "meowjsx";
import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";

export const buttonOptions = defineOptions("button", {
  /**
   * primary: the one main action (black/white). outline: secondary, a hairline-edged control.
   * quiet: tertiary. accent: soft accent fill for an action about the current activity.
   * stop: interrupts running work. danger: filled, for destructive confirmation.
   */
  variant: ["primary", "quiet", "danger", "outline", "accent", "stop"],
  size: ["small", "default", "large"],
});

export const buttonContract = {
  name: "button",
  parts: ["root"],
  styleProps: defineStyleProps(buttonOptions, {
    defaults: { variant: "primary", size: "default" },
  }),
} as const satisfies StyledComponentContract;

export interface ButtonProps extends Props, ThemedProps<typeof buttonOptions> {
  className?: string;
}

/** Triggers one action, in one of six levels and three sizes. */
export const Button = defineComponent<
  ButtonProps,
  typeof buttonContract.name,
  (typeof buttonContract.parts)[number]
>(buttonContract, ({ children, className, ...props }, context) => {
  return context.part(
    "root",
    "button",
    {
      ...props,
      type: props.type ?? "button",
      className,
    },
    children,
  );
});

export interface AddButtonProps extends Omit<ButtonProps, "children"> {
  children?: Child;
}
