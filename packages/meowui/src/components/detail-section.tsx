import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const detailSectionContract = {
  name: "detail-section",
  parts: ["root", "header", "title", "aside", "body"],
} as const satisfies ComponentContract;

export interface DetailSectionProps extends Props {
  title: Child;
  /** A quiet fact on the heading line, such as a count or a caveat. */
  aside?: Child;
  className?: string;
}

/**
 * One titled block inside a detail surface (a side panel or a full-screen reader). Blocks are
 * separated by a hairline; the heading is a small label, not a page title.
 */
export const DetailSection = defineComponent<
  DetailSectionProps,
  typeof detailSectionContract.name,
  (typeof detailSectionContract.parts)[number]
>(detailSectionContract, ({ title, aside, className, children, ...props }, context) =>
  context.part(
    "root",
    "section",
    { ...props, className },
    context.part(
      "header",
      "div",
      null,
      context.part("title", "h3", null, title),
      aside !== undefined && aside !== null && aside !== false
        ? context.part("aside", "span", null, aside)
        : null,
    ),
    context.part("body", "div", null, children),
  ),
);
