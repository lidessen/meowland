import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const pageHeaderContract = {
  name: "page-header",
  parts: ["root", "copy", "title", "description", "actions"],
} as const satisfies ComponentContract;

export interface PageHeaderProps extends Props {
  title: Child;
  description?: Child;
  titleId?: string;
  /** Switches and buttons that act on the whole page. */
  actions?: Child;
  className?: string;
}

/** The title block at the top of a full page: a name, one line of purpose, page-level actions. */
export const PageHeader = defineComponent<
  PageHeaderProps,
  typeof pageHeaderContract.name,
  (typeof pageHeaderContract.parts)[number]
>(pageHeaderContract, ({ title, description, titleId, actions, className, ...props }, context) =>
  context.part(
    "root",
    "header",
    { ...props, className },
    context.part(
      "copy",
      "div",
      null,
      context.part("title", "h1", titleId ? { id: titleId } : null, title),
      description !== undefined && description !== null && description !== false
        ? context.part("description", "p", null, description)
        : null,
    ),
    actions ? context.part("actions", "div", null, actions) : null,
  ),
);
