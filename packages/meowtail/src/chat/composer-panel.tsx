import { h, type Child, type Context } from "meowjsx";
import { ChatComposer, type ChatComposerProps } from "./composer";

export interface ComposerPanelProps extends ChatComposerProps {
  /** Page-level facts below the writing surface, usually a MetaRow. */
  meta?: Child;
}

/**
 * A ChatComposer and optional page-level meta row. The composer keeps its single
 * writing surface and external hint; this panel owns the surrounding composition.
 */
export function ComposerPanel(
  { meta, className, ref, ...props }: ComposerPanelProps,
  context: Context<typeof ComposerPanel>,
) {
  const parts = context.parts;
  return (
    <div className={className} data-pattern="composer-panel" ref={[parts.root, ref]}>
      <div ref={parts.surface}>
        <ChatComposer {...props} />
      </div>
      {meta !== undefined && meta !== null ? <div ref={parts.meta}>{meta}</div> : null}
    </div>
  );
}

ComposerPanel.meta = {
  name: "composer-panel",
  parts: ["root", "surface", "meta"],
} as const;
