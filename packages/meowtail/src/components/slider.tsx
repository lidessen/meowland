import {
  defineComponent,
  unwrap,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";

export const sliderContract = {
  name: "slider",
  parts: ["root", "control", "value"],
} as const satisfies ComponentContract;

export interface SliderProps extends Props {
  /** Accessible name for the native range control. */
  label: string;
  value?: MaybeSignal<number>;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  name?: string;
  id?: string;
  onValueChange?: (value: number) => void;
  onInput?: (event: Event) => void;
  className?: string;
}

function asNumber(value: string, fallback: number): number {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

/** Native range control. The visible figure is the same value assistive technology reads. */
export const Slider = defineComponent<
  SliderProps,
  typeof sliderContract.name,
  (typeof sliderContract.parts)[number]
>(
  sliderContract,
  (
    {
      label,
      value,
      defaultValue,
      min = 0,
      max = 100,
      step = 1,
      disabled,
      name,
      id,
      onValueChange,
      className,
      onInput,
      ...props
    },
    context,
  ) => {
    const initial = value === undefined ? (defaultValue ?? min) : unwrap(value);
    const local = context.signal(initial);
    const current = () => (value === undefined ? local.value : unwrap(value));
    const display = context.signal(String(current()));
    context.effect(() => {
      display.value = String(current());
    });
    const commit = (event: Event) => {
      const input = event.currentTarget as HTMLInputElement;
      const next = asNumber(input.value, current());
      if (value === undefined) local.value = next;
      onValueChange?.(next);
      onInput?.(event);
      if (value !== undefined) input.value = String(unwrap(value));
    };
    return context.part(
      "root",
      "div",
      { className },
      context.part("control", "input", {
        ...props,
        id,
        name,
        type: "range",
        min,
        max,
        step,
        disabled,
        "aria-label": label,
        value: display,
        onInput: commit,
      }),
      context.part(
        "value",
        "output",
        { htmlFor: id, "aria-hidden": id ? undefined : "true" },
        display,
      ),
    );
  },
);
