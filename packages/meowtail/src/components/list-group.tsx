import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const listGroupContract = {
  name: "list-group",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface ListGroupProps extends Props {
  className?: string;
}

/** Rows that read as one set: a single rounded outline with hairlines between the rows. */
export const ListGroup = defineComponent<
  ListGroupProps,
  typeof listGroupContract.name,
  (typeof listGroupContract.parts)[number]
>(listGroupContract, ({ className, children, ...props }, context) =>
  context.part("root", "div", { role: "list", ...props, className }, children),
);

export const listRowContract = {
  name: "list-row",
  parts: [
    "root",
    "line",
    "copy",
    "heading",
    "title",
    "tags",
    "description",
    "status",
    "actions",
    "panel",
  ],
} as const satisfies ComponentContract;

export interface ListRowProps extends Props {
  title: Child;
  /** Tags beside the title, such as "CLI" or "默认". */
  tags?: Child;
  description?: Child;
  /** A state in words with its dot; the row's only status. */
  status?: Child;
  actions?: Child;
  /** "accent" is the row the reader should notice first, such as the default. */
  tone?: "default" | "accent";
  /** Open content under the row, such as its editor. Children render here. */
  expanded?: boolean;
  className?: string;
}

/** One entry in a ListGroup, or alone as a summary. Children open under the row when expanded. */
export const ListRow = defineComponent<
  ListRowProps,
  typeof listRowContract.name,
  (typeof listRowContract.parts)[number]
>(
  listRowContract,
  (
    {
      title,
      tags,
      description,
      status,
      actions,
      tone = "default",
      expanded = false,
      className,
      children,
      ...props
    },
    context,
  ) =>
    context.part(
      "root",
      "div",
      {
        role: "listitem",
        ...props,
        className,
        "data-tone": tone,
        "data-expanded": expanded ? "true" : undefined,
      },
      context.part(
        "line",
        "div",
        null,
        context.part(
          "copy",
          "span",
          null,
          context.part(
            "heading",
            "span",
            null,
            context.part("title", "strong", null, title),
            tags ? context.part("tags", "span", null, tags) : null,
          ),
          description !== undefined && description !== null && description !== false
            ? context.part("description", "span", null, description)
            : null,
        ),
        status ? context.part("status", "span", null, status) : null,
        actions ? context.part("actions", "span", null, actions) : null,
      ),
      expanded && children ? context.part("panel", "div", null, children) : null,
    ),
);
