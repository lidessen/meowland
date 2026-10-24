import { h, type Child, type Props, type Context } from "meowjsx";
import { Icon } from "../icons/icon";

export interface ProcessGroupProps extends Props {
  /** The group's name and size, for example "Process · 3 steps". */
  title: Child;
  /**
   * The group's state right after the name: pass the shared state badge, for example
   * `<Status state="success" label="Completed" />`. Plain words still render as a quiet fact.
   */
  status?: Child;
  /** One quiet right-aligned fact, such as the total duration or "2 / 4". Not a row of dots. */
  trailing?: Child;
  open?: boolean;
  className?: Props["className"];
}

/** Collapsible record of what the assistant did; native details owns expansion and keyboard. */
export function ProcessGroup(
  { title, status, trailing, open = false, children, className, ...props }: ProcessGroupProps,
  context: Context<typeof ProcessGroup>,
) {
  return (
    <details {...props} className={className} open={open} ref={[context.parts.root, props.ref]}>
      <summary ref={[context.parts.summary]}>
        <span aria-hidden="true" ref={[context.parts.chevron]}>
          <Icon name="chevron-right" />
        </span>
        <strong ref={[context.parts.title]}>{title}</strong>
        {status ? <span ref={[context.parts.status]}>{status}</span> : null}
        {trailing ? (
          <span aria-hidden="true" ref={[context.parts.trailing]}>
            {trailing}
          </span>
        ) : null}
      </summary>
      <div ref={[context.parts.body]}>{children}</div>
    </details>
  );
}
ProcessGroup.meta = {
  name: "process-group",
  parts: ["root", "summary", "chevron", "title", "status", "trailing", "body"],
} as const;
