import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { h, type MaybeSignal, type Props, type Context } from "meowjsx";

import { iconButtonOptions } from "./icon-button.options";
export { iconButtonOptions } from "./icon-button.options";

export interface IconButtonProps extends Props, ThemedProps<typeof iconButtonOptions> {
  /** The accessible name; a Signal keeps it live (e.g. Copy → Copied). */
  label: MaybeSignal<string>;
  className?: Props["className"];
}

/** A button that shows only an icon and carries its name for assistive technology. */
export function IconButton(
  { children, className, label, ...props }: IconButtonProps,
  context: Context<typeof IconButton>,
) {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={className}
      aria-label={label}
      ref={[context.parts.root, props.ref]}
    >
      {children}
    </button>
  );
}
IconButton.meta = {
  name: "icon-button",
  parts: ["root"],
  style: defineStyleProps(iconButtonOptions, { defaults: { size: "default" } }),
} as const;
