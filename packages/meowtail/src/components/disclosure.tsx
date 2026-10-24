import { h, type Child, type MaybeSignal, type Props, type Context } from "meowjsx";
import { Icon } from "../icons/icon";

export interface DisclosureProps extends Props {
  summary: Child;
  open?: MaybeSignal<boolean>;
  onToggle?: (event: Event) => void;
  className?: Props["className"];
  summaryClassName?: Props["className"];
  contentClassName?: Props["className"];
}

/**
 * A section the reader can expand and collapse. Native details owns expansion and keyboard
 * behavior, independently of the theme.
 */
export function Disclosure(
  {
    summary,
    children,
    className,
    summaryClassName,
    contentClassName,
    ref,
    ...props
  }: DisclosureProps,
  context: Context<typeof Disclosure>,
) {
  return (
    <details {...props} className={className} ref={[context.parts.root, ref]}>
      <summary className={summaryClassName} ref={context.parts.summary}>
        <span aria-hidden="true" ref={context.parts.icon}>
          <Icon name="chevron-right" />
        </span>
        {summary}
      </summary>
      <div className={contentClassName} ref={context.parts.content}>
        {children}
      </div>
    </details>
  );
}
Disclosure.meta = { name: "disclosure", parts: ["root", "summary", "icon", "content"] } as const;
