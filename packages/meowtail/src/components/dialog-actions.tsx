import { h, type Props, type Context } from "meowjsx";
import { actionRowRef } from "../shared/action-row-fit";

export interface DialogActionsProps extends Props {
  className?: Props["className"];
}

/** The row of buttons that ends a dialog; it stacks whole when it does not fit, like ActionRow. */
export function DialogActions(
  { children, className, ref, ...props }: DialogActionsProps,
  context: Context<typeof DialogActions>,
) {
  return (
    <div {...props} className={className} ref={[context.parts.root, ref, actionRowRef()]}>
      {children}
    </div>
  );
}
DialogActions.meta = { name: "dialog-actions", parts: ["root"] } as const;
