import {
  isSignal,
  mapSignal,
  unwrap,
  type MaybeSignal,
  type Props,
  type Context,
  h,
} from "meowjsx";

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
  className?: Props["className"];
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
    ref: [
      ref,
      (input: HTMLInputElement) => {
        apply(input);
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
        };
      },
    ],
    onChange: (event: Event) => {
      onChange?.(event);
      const input = event.currentTarget as HTMLInputElement;
      if (checked !== undefined) input.checked = unwrap(checked);
      if (indeterminate !== undefined) input.indeterminate = unwrap(indeterminate);
    },
  };
}

/** A native checkbox with its label, including the mixed state. */
export function Checkbox(
  { label, labelHidden, className, ...props }: CheckboxProps,
  context: Context<typeof Checkbox>,
) {
  const inputProps = nativeToggleBindings(props);
  return (
    <label
      className={className}
      data-label-hidden={labelHidden ? "true" : undefined}
      ref={[context.parts.root]}
    >
      <input {...inputProps} ref={[context.parts.input, inputProps.ref]} />
      <span data-label-hidden={labelHidden ? "true" : undefined} ref={[context.parts.label]}>
        {label}
      </span>
    </label>
  );
}
Checkbox.meta = { name: "checkbox", parts: ["root", "input", "label"] } as const;
