import {
  defineComponent,
  derived,
  h,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
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
  code: MaybeSignal<string>;
  language?: MaybeSignal<string | undefined>;
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
  const highlighted = context.signal<Child>(unwrap(code));
  const languageLabel = derived(() => unwrap(language)?.trim() || "Code");
  let disposed = false;
  context.onCleanup(() => {
    disposed = true;
  });
  context.effect(() => {
    const currentCode = unwrap(code);
    const currentLanguage = unwrap(language);
    highlighted.value = currentCode;
    let active = true;
    void highlightCode(currentCode, currentLanguage).then((spans) => {
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
  });
  const copy = async () => {
    if (copying.value) return;
    copying.value = true;
    feedback.value = "";
    const text = unwrap(code);
    try {
      if (onCopy) await onCopy(text);
      else await copyTextToClipboard(text);
      if (!disposed) feedback.value = "Copied";
    } catch {
      if (!disposed) feedback.value = "Copy failed; select the code and copy it manually.";
    } finally {
      if (!disposed) copying.value = false;
    }
  };
  return context.part("root", "figure", props, [
    context.part("header", "figcaption", {}, [
      context.part("language", "span", {}, languageLabel),
      context.part("actions", "div", {}, [
        <Button
          variant="quiet"
          size="small"
          aria-pressed={wrap}
          onClick={() => {
            wrap.value = wrap.value === "true" ? "false" : "true";
          }}
        >
          Soft wrap
        </Button>,
        <Button variant="quiet" size="small" disabled={copying} onClick={copy}>
          Copy code
        </Button>,
      ]),
    ]),
    context.part(
      "content",
      "pre",
      { tabIndex: 0, "aria-label": "Code content", "data-wrap": wrap },
      context.part("code", "code", null, highlighted),
    ),
    context.part("feedback", "span", { role: "status", "aria-live": "polite" }, feedback),
  ]);
});
