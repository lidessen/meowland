import { type Props, type Context, h } from "meowjsx";
import { derived, unwrap, type MaybeSignal } from "meowjsx/signal";
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
  className?: Props["className"];
}

/** A single choice, using native radio keyboard semantics; tabs remain a separate component. */
export function SegmentedControl(
  {
    id,
    name = id,
    form,
    label,
    value,
    options,
    onValueChange,
    disabled,
    className,
  }: SegmentedControlProps,
  context: Context<typeof SegmentedControl>,
) {
  const inputs = new Map<string, HTMLInputElement>();
  // Form reset and a rejected change flip the native radio before the signal does.
  const reconcile = () => {
    const selected = unwrap(value);
    for (const [key, input] of inputs) input.checked = selected === key;
  };
  return (
    <fieldset
      id={id}
      form={form}
      className={className}
      disabled={disabled}
      ref={[
        context.parts.root,
        (root: HTMLFieldSetElement) => {
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
      ]}
    >
      {<legend ref={[context.parts.legend]}>{label}</legend>}
      {
        <div ref={[context.parts.options]}>
          {options.map((option) => (
            <label title={option.title} ref={[context.parts.option]}>
              {
                <input
                  type={"radio"}
                  name={name}
                  form={form}
                  value={option.value}
                  checked={derived(() => unwrap(value) === option.value)}
                  disabled={option.disabled}
                  onChange={(event: Event) => {
                    if (
                      !unwrap(disabled) &&
                      !option.disabled &&
                      (event.currentTarget as HTMLInputElement).checked &&
                      unwrap(value) !== option.value
                    )
                      onValueChange(option.value);
                    reconcile();
                  }}
                  ref={[
                    context.parts.input,
                    (input: HTMLInputElement) => {
                      inputs.set(option.value, input);
                      reconcile();
                      return () => {
                        inputs.delete(option.value);
                      };
                    },
                  ]}
                />
              }
              {<span ref={[context.parts.label]}>{option.label}</span>}
            </label>
          ))}
        </div>
      }
    </fieldset>
  );
}
SegmentedControl.meta = {
  name: "segmented-control",
  parts: ["root", "legend", "options", "option", "input", "label"],
} as const;
