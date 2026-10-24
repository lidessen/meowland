import { h, type Child, type Props, type Context } from "meowjsx";
import { PageFrame } from "./page-frame";

export interface DialogPanelProps extends Props {
  as?: "div" | "form";
  header?: Child;
  className?: Props["className"];
}

/** The body of a dialog, with an optional header that stays in place while the body scrolls. */
export function DialogPanel(
  { as = "div", header, className, children, ref, ...props }: DialogPanelProps,
  context: Context<typeof DialogPanel>,
) {
  const Panel = as;
  return (
    <Panel {...props} className={className} ref={[context.parts.root, ref]}>
      {h(PageFrame, { variant: "workspace", scrollOwner: "layout", header }, children)}
    </Panel>
  );
}
DialogPanel.meta = { name: "dialog-panel", parts: ["root"] } as const;
