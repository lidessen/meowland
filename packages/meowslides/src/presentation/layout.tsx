import { h, type Child, type Context, type Props } from "meowjsx";

export interface PresentationLayoutProps extends Props {
  header?: Child;
  footer?: Child;
  /** Logical column proportions within the fixed presentation canvas. */
  columns?: 1 | 2 | 3 | "single" | "equal" | "wide-start" | "wide-end";
  gap?: "none" | "compact" | "normal" | "relaxed";
}

/** Reserve optional headings and sources before allocating the remaining slide area. */
export function PresentationLayout(
  {
    header,
    footer,
    columns = "single",
    gap = "normal",
    children,
    className,
    ref,
    ...props
  }: PresentationLayoutProps,
  context: Context<typeof PresentationLayout>,
) {
  const parts = context.parts;
  return (
    <div
      {...props}
      ref={[parts.root, ref]}
      className={className}
      data-columns={columns === 1 ? "single" : columns === 2 ? "equal" : columns}
      data-gap={gap}
    >
      {header ? <header ref={parts.header}>{header}</header> : null}
      <div ref={parts.body}>{children}</div>
      {footer ? <footer ref={parts.footer}>{footer}</footer> : null}
    </div>
  );
}

PresentationLayout.meta = {
  name: "presentation-layout",
  parts: ["root", "header", "body", "footer"],
} as const;
