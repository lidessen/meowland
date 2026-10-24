import { h, type Child, type Props, type Context } from "meowjsx";
import { derived, unwrap, type MaybeSignal } from "meowjsx/signal";

export interface NavItemProps extends Props {
  label: Child;
  icon?: Child;
  badge?: Child;
  active?: MaybeSignal<boolean>;
  className?: Props["className"];
}

/**
 * One navigation entry: an icon, a label and an optional badge, marked when it is the current
 * location.
 */
export function NavItem(
  { label, icon, badge, active = false, className, ...props }: NavItemProps,
  context: Context<typeof NavItem>,
) {
  const current = derived(() => (unwrap(active) ? "page" : undefined));
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={className}
      aria-current={current}
      ref={[context.parts.root, props.ref]}
    >
      {icon ? <span ref={context.parts.icon}>{icon}</span> : null}
      <span ref={context.parts.label}>{label}</span>
      {badge !== undefined && badge !== null && badge !== false ? (
        <span ref={context.parts.badge}>{badge}</span>
      ) : null}
    </button>
  );
}
NavItem.meta = { name: "nav-item", parts: ["root", "icon", "label", "badge"] } as const;
