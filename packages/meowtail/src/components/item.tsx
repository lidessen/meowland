import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { type Child, type Props, type Context, h } from "meowjsx";

import { itemOptions } from "./item.options";
export { itemOptions } from "./item.options";

export interface ItemProps extends Props, ThemedProps<typeof itemOptions> {
  as?: "div" | "button";
  /**
   * Makes the whole item a link to this destination, overriding `as`. A selected link item is the
   * current destination and carries `aria-current="page"`; routing stays with the host.
   */
  href?: string;
  title: Child;
  description?: Child;
  leading?: Child;
  trailing?: Child;
  meta?: Child;
  selected?: boolean;
  className?: Props["className"];
}

/** A single readable destination. Button and link content must not contain nested controls. */
export function Item(
  {
    as = "div",
    href,
    title,
    description,
    leading,
    trailing,
    meta,
    selected,
    className,
    children,
    ...props
  }: ItemProps,
  context: Context<typeof Item>,
) {
  const Tag = href !== undefined ? "a" : as;
  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      href={href}
      aria-current={href !== undefined && selected ? "page" : undefined}
      {...props}
      className={className}
      data-selected={selected ? "true" : undefined}
      ref={[context.parts.root, props.ref]}
    >
      {leading != null ? <span ref={[context.parts.leading]}>{leading}</span> : null}
      <span ref={[context.parts.content]}>
        {meta != null ? <span ref={[context.parts.meta]}>{meta}</span> : null}
        <span ref={[context.parts.title]}>{title}</span>
        {description != null ? <span ref={[context.parts.description]}>{description}</span> : null}
        {children}
      </span>
      {trailing != null ? <span ref={[context.parts.trailing]}>{trailing}</span> : null}
    </Tag>
  );
}
Item.meta = {
  name: "item",
  parts: ["root", "leading", "content", "meta", "title", "description", "trailing"],
  style: defineStyleProps(itemOptions, { defaults: { size: "medium", variant: "plain" } }),
} as const;
