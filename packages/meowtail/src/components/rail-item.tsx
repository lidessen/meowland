import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const railItemContract = {
  name: "rail-item",
  parts: ["root", "icon", "dot", "label", "meta"],
} as const satisfies ComponentContract;

export interface RailItemProps extends Props {
  label: Child;
  icon: Child;
  /** The current location. Sets aria-current; the accent mark and fill follow it. */
  current?: boolean;
  /**
   * Quiet marker on the icon, visible while the rail is collapsed. It is the `data-dot`
   * attribute on the item, so a host can set or clear it at runtime without re-rendering.
   */
  dot?: "warning" | "accent";
  /** Text or count at the end, visible while the rail is expanded: a count, "In progress". */
  meta?: Child;
  /** "accent" marks activity happening now, such as "In progress"; otherwise the meta is a quiet fact. */
  metaTone?: "accent";
  /** A route renders an anchor; an action renders a button. */
  href?: string;
  className?: string;
}

/** One destination in an IconRail: an icon alone when collapsed, icon and label when expanded. */
export const RailItem = defineComponent<
  RailItemProps,
  typeof railItemContract.name,
  (typeof railItemContract.parts)[number]
>(
  railItemContract,
  ({ label, icon, current = false, dot, meta, metaTone, href, className, ...props }, context) =>
    context.part(
      "root",
      href !== undefined ? "a" : "button",
      {
        ...props,
        ...(href !== undefined ? { href } : { type: props.type ?? "button" }),
        className,
        "aria-current": current ? "page" : undefined,
        "data-dot": dot,
        "data-meta-tone": metaTone,
      },
      context.part("icon", "span", { "aria-hidden": "true" }, icon),
      context.part("dot", "span", { "aria-hidden": "true" }),
      context.part("label", "span", null, label),
      meta !== undefined && meta !== null && meta !== false
        ? context.part("meta", "span", null, meta)
        : null,
    ),
);
