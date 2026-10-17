import { defineComponent, h, type ComponentContract, type Props } from "meowjsx";
import { Icon } from "../icons/icon";
export type StateDotState = "done" | "warning" | "ongoing" | "error" | "idle";
export const stateDotContract = {
  name: "state-dot",
  parts: ["root", "motion"],
} as const satisfies ComponentContract;
export interface StateDotProps extends Props {
  state: StateDotState;
  appearance?: "dot" | "step";
  size?: number;
  className?: string;
}
/** Decorative state marker; the owner supplies adjacent accessible status text. */
export const StateDot = defineComponent<StateDotProps, "state-dot", "root" | "motion">(
  stateDotContract,
  (
    { state, appearance = "dot", size = state === "ongoing" ? 14 : 10, className, ...props },
    context,
  ) =>
    context.part(
      "root",
      "span",
      {
        ...props,
        className,
        "data-state": state,
        "data-appearance": appearance,
        "aria-hidden": "true",
        style: { width: `${size}px`, height: `${size}px` },
      },
      state === "ongoing" ? (
        context.part(
          "motion",
          "span",
          {
            ref: (element: HTMLElement) => {
              let alive = true;
              queueMicrotask(() => {
                if (alive)
                  for (const animation of element.getAnimations?.() ?? []) animation.startTime = 0;
              });
              return () => {
                alive = false;
              };
            },
          },
          <Icon name="loader-circle" size={size} />,
        )
      ) : appearance === "step" && state === "done" ? (
        <svg viewBox="0 0 12 12" width={size} height={size}>
          <path d="m3 6 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.5" />
        </svg>
      ) : null,
    ),
);
