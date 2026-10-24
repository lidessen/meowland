import { defineOptions } from "meowcss";

export const alertOptions = defineOptions("alert", {
  tone: ["neutral", "info", "success", "warning", "danger"],
  layout: ["block", "bar"],
  /** The bar's leading status dot. Block layout has no dot. */
  marker: ["dot", "none"],
});
