import { h, type Child, type Context, type Props } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { ActionRow } from "./action-row";
import { Alert } from "./alert";
import { Button } from "./button";

export interface FormProps extends Props {
  /**
   * Called only after native constraint validation passes, with the form's data including the
   * submitter. The browser's own submission is prevented; the native onSubmit is not forwarded.
   */
  onSubmit: (data: FormData, event: SubmitEvent) => void;
  /** The host is saving: the form reports busy and a submit in the meantime is not reported. */
  busy?: MaybeSignal<boolean>;
  /** A host failure for the whole form, shown above the actions as an alert. */
  error?: MaybeSignal<string | undefined>;
  /** A polite receipt, such as "Saved", shown above the actions. */
  status?: MaybeSignal<string | undefined>;
  submitLabel?: string;
  busyLabel?: string;
  /** Adds a Cancel action; the host decides what cancelling keeps. */
  onCancel?: () => void;
  cancelLabel?: string;
  /** Replaces the Save and Cancel actions; place them in the order Cancel, then the primary. */
  actions?: Child;
  className?: Props["className"];
}

function labelOf(element: Element): string {
  const labels = (element as HTMLInputElement).labels;
  return labels?.[0]?.textContent?.trim() ?? "";
}

/**
 * A native form for a settings or connection task: validation stays native, values stay in the
 * host's controls, and submission, busy state and results belong to the host.
 */
export function Form(
  {
    onSubmit,
    busy = false,
    error,
    status,
    submitLabel = "Save",
    busyLabel = "Saving…",
    onCancel,
    cancelLabel = "Cancel",
    actions,
    className,
    children,
    ref,
    ...props
  }: FormProps,
  context: Context<typeof Form>,
) {
  // The first invalid control's native message, shown only when the host gives no error.
  const invalidMessage = signal<string | undefined>(undefined);
  const message = derived(() => unwrap(error) ?? invalidMessage.value);
  const receipt = derived(() => unwrap(status));

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (unwrap(busy)) return;
    // checkValidity also fires each control's invalid event, so components show their own state.
    if (!form.checkValidity()) {
      const invalid = [...form.elements].find(
        (element) => !(element as HTMLInputElement).validity?.valid,
      ) as HTMLElement | undefined;
      if (invalid) {
        // A hidden native carrier (such as ChoiceSelect's select) names its visible control.
        const visible =
          invalid.getAttribute("aria-hidden") === "true"
            ? form.ownerDocument.getElementById(invalid.getAttribute("aria-labelledby") ?? "")
            : invalid;
        (visible ?? invalid).focus();
        const label = labelOf(visible ?? invalid) || labelOf(invalid);
        const text = (invalid as HTMLInputElement).validationMessage;
        invalidMessage.value = label ? `${label}: ${text}` : text;
      }
      return;
    }
    invalidMessage.value = undefined;
    onSubmit(new FormData(form, event.submitter), event);
  };

  return (
    <form
      {...props}
      noValidate
      className={className}
      aria-busy={derived(() => (unwrap(busy) ? "true" : undefined))}
      onSubmit={submit}
      onInput={() => {
        invalidMessage.value = undefined;
      }}
      ref={[context.parts.root, ref]}
    >
      <div ref={context.parts.body}>{children}</div>
      <div hidden={derived(() => !message.value)} ref={context.parts.error}>
        <Alert tone="danger" role="alert">
          {derived(() => message.value ?? "")}
        </Alert>
      </div>
      <p role="status" hidden={derived(() => !receipt.value)} ref={context.parts.status}>
        {derived(() => receipt.value ?? "")}
      </p>
      <div ref={context.parts.actions}>
        <ActionRow>
          {actions ?? [
            onCancel ? (
              <Button type="button" variant="outline" onClick={() => onCancel()}>
                {cancelLabel}
              </Button>
            ) : null,
            <Button
              type="submit"
              aria-disabled={derived(() => (unwrap(busy) ? "true" : undefined))}
            >
              {derived(() => (unwrap(busy) ? busyLabel : submitLabel))}
            </Button>,
          ]}
        </ActionRow>
      </div>
    </form>
  );
}
Form.meta = {
  name: "form",
  parts: ["root", "body", "error", "status", "actions"],
} as const;
