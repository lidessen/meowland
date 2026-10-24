import { h, type MaybeSignal, type Props, type Context } from "meowjsx";

export interface ProgressProps extends Props {
  /** Accessible name. Spinner remains the wait with no known amount. */
  label: MaybeSignal<string>;
  /** Omit for an indeterminate bar. Finite values are handed to the native progress element. */
  value?: MaybeSignal<number>;
  max?: MaybeSignal<number>;
  className?: Props["className"];
}

/** Native progress: a known amount, or an indeterminate bar when value is omitted. */
export function Progress(
  { label, value, max = 1, className, ref, ...props }: ProgressProps,
  context: Context<typeof Progress>,
) {
  return (
    <div className={className} ref={[context.parts.root, ref]}>
      <progress
        {...props}
        {...(value === undefined ? {} : { value })}
        max={max}
        aria-label={label}
        ref={context.parts.bar}
      />
    </div>
  );
}
Progress.meta = { name: "progress", parts: ["root", "bar"] } as const;
