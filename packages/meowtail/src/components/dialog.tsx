import { h, type Props, type Context } from "meowjsx";

export interface DialogProps extends Props {
  labelledBy?: string;
  describedBy?: string;
  className?: Props["className"];
}

/** The native dialog element, themed; Modal builds a complete dialog on top of it. */
export function Dialog(
  { labelledBy, describedBy, className, children, ref, ...props }: DialogProps,
  context: Context<typeof Dialog>,
) {
  return (
    <dialog
      {...props}
      className={className}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      ref={[context.parts.root, ref]}
    >
      {children}
    </dialog>
  );
}
Dialog.meta = { name: "dialog", parts: ["root"] } as const;

// One component per module, so a bundler keeps only the dialog pieces a host uses.
export { DialogPanel, type DialogPanelProps } from "./dialog-panel";
export { DialogHeader, type DialogHeaderProps } from "./dialog-header";
export { DialogActions, type DialogActionsProps } from "./dialog-actions";
