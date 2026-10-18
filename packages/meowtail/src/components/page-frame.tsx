import { defineComponent, type Child, type Props } from "meowjsx";
import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";

export const pageFrameOptions = defineOptions("page-frame", {
  variant: ["page", "workspace"],
  scrollOwner: ["content", "layout"],
});

export const pageFrameContract = {
  name: "page-frame",
  parts: ["root", "toolbar", "header", "notice", "body", "footer"],
  styleProps: defineStyleProps(pageFrameOptions, {
    defaults: { variant: "page", scrollOwner: "content" },
  }),
} as const satisfies StyledComponentContract;

export interface PageFrameProps extends Props, ThemedProps<typeof pageFrameOptions> {
  header?: Child;
  toolbar?: Child;
  /** A full-width status or alert row between the header and the body. */
  notice?: Child;
  /** A persistent region after the body, typically a composer or action bar. */
  footer?: Child;
  className?: string;
}

/** The parent owns page chrome; its body receives only the remaining space. */
export const PageFrame = defineComponent<
  PageFrameProps,
  "page-frame",
  (typeof pageFrameContract.parts)[number]
>(
  pageFrameContract,
  ({ header, toolbar, notice, footer, children, className, ...props }, context) =>
    context.part(
      "root",
      "section",
      { ...props, className },
      toolbar ? context.part("toolbar", "div", null, toolbar) : null,
      header ? context.part("header", "div", null, header) : null,
      notice ? context.part("notice", "div", null, notice) : null,
      context.part("body", "div", null, children),
      footer ? context.part("footer", "div", null, footer) : null,
    ),
);
