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
 * A ChatComposer and optional page-level meta row. The composer keeps its single
 * writing surface and external hint; this panel owns the surrounding composition.
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
    context.part("surface", "div", null, h(ChatComposer, props)),
    meta !== undefined && meta !== null ? context.part("meta", "div", null, meta) : null,
  ),
);
