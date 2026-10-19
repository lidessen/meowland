import {
  defineComponent,
  mapSignal,
  unwrap,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";

export const sliderContract = {
  name: "slider",
  parts: ["root", "control", "track", "thumb", "value"],
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
    const fill = context.signal("0%");
    context.effect(() => {
      const next = current();
      display.value = String(next);
      const range = max - min;
      const pct = range <= 0 ? 0 : Math.min(100, Math.max(0, ((next - min) / range) * 100));
      fill.value = `${pct}%`;
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
      {
        className,
        style: mapSignal(fill, (amount) => ({ "--slider-fill": amount })),
      },
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
        "track",
        "span",
        { "aria-hidden": "true" },
        context.part("thumb", "span", { "aria-hidden": "true" }),
      ),
      context.part(
        "value",
        "output",
        { htmlFor: id, "aria-hidden": id ? undefined : "true" },
        display,
      ),
    );
  },
);
