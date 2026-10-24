import { type Child, type Props, type Context, h } from "meowjsx";

export interface BreadcrumbItem {
  label: Child;
  href?: string;
}

export interface BreadcrumbProps extends Props {
  items: readonly BreadcrumbItem[];
  label?: string;
  className?: Props["className"];
}
/** The trail of pages from the top of a site to the current one. */
export function Breadcrumb(
  { items, label = "Current location", className, ...props }: BreadcrumbProps,
  context: Context<typeof Breadcrumb>,
) {
  return (
    <nav {...props} className={className} aria-label={label} ref={[context.parts.root, props.ref]}>
      <ol ref={[context.parts.list]}>
        {items.map((item, index) => (
          <li ref={[context.parts.item]}>
            {index ? (
              <span aria-hidden="true" ref={[context.parts.separator]}>
                {"/"}
              </span>
            ) : null}
            {index === items.length - 1 ? (
              <span aria-current="page" ref={[context.parts.current]}>
                {item.label}
              </span>
            ) : item.href ? (
              <a href={item.href} ref={[context.parts.link]}>
                {item.label}
              </a>
            ) : (
              <span ref={[context.parts.current]}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
Breadcrumb.meta = {
  name: "breadcrumb",
  parts: ["root", "list", "item", "link", "current", "separator"],
} as const;
