import { defineOptions } from "meowcss";

export const chatComposerOptions = defineOptions("chat-composer", {
  layout: ["stacked", "inline", "hero", "bar"],
  surface: ["default", "none"],
});
