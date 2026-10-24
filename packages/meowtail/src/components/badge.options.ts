import { defineOptions } from "meowcss";

export const badgeOptions = defineOptions("badge", {
  tone: ["neutral", "accent", "success", "warning", "danger", "outline", "solid", "quiet"],
  size: ["small", "default"],
});
