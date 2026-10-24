import { derived, unwrap, type MaybeSignal, type Props, type Context, h } from "meowjsx";

export interface PillProps extends Props {
  active?: MaybeSignal<boolean>;
  className?: Props["className"];
}

/** A capsule fact, or a native button when supplied an action. Selection belongs to its caller. */
export function Pill(
  { active = false, onClick, children, ref, ...props }: PillProps,
  context: Context<typeof Pill>,
) {
  const selected = derived(() => String(unwrap(active)));
  const Element = onClick ? "button" : "span";
  return (
    <Element
      {...props}
      ref={[context.parts.root, ref]}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      data-active={selected}
    >
      {children}
    </Element>
  );
}
Pill.meta = { name: "pill", parts: ["root"] } as const;
