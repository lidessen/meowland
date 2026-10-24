import { derived, unwrap, type MaybeSignal, type Props, type Context, h } from "meowjsx";

export interface ChoiceGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ChoiceGroupProps extends Props {
  /** Options are fixed for the mount. */
  options: readonly ChoiceGroupOption[];
  label: string;
  hideLabel?: boolean;
  id?: string;
  name?: string;
  form?: string;
  value?: MaybeSignal<string>;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: Props["className"];
}

let nextChoiceGroupId = 0;

/** Visible single choices with native radio keyboard, validation and form semantics. */
export function ChoiceGroup(
  {
    options,
    label,
    hideLabel = false,
    id = `choice-group-${++nextChoiceGroupId}`,
    name = id,
    form,
    value,
    defaultValue = "",
    onValueChange,
    disabled = false,
    required = false,
    className,
    ...props
  }: ChoiceGroupProps,
  context: Context<typeof ChoiceGroup>,
) {
  const local = context.signal(defaultValue);
  const current = value !== undefined ? value : local;
  const readValue = () => unwrap(current);
  const inputs = new Map<string, HTMLInputElement>();
  let disposed = false;
  // A rejected change and form reset flip the native radio before the owner signal does.
  const reconcile = () => {
    const selected = readValue();
    for (const [optionValue, input] of inputs) input.checked = selected === optionValue;
  };
  context.onCleanup(() => {
    disposed = true;
  });
  const rootRef = (root: HTMLFieldSetElement) => {
    queueMicrotask(() => {
      if (disposed || !root.isConnected) return;
      const owner = root.form;
      if (!owner) return;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const reset = (event: Event) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (disposed || event.defaultPrevented) return;
          if (value === undefined) local.value = defaultValue;
          reconcile();
        }, 0);
      };
      owner.addEventListener("reset", reset);
      context.onCleanup(() => {
        clearTimeout(timer);
        owner.removeEventListener("reset", reset);
      });
    });
  };
  return (
    <fieldset
      {...props}
      id={id}
      form={form}
      disabled={disabled}
      className={className}
      ref={[context.parts.root, props.ref, rootRef]}
    >
      {
        <legend data-hidden={hideLabel ? "true" : undefined} ref={[context.parts.legend]}>
          {label}
        </legend>
      }
      {
        <div ref={[context.parts.options]}>
          {options.map((option, index) => {
            const checked = derived(() => readValue() === option.value);
            const descriptionId = option.description ? `${id}-description-${index}` : undefined;
            return (
              <label ref={[context.parts.option]}>
                {
                  <input
                    type={"radio"}
                    name={name}
                    form={form}
                    value={option.value}
                    checked={checked}
                    disabled={disabled || option.disabled}
                    required={required}
                    aria-describedby={descriptionId}
                    onChange={(event: Event) => {
                      const input = event.currentTarget as HTMLInputElement;
                      if (disabled || option.disabled || !input.checked) return;
                      if (value === undefined) local.value = option.value;
                      onValueChange?.(option.value);
                      // Native selection happens before change. Controlled callers retain
                      // ownership even when they reject the proposed value.
                      reconcile();
                    }}
                    ref={[
                      context.parts.input,
                      (input: HTMLInputElement) => {
                        inputs.set(option.value, input);
                        input.defaultChecked = defaultValue === option.value;
                        input.checked = readValue() === option.value;
                      },
                    ]}
                  />
                }
                {
                  <span ref={[context.parts.content]}>
                    {<span ref={[context.parts.label]}>{option.label}</span>}
                    {option.description ? (
                      <span id={descriptionId} ref={[context.parts.description]}>
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                }
              </label>
            );
          })}
        </div>
      }
    </fieldset>
  );
}
ChoiceGroup.meta = {
  name: "choice-group",
  parts: ["root", "legend", "options", "option", "input", "content", "label", "description"],
} as const;
