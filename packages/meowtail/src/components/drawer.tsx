import { h, unwrap, type Child, type MaybeSignal, type Props, type Context } from "meowjsx";
import { PageFrame } from "./page-frame";

export interface DrawerProps extends Props {
  /** Accessible name of the drawer. */
  label: string;
  open: MaybeSignal<boolean>;
  /** Called when the reader dismisses the drawer (scrim, Escape); the owner updates `open`. */
  onOpenChange: (open: boolean) => void;
  header?: Child;
  className?: Props["className"];
}

/**
 * A modal panel that slides in from the start edge over a scrim, for navigation on narrow
 * screens. The native dialog supplies focus containment and Escape; the scrim dismisses.
 */
export function Drawer(
  { label, open, onOpenChange, header, className, children, ref, ...props }: DrawerProps,
  context: Context<typeof Drawer>,
) {
  let dialog: HTMLDialogElement | undefined;
  const sync = () => {
    // Read first: the effect must subscribe to `open` even before the dialog is mounted.
    const next = unwrap(open);
    if (!dialog?.isConnected) return;
    if (next && !dialog.open) dialog.showModal();
    else if (!next && dialog.open) dialog.close();
  };
  context.effect(sync);
  return (
    <dialog
      {...props}
      className={className}
      aria-label={label}
      ref={[
        context.parts.root,
        ref,
        (element: HTMLDialogElement) => {
          dialog = element;
          queueMicrotask(sync);
          const dismiss = (event: Event) => {
            event.preventDefault();
            onOpenChange(false);
          };
          const closed = () => {
            if (unwrap(open)) onOpenChange(false);
          };
          const scrim = (event: MouseEvent) => {
            if (event.target === element) onOpenChange(false);
          };
          element.addEventListener("cancel", dismiss);
          element.addEventListener("close", closed);
          element.addEventListener("click", scrim);
          return () => {
            element.removeEventListener("cancel", dismiss);
            element.removeEventListener("close", closed);
            element.removeEventListener("click", scrim);
            if (element.open) element.close();
            dialog = undefined;
          };
        },
      ]}
    >
      <div ref={context.parts.panel}>
        <PageFrame variant="workspace" scrollOwner="layout" header={header}>
          {children}
        </PageFrame>
      </div>
    </dialog>
  );
}
Drawer.meta = { name: "drawer", parts: ["root", "panel"] } as const;
