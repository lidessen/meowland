import { h, type Child, type Props, type Context } from "meowjsx";
import { isSignal, mapSignal, unwrap } from "meowjsx/signal";
import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";

import { buttonOptions } from "./button.options";
export { buttonOptions } from "./button.options";

export interface ButtonProps extends Props, ThemedProps<typeof buttonOptions> {
  className?: Props["className"];
  /** Use a native link for navigation while keeping the shared action appearance. */
  href?: string;
}

/** Triggers one action, in one of six levels and three sizes. */
export function Button(
  { children, className, href, ref, ...props }: ButtonProps,
  context: Context<typeof Button>,
) {
  if (href !== undefined) {
    const { type: _type, disabled, tabIndex, onClick, ...link } = props;
    const whenDisabled = <T,>(read: (value: boolean) => T) =>
      isSignal(disabled)
        ? mapSignal(disabled, (value) => read(Boolean(value)))
        : read(Boolean(disabled));
    return (
      <a
        {...link}
        href={whenDisabled((disabled) => (disabled ? undefined : href))}
        role={whenDisabled((disabled) => (disabled ? "link" : undefined))}
        aria-disabled={whenDisabled((disabled) => (disabled ? "true" : undefined))}
        tabIndex={whenDisabled((disabled) => (disabled ? -1 : tabIndex))}
        className={className}
        ref={[context.parts.root, ref]}
        onClick={(event: MouseEvent) => {
          if (unwrap(disabled)) {
            event.preventDefault();
            event.stopPropagation();
          } else if (typeof onClick === "function") onClick(event);
        }}
      >
        {children}
      </a>
    );
  }
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
