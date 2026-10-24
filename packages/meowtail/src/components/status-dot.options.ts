import { defineOptions } from "meowcss";

export const statusDotOptions = defineOptions("status-dot", {
  /**
   * processing: accent pulse, happening now. success: connected/enabled/complete (solid).
   * returned: hollow success, an execution came back but the goal is not confirmed complete.
   * warning: waiting for you. danger: failed or unreadable. unknown: hollow, not verified.
   * idle: a known, quiet standby (solid gray), distinct from an unverified state.
   */
  state: ["processing", "success", "returned", "warning", "danger", "unknown", "idle"],
});
