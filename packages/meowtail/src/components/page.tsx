import { h, type Child, type Props, type Context } from "meowjsx";
import { Container } from "./container";
import { PageHeader } from "./page-header";
import { sectionLevelContext } from "./section";

export type PageWidth = "narrow" | "content" | "wide" | "full";

export interface PageProps extends Props {
  /**
   * The page name; `PageHeader` renders it as the h1. Required unless `header`
   * is given: with neither, the page renders no identity block and keeps only
   * its toolbar, notice and content.
   */
  title?: Child;
  /** One line of purpose under the title. Ignored without a title or header. */
  description?: Child;
  /** Optional small label above the title. Ignored without a title or header. */
  eyebrow?: Child;
  /** Page-level actions, placed in the header. Ignored without a title or header. */
  actions?: Child;
  /**
   * A mark before the title, forwarded to `PageHeader`. Ignored without a title
   * or when `header` replaces the identity block. Presence is fixed for the mount.
   */
  leading?: Child;
  /**
   * Escape hatch: replaces the eyebrow and the `PageHeader` identity block with
   * host chrome, and needs no `title`. `title`, `description`, `eyebrow`,
   * `leading` and `actions` are then unused.
   */
  header?: Child;
  /** Optional bar below the header for filters or view controls. */
  toolbar?: Child;
  /** A status row between the header and the content. */
  notice?: Child;
  /**
   * Content width, forwarded to the existing `Container`; default `content`.
   * Fixed for the mount: the width is chosen when the page mounts, so pass a new
   * key or remount to switch widths.
   */
  width?: PageWidth;
  className?: Props["className"];
}

/** True when a slot was given; `false` and `null` mean the slot is omitted. */
function hasSlot(slot: Child): boolean {
  return slot !== undefined && slot !== null && slot !== false;
}

/**
 * A content page inside an existing host region: it arranges the identity block,
 * an optional toolbar and notice, and the page content column. It creates no
 * viewport and owns no scrolling; `PageFrame` stays the frame primitive for
 * shells and dialogs. The identity block needs a `title` or a `header`; without
 * either the page is only its toolbar, notice and content. Slots are fixed for
 * the mount: presence decides whether a region renders, while a Signal passed as
 * slot content still updates its text.
 */
export function Page(
  {
    title,
    description,
    eyebrow,
    actions,
    leading,
    header,
    toolbar,
    notice,
    width = "content",
    className,
    children,
    ...props
  }: PageProps,
  context: Context<typeof Page>,
) {
  const identity = hasSlot(header) ? (
    <div ref={[context.parts.header]}>{header}</div>
  ) : hasSlot(title) ? (
    <div ref={[context.parts.header]}>
      {hasSlot(eyebrow) ? <p ref={[context.parts.eyebrow]}>{eyebrow}</p> : null}
      {h(PageHeader, { title, description, actions, leading })}
    </div>
  ) : null;
  return (
    <div {...props} className={className} ref={[context.parts.root, props.ref]}>
      {h(
        Container,
        { width },
        h(
          sectionLevelContext.Provider,
          { value: 1 },
          identity,
          hasSlot(toolbar) ? <div ref={[context.parts.toolbar]}>{toolbar}</div> : null,
          hasSlot(notice) ? <div ref={[context.parts.notice]}>{notice}</div> : null,
          <div ref={[context.parts.content]}>{children}</div>,
        ),
      )}
    </div>
  );
}
Page.meta = {
  name: "page",
  parts: ["root", "header", "eyebrow", "toolbar", "notice", "content"],
} as const;
