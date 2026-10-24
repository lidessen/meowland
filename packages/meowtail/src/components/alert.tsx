import { h, type Child, type Props, type Context } from "meowjsx";
import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { alertOptions } from "./alert.options";
export { alertOptions } from "./alert.options";

export interface AlertProps extends Props, ThemedProps<typeof alertOptions> {
  title?: Child;
  role?: "status" | "alert";
  actions?: Child;
  className?: Props["className"];
}

/**
 * A message about the page or a task, in one of the status tones. Urgency is explicit, independent
 * of the visual tone.
 */
export function Alert(
  { title, role = "status", actions, children, className, ref, ...props }: AlertProps,
  context: Context<typeof Alert>,
) {
  return (
    <div
      {...props}
      className={className}
      role={role}
      aria-atomic="true"
      ref={[context.parts.root, ref]}
    >
      {title ? <strong ref={context.parts.title}>{title}</strong> : null}
      <div ref={context.parts.body}>{children}</div>
      {actions ? <div ref={context.parts.actions}>{actions}</div> : null}
    </div>
  );
}
Alert.meta = {
  name: "alert",
  parts: ["root", "title", "body", "actions"],
  style: defineStyleProps(alertOptions, {
    defaults: { tone: "info", layout: "block", marker: "dot" },
    parts: ["root", "title"],
  }),
} as const;
