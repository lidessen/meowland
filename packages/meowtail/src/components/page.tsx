import { defineComponent, h, type Child, type ComponentContract, type Props } from "meowjsx";
import { Container } from "./container";
import { PageHeader } from "./page-header";
import { sectionLevelContext } from "./section";

export const pageContract = {
  name: "page",
  parts: ["root", "header", "eyebrow", "toolbar", "notice", "content"],
} as const satisfies ComponentContract;

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
   * Escape hatch: replaces the eyebrow and the `PageHeader` identity block with
   * host chrome, and needs no `title`. `title`, `description`, `eyebrow` and
   * `actions` are then unused.
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
  className?: string;
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
export const Page = defineComponent<
  PageProps,
  typeof pageContract.name,
  (typeof pageContract.parts)[number]
>(
  pageContract,
  (
    {
      title,
      description,
      eyebrow,
      actions,
      header,
      toolbar,
      notice,
      width = "content",
      className,
      children,
      ...props
    },
    context,
  ) => {
    const identity = hasSlot(header)
      ? context.part("header", "div", null, header)
      : hasSlot(title)
        ? context.part(
            "header",
            "div",
            null,
            hasSlot(eyebrow) ? context.part("eyebrow", "p", null, eyebrow) : null,
            h(PageHeader, { title, description, actions }),
          )
        : null;
    return context.part(
      "root",
      "div",
      { ...props, className },
      h(
        Container,
        { width },
        h(
          sectionLevelContext.Provider,
          { value: 1 },
          identity,
          hasSlot(toolbar) ? context.part("toolbar", "div", null, toolbar) : null,
          hasSlot(notice) ? context.part("notice", "div", null, notice) : null,
          context.part("content", "div", null, children),
        ),
      ),
    );
  },
);
