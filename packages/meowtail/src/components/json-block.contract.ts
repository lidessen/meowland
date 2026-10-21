import type { ComponentContract } from "meowjsx";

/** Part identity for a JSON disclosure. The component renders CodeBlock. */
export const jsonBlockContract = {
  name: "json-block",
  parts: ["root", "summary", "body", "error"],
} as const satisfies ComponentContract;
