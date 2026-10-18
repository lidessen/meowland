import {
  defineComponent,
  h,
  type Child,
  type ComponentContract,
  type Props,
  type MaybeSignal,
  unwrap,
} from "meowjsx";
import { copyTextToClipboard } from "../clipboard";

export const outputBlockContract = {
  name: "output-block",
  parts: ["root", "header", "title", "actions", "body", "line", "fold", "toggle", "feedback"],
} as const satisfies ComponentContract;

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

export const OutputBlock = defineComponent<
  OutputBlockProps,
  "output-block",
  (typeof outputBlockContract.parts)[number]
>(
  outputBlockContract,
  (
    { title, rows, copyText, maxLines, wrap = false, emptyText = "No content", onCopy, ...props },
    context,
  ) => {
    const derived = <T,>(read: () => T) => {
      const value = context.signal(read());
      context.effect(() => {
        value.value = read();
      });
      return value;
    };
    const feedback = context.signal("");
    const busy = context.signal(false);
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
      items.map((row) => context.part("line", "div", {}, row));
    return context.part(
      "root",
      "section",
      { ...props, "data-output-wrap": wrap ? "true" : undefined },
      [
        context.part("header", "div", {}, [
          context.part("title", "div", {}, title),
          context.part(
            "actions",
            "button",
            { type: "button", disabled: busy, onClick: copy },
            "Copy",
          ),
        ]),
        context.part("body", "div", { tabIndex: 0, "aria-label": "Output content" }, [
          derived(() => {
            const values = unwrap(rows);
            return values.length === 0
              ? emptyText
              : renderRows(window.value.hidden ? values.slice(0, window.value.head) : values);
          }),
          context.part("fold", "details", { hidden: derived(() => window.value.hidden === 0) }, [
            context.part("toggle", "summary", {}, [
              <span data-fold-closed>
                {derived(() => `Show the ${window.value.hidden} hidden middle lines`)}
              </span>,
              <span data-fold-open>Hide the middle lines</span>,
            ]),
            derived(() => {
              const values = unwrap(rows);
              return window.value.hidden
                ? renderRows(values.slice(window.value.head, values.length - window.value.tail))
                : null;
            }),
          ]),
          derived(() =>
            window.value.hidden ? renderRows(unwrap(rows).slice(-window.value.tail)) : null,
          ),
        ]),
        context.part("feedback", "span", { role: "status", "aria-live": "polite" }, feedback),
      ],
    );
  },
);
