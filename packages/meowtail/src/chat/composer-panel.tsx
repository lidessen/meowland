import { defineComponent, h, type Child, type ComponentContract } from "meowjsx";
import { ChatComposer, type ChatComposerProps } from "./composer";

export const composerPanelContract = {
  name: "composer-panel",
  parts: ["root", "surface", "meta"],
} as const satisfies ComponentContract;

export interface ComposerPanelProps extends Omit<ChatComposerProps, "surface" | "className"> {
  /** Page-level facts below the writing surface, usually a MetaRow. */
  meta?: Child;
  className?: string;
}

/**
 * Composer chrome: one surface around a bare ChatComposer, plus an optional
 * page-level meta row below it. Behavior, draft and submission stay in
 * ChatComposer; this component only owns the surrounding composition.
 */
export const ComposerPanel = defineComponent<
  ComposerPanelProps,
  typeof composerPanelContract.name,
  (typeof composerPanelContract.parts)[number]
>(composerPanelContract, ({ meta, className, ...props }, context) =>
  context.part(
    "root",
    "div",
    { className, "data-pattern": "composer-panel" },
    context.part("surface", "div", null, h(ChatComposer, { ...props, surface: "none" })),
    meta !== undefined && meta !== null ? context.part("meta", "div", null, meta) : null,
  ),
);
