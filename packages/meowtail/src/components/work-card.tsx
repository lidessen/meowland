import { h, type Child, type Context, type Props } from "meowjsx";
import { type MaybeSignal } from "meowjsx/signal";
import { Icon } from "../icons/icon";
import { StatusDot, type StatusDotState } from "./status-dot";

export interface WorkCardProps extends Props {
  title: Child;
  /** What the dot says; the words in `status` stay the source of truth. */
  state?: MaybeSignal<StatusDotState>;
  /** Current status in words, for example "In progress: reviewing the record format". */
  status?: Child;
  /** A quiet extra fact after the status, for example "1 outcome linked". */
  detail?: Child;
  icon?: Child;
  /** Label of the open affordance; the whole card is the control. */
  action?: Child;
  className?: Props["className"];
}

/** A work reference inside a conversation: one control that opens the work's details. */
export function WorkCard(
  {
    title,
    state = "unknown",
    status,
    detail,
    icon,
    action = "Details",
    className,
    children,
    ref,
    ...props
  }: WorkCardProps,
  context: Context<typeof WorkCard>,
) {
  return (
    <button type="button" {...props} className={className} ref={[context.parts.root, ref]}>
      <span aria-hidden="true" ref={context.parts.icon}>
        {icon ?? <Icon name="file-text" />}
      </span>
      <span ref={context.parts.copy}>
        <strong ref={context.parts.title}>{title}</strong>
        {status !== undefined || detail !== undefined ? (
          <span ref={context.parts.status}>
            <StatusDot state={state} size={6} />
            <span data-work-card-status ref={context.parts.statusText}>
              {status}
            </span>
            {detail ? <span ref={context.parts.detail}>{detail}</span> : null}
          </span>
        ) : null}
        {children}
      </span>
      <span ref={context.parts.action}>
        {action}
        <Icon name="chevron-right" size={14} />
      </span>
    </button>
  );
}
WorkCard.meta = {
  name: "work-card",
  parts: ["root", "icon", "copy", "title", "status", "statusText", "detail", "action"],
} as const;
