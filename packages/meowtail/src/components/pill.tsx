import {
  defineComponent,
  derived,
  unwrap,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";

export const pillContract = { name: "pill", parts: ["root"] } as const satisfies ComponentContract;
export interface PillProps extends Props {
  active?: MaybeSignal<boolean>;
  className?: string;
}

/** A capsule fact, or a native button when supplied an action. Selection belongs to its caller. */
export const Pill = defineComponent<PillProps, "pill", "root">(
  pillContract,
  ({ active = false, onClick, children, ...props }, context) => {
    const selected = derived(() => String(unwrap(active)));
    return context.part(
      "root",
      onClick ? "button" : "span",
      {
        ...props,
        ...(onClick ? { type: "button", onClick } : {}),
        "data-active": selected,
      },
      children,
    );
  },
);
