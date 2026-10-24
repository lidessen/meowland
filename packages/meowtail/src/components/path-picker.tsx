import { batch, derived, h, unwrap, type MaybeSignal, type Props, type Context } from "meowjsx";
import { Button } from "./button";
import { Input } from "./input";

const messages = {
  file: "Browse files…",
  directory: "Browse directories…",
  pending: "Choosing…",
  failed: "Could not open the picker; try again or enter a path manually.",
};

export interface PathPickerProps extends Props {
  label: string;
  value: MaybeSignal<string>;
  onValueChange(value: string): void;
  /** Selection only supplies a path. Access and persistence belong to the host. */
  onChoose?: () => Promise<string | null>;
  kind?: "file" | "directory";
  disabled?: MaybeSignal<boolean>;
  readOnly?: MaybeSignal<boolean>;
  className?: Props["className"];
}

/** Controlled path editing with an optional host-owned chooser. */
export function PathPicker(
  {
    label,
    value,
    onValueChange,
    onChoose,
    kind = "file",
    disabled = false,
    readOnly = false,
    className,
    children: _children,
    ...props
  }: PathPickerProps,
  context: Context<typeof PathPicker>,
) {
  const pending = context.signal(false);
  const feedback = context.signal("");
  const locked = derived(() => unwrap(readOnly) || pending.value);
  const buttonDisabled = derived(() => unwrap(disabled) || unwrap(readOnly) || pending.value);
  const buttonLabel = derived(() => (pending.value ? messages.pending : messages[kind]));
  let disposed = false;
  let button: HTMLButtonElement | undefined;
  context.onCleanup(() => {
    disposed = true;
  });
  const choose = async () => {
    if (!onChoose || disposed || buttonDisabled.value) return;
    const startingValue = unwrap(value);
    pending.value = true;
    feedback.value = "";
    try {
      const selected = await onChoose();
      if (
        !disposed &&
        !unwrap(disabled) &&
        !unwrap(readOnly) &&
        unwrap(value) === startingValue &&
        selected !== null
      )
        onValueChange(selected);
    } catch {
      if (!disposed) feedback.value = messages.failed;
    } finally {
      if (!disposed) {
        // The button's disabled property updates in the signal subscriber, so flush it before focus.
        batch(() => {
          pending.value = false;
        });
        const document = button?.ownerDocument;
        if (
          button?.isConnected &&
          !button.disabled &&
          document &&
          (document.activeElement === document.body || document.activeElement === button)
        )
          button.focus();
      }
    }
  };
  const feedbackId = typeof props.id === "string" ? `${props.id}-picker-status` : undefined;
  const describedBy =
    [props["aria-describedby"], feedbackId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className} ref={[context.parts.root]}>
      {[
        <div aria-busy={pending} ref={[context.parts.row]}>
          {[
            <div ref={[context.parts.control]}>
              {
                <Input
                  {...props}
                  value={value}
                  disabled={disabled}
                  readOnly={locked}
                  aria-label={label}
                  aria-describedby={describedBy}
                  onInput={(event: Event) => {
                    if (unwrap(disabled) || locked.value) return;
                    feedback.value = "";
                    onValueChange((event.target as HTMLInputElement).value);
                  }}
                />
              }
            </div>,
            onChoose ? (
              <span ref={[context.parts.trigger]}>
                {
                  <Button
                    type="button"
                    variant="outline"
                    disabled={buttonDisabled}
                    onClick={choose}
                    ref={(element: HTMLButtonElement) => {
                      button = element;
                    }}
                  >
                    {buttonLabel}
                  </Button>
                }
              </span>
            ) : null,
          ]}
        </div>,
        <span id={feedbackId} role={"status"} aria-live={"polite"} ref={[context.parts.feedback]}>
          {feedback}
        </span>,
      ]}
    </div>
  );
}
PathPicker.meta = {
  name: "path-picker",
  parts: ["root", "row", "control", "trigger", "feedback"],
} as const;
