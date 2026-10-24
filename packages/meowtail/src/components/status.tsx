import { h, type Child, type Props, type Context } from "meowjsx";
import { StatusDot, type StatusDotProps } from "./status-dot";

export interface StatusProps extends Props {
  state?: StatusDotProps["state"];
  /** Supply visible, non-empty content, including when the Child is dynamic. */
  label: Exclude<Child, null | undefined | boolean>;
  size?: never;
  halo?: never;
  className?: Props["className"];
}

/** The state badge: a decorative dot and the state in a word or two, on a soft tint of the state's ink. Use as slot content; composed markers remain owned by WorkCard and Timeline. */
export function Status(
  { state, label, className, children: _children, ...props }: StatusProps,
  context: Context<typeof Status>,
) {
  return (
    <span
      {...props}
      className={className}
      data-tone={state ?? "unknown"}
      ref={[context.parts.root, props.ref]}
    >
      {<StatusDot state={state} />}
      {<span ref={[context.parts.label]}>{label}</span>}
    </span>
  );
}
Status.meta = { name: "status", parts: ["root", "label"] } as const;
