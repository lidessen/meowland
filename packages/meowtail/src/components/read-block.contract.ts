import type { ComponentContract } from "meowjsx";

/** Part identity for a file window. Kept apart from the highlighter import. */
export const readBlockContract = {
  name: "read-block",
  parts: ["root", "number", "text"],
} as const satisfies ComponentContract;
