import { h, type Child, type Props, type Context } from "meowjsx";
import { Icon } from "../icons/icon";

export interface ResourceLinkProps extends Props {
  title: Child;
  /** Where it lives and which version, for example "docs/records · Revision 1". */
  detail?: Child;
  icon?: Child;
  /** Replaces the arrow, for a state the reader should see before opening. */
  trailing?: Child;
  /** A destination renders an anchor; an in-page action renders a button. */
  href?: string;
  className?: Props["className"];
}

/** A reference to one thing that can be opened: a file, a message, a record. */
export function ResourceLink(
  { title, detail, icon, trailing, href, className, children, ref, ...props }: ResourceLinkProps,
  context: Context<typeof ResourceLink>,
) {
  const Element = href !== undefined ? "a" : "button";
  return (
    <Element
      {...props}
      href={href}
      type={href === undefined ? (props.type ?? "button") : undefined}
      className={className}
      ref={[context.parts.root, ref]}
    >
      <span aria-hidden="true" ref={context.parts.icon}>
        {icon ?? <Icon name="file-text" />}
      </span>
      <span ref={context.parts.copy}>
        <strong ref={context.parts.title}>{title}</strong>
        {detail !== undefined && detail !== null && detail !== false ? (
          <span ref={context.parts.detail}>{detail}</span>
        ) : null}
        {children}
      </span>
      <span aria-hidden="true" ref={context.parts.trailing}>
        {trailing ?? <Icon name="arrow-up-right" size={16} />}
      </span>
    </Element>
  );
}
ResourceLink.meta = {
  name: "resource-link",
  parts: ["root", "icon", "copy", "title", "detail", "trailing"],
} as const;
