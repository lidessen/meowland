import { defineComponent, h, type Child, type ComponentContract, type Props } from "meowjsx";
import { copyTextToClipboard } from "../clipboard";

export const outputBlockContract = {
  name: "output-block",
  parts: ["root", "header", "title", "actions", "body", "line", "fold", "toggle", "feedback"],
} as const satisfies ComponentContract;

export interface OutputBlockProps extends Props {
  title: Child;
  rows: readonly Child[];
  copyText: string;
  maxLines?: number;
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
  ({ title, rows, copyText, maxLines, emptyText = "没有内容", onCopy, ...props }, context) => {
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
        await (onCopy ?? copyTextToClipboard)(copyText);
        if (!disposed) feedback.value = "已复制";
      } catch {
        if (!disposed) feedback.value = "复制失败，请手动选择文本。";
      } finally {
        if (!disposed) busy.value = false;
      }
    };
    const { head, tail, hidden } = outputWindow(rows.length, maxLines);
    const renderRows = (items: readonly Child[]) =>
      items.map((row) => context.part("line", "div", {}, row));
    return context.part("root", "section", props, [
      context.part("header", "div", {}, [
        context.part("title", "div", {}, title),
        context.part(
          "actions",
          "button",
          { type: "button", disabled: busy, onClick: copy },
          "复制",
        ),
      ]),
      context.part(
        "body",
        "div",
        { tabIndex: 0, "aria-label": "输出内容" },
        rows.length === 0
          ? emptyText
          : [
              renderRows(hidden ? rows.slice(0, head) : rows),
              hidden
                ? context.part("fold", "details", {}, [
                    context.part("toggle", "summary", {}, [
                      <span data-fold-closed>展开中间 {hidden} 行</span>,
                      <span data-fold-open>收起中间行</span>,
                    ]),
                    renderRows(rows.slice(head, rows.length - tail)),
                  ])
                : null,
              hidden ? renderRows(rows.slice(rows.length - tail)) : null,
            ],
      ),
      context.part("feedback", "span", { role: "status", "aria-live": "polite" }, feedback),
    ]);
  },
);
