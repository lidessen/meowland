import { defineOptions } from "meowcss";

export const tagOptions = defineOptions("tag", {
  /** neutral: plain fact. accent: the current/default one. warning: needs the reader. */
  tone: ["neutral", "accent", "warning"],
  /** label: short text. count: a small number. path: a checkable monospace fact. */
  kind: ["label", "count", "path"],
});
