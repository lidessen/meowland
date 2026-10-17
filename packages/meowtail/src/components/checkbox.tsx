import {
  defineComponent,
  unwrap,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";

export const checkboxContract = {
  name: "checkbox",
  parts: ["root", "input", "label"],
} as const satisfies ComponentContract;

interface NativeToggleProps extends Props {
  checked?: MaybeSignal<boolean>;
  defaultChecked?: boolean;
  onChange?: (event: Event) => void;
}

export interface CheckboxProps extends NativeToggleProps {
  label: string;
  className?: string;
}

/** Native state owns uncontrolled toggles; controlled callers retain the final say. */
export function nativeToggleBindings({
  checked,
  defaultChecked = false,
  onChange,
  ref,
  ...props
}: NativeToggleProps): Props {
  return {
    ...props,
    type: "checkbox",
    checked: checked ?? defaultChecked,
    ref: (input: HTMLInputElement) => {
      input.defaultChecked = defaultChecked;
      input.checked = checked === undefined ? defaultChecked : unwrap(checked);
      const cleanup = typeof ref === "function" ? ref(input) : undefined;
      let disposed = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const reset = (event: Event) => {
        if (checked === undefined || event.target !== input.form) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (!disposed && !event.defaultPrevented) input.checked = unwrap(checked);
        }, 0);
      };
      // The native form owner may change through the form attribute after mount.
      input.ownerDocument.addEventListener("reset", reset, true);
      return () => {
        disposed = true;
        clearTimeout(timer);
        input.ownerDocument.removeEventListener("reset", reset, true);
        if (typeof cleanup === "function") cleanup();
      };
    },
    onChange: (event: Event) => {
      onChange?.(event);
      if (checked !== undefined)
        (event.currentTarget as HTMLInputElement).checked = unwrap(checked);
    },
  };
}

export const Checkbox = defineComponent<
  CheckboxProps,
  typeof checkboxContract.name,
  (typeof checkboxContract.parts)[number]
>(checkboxContract, ({ label, className, ...props }, context) =>
  context.part(
    "root",
    "label",
    { className },
    context.part("input", "input", nativeToggleBindings(props)),
    context.part("label", "span", null, label),
  ),
);
