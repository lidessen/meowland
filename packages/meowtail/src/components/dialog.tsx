import { h, type Child, type Props, type Context } from "meowjsx";
import { actionRowRef } from "../shared/action-row-fit";
import { PageFrame } from "./page-frame";

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

export interface DialogPanelProps extends Props {
  as?: "div" | "form";
  header?: Child;
  className?: Props["className"];
}

/** The body of a dialog, with an optional header that stays in place while the body scrolls. */
export function DialogPanel(
  { as = "div", header, className, children, ref, ...props }: DialogPanelProps,
  context: Context<typeof DialogPanel>,
) {
  const Panel = as;
  return (
    <Panel {...props} className={className} ref={[context.parts.root, ref]}>
      {h(PageFrame, { variant: "workspace", scrollOwner: "layout", header }, children)}
    </Panel>
  );
}
DialogPanel.meta = { name: "dialog-panel", parts: ["root"] } as const;

export interface DialogHeaderProps extends Props {
  title: Child;
  eyebrow?: Child;
  description?: Child;
  actions?: Child;
  titleId?: string;
  descriptionId?: string;
  className?: Props["className"];
}

/** The title block of a dialog: an optional eyebrow, the title, a description and actions. */
export function DialogHeader(
  {
    title,
    eyebrow,
    description,
    actions,
    titleId,
    descriptionId,
    className,
    ref,
  }: DialogHeaderProps,
  context: Context<typeof DialogHeader>,
) {
  return (
    <header className={className} ref={[context.parts.root, ref]}>
      <div ref={context.parts.identity}>
        {eyebrow ? <span ref={context.parts.eyebrow}>{eyebrow}</span> : null}
        <h2 id={titleId} ref={context.parts.title}>
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} ref={context.parts.description}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div ref={context.parts.actions}>{actions}</div> : null}
    </header>
  );
}
DialogHeader.meta = {
  name: "dialog-header",
  parts: ["root", "identity", "eyebrow", "title", "description", "actions"],
} as const;

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
