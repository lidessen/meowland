import { derived, unwrap, type MaybeSignal, type Props, type Context, h } from "meowjsx";

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
  className?: Props["className"];
}

function asNumber(value: string, fallback: number): number {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

/** Native range control. The visible figure is the same value assistive technology reads. */
export function Slider(
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
  }: SliderProps,
  context: Context<typeof Slider>,
) {
  const initial = value === undefined ? (defaultValue ?? min) : unwrap(value);
  const local = context.signal(initial);
  const current = value !== undefined ? value : local;
  const readValue = () => unwrap(current);
  const display = derived(() => String(readValue()));
  const fill = derived(() => {
    const next = readValue();
    const range = max - min;
    const pct = range <= 0 ? 0 : Math.min(100, Math.max(0, ((next - min) / range) * 100));
    return `${pct}%`;
  });
  const commit = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const next = asNumber(input.value, readValue());
    if (value === undefined) local.value = next;
    onValueChange?.(next);
    onInput?.(event);
    if (value !== undefined) input.value = String(unwrap(value));
  };
  return (
    <div className={className} style={{ "--slider-fill": fill }} ref={[context.parts.root]}>
      {
        <input
          {...props}
          id={id}
          name={name}
          type={"range"}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-label={label}
          value={display}
          onInput={commit}
          ref={[context.parts.control, props.ref]}
        />
      }
      {
        <span aria-hidden={"true"} ref={[context.parts.track]}>
          {<span aria-hidden={"true"} ref={[context.parts.thumb]}></span>}
        </span>
      }
      {
        <output htmlFor={id} aria-hidden={id ? undefined : "true"} ref={[context.parts.value]}>
          {display}
        </output>
      }
    </div>
  );
}
Slider.meta = { name: "slider", parts: ["root", "control", "track", "thumb", "value"] } as const;
