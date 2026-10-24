import { type Child, type Props, type Context, h } from "meowjsx";

export interface DetailSectionProps extends Props {
  title: Child;
  /** A quiet fact on the heading line, such as a count or a caveat. */
  aside?: Child;
  className?: Props["className"];
}

/**
 * One titled block inside a detail surface (a side panel or a full-screen reader). Blocks are
 * separated by a hairline; the heading is a small label, not a page title.
 */
export function DetailSection(
  { title, aside, className, children, ...props }: DetailSectionProps,
  context: Context<typeof DetailSection>,
) {
  return (
    <section {...props} className={className} ref={[context.parts.root, props.ref]}>
      <div ref={[context.parts.header]}>
        <h3 ref={[context.parts.title]}>{title}</h3>
        {aside !== undefined && aside !== null && aside !== false ? (
          <span ref={[context.parts.aside]}>{aside}</span>
        ) : null}
      </div>
      <div ref={[context.parts.body]}>{children}</div>
    </section>
  );
}
DetailSection.meta = {
  name: "detail-section",
  parts: ["root", "header", "title", "aside", "body"],
} as const;
