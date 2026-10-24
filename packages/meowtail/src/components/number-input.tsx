import { derived, h, unwrap, type MaybeSignal, type Props, type Context } from "meowjsx";
import { Icon } from "../icons/icon";

export interface NumberInputProps extends Props {
  value?: MaybeSignal<number | undefined>;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  /** Decimal places of a committed value. When omitted, derived from step. */
  precision?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  onValueChange?: (value: number | undefined) => void;
  onChange?: (event: Event) => void;
  onInput?: (event: Event) => void;
  onBlur?: (event: FocusEvent) => void;
  className?: Props["className"];
}

export function numberPrecision(step: number, precision?: number): number {
  if (precision !== undefined) return Math.max(0, Math.floor(precision));
  if (!Number.isFinite(step) || step <= 0) return 0;
  const text = String(step);
  const index = text.indexOf(".");
  return index < 0 ? 0 : text.length - index - 1;
}

export function formatNumber(value: number, precision: number): string {
  if (!Number.isFinite(value)) return "";
  return value.toFixed(precision);
}

export function clampNumber(value: number, min: number, max: number, step: number, origin: number) {
  const lo = Number.isFinite(min) ? min : -Infinity;
  const hi = Number.isFinite(max) ? max : Infinity;
  let next = Math.min(hi, Math.max(lo, value));
  if (Number.isFinite(step) && step > 0 && Number.isFinite(origin)) {
    next = origin + Math.round((next - origin) / step) * step;
    next = Math.min(hi, Math.max(lo, next));
  }
  return next;
}

function parseInput(text: string): number | undefined {
  const trimmed = text.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === "+" || trimmed === ".") return undefined;
  const next = Number(trimmed);
  return Number.isFinite(next) ? next : undefined;
}

/** A number the user can type or step. Clamping and formatting happen on commit. */
export function NumberInput(
  {
    value,
    defaultValue,
    min,
    max,
    step = 1,
    precision,
    disabled,
    readOnly,
    required,
    name,
    id,
    onValueChange,
    className,
    onChange,
    onInput,
    onBlur,
    ...props
  }: NumberInputProps,
  context: Context<typeof NumberInput>,
) {
  const places = numberPrecision(step, precision);
  const lower = min ?? Number.NEGATIVE_INFINITY;
  const upper = max ?? Number.POSITIVE_INFINITY;
  const origin = Number.isFinite(lower) ? lower : 0;
  const local = context.signal<number | undefined>(
    value === undefined ? defaultValue : unwrap(value),
  );
  const current = value !== undefined ? value : local;
  const readValue = () => unwrap(current);
  const editing = context.signal(false);
  const draft = context.signal("");
  const formatted = (next: number | undefined) =>
    next === undefined ? "" : formatNumber(next, places);
  const text = derived(() => (editing.value ? draft.value : formatted(readValue())));
  const assign = (next: number | undefined) => {
    if (value === undefined) local.value = next;
    onValueChange?.(next);
  };
  const commit = (raw: string) => {
    const parsed = parseInput(raw);
    if (parsed === undefined) {
      assign(undefined);
      return undefined;
    }
    const next = clampNumber(parsed, lower, upper, step, origin);
    assign(next);
    return next;
  };
  const nudge = (direction: 1 | -1) => {
    if (disabled || readOnly) return;
    editing.value = false;
    const base =
      readValue() ??
      (direction > 0 ? (Number.isFinite(lower) ? lower : 0) : Number.isFinite(upper) ? upper : 0);
    const next = clampNumber(base + direction * step, lower, upper, step, origin);
    assign(next);
  };
  return (
    <div className={className} ref={[context.parts.root]}>
      {
        <button
          type={"button"}
          disabled={disabled || readOnly}
          tabIndex={-1}
          aria-label={"Decrease"}
          onClick={() => nudge(-1)}
          ref={[context.parts.decrement]}
        >
          {<Icon name="minus" size={16} />}
        </button>
      }
      {
        <input
          {...props}
          id={id}
          name={name}
          type={"text"}
          inputMode={"decimal"}
          autoComplete={"off"}
          role={"spinbutton"}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          value={text}
          aria-valuenow={text}
          aria-valuemin={Number.isFinite(lower) ? lower : undefined}
          aria-valuemax={Number.isFinite(upper) ? upper : undefined}
          onInput={(event: Event) => {
            const input = event.currentTarget as HTMLInputElement;
            editing.value = true;
            draft.value = input.value;
            onInput?.(event);
          }}
          onChange={(event: Event) => {
            onChange?.(event);
          }}
          onBlur={(event: FocusEvent) => {
            const input = event.currentTarget as HTMLInputElement;
            const next = commit(input.value);
            editing.value = false;
            // A controlled owner that stays empty must clear a parsed draft immediately.
            if (value !== undefined && next !== undefined && unwrap(value) === undefined)
              input.value = "";
            onBlur?.(event);
          }}
          onKeyDown={(event: KeyboardEvent) => {
            if (event.isComposing || disabled || readOnly) return;
            if (event.key === "ArrowUp") {
              event.preventDefault();
              nudge(1);
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "Enter") {
              commit((event.currentTarget as HTMLInputElement).value);
              editing.value = false;
            }
          }}
          ref={[context.parts.control, props.ref]}
        />
      }
      {
        <button
          type={"button"}
          disabled={disabled || readOnly}
          tabIndex={-1}
          aria-label={"Increase"}
          onClick={() => nudge(1)}
          ref={[context.parts.increment]}
        >
          {<Icon name="plus" size={16} />}
        </button>
      }
    </div>
  );
}
NumberInput.meta = {
  name: "number-input",
  parts: ["root", "decrement", "control", "increment"],
} as const;
