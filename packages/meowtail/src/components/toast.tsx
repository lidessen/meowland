import { h, type Child, type Context, type Props } from "meowjsx";

export interface ToastProps extends Props {
  message: Child;
  icon?: Child;
  actions?: Child;
  role?: "status" | "alert";
  className?: Props["className"];
}
/**
 * A short notice that appears over the page. Host owns visibility, lifetime and placement; mounting
 * does not schedule timers.
 */
export function Toast(
  { message, icon, actions, role = "status", className, ref, ...props }: ToastProps,
  context: Context<typeof Toast>,
) {
  return (
    <div
      {...props}
      role={role}
      aria-atomic="true"
      className={className}
      ref={[context.parts.root, ref]}
    >
      {icon ? (
        <span aria-hidden="true" ref={context.parts.icon}>
          {icon}
        </span>
      ) : null}
      <div ref={context.parts.message}>{message}</div>
      {actions ? <div ref={context.parts.actions}>{actions}</div> : null}
    </div>
  );
}
Toast.meta = { name: "toast", parts: ["root", "icon", "message", "actions"] } as const;
