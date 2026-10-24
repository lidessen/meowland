import { defineOptions } from "meowcss";

export const layoutOptions = defineOptions("layout", {
  gap: ["none", "compact", "normal", "relaxed"],
  rowGap: ["auto", "none", "compact", "normal", "relaxed"],
  columnGap: ["auto", "none", "compact", "normal", "relaxed"],
});
