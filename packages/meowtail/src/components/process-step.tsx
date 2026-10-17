import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const processStepContract = {
  name: "process-step",
  parts: ["root", "icon", "label", "meta"],
} as const satisfies ComponentContract;

export interface ProcessStepProps extends Props {
  icon?: Child;
  /** Duration, count or other quiet fact at the row's end. */
  meta?: Child;
  className?: string;
}

/** One row of a ProcessGroup: icon, a single truncated line, a quiet fact. */
export const ProcessStep = defineComponent<
  ProcessStepProps,
  typeof processStepContract.name,
  (typeof processStepContract.parts)[number]
>(processStepContract, ({ icon, meta, children, className, ...props }, context) =>
  context.part(
    "root",
    "div",
    { ...props, className },
    context.part("icon", "span", { "aria-hidden": "true" }, icon),
    context.part("label", "span", null, children),
    meta ? context.part("meta", "span", null, meta) : null,
  ),
);
