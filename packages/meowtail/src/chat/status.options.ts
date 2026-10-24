import { defineOptions } from "meowcss";

export const chatStatusOptions = defineOptions("chat-status", {
  tone: ["online", "busy", "waiting", "error", "idle"],
});
