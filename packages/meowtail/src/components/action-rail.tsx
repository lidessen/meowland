import { h, type Child, type Props, type Context } from "meowjsx";

export interface ActionRailProps extends Props {
  /** Actions anchored to the start of the row. */
  leading?: Child;
  /** Selection or secondary actions that stay together before the submit action. */
  trailing?: Child;
  /** The final action; flexible leading and trailing actions wrap to keep it visible. */
  submit?: Child;
  className?: Props["className"];
}

/**
 * An action row with wrapping groups. The rail owns order, start/end anchoring, the gap between
 * groups and the rule that the submit action stays visible; callers pass actions.
 */
export function ActionRail(
  { leading, trailing, submit, children, className, ref, ...props }: ActionRailProps,
  context: Context<typeof ActionRail>,
) {
  void children;
  return (
    <div {...props} className={className} ref={[context.parts.root, ref]}>
      <div ref={context.parts.leading}>{leading}</div>
      <div ref={context.parts.trailing}>{trailing}</div>
      <div ref={context.parts.submit}>{submit}</div>
    </div>
  );
}
ActionRail.meta = {
  name: "action-rail",
  parts: ["root", "leading", "trailing", "submit"],
} as const;
