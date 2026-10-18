import {
  batch,
  defineComponent,
  h,
  unwrap,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Button } from "./button";
import { Input } from "./input";

const messages = {
  file: "Browse files…",
  directory: "Browse directories…",
  pending: "Choosing…",
  failed: "Could not open the picker; try again or enter a path manually.",
};

export const pathPickerContract = {
  name: "path-picker",
  parts: ["root", "row", "control", "trigger", "feedback"],
} as const satisfies ComponentContract;

export interface PathPickerProps extends Props {
  label: string;
  value: MaybeSignal<string>;
  onValueChange(value: string): void;
  /** Selection only supplies a path. Access and persistence belong to the host. */
  onChoose?: () => Promise<string | null>;
  kind?: "file" | "directory";
  disabled?: MaybeSignal<boolean>;
  readOnly?: MaybeSignal<boolean>;
  className?: string;
}

/** Controlled path editing with an optional host-owned chooser. */
export const PathPicker = defineComponent<
  PathPickerProps,
  typeof pathPickerContract.name,
  (typeof pathPickerContract.parts)[number]
>(
  pathPickerContract,
  (
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
    },
    context,
  ) => {
    const pending = context.signal(false);
    const feedback = context.signal("");
    const locked = context.signal(false);
    const buttonDisabled = context.signal(false);
    const buttonLabel = context.signal(messages[kind]);
    let disposed = false;
    let button: HTMLButtonElement | undefined;
    context.onCleanup(() => {
      disposed = true;
    });
    context.effect(() => {
      locked.value = unwrap(readOnly) || pending.value;
      buttonDisabled.value = unwrap(disabled) || unwrap(readOnly) || pending.value;
      buttonLabel.value = pending.value ? messages.pending : messages[kind];
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
          // Flush derived disabled state before returning focus to the native button.
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
    return context.part("root", "div", { className }, [
      context.part("row", "div", { "aria-busy": pending }, [
        context.part(
          "control",
          "div",
          {},
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
          />,
        ),
        onChoose
          ? context.part(
              "trigger",
              "span",
              {},
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
              </Button>,
            )
          : null,
      ]),
      context.part(
        "feedback",
        "span",
        { id: feedbackId, role: "status", "aria-live": "polite" },
        feedback,
      ),
    ]);
  },
);
