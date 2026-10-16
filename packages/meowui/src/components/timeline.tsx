import {
  defineComponent,
  h,
  type Child,
  type ComponentContract,
  type Props,
} from "meowjsx";
import { StatusDot, type StatusDotState } from "./status-dot";

export const timelineContract = {
  name: "timeline",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface TimelineProps extends Props {
  className?: string;
}

/** An ordered run of events that share one vertical line, newest or most active first. */
export const Timeline = defineComponent<
  TimelineProps,
  typeof timelineContract.name,
  (typeof timelineContract.parts)[number]
>(timelineContract, ({ className, children, ...props }, context) =>
  context.part("root", "ol", { ...props, className }, children),
);

export const timelineItemContract = {
  name: "timeline-item",
  parts: ["root", "marker", "content", "head", "title", "state", "description", "actions"],
} as const satisfies ComponentContract;

export interface TimelineItemProps extends Props {
  title: Child;
  /** What the marker says; `stateLabel` stays the source of truth. */
  state?: StatusDotState;
  stateLabel?: Child;
  description?: Child;
  /** Controls that belong to this event, for example opening its log. */
  actions?: Child;
  className?: string;
}

export const TimelineItem = defineComponent<
  TimelineItemProps,
  typeof timelineItemContract.name,
  (typeof timelineItemContract.parts)[number]
>(
  timelineItemContract,
  (
    { title, state = "unknown", stateLabel, description, actions, className, children, ...props },
    context,
  ) =>
    context.part(
      "root",
      "li",
      { ...props, className, "data-state": state },
      context.part(
        "marker",
        "span",
        { "aria-hidden": "true" },
        <StatusDot state={state} size={10} halo={state === "processing"} />,
      ),
      context.part(
        "content",
        "div",
        null,
        context.part(
          "head",
          "div",
          null,
          context.part("title", "strong", null, title),
          stateLabel !== undefined && stateLabel !== null && stateLabel !== false
            ? context.part("state", "span", null, stateLabel)
            : null,
        ),
        description !== undefined && description !== null && description !== false
          ? context.part("description", "p", null, description)
          : null,
        children,
        actions ? context.part("actions", "div", null, actions) : null,
      ),
    ),
);
