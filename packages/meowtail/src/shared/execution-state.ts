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
      return "Queued";
    case "running":
      return "Running";
    case "waiting":
      return "Waiting";
    case "error":
      return "Error";
    case "cancelled":
      return "Canceled";
    case "unknown":
      return "Unconfirmed result";
    default:
      return "Completed";
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
