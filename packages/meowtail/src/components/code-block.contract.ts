import type { ComponentContract } from "meowjsx";

/**
 * Part identity for the code surface. Theme styles and the registry import this
 * module; the component module imports the syntax highlighter and does not
 * re-export the contract, so a host that never mounts a code surface does not
 * bundle Shiki.
 */
export const codeBlockContract = {
  name: "code-block",
  parts: [
    "root",
    "header",
    "title",
    "caption",
    "language",
    "actions",
    "content",
    "code",
    "feedback",
  ],
} as const satisfies ComponentContract;
