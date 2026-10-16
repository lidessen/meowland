import {
  defineComponent,
  h,
  type Child,
  type ComponentContract,
  type Props,
} from "meowjsx";
import { Icon } from "../icons/icon";

export const resourceLinkContract = {
  name: "resource-link",
  parts: ["root", "icon", "copy", "title", "detail", "trailing"],
} as const satisfies ComponentContract;

export interface ResourceLinkProps extends Props {
  title: Child;
  /** Where it lives and which version, for example "docs/records · 修订 1". */
  detail?: Child;
  icon?: Child;
  /** Replaces the arrow, for a state the reader should see before opening. */
  trailing?: Child;
  /** A destination renders an anchor; an in-page action renders a button. */
  href?: string;
  className?: string;
}

/** A reference to one thing that can be opened: a file, a message, a record. */
export const ResourceLink = defineComponent<
  ResourceLinkProps,
  typeof resourceLinkContract.name,
  (typeof resourceLinkContract.parts)[number]
>(
  resourceLinkContract,
  ({ title, detail, icon, trailing, href, className, children, ...props }, context) =>
    context.part(
      "root",
      href !== undefined ? "a" : "button",
      {
        ...props,
        ...(href !== undefined ? { href } : { type: props.type ?? "button" }),
        className,
      },
      context.part("icon", "span", { "aria-hidden": "true" }, icon ?? <Icon name="file-text" />),
      context.part(
        "copy",
        "span",
        null,
        context.part("title", "strong", null, title),
        detail !== undefined && detail !== null && detail !== false
          ? context.part("detail", "span", null, detail)
          : null,
        children,
      ),
      context.part(
        "trailing",
        "span",
        { "aria-hidden": "true" },
        trailing ?? <Icon name="arrow-up-right" size={16} />,
      ),
    ),
);
