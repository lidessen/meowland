import { h, type Child, type Props, type Context } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { copyTextToClipboard } from "../clipboard";

export interface OutputBlockProps extends Props {
  title: Child;
  rows: MaybeSignal<readonly Child[]>;
  copyText: MaybeSignal<string>;
  maxLines?: number;
  /** Wrap prose-like tool output; code and terminal output keep their existing horizontal scroll. */
  wrap?: boolean;
  emptyText?: string;
  onCopy?: (text: string) => Promise<void>;
}

/** A display cap hides only the middle; copying always uses the complete payload. */
export function outputWindow(length: number, maxLines = 16) {
  const limit = Number.isFinite(maxLines) ? Math.max(2, Math.floor(maxLines)) : length;
  const head = Math.ceil(limit / 2);
  const tail = Math.floor(limit / 2);
  return { head, tail, hidden: Math.max(0, length - limit) };
}

export function OutputBlock(
  {
    title,
    rows,
    copyText,
    maxLines,
    wrap = false,
    emptyText = "No content",
    onCopy,
    ref,
    ...props
  }: OutputBlockProps,
  context: Context<typeof OutputBlock>,
) {
  const feedback = signal("");
  const busy = signal(false);
  let disposed = false;
  context.onCleanup(() => {
    disposed = true;
  });
  const copy = async () => {
    if (busy.value) return;
    busy.value = true;
    try {
      await (onCopy ?? copyTextToClipboard)(unwrap(copyText));
      if (!disposed) feedback.value = "Copied";
    } catch {
      if (!disposed) feedback.value = "Copy failed; select the text manually.";
    } finally {
      if (!disposed) busy.value = false;
    }
  };
  const window = derived(() => outputWindow(unwrap(rows).length, maxLines));
  const renderRows = (items: readonly Child[]) =>
    items.map((row) => <div ref={context.parts.line}>{row}</div>);
  return (
    <section
      {...props}
      data-output-wrap={wrap ? "true" : undefined}
      ref={[context.parts.root, ref]}
    >
      <div ref={context.parts.header}>
        <div ref={context.parts.title}>{title}</div>
        <button type="button" disabled={busy} onClick={copy} ref={context.parts.actions}>
          Copy
        </button>
      </div>
      <div tabIndex={0} aria-label="Output content" ref={context.parts.body}>
        {derived(() => {
          const values = unwrap(rows);
          return values.length === 0
            ? emptyText
            : renderRows(window.value.hidden ? values.slice(0, window.value.head) : values);
        })}
        <details hidden={derived(() => window.value.hidden === 0)} ref={context.parts.fold}>
          <summary ref={context.parts.toggle}>
            <span data-fold-closed>
              {derived(() => `Show the ${window.value.hidden} hidden middle lines`)}
            </span>
            <span data-fold-open>Hide the middle lines</span>
          </summary>
          {derived(() => {
            const values = unwrap(rows);
            return window.value.hidden
              ? renderRows(values.slice(window.value.head, values.length - window.value.tail))
              : null;
          })}
        </details>
        {derived(() =>
          window.value.hidden ? renderRows(unwrap(rows).slice(-window.value.tail)) : null,
        )}
      </div>
      <span role="status" aria-live="polite" ref={context.parts.feedback}>
        {feedback}
      </span>
    </section>
  );
}
OutputBlock.meta = {
  name: "output-block",
  parts: ["root", "header", "title", "actions", "body", "line", "fold", "toggle", "feedback"],
} as const;
