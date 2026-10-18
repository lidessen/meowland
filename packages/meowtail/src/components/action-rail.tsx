import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const actionRailContract = {
  name: "action-rail",
  parts: ["root", "leading", "trailing", "submit"],
} as const satisfies ComponentContract;

export interface ActionRailProps extends Props {
  /** Actions anchored to the start of the row. */
  leading?: Child;
  /** Selection or secondary actions that stay together before the submit action. */
  trailing?: Child;
  /** The final action; flexible leading and trailing actions wrap to keep it visible. */
  submit?: Child;
  className?: string;
}

/**
 * An action row with wrapping groups. The rail owns order, start/end anchoring, the gap between
 * groups and the rule that the submit action stays visible; callers pass actions.
 */
export const ActionRail = defineComponent<
  ActionRailProps,
  typeof actionRailContract.name,
  (typeof actionRailContract.parts)[number]
>(actionRailContract, ({ leading, trailing, submit, children, className, ...props }, context) => {
  void children;
  return context.part(
    "root",
    "div",
    { ...props, className },
    context.part("leading", "div", null, leading),
    context.part("trailing", "div", null, trailing),
    context.part("submit", "div", null, submit),
  );
});
