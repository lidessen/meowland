import { h, type Child, type Props, type Context } from "meowjsx";
import { unwrap, type MaybeSignal } from "meowjsx/signal";
import { activeElementInRoot } from "../shared/dom-root";
import { Icon } from "../icons/icon";
import { Dialog, DialogActions, DialogHeader, DialogPanel } from "./dialog";
import { IconButton } from "./icon-button";
import { elementId } from "../shared/element-id";

export interface ModalProps extends Props {
  /** Required; the host owns the state. A Signal keeps the dialog in sync after mount. */
  open: MaybeSignal<boolean>;
  /**
   * Called with `false` when the reader dismisses the dialog (Escape, backdrop,
   * header close entry, or a native close). The owner decides whether `open`
   * changes; a controlled host that ignores the call keeps the dialog open.
   */
  onOpenChange: (open: boolean) => void;
  /** The dialog heading and accessible name. */
  title: Child;
  /** Optional supporting line under the heading; it is wired to the dialog description. */
  description?: Child;
  /** Optional bottom action row; omit it for a body-only dialog. */
  actions?: Child;
  /** Default true; false removes the header close entry and Escape/backdrop dismissal. */
  dismissible?: boolean;
  /** Accessible name of the header close entry; default "Close". */
  closeLabel?: string;
  /**
   * Id of the transparent wrapper and base for the generated title/description ids.
   * A generated base is used when omitted. Fixed for the mount.
   */
  id?: string;
  className?: Props["className"];
  children: Child;
}

/** True when a slot was given; `false` and `null` mean the slot is omitted. */
function hasSlot(slot: Child): boolean {
  return slot !== undefined && slot !== null && slot !== false;
}

/**
 * A complete native modal dialog over the `Dialog` primitives: the host owns the
 * `open` state and every business action, while the Modal owns the native
 * `showModal`/`close` mechanics, Escape and backdrop dismissal, focus return and
 * the generated title/description ids.
 */
export function Modal(
  {
    open,
    onOpenChange,
    title,
    description,
    actions,
    dismissible = true,
    closeLabel = "Close",
    id,
    className,
    children,
    ref,
    ...props
  }: ModalProps,
  context: Context<typeof Modal>,
) {
  const baseId = id ?? elementId("modal");
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;
  // DialogHeader renders its description on truthiness; match it so the id never dangles.
  const hasDescription = hasSlot(description) && Boolean(description);
  let dialog: HTMLDialogElement | undefined;
  let opener: HTMLElement | null = null;
  let alive = true;
  context.onCleanup(() => {
    alive = false;
  });
  const dismiss = () => {
    if (dismissible) onOpenChange(false);
  };
  const rememberOpener = (element: HTMLDialogElement) => {
    // `open` may be set without a click, so remember whatever held focus when the
    // modal actually opened and give it back after the dialog closes. Focus that is
    // already inside the dialog is not a useful return target (a rapid reopen).
    const focused = activeElementInRoot(element);
    if (focused instanceof HTMLElement && element.contains(focused)) return;
    opener = focused instanceof HTMLElement ? focused : null;
  };
  const restoreOpener = () => {
    const target = opener;
    opener = null;
    if (target?.isConnected) target.focus();
  };
  const sync = () => {
    if (!alive || !dialog?.isConnected) return;
    if (unwrap(open)) {
      if (!dialog.open) {
        rememberOpener(dialog);
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  };
  context.effect(() => {
    // Read before the dialog mounts so the effect subscribes to a live owner signal.
    unwrap(open);
    sync();
  });
  return (
    <div {...props} id={id} className={className} ref={[context.parts.root, ref]}>
      <Dialog
        labelledBy={titleId}
        describedBy={hasDescription ? descriptionId : undefined}
        onCancel={(event: Event) => {
          // The native default would close the dialog; route dismissal through the
          // owner instead, and keep a non-dismissible dialog open.
          event.preventDefault();
          if (alive) dismiss();
        }}
        onClose={() => {
          if (!alive) return;
          // A native close the owner did not initiate (for example a form with
          // method="dialog") still has to reach the open-signal owner.
          const wasOpen = unwrap(open);
          restoreOpener();
          if (wasOpen) onOpenChange(false);
        }}
        onClick={(event: MouseEvent) => {
          if (!alive || !dismissible) return;
          // A backdrop click targets the dialog element; panel clicks target descendants.
          if (event.target === event.currentTarget) onOpenChange(false);
        }}
        ref={(element: HTMLDialogElement) => {
          dialog = element;
          // The dialog is created before it is inserted, so open after the mount.
          queueMicrotask(sync);
          return () => {
            if (element.open) element.close();
            dialog = undefined;
            opener = null;
          };
        }}
      >
        <DialogPanel
          header={
            <DialogHeader
              title={title}
              titleId={titleId}
              description={hasDescription ? description : undefined}
              descriptionId={hasDescription ? descriptionId : undefined}
              actions={
                dismissible ? (
                  <IconButton label={closeLabel} onClick={dismiss}>
                    <Icon name="x" />
                  </IconButton>
                ) : undefined
              }
            />
          }
        >
          {children}
          {hasSlot(actions) ? <DialogActions>{actions}</DialogActions> : null}
        </DialogPanel>
      </Dialog>
    </div>
  );
}
Modal.meta = { name: "modal", parts: ["root"] } as const;
