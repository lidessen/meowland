import { type Props, type Context, h } from "meowjsx";
import { derived, unwrap, type MaybeSignal } from "meowjsx/signal";

export interface PillProps extends Props {
  active?: MaybeSignal<boolean>;
  className?: Props["className"];
}

/** A toggle or filter chip when supplied an action; the caller owns its active state. */
export function Pill(
  { active = false, onClick, children, ref, ...props }: PillProps,
  context: Context<typeof Pill>,
) {
  const selected = derived(() => (unwrap(active) ? "active" : "inactive"));
  const Element = onClick ? "button" : "span";
  return (
    <Element
      {...props}
      ref={[context.parts.root, ref]}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      data-state={selected}
    >
      {children}
    </Element>
  );
}
Pill.meta = { name: "pill", parts: ["root"] } as const;
