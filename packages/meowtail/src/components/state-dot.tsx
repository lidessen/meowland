import { h, type Props, type Context } from "meowjsx";
import { Icon } from "../icons/icon";
export type StateDotState = "done" | "warning" | "ongoing" | "error" | "idle";

export interface StateDotProps extends Props {
  state: StateDotState;
  appearance?: "dot" | "step";
  size?: number;
  className?: Props["className"];
}
/**
 * A small dot that marks a state beside its text. It is decorative: the owner supplies the
 * adjacent accessible status text.
 */
export function StateDot(
  {
    state,
    appearance = "dot",
    size = state === "ongoing" ? 14 : 10,
    className,
    ...props
  }: StateDotProps,
  context: Context<typeof StateDot>,
) {
  return (
    <span
      {...props}
      className={className}
      data-state={state}
      data-appearance={appearance}
      aria-hidden={"true"}
      style={{ width: `${size}px`, height: `${size}px` }}
      ref={[context.parts.root, props.ref]}
    >
      {state === "ongoing" ? (
        <span
          ref={[
            context.parts.motion,
            (element: HTMLElement) => {
              let alive = true;
              queueMicrotask(() => {
                if (alive)
                  for (const animation of element.getAnimations?.() ?? []) animation.startTime = 0;
              });
              return () => {
                alive = false;
              };
            },
          ]}
        >
          {<Icon name="loader-circle" size={size} />}
        </span>
      ) : appearance === "step" && state === "done" ? (
        <svg viewBox="0 0 12 12" width={size} height={size}>
          <path d="m3 6 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.5" />
        </svg>
      ) : null}
    </span>
  );
}
StateDot.meta = { name: "state-dot", parts: ["root", "motion"] } as const;
