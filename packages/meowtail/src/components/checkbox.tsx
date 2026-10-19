import {
  defineComponent,
  isSignal,
  mapSignal,
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
  /** Native indeterminate property. Assistive technology reads `aria-checked="mixed"`. */
  indeterminate?: MaybeSignal<boolean>;
  onChange?: (event: Event) => void;
}

export interface CheckboxProps extends NativeToggleProps {
  label: MaybeSignal<string>;
  /** Keep the accessible name while hiding the visible label, for compact tables. */
  labelHidden?: boolean;
  className?: string;
}

function mixedValue(indeterminate: MaybeSignal<boolean> | undefined): boolean {
  return Boolean(indeterminate !== undefined && unwrap(indeterminate));
}

/** Native state owns uncontrolled toggles; controlled callers retain the final say. */
export function nativeToggleBindings({
  checked,
  defaultChecked = false,
  indeterminate,
  onChange,
  ref,
  ...props
}: NativeToggleProps): Props {
  const mixedAttr =
    indeterminate === undefined
      ? undefined
      : isSignal(indeterminate)
        ? mapSignal(indeterminate, (value) => (value ? "mixed" : undefined))
        : unwrap(indeterminate)
          ? "mixed"
          : undefined;
  const apply = (input: HTMLInputElement) => {
    input.defaultChecked = defaultChecked;
    input.checked = checked === undefined ? defaultChecked : unwrap(checked);
    input.indeterminate = mixedValue(indeterminate);
  };
  return {
    ...props,
    type: "checkbox",
    checked: checked !== undefined ? checked : defaultChecked,
    "aria-checked": mixedAttr,
    ref: (input: HTMLInputElement) => {
      apply(input);
      const cleanup = typeof ref === "function" ? ref(input) : undefined;
      let disposed = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const reset = (event: Event) => {
        if (checked === undefined || event.target !== input.form) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (!disposed && !event.defaultPrevented) apply(input);
        }, 0);
      };
      const refresh = () => {
        if (!disposed) apply(input);
      };
      const unsubIndeterminate = isSignal(indeterminate)
        ? indeterminate.subscribe(refresh)
        : undefined;
      const unsubChecked = isSignal(checked) ? checked.subscribe(refresh) : undefined;
      // The native form owner may change through the form attribute after mount.
      input.ownerDocument.addEventListener("reset", reset, true);
      return () => {
        disposed = true;
        clearTimeout(timer);
        unsubIndeterminate?.();
        unsubChecked?.();
        input.ownerDocument.removeEventListener("reset", reset, true);
        if (typeof cleanup === "function") cleanup();
      };
    },
    onChange: (event: Event) => {
      onChange?.(event);
      const input = event.currentTarget as HTMLInputElement;
      if (checked !== undefined) input.checked = unwrap(checked);
      if (indeterminate !== undefined) input.indeterminate = unwrap(indeterminate);
    },
  };
}

export const Checkbox = defineComponent<
  CheckboxProps,
  typeof checkboxContract.name,
  (typeof checkboxContract.parts)[number]
>(checkboxContract, ({ label, labelHidden, className, ...props }, context) =>
  context.part(
    "root",
    "label",
    { className, "data-label-hidden": labelHidden ? "true" : undefined },
    context.part("input", "input", nativeToggleBindings(props)),
    context.part("label", "span", { "data-label-hidden": labelHidden ? "true" : undefined }, label),
  ),
);
