import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export interface PresentationLayoutProps extends Props {
  header?: Child;
  footer?: Child;
  /** Logical column proportions within the fixed presentation canvas. */
  columns?: "single" | "equal" | "wide-start" | "wide-end";
  gap?: "none" | "compact" | "normal" | "relaxed";
  className?: string;
}

export const presentationLayoutContract = {
  name: "presentation-layout",
  parts: ["root", "header", "body", "footer"],
} as const satisfies ComponentContract;

/** Reserve optional headings and sources before allocating the remaining slide area. */
export const PresentationLayout = defineComponent<
  PresentationLayoutProps,
  "presentation-layout",
  (typeof presentationLayoutContract.parts)[number]
>(
  presentationLayoutContract,
  (
    { header, footer, columns = "single", gap = "normal", children, className, ...props },
    context,
  ) =>
    context.part(
      "root",
      "div",
      { ...props, className, "data-columns": columns, "data-gap": gap },
      header ? context.part("header", "header", null, header) : null,
      context.part("body", "div", null, children),
      footer ? context.part("footer", "footer", null, footer) : null,
    ),
);
