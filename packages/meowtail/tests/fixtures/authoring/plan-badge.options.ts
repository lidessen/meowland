import { defineOptions } from "meowcss";

export const planBadgeOptions = defineOptions("app-plan-badge", {
  tone: ["free", "pro", "trial"],
});
