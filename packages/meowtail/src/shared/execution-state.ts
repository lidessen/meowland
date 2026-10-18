import type { StatusDotState } from "../components/status-dot";

/** Display facts supplied by the host. Completion never implies that a public reply was sent. */
export type ChatExecutionState =
  | "queued"
  | "running"
  | "waiting"
  | "success"
  | "error"
  | "cancelled"
  | "unknown"
  /** Compatibility spelling for a successful tool execution. */
  | "complete";

export function executionStateLabel(state: ChatExecutionState): string {
  switch (state) {
    case "queued":
      return "排队中";
    case "running":
      return "运行中";
    case "waiting":
      return "等待中";
    case "error":
      return "出错";
    case "cancelled":
      return "已取消";
    case "unknown":
      return "结果未确认";
    default:
      return "已完成";
  }
}

export function executionStateTone(state: ChatExecutionState): StatusDotState {
  switch (state) {
    case "queued":
    case "cancelled":
      return "idle";
    case "running":
      return "processing";
    case "waiting":
      return "warning";
    case "error":
      return "danger";
    case "success":
    case "complete":
      return "success";
    default:
      return "unknown";
  }
}
