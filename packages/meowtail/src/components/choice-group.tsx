import {
  defineComponent,
  derived,
  unwrap,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";

export interface ChoiceGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const choiceGroupContract = {
  name: "choice-group",
  parts: ["root", "legend", "options", "option", "input", "content", "label", "description"],
} as const satisfies ComponentContract;

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
  className?: string;
}

let nextChoiceGroupId = 0;

/** Visible single choices with native radio keyboard, validation and form semantics. */
export const ChoiceGroup = defineComponent<
  ChoiceGroupProps,
  typeof choiceGroupContract.name,
  (typeof choiceGroupContract.parts)[number]
>(
  choiceGroupContract,
  (
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
    },
    context,
  ) => {
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
    return context.part(
      "root",
      "fieldset",
      { ...props, id, form, disabled, className, ref: rootRef },
      context.part("legend", "legend", { "data-hidden": hideLabel ? "true" : undefined }, label),
      context.part(
        "options",
        "div",
        null,
        ...options.map((option, index) => {
          const checked = derived(() => readValue() === option.value);
          const descriptionId = option.description ? `${id}-description-${index}` : undefined;
          return context.part(
            "option",
            "label",
            null,
            context.part("input", "input", {
              type: "radio",
              name,
              form,
              value: option.value,
              checked,
              disabled: disabled || option.disabled,
              required,
              "aria-describedby": descriptionId,
              ref: (input: HTMLInputElement) => {
                inputs.set(option.value, input);
                input.defaultChecked = defaultValue === option.value;
                input.checked = readValue() === option.value;
              },
              onChange: (event: Event) => {
                const input = event.currentTarget as HTMLInputElement;
                if (disabled || option.disabled || !input.checked) return;
                if (value === undefined) local.value = option.value;
                onValueChange?.(option.value);
                // Native selection happens before change. Controlled callers retain
                // ownership even when they reject the proposed value.
                reconcile();
              },
            }),
            context.part(
              "content",
              "span",
              null,
              context.part("label", "span", null, option.label),
              option.description
                ? context.part("description", "span", { id: descriptionId }, option.description)
                : null,
            ),
          );
        }),
      ),
    );
  },
);
