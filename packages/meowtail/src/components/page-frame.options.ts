import { defineOptions } from "meowcss";

export const pageFrameOptions = defineOptions("page-frame", {
  variant: ["page", "workspace"],
  scrollOwner: ["content", "layout"],
});
