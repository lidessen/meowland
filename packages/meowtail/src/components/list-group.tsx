import { type Child, type Props, type Context, h } from "meowjsx";

export interface ListGroupProps extends Props {
  className?: Props["className"];
}

/** Rows that read as one set: a single rounded outline with hairlines between the rows. */
export function ListGroup(
  { className, children, ...props }: ListGroupProps,
  context: Context<typeof ListGroup>,
) {
  return (
    <div role="list" {...props} className={className} ref={[context.parts.root, props.ref]}>
      {children}
    </div>
  );
}
ListGroup.meta = { name: "list-group", parts: ["root"] } as const;

export interface ListRowProps extends Props {
  title: Child;
  /** Tags beside the title, such as "CLI" or "Default". */
  tags?: Child;
  description?: Child;
  /** A state in words with its dot; the row's only status. */
  status?: Child;
  actions?: Child;
  /** "accent" is the row the reader should notice first, such as the default. */
  tone?: "default" | "accent";
  /** Open content under the row, such as its editor. Children render here. */
  expanded?: boolean;
  className?: Props["className"];
}

/** One entry in a ListGroup, or alone as a summary. Children open under the row when expanded. */
export function ListRow(
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
  }: ListRowProps,
  context: Context<typeof ListRow>,
) {
  return (
    <div
      role="listitem"
      {...props}
      className={className}
      data-tone={tone}
      data-expanded={expanded ? "true" : undefined}
      ref={[context.parts.root, props.ref]}
    >
      <div ref={[context.parts.line]}>
        <span ref={[context.parts.copy]}>
          <span ref={[context.parts.heading]}>
            <strong ref={[context.parts.title]}>{title}</strong>
            {tags ? <span ref={[context.parts.tags]}>{tags}</span> : null}
          </span>
          {description !== undefined && description !== null && description !== false ? (
            <span ref={[context.parts.description]}>{description}</span>
          ) : null}
        </span>
        {status ? <span ref={[context.parts.status]}>{status}</span> : null}
        {actions ? <span ref={[context.parts.actions]}>{actions}</span> : null}
      </div>
      {expanded && children ? <div ref={[context.parts.panel]}>{children}</div> : null}
    </div>
  );
}
ListRow.meta = {
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
} as const;
