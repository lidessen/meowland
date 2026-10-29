import { h, keyed, type Child, type Context, type Props } from "meowjsx";
import { derived, mapSignal, unwrap, type MaybeSignal, type ReadableSignal } from "meowjsx/signal";
import { markdownBlocks, repairMarkdownTail, type MarkdownBlock } from "./markdown-blocks";
export {
  markdownBlocks,
  renderMarkdown,
  repairMarkdownTail,
  safeMarkdownLink,
  type MarkdownBlock,
} from "./markdown-blocks";

export interface MarkdownCodeBlock {
  code: string;
  language: string | undefined;
}

export interface MarkdownProps extends Props {
  /** Markdown source; a Signal keeps it live while it streams. */
  text: MaybeSignal<string>;
  /** The text is still arriving: the open tail is completed so markers do not flash. */
  streaming?: MaybeSignal<boolean>;
  /**
   * Draws a fenced or indented code block, for example with CodeBlock. The Signal follows the
   * block while it streams. Without it, code is a themed `pre`.
   */
  renderCode?: (block: ReadableSignal<MarkdownCodeBlock>) => Child;
  className?: Props["className"];
}

/**
 * Renders Markdown blocks, each block keyed by its position and element. Hosts call it inside
 * their own component; `part` names the carrier of each block.
 */
export function markdownBlockChildren(
  text: MaybeSignal<string>,
  streaming: MaybeSignal<boolean>,
  renderCode: MarkdownProps["renderCode"],
  part: Props["ref"],
): Child {
  const blocks = derived(() => {
    const source = unwrap(text);
    return markdownBlocks(unwrap(streaming) ? repairMarkdownTail(source) : source);
  });
  return keyed(
    blocks,
    (block) => (renderCode && block.code ? `${block.key}:custom` : block.key),
    (block: ReadableSignal<MarkdownBlock>) => {
      const first = block.value;
      if (renderCode && first.code)
        return renderCode(derived(() => block.value.code ?? { code: "", language: undefined }));
      // Only this block's own output is written, so selections in other blocks survive.
      // The string is compared first: an unchanged block is never rewritten.
      const html = mapSignal(
        derived(() => block.value.html),
        (value) => ({ __html: value }),
      );
      return h(first.tag, {
        ...(first.start === undefined ? {} : { start: first.start }),
        ...(first.tag === "hr" ? {} : { dangerouslySetInnerHTML: html }),
        ref: part,
      });
    },
  );
}

/**
 * Agent or document text as safe Markdown: raw HTML and images stay text and only explicit
 * external links navigate. Streaming text keeps finished blocks untouched.
 */
export function Markdown(
  { text, streaming = false, renderCode, className, ref, ...props }: MarkdownProps,
  context: Context<typeof Markdown>,
) {
  return (
    <div
      {...props}
      className={className}
      aria-busy={derived(() => (unwrap(streaming) ? "true" : undefined))}
      ref={[context.parts.root, ref]}
    >
      {markdownBlockChildren(text, streaming, renderCode, context.parts.block)}
    </div>
  );
}
Markdown.meta = { name: "markdown", parts: ["root", "block"] } as const;
