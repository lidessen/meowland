import { defineComponent, h, type Child, type ComponentContract, type Props } from "meowjsx";
import { OutputBlock } from "./output-block";
import { highlightCode, type HighlightSpan } from "../syntax-highlight";

export const readBlockContract = {
  name: "read-block",
  parts: ["root", "number", "text"],
} as const satisfies ComponentContract;
export interface ReadBlockLine {
  number: number;
  text: string;
  highlighted?: boolean;
}
export interface ReadBlockProps extends Props {
  label?: string;
  lines: readonly ReadBlockLine[];
  totalLines?: number;
  /** Grammar hint for the entire supplied window; unknown grammars retain plain text. */
  lang?: string;
  maxLines?: number;
  onCopy?: (text: string) => Promise<void>;
}
/** Split an already highlighted window without restarting its grammar per row. */
export function readHighlightLines(spans: readonly HighlightSpan[]): HighlightSpan[][] {
  const rows: HighlightSpan[][] = [[]];
  for (const span of spans) {
    span.text.split("\n").forEach((text, index) => {
      if (index) rows.push([]);
      if (text) rows[rows.length - 1]!.push({ ...span, text });
    });
  }
  return rows;
}
/** Displays a supplied file window; never opens the named path. */
export const ReadBlock = defineComponent<
  ReadBlockProps,
  "read-block",
  (typeof readBlockContract.parts)[number]
>(
  readBlockContract,
  ({ label = "File content", lines, totalLines, lang, maxLines, onCopy, ...props }, context) => {
    const raw = lines.map((line) => line.text).join("\n");
    const content = lines.map((line) => context.signal<Child>(line.text || "\u200b"));
    let disposed = false;
    context.onCleanup(() => {
      disposed = true;
    });
    return context.part(
      "root",
      "div",
      {
        ...props,
        ref: (element: HTMLElement) => {
          const hostCleanup = typeof props.ref === "function" ? props.ref(element) : undefined;
          let active = true;
          let started = false;
          let observer: IntersectionObserver | undefined;
          const start = () => {
            if (started || !active || disposed || !lang) return;
            started = true;
            observer?.disconnect();
            void highlightCode(raw, lang).then((spans) => {
              if (!active || disposed || !spans) return;
              const rows = readHighlightLines(spans);
              if (
                rows.length !== lines.length ||
                rows.some(
                  (row, index) => row.map((span) => span.text).join("") !== lines[index]!.text,
                )
              )
                return;
              rows.forEach((row, index) => {
                content[index]!.value = row.length
                  ? row.map((span) => (
                      <span
                        style={{
                          color: span.color,
                          fontStyle: (span.fontStyle ?? 0) & 1 ? "italic" : undefined,
                          fontWeight: (span.fontStyle ?? 0) & 2 ? "bold" : undefined,
                          textDecoration: (span.fontStyle ?? 0) & 4 ? "underline" : undefined,
                        }}
                      >
                        {span.text}
                      </span>
                    ))
                  : "\u200b";
              });
            });
          };
          const Observer = element.ownerDocument.defaultView?.IntersectionObserver;
          if (lang && Observer) {
            observer = new Observer((entries) => {
              if (entries.some((entry) => entry.isIntersecting)) start();
            });
            observer.observe(element);
          } else start();
          return () => {
            active = false;
            observer?.disconnect();
            if (typeof hostCleanup === "function") hostCleanup();
          };
        },
      },
      <OutputBlock
        title={
          <span>
            {label}
            {totalLines !== undefined ? ` · Showing ${lines.length} / ${totalLines} lines` : ""}
          </span>
        }
        maxLines={maxLines}
        onCopy={onCopy}
        copyText={raw}
        rows={lines.map((line, index) => (
          <div data-read-highlight={line.highlighted ? "true" : undefined}>
            {context.part("number", "span", { "aria-hidden": "true" }, String(line.number))}
            {context.part("text", "span", {}, content[index]!)}
          </div>
        ))}
      />,
    );
  },
);
