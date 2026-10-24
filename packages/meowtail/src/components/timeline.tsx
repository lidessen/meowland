import { h, type Child, type Context, type Props } from "meowjsx";
import { StatusDot, type StatusDotState } from "./status-dot";

export interface TimelineProps extends Props {
  className?: Props["className"];
}

/** An ordered run of events that share one vertical line, newest or most active first. */
export function Timeline(
  { className, children, ref, ...props }: TimelineProps,
  context: Context<typeof Timeline>,
) {
  return (
    <ol {...props} className={className} ref={[context.parts.root, ref]}>
      {children}
    </ol>
  );
}
Timeline.meta = { name: "timeline", parts: ["root"] } as const;

export interface TimelineItemProps extends Props {
  title: Child;
  /** What the marker says; `stateLabel` stays the source of truth. */
  state?: StatusDotState;
  stateLabel?: Child;
  description?: Child;
  /** Controls that belong to this event, for example opening its log. */
  actions?: Child;
  className?: Props["className"];
}

/** One event on a Timeline: a marker, a title, its state and optional details. */
export function TimelineItem(
  {
    title,
    state = "unknown",
    stateLabel,
    description,
    actions,
    className,
    children,
    ref,
    ...props
  }: TimelineItemProps,
  context: Context<typeof TimelineItem>,
) {
  return (
    <li {...props} className={className} data-state={state} ref={[context.parts.root, ref]}>
      <span aria-hidden="true" ref={context.parts.marker}>
        <StatusDot state={state} size={10} halo={state === "processing"} />
      </span>
      <div ref={context.parts.content}>
        <div ref={context.parts.head}>
          <strong ref={context.parts.title}>{title}</strong>
          {stateLabel !== undefined && stateLabel !== null && stateLabel !== false ? (
            <span ref={context.parts.state}>{stateLabel}</span>
          ) : null}
        </div>
        {description !== undefined && description !== null && description !== false ? (
          <p ref={context.parts.description}>{description}</p>
        ) : null}
        {children}
        {actions ? <div ref={context.parts.actions}>{actions}</div> : null}
      </div>
    </li>
  );
}
TimelineItem.meta = {
  name: "timeline-item",
  parts: ["root", "marker", "content", "head", "title", "state", "description", "actions"],
} as const;
