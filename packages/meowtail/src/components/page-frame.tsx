import { type Child, type Props, type Context, h } from "meowjsx";
import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";

import { pageFrameOptions } from "./page-frame.options";
export { pageFrameOptions } from "./page-frame.options";

export interface PageFrameProps extends Props, ThemedProps<typeof pageFrameOptions> {
  header?: Child;
  toolbar?: Child;
  /** A full-width status or alert row between the header and the body. */
  notice?: Child;
  /** A persistent region after the body, typically a composer or action bar. */
  footer?: Child;
  className?: Props["className"];
}

/**
 * A frame with fixed chrome and a body that takes the remaining space; the parent owns the
 * chrome.
 */
export function PageFrame(
  { header, toolbar, notice, footer, children, className, ...props }: PageFrameProps,
  context: Context<typeof PageFrame>,
) {
  return (
    <section {...props} className={className} ref={[context.parts.root, props.ref]}>
      {toolbar ? <div ref={[context.parts.toolbar]}>{toolbar}</div> : null}
      {header ? <div ref={[context.parts.header]}>{header}</div> : null}
      {notice ? <div ref={[context.parts.notice]}>{notice}</div> : null}
      {<div ref={[context.parts.body]}>{children}</div>}
      {footer ? <div ref={[context.parts.footer]}>{footer}</div> : null}
    </section>
  );
}
PageFrame.meta = {
  name: "page-frame",
  parts: ["root", "toolbar", "header", "notice", "body", "footer"],
  style: defineStyleProps(pageFrameOptions, {
    defaults: { variant: "page", scrollOwner: "content" },
  }),
} as const;
