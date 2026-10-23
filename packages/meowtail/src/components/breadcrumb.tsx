import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export interface BreadcrumbItem {
  label: Child;
  href?: string;
}
export const breadcrumbContract = {
  name: "breadcrumb",
  parts: ["root", "list", "item", "link", "current", "separator"],
} as const satisfies ComponentContract;
export interface BreadcrumbProps extends Props {
  items: readonly BreadcrumbItem[];
  label?: string;
  className?: string;
}
/** The trail of pages from the top of a site to the current one. */
export const Breadcrumb = defineComponent<
  BreadcrumbProps,
  "breadcrumb",
  "root" | "list" | "item" | "link" | "current" | "separator"
>(breadcrumbContract, ({ items, label = "Current location", className, ...props }, context) =>
  context.part(
    "root",
    "nav",
    { ...props, className, "aria-label": label },
    context.part(
      "list",
      "ol",
      null,
      items.map((item, index) =>
        context.part(
          "item",
          "li",
          null,
          index ? context.part("separator", "span", { "aria-hidden": "true" }, "/") : null,
          index === items.length - 1
            ? context.part("current", "span", { "aria-current": "page" }, item.label)
            : item.href
              ? context.part("link", "a", { href: item.href }, item.label)
              : context.part("current", "span", null, item.label),
        ),
      ),
    ),
  ),
);
