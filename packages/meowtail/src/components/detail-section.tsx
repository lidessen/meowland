import { type Child, type Props, type Context, h } from "meowjsx";
import { nestedHeadingLevel, sectionLevelContext } from "./heading-level";

export interface DetailSectionProps extends Props {
  title: Child;
  /** A quiet fact on the heading line, such as a count or a caveat. */
  aside?: Child;
  className?: Props["className"];
}

/**
 * One titled block inside a detail surface (a side panel or a full-screen reader). Blocks are
 * separated by a hairline; the heading is a small label, not a page title. Its level sits one
 * below the surrounding `Page` or `Section` heading, and nested sections continue from it.
 */
export function DetailSection(
  { title, aside, className, children, ...props }: DetailSectionProps,
  context: Context<typeof DetailSection>,
) {
  const level = nestedHeadingLevel();
  const Heading = `h${level}`;
  return (
    <section {...props} className={className} ref={[context.parts.root, props.ref]}>
      <div ref={[context.parts.header]}>
        <Heading ref={[context.parts.title]}>{title}</Heading>
        {aside !== undefined && aside !== null && aside !== false ? (
          <span ref={[context.parts.aside]}>{aside}</span>
        ) : null}
      </div>
      <div ref={[context.parts.body]}>
        <sectionLevelContext.Provider value={level}>{children}</sectionLevelContext.Provider>
      </div>
    </section>
  );
}
DetailSection.meta = {
  name: "detail-section",
  parts: ["root", "header", "title", "aside", "body"],
} as const;
