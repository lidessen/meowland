import { defineOptions } from "meowcss";

export const itemOptions = defineOptions("item", {
  size: ["small", "medium"],
  variant: ["plain", "outline"],
});
