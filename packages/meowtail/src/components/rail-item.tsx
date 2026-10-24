import { type Child, type Props, type Context, h } from "meowjsx";

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
  className?: Props["className"];
}

/** One destination in an IconRail: an icon alone when collapsed, icon and label when expanded. */
export function RailItem(
  { label, icon, current = false, dot, meta, metaTone, href, className, ...props }: RailItemProps,
  context: Context<typeof RailItem>,
) {
  const Tag = href !== undefined ? "a" : "button";
  return (
    <Tag
      {...props}
      {...(href !== undefined ? { href } : { type: props.type ?? "button" })}
      className={className}
      aria-current={current ? "page" : undefined}
      data-dot={dot}
      data-meta-tone={metaTone}
      ref={[context.parts.root, props.ref]}
    >
      <span aria-hidden="true" ref={[context.parts.icon]}>
        {icon}
      </span>
      <span aria-hidden="true" ref={[context.parts.dot]}></span>
      <span ref={[context.parts.label]}>{label}</span>
      {meta !== undefined && meta !== null && meta !== false ? (
        <span ref={[context.parts.meta]}>{meta}</span>
      ) : null}
    </Tag>
  );
}
RailItem.meta = { name: "rail-item", parts: ["root", "icon", "dot", "label", "meta"] } as const;
