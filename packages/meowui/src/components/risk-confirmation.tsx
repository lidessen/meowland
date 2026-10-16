import {
  defineComponent,
  h,
  isSignal,
  unwrap,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Dialog, DialogPanel, DialogHeader, DialogActions } from "./dialog";
import { Checkbox } from "./checkbox";
import { Button } from "./button";
export const riskConfirmationContract = {
  name: "risk-confirmation",
  parts: ["root"],
} as const satisfies ComponentContract;
export interface RiskConfirmationProps extends Props {
  id: string;
  open: MaybeSignal<boolean>;
  title: string;
  description: string;
  acknowledgeLabel: string;
  cancelLabel: string;
  confirmLabel: string;
  acknowledged: MaybeSignal<boolean>;
  disabled?: MaybeSignal<boolean>;
  onAcknowledgedChange: (value: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
  className?: string;
}
/** One host-requested acknowledgement; it never decides which actions need confirmation. */
export const RiskConfirmation = defineComponent<RiskConfirmationProps, "risk-confirmation", "root">(
  riskConfirmationContract,
  (
    {
      id,
      open,
      title,
      description,
      acknowledgeLabel,
      cancelLabel,
      confirmLabel,
      acknowledged,
      disabled = false,
      onAcknowledgedChange,
      onCancel,
      onConfirm,
      className,
    },
    context,
  ) => {
    const blocked = context.signal(unwrap(disabled) || !unwrap(acknowledged));
    context.effect(() => {
      blocked.value = unwrap(disabled) || !unwrap(acknowledged);
    });
    return context.part(
      "root",
      "div",
      { className },
      <Dialog
        labelledBy={`${id}-title`}
        describedBy={`${id}-description`}
        onCancel={(event: Event) => {
          event.preventDefault();
          onCancel();
        }}
        ref={(dialog: HTMLDialogElement) => {
          let alive = true;
          const sync = () => {
            if (!alive || !dialog.isConnected) return;
            if (unwrap(open) && !dialog.open) dialog.showModal();
            else if (!unwrap(open) && dialog.open) dialog.close();
          };
          const stop = isSignal(open) ? open.subscribe(sync) : () => {};
          queueMicrotask(sync);
          return () => {
            alive = false;
            stop();
            if (dialog.open) dialog.close();
          };
        }}
      >
        <DialogPanel
          header={
            <DialogHeader
              title={title}
              titleId={`${id}-title`}
              description={description}
              descriptionId={`${id}-description`}
            />
          }
        >
          <Checkbox
            label={acknowledgeLabel}
            checked={acknowledged}
            disabled={disabled}
            autofocus
            onChange={(event) =>
              onAcknowledgedChange((event.currentTarget as HTMLInputElement).checked)
            }
          />
          <DialogActions>
            <Button variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button
              disabled={blocked}
              onClick={() => {
                if (!unwrap(disabled) && unwrap(acknowledged)) onConfirm();
              }}
            >
              {confirmLabel}
            </Button>
          </DialogActions>
        </DialogPanel>
      </Dialog>,
    );
  },
);
