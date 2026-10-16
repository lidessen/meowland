import {
  defineComponent,
  h,
  type Child,
  type MaybeSignal,
  type ComponentContract,
  type Props,
} from "meowjsx";
import { Icon } from "../icons/icon";
import { StatusDot, type StatusDotState } from "./status-dot";

export const workCardContract = {
  name: "work-card",
  parts: ["root", "icon", "copy", "title", "status", "statusText", "detail", "action"],
} as const satisfies ComponentContract;

export interface WorkCardProps extends Props {
  title: Child;
  /** What the dot says; the words in `status` stay the source of truth. */
  state?: MaybeSignal<StatusDotState>;
  /** Current status in words, for example "正在推进：校对记录格式". */
  status?: Child;
  /** A quiet extra fact after the status, for example "已关联 1 项成果". */
  detail?: Child;
  icon?: Child;
  /** Label of the open affordance; the whole card is the control. */
  action?: Child;
  className?: string;
}

/** A work reference inside a conversation: one control that opens the work's details. */
export const WorkCard = defineComponent<
  WorkCardProps,
  typeof workCardContract.name,
  (typeof workCardContract.parts)[number]
>(
  workCardContract,
  (
    {
      title,
      state = "unknown",
      status,
      detail,
      icon,
      action = "详情",
      className,
      children,
      ...props
    },
    context,
  ) =>
    context.part(
      "root",
      "button",
      { type: "button", ...props, className },
      context.part("icon", "span", { "aria-hidden": "true" }, icon ?? <Icon name="file-text" />),
      context.part(
        "copy",
        "span",
        null,
        context.part("title", "strong", null, title),
        status !== undefined || detail !== undefined
          ? context.part(
              "status",
              "span",
              null,
              <StatusDot state={state} size={6} />,
              context.part("statusText", "span", { "data-work-card-status": true }, status),
              detail ? context.part("detail", "span", null, detail) : null,
            )
          : null,
        children,
      ),
      context.part("action", "span", null, action, <Icon name="chevron-right" size={14} />),
    ),
);
