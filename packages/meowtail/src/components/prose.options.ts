import { defineOptions } from "meowcss";

export const proseOptions = defineOptions("prose", {
  /** `reading` caps lines at the reading measure; `fill` takes the width the parent gives. */
  measure: ["reading", "fill"],
});
