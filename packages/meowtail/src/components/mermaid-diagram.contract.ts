import type { ComponentContract } from "meowjsx";

/**
 * Part identity for Mermaid diagrams. Theme styles and the registry import this module; the
 * component module loads Pele only when a diagram mounts, so a host that never draws a diagram
 * does not bundle it.
 */
export const mermaidDiagramContract = {
  name: "mermaid-diagram",
  parts: ["root", "header", "title", "caption", "actions", "feedback", "canvas", "source", "error"],
} as const satisfies ComponentContract;
