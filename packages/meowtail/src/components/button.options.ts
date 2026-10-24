import { defineOptions } from "meowcss";

export const buttonOptions = defineOptions("button", {
  /**
   * primary: the one main action (black/white). outline: secondary, a hairline-edged control.
   * quiet: tertiary. accent: soft accent fill for an action about the current activity.
   * stop: interrupts running work. danger: filled, for destructive confirmation.
   */
  variant: ["primary", "quiet", "danger", "outline", "accent", "stop"],
  size: ["small", "default", "large"],
});
