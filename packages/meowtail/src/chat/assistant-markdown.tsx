import { h, type Context, type Props } from "meowjsx";
import { derived, mapSignal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { CodeBlock } from "../components/code-block";
import { markdownBlockChildren, type MarkdownProps } from "../components/markdown";
import { renderMarkdown, safeMarkdownLink } from "../components/markdown-blocks";

export const assistantSafeLink = safeMarkdownLink;

/** Raw HTML and images are text. Only explicit safe external links become navigation. */
export const assistantMarkdown = renderMarkdown;

// Fences in text read like the Assistant's code parts: the shared CodeBlock, with copy.
const renderCode: MarkdownProps["renderCode"] = (block) => (
  <CodeBlock
    code={mapSignal(block, (value) => value.code)}
    language={mapSignal(block, (value) => value.language)}
  />
);

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
      {markdownBlockChildren(text, streaming, renderCode, undefined)}
    </div>
  );
}

AssistantMarkdown.meta = { name: "assistant-markdown", parts: ["root"] } as const;
