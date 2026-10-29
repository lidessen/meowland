import { h, type Context, type Props } from "meowjsx";
import { derived, unwrap, type MaybeSignal } from "meowjsx/signal";
import { markdownBlockChildren } from "../components/markdown";
import { renderMarkdown, safeMarkdownLink } from "../components/markdown-blocks";

export const assistantSafeLink = safeMarkdownLink;

/** Raw HTML and images are text. Only explicit safe external links become navigation. */
export const assistantMarkdown = renderMarkdown;

/** The Assistant's text: the shared Markdown blocks under the Assistant's own part. */
export function AssistantMarkdown(
  {
    text,
    streaming = false,
    ref,
  }: { text: MaybeSignal<string>; streaming?: MaybeSignal<boolean>; ref?: Props["ref"] },
  context: Context<typeof AssistantMarkdown>,
) {
  return (
    <div
      aria-busy={derived(() => (unwrap(streaming) ? "true" : undefined))}
      ref={[context.parts.root, ref]}
    >
      {markdownBlockChildren(text, streaming, undefined, undefined)}
    </div>
  );
}

AssistantMarkdown.meta = { name: "assistant-markdown", parts: ["root"] } as const;
