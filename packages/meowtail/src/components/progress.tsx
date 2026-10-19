import { defineComponent, type ComponentContract, type MaybeSignal, type Props } from "meowjsx";

export const progressContract = {
  name: "progress",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface ProgressProps extends Props {
  /** Accessible name. Spinner remains the wait with no known amount. */
  label: MaybeSignal<string>;
  /** Omit for an indeterminate bar. Finite values are handed to the native progress element. */
  value?: MaybeSignal<number>;
  max?: MaybeSignal<number>;
  className?: string;
}

/** Native progress: a known amount, or an indeterminate bar when value is omitted. */
export const Progress = defineComponent<
  ProgressProps,
  typeof progressContract.name,
  (typeof progressContract.parts)[number]
>(progressContract, ({ label, value, max = 1, className, ...props }, context) =>
  context.part("root", "progress", {
    ...props,
    className,
    ...(value === undefined ? {} : { value }),
    max,
    "aria-label": label,
  }),
);
