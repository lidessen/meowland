import {
  defineComponent,
  derived,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";

export const navItemContract = {
  name: "nav-item",
  parts: ["root", "icon", "label", "badge"],
} as const satisfies ComponentContract;

export interface NavItemProps extends Props {
  label: Child;
  icon?: Child;
  badge?: Child;
  active?: MaybeSignal<boolean>;
  className?: string;
}

export const NavItem = defineComponent<
  NavItemProps,
  typeof navItemContract.name,
  (typeof navItemContract.parts)[number]
>(navItemContract, ({ label, icon, badge, active = false, className, ...props }, context) => {
  const current = derived(() => (unwrap(active) ? "page" : undefined));
  return context.part(
    "root",
    "button",
    {
      ...props,
      type: props.type ?? "button",
      className,
      "aria-current": current,
    },
    icon ? context.part("icon", "span", null, icon) : null,
    context.part("label", "span", null, label),
    badge !== undefined && badge !== null && badge !== false
      ? context.part("badge", "span", null, badge)
      : null,
  );
});
