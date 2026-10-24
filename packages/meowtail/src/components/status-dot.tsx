import { h, type Props, type Context } from "meowjsx";
import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";

import { statusDotOptions } from "./status-dot.options";
export { statusDotOptions } from "./status-dot.options";

export type StatusDotState = (typeof statusDotOptions.axes.state)[number];

export interface StatusDotProps extends Props, ThemedProps<typeof statusDotOptions> {
  /** Diameter in px; the state shape is drawn inside it. */
  size?: number;
  /** A soft ring behind the dot, for the one status that leads a surface (header, connection). */
  halo?: boolean;
  className?: Props["className"];
}

/**
 * A dot that shows the state of a piece of work. It is decorative: the owner supplies adjacent
 * text, so it is hidden from assistive tech.
 */
export function StatusDot(
  { size = 8, halo = false, className, style, ref, ...props }: StatusDotProps,
  context: Context<typeof StatusDot>,
) {
  return (
    <span
      {...props}
      className={className}
      aria-hidden="true"
      data-halo={halo ? "true" : undefined}
      style={{ ...(typeof style === "object" ? style : null), "--status-dot-size": `${size}px` }}
      ref={[context.parts.root, ref]}
    />
  );
}
StatusDot.meta = {
  name: "status-dot",
  parts: ["root"],
  style: defineStyleProps(statusDotOptions, { defaults: { state: "unknown" } }),
} as const;
