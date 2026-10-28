import { createContext, h, useContext, type Child, type Context, type Props } from "meowjsx";
import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { entryOptions } from "./entry.options";
import { nestedHeadingLevel } from "./heading-level";

/** Whether an Entry sits directly in an EntryList, which makes it a list item. */
const entryListContext = createContext(false);

export interface EntryListProps extends Props {
  className?: Props["className"];
}

/**
 * A run of content entries, such as posts, notes or releases. Entries are separated by hairlines
 * and sit on the surrounding surface; there is no box around the run.
 */
export function EntryList(
  { className, children, ref, ...props }: EntryListProps,
  context: Context<typeof EntryList>,
) {
  return (
    <ul {...props} className={className} ref={[context.parts.root, ref]}>
      <entryListContext.Provider value={true}>{children}</entryListContext.Provider>
    </ul>
  );
}
EntryList.meta = { name: "entry-list", parts: ["root"] } as const;

export interface EntryProps extends Props, ThemedProps<typeof entryOptions> {
  /** The entry's name; rendered as a heading one level below the surrounding region. */
  title: Child;
  /** Where the entry lives; the title links to it. */
  href?: string;
  /** A short kicker above the title, such as the date or the section. */
  eyebrow?: Child;
  /** One or two sentences that say what the entry is about. */
  description?: Child;
  /** Facts under the description, such as a byline, reading time or tags. */
  meta?: Child;
  className?: Props["className"];
}

/**
 * One summary of a piece of content: an optional kicker, a titled heading that can link to the
 * content, a standfirst and its facts. In an EntryList it is a list item; on its own it is an
 * article. Its heading level follows the surrounding `Page` or `Section`.
 */
export function Entry(
  { title, href, eyebrow, description, meta, className, children, ref, ...props }: EntryProps,
  context: Context<typeof Entry>,
) {
  const Root = useContext(entryListContext) ? "li" : "article";
  const Heading = `h${nestedHeadingLevel()}`;
  return (
    <Root {...props} className={className} ref={[context.parts.root, ref]}>
      {hasSlot(eyebrow) ? <p ref={context.parts.eyebrow}>{eyebrow}</p> : null}
      <Heading ref={context.parts.title}>
        {href === undefined ? (
          title
        ) : (
          <a href={href} ref={context.parts.link}>
            {title}
          </a>
        )}
      </Heading>
      {hasSlot(description) ? <p ref={context.parts.description}>{description}</p> : null}
      {hasSlot(meta) ? <div ref={context.parts.meta}>{meta}</div> : null}
      {children}
    </Root>
  );
}
Entry.meta = {
  name: "entry",
  parts: ["root", "eyebrow", "title", "link", "description", "meta"],
  style: defineStyleProps(entryOptions, { defaults: { size: "default" } }),
} as const;

function hasSlot(value: Child | undefined): boolean {
  return value !== undefined && value !== null && value !== false && value !== "";
}
