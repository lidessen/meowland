import { defineOptions, tokenRef } from "meowcss";

export const gridOptions = defineOptions("grid", {
  gap: ["none", "compact", "normal", "relaxed"],
  rowGap: ["auto", "none", "compact", "normal", "relaxed"],
  columnGap: ["auto", "none", "compact", "normal", "relaxed"],
  minColumnWidth: ["compact", "normal", "wide"],
});

export const gridMinColumn = tokenRef("grid", "minColumn");
