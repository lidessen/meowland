import {
  defineComponent,
  derived,
  unwrap,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
export interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
  title?: string;
}
export interface SegmentedControlProps extends Props {
  id: string;
  name?: string;
  form?: string;
  label: string;
  value: MaybeSignal<string>;
  options: readonly SegmentedControlOption[];
  onValueChange: (value: string) => void;
  disabled?: MaybeSignal<boolean>;
  className?: string;
}
export const segmentedControlContract = {
  name: "segmented-control",
  parts: ["root", "legend", "options", "option", "input", "label"],
} as const satisfies ComponentContract;
/** A single choice, using native radio keyboard semantics; tabs remain a separate component. */
export const SegmentedControl = defineComponent<
  SegmentedControlProps,
  "segmented-control",
  (typeof segmentedControlContract.parts)[number]
>(
  segmentedControlContract,
  ({ id, name = id, form, label, value, options, onValueChange, disabled, className }, context) => {
    const inputs = new Map<string, HTMLInputElement>();
    // Form reset and a rejected change flip the native radio before the signal does.
    const reconcile = () => {
      const selected = unwrap(value);
      for (const [key, input] of inputs) input.checked = selected === key;
    };
    return context.part(
      "root",
      "fieldset",
      {
        id,
        form,
        className,
        disabled,
        ref: (root: HTMLFieldSetElement) => {
          let disposed = false;
          let timer: ReturnType<typeof setTimeout> | undefined;
          const reset = (event: Event) => {
            // Read live native owners: an external form attribute may change after mount.
            if (![...inputs.values()].some((input) => input.form === event.target)) return;
            clearTimeout(timer);
            timer = setTimeout(() => {
              if (!disposed && !event.defaultPrevented) reconcile();
            }, 0);
          };
          root.ownerDocument.addEventListener("reset", reset, true);
          return () => {
            disposed = true;
            clearTimeout(timer);
            root.ownerDocument.removeEventListener("reset", reset, true);
          };
        },
      },
      context.part("legend", "legend", null, label),
      context.part(
        "options",
        "div",
        null,
        ...options.map((option) =>
          context.part(
            "option",
            "label",
            { title: option.title },
            context.part("input", "input", {
              type: "radio",
              name,
              form,
              value: option.value,
              checked: derived(() => unwrap(value) === option.value),
              disabled: option.disabled,
              ref: (input: HTMLInputElement) => {
                inputs.set(option.value, input);
                reconcile();
                return () => {
                  inputs.delete(option.value);
                };
              },
              onChange: (event: Event) => {
                if (
                  !unwrap(disabled) &&
                  !option.disabled &&
                  (event.currentTarget as HTMLInputElement).checked &&
                  unwrap(value) !== option.value
                )
                  onValueChange(option.value);
                reconcile();
              },
            }),
            context.part("label", "span", null, option.label),
          ),
        ),
      ),
    );
  },
);
