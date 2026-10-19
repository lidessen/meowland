import {
  defineComponent,
  h,
  unwrap,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Icon } from "../icons/icon";

export const numberInputContract = {
  name: "number-input",
  parts: ["root", "decrement", "control", "increment"],
} as const satisfies ComponentContract;

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
  className?: string;
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
export const NumberInput = defineComponent<
  NumberInputProps,
  typeof numberInputContract.name,
  (typeof numberInputContract.parts)[number]
>(
  numberInputContract,
  (
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
    },
    context,
  ) => {
    const places = numberPrecision(step, precision);
    const lower = min ?? Number.NEGATIVE_INFINITY;
    const upper = max ?? Number.POSITIVE_INFINITY;
    const origin = Number.isFinite(lower) ? lower : 0;
    const local = context.signal<number | undefined>(
      value === undefined ? defaultValue : unwrap(value),
    );
    const current = () => (value === undefined ? local.value : unwrap(value));
    const text = context.signal(
      current() === undefined ? "" : formatNumber(current() as number, places),
    );
    let editing = false;
    context.effect(() => {
      if (editing) return;
      const next = current();
      text.value = next === undefined ? "" : formatNumber(next, places);
    });
    const assign = (next: number | undefined) => {
      if (value === undefined) local.value = next;
      onValueChange?.(next);
    };
    const commit = (raw: string) => {
      const parsed = parseInput(raw);
      if (parsed === undefined) {
        assign(undefined);
        text.value = "";
        return undefined;
      }
      const next = clampNumber(parsed, lower, upper, step, origin);
      assign(next);
      text.value = formatNumber(next, places);
      return next;
    };
    const nudge = (direction: 1 | -1) => {
      if (disabled || readOnly) return;
      const base =
        current() ??
        (direction > 0 ? (Number.isFinite(lower) ? lower : 0) : Number.isFinite(upper) ? upper : 0);
      const next = clampNumber(base + direction * step, lower, upper, step, origin);
      assign(next);
      text.value = formatNumber(next, places);
    };
    return context.part(
      "root",
      "div",
      { className },
      context.part(
        "decrement",
        "button",
        {
          type: "button",
          disabled: disabled || readOnly,
          tabIndex: -1,
          "aria-label": "Decrease",
          onClick: () => nudge(-1),
        },
        <Icon name="minus" />,
      ),
      context.part("control", "input", {
        ...props,
        id,
        name,
        type: "text",
        inputMode: "decimal",
        autoComplete: "off",
        role: "spinbutton",
        disabled,
        readOnly,
        required,
        value: text,
        "aria-valuenow": text,
        "aria-valuemin": Number.isFinite(lower) ? lower : undefined,
        "aria-valuemax": Number.isFinite(upper) ? upper : undefined,
        onInput: (event: Event) => {
          editing = true;
          const input = event.currentTarget as HTMLInputElement;
          text.value = input.value;
          onInput?.(event);
        },
        onChange: (event: Event) => {
          onChange?.(event);
        },
        onBlur: (event: FocusEvent) => {
          editing = false;
          const input = event.currentTarget as HTMLInputElement;
          const next = commit(input.value);
          if (value !== undefined) {
            const controlled = unwrap(value);
            text.value = controlled === undefined ? "" : formatNumber(controlled, places);
            if (next !== undefined && controlled === undefined) input.value = text.value;
          }
          onBlur?.(event);
        },
        onKeyDown: (event: KeyboardEvent) => {
          if (event.isComposing || disabled || readOnly) return;
          if (event.key === "ArrowUp") {
            event.preventDefault();
            nudge(1);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            nudge(-1);
          } else if (event.key === "Enter") {
            commit((event.currentTarget as HTMLInputElement).value);
          }
        },
      }),
      context.part(
        "increment",
        "button",
        {
          type: "button",
          disabled: disabled || readOnly,
          tabIndex: -1,
          "aria-label": "Increase",
          onClick: () => nudge(1),
        },
        <Icon name="plus" />,
      ),
    );
  },
);
