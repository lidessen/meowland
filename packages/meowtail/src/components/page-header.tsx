import { type Child, type Props, type Context, h } from "meowjsx";

/** True when a slot was given; `false` and `null` mean the slot is omitted. */
function hasSlot(slot: Child | undefined): boolean {
  return slot !== undefined && slot !== null && slot !== false;
}

export interface PageHeaderProps extends Props {
  title: Child;
  description?: Child;
  titleId?: string;
  /**
   * A mark before the title, such as an icon. Presence is fixed for the mount:
   * omitting it, or passing `null` or `false`, keeps the title as a direct child
   * of the copy block.
   */
  leading?: Child;
  /** Switches and buttons that act on the whole page. */
  actions?: Child;
  className?: Props["className"];
}

/** The title block at the top of a full page: a name, one line of purpose, page-level actions. */
export function PageHeader(
  { title, description, titleId, leading, actions, className, ...props }: PageHeaderProps,
  context: Context<typeof PageHeader>,
) {
  const titlePart = (
    <h1 id={titleId ? titleId : undefined} ref={[context.parts.title]}>
      {title}
    </h1>
  );
  return (
    <header {...props} className={className} ref={[context.parts.root, props.ref]}>
      {
        <div ref={[context.parts.copy]}>
          {hasSlot(leading) ? (
            <div ref={[context.parts.heading]}>
              {<div ref={[context.parts.leading]}>{leading}</div>}
              {titlePart}
            </div>
          ) : (
            titlePart
          )}
          {hasSlot(description) ? <p ref={[context.parts.description]}>{description}</p> : null}
        </div>
      }
      {hasSlot(actions) ? <div ref={[context.parts.actions]}>{actions}</div> : null}
    </header>
  );
}
PageHeader.meta = {
  name: "page-header",
  parts: ["root", "copy", "heading", "leading", "title", "description", "actions"],
} as const;
