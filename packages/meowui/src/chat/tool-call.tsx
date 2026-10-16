import { defineComponent, h, type Child, type ComponentContract, type Props } from "meowjsx";
import { Icon } from "../icons/icon";

export const chatToolCallContract = {
  name: "chat-tool-call",
  parts: ["root", "header", "icon", "label", "summary", "status", "chevron", "detail", "body"],
} as const satisfies ComponentContract;

export type ChatToolCallState = "running" | "complete" | "waiting" | "error" | "unknown";

export interface ChatToolCallProps extends Props {
  label: string;
  /** Short target or action summary, visible while collapsed. */
  summary?: string;
  state?: ChatToolCallState;
  statusLabel?: string;
  detail?: Child;
  icon?: Child;
  /** Reveals this row's own body in place. */
  collapsible?: boolean;
  /** Runs the host's own action instead of revealing a body; the row keeps the row chrome. */
  onActivate?: () => void;
  className?: string;
}

export const ChatToolCall = defineComponent<
  ChatToolCallProps,
  typeof chatToolCallContract.name,
  (typeof chatToolCallContract.parts)[number]
>(
  chatToolCallContract,
  (
    {
      children,
      label,
      summary,
      state = "complete",
      statusLabel,
      detail,
      icon,
      collapsible = false,
      onActivate,
      className,
      ...props
    },
    context,
  ) => {
    const status = statusLabel ?? stateLabel(state);
    // A completed row already shows its outcome in the leading glyph, so a status the caller
    // did not spell out stays out of the reading column; it remains as the row's description.
    const quietStatus = state === "complete" && !statusLabel;
    // An activating row is an action of its own, so it never reveals a body: one interactive
    // header, the same chrome, and the host decides what the action is.
    const reveals = collapsible && onActivate === undefined;
    const interactive = reveals || onActivate !== undefined;
    return context.part(
      "root",
      reveals ? "details" : "div",
      {
        ...props,
        className,
        "data-tool-state": state,
        "data-tool-default-complete": quietStatus ? "true" : undefined,
        "data-tool-interactive": interactive ? "true" : undefined,
        "data-tool-collapsible": reveals ? "true" : undefined,
      },
      context.part(
        "header",
        onActivate !== undefined ? "button" : reveals ? "summary" : "div",
        onActivate !== undefined ? { type: "button", onClick: onActivate } : null,
        context.part("icon", "span", { "aria-hidden": "true" }, icon ?? <Icon name="wrench" />),
        context.part("label", "strong", null, label),
        summary ? context.part("summary", "span", { title: summary }, summary) : null,
        context.part("status", "span", null, status),
        interactive
          ? context.part(
              "chevron",
              "span",
              { "aria-hidden": "true" },
              <Icon name="chevron-right" />,
            )
          : null,
      ),
      detail ? context.part("detail", "p", null, detail) : null,
      children ? context.part("body", "div", null, children) : null,
    );
  },
);

function stateLabel(state: ChatToolCallState): string {
  switch (state) {
    case "running":
      return "运行中";
    case "waiting":
      return "等待中";
    case "error":
      return "出错";
    case "unknown":
      return "结果未确认";
    default:
      return "已完成";
  }
}
