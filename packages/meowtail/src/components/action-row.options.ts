import { defineOptions } from "meowcss";

export const actionRowOptions = defineOptions("action-row", {
  /** Where the row sits when it fits on one line: with the content, or at the trailing edge. */
  align: ["start", "end"],
});
