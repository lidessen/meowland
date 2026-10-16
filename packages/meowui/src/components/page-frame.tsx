import { defineComponent, type Child, type Props } from "meowjsx";
import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";

export const pageFrameOptions = defineOptions("page-frame", {
  variant: ["page", "workspace"],
  scrollOwner: ["content", "layout"],
});

export const pageFrameContract = {
  name: "page-frame",
  parts: ["root", "toolbar", "header", "body"],
  styleProps: defineStyleProps(pageFrameOptions, {
    defaults: { variant: "page", scrollOwner: "content" },
  }),
} as const satisfies StyledComponentContract;

export interface PageFrameProps extends Props, ThemedProps<typeof pageFrameOptions> {
  header?: Child;
  toolbar?: Child;
  className?: string;
}

/** The parent owns page chrome; its body receives only the remaining space. */
export const PageFrame = defineComponent<
  PageFrameProps,
  "page-frame",
  (typeof pageFrameContract.parts)[number]
>(pageFrameContract, ({ header, toolbar, children, className, ...props }, context) =>
  context.part(
    "root",
    "section",
    { ...props, className },
    toolbar ? context.part("toolbar", "div", null, toolbar) : null,
    header ? context.part("header", "div", null, header) : null,
    context.part("body", "div", null, children),
  ),
);
