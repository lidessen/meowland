import {
  defineComponent,
  h,
  type Child,
  type ComponentContract,
  type Props,
} from "meowjsx";
import { Button } from "./button";
import { copyTextToClipboard } from "../clipboard";
import { highlightCode } from "../syntax-highlight";

export const codeBlockContract = {
  name: "code-block",
  parts: ["root", "header", "language", "actions", "content", "code", "feedback"],
} as const satisfies ComponentContract;

export interface CodeBlockProps extends Props {
  code: string;
  language?: string;
  defaultWrap?: boolean;
  /** Hosts may supply a clipboard implementation; the default uses the browser clipboard. */
  onCopy?: (code: string) => Promise<void>;
}

export const CodeBlock = defineComponent<
  CodeBlockProps,
  "code-block",
  (typeof codeBlockContract.parts)[number]
>(codeBlockContract, ({ code, language, defaultWrap = false, onCopy, ...props }, context) => {
  // These are enumerated attributes, not native boolean attributes such as disabled.
  const wrap = context.signal(defaultWrap ? "true" : "false");
  const copying = context.signal(false);
  const feedback = context.signal("");
  const highlighted = context.signal<Child>(code);
  let disposed = false;
  context.onCleanup(() => {
    disposed = true;
  });
  const copy = async () => {
    if (copying.value) return;
    copying.value = true;
    feedback.value = "";
    try {
      if (onCopy) await onCopy(code);
      else await copyTextToClipboard(code);
      if (!disposed) feedback.value = "已复制";
    } catch {
      if (!disposed) feedback.value = "复制失败，请选择代码后手动复制。";
    } finally {
      if (!disposed) copying.value = false;
    }
  };
  return context.part("root", "figure", props, [
    context.part("header", "figcaption", {}, [
      context.part("language", "span", {}, language?.trim() || "代码"),
      context.part("actions", "div", {}, [
        <Button
          variant="quiet"
          size="small"
          aria-pressed={wrap}
          onClick={() => {
            wrap.value = wrap.value === "true" ? "false" : "true";
          }}
        >
          自动换行
        </Button>,
        <Button variant="quiet" size="small" disabled={copying} onClick={copy}>
          复制代码
        </Button>,
      ]),
    ]),
    context.part(
      "content",
      "pre",
      { tabIndex: 0, "aria-label": "代码内容", "data-wrap": wrap },
      context.part(
        "code",
        "code",
        {
          ref: () => {
            let active = true;
            void highlightCode(code, language).then((spans) => {
              if (!active || disposed || !spans) return;
              highlighted.value = spans.map((span) => (
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
              ));
            });
            return () => {
              active = false;
            };
          },
        },
        highlighted,
      ),
    ),
    context.part("feedback", "span", { role: "status", "aria-live": "polite" }, feedback),
  ]);
});
