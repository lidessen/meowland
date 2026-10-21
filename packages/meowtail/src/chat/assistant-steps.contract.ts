/** Part identity for process steps. The content module renders CodeBlock. */
export const assistantStepsContract = {
  name: "assistant-steps",
  parts: ["root", "step", "label", "description", "status"],
} as const;
