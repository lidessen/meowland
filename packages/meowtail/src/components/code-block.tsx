import {
  defineComponent,
  derived,
  h,
  unwrap,
  type Child,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Button } from "./button";
import { copyTextToClipboard } from "../clipboard";
import { codeBlockContract } from "./code-block.contract";
// The highlighter stays in this module. Theme styles and the registry import
// the contract module instead, so unused code surfaces drop out of the bundle.
import { highlightCode } from "../syntax-highlight";

/** A header part appears only when its prop has content; a Signal counts as provided. */
function provided(value: MaybeSignal<Child> | undefined): boolean {
  return value !== undefined && value !== null && value !== false;
}

export interface CodeBlockProps extends Props {
  code: MaybeSignal<string>;
  language?: MaybeSignal<string | undefined>;
  /**
   * The code surface's name, such as a file name or an example title, at the
   * start of the header. A plain value is fixed for the mount; a Signal keeps
   * the name live. Omit it for the language-only header.
   */
  title?: MaybeSignal<Child>;
  /**
   * A quiet supporting line for the name, such as a path or a short note. A
   * plain value is fixed for the mount; a Signal keeps it live. Omit it to hide
   * the caption.
   */
  caption?: MaybeSignal<Child>;
  /**
   * Host buttons or links that extend the built-in wrap and copy controls; they
   * render before those controls and do not replace them. A plain value is
   * fixed for the mount; a Signal keeps the actions live.
   */
  actions?: MaybeSignal<Child>;
  defaultWrap?: boolean;
  /** Hosts may supply a clipboard implementation; the default uses the browser clipboard. */
  onCopy?: (code: string) => Promise<void>;
}

/** A block of code with its language, an optional title, soft wrap and copy. */
export const CodeBlock = defineComponent<
  CodeBlockProps,
  "code-block",
  (typeof codeBlockContract.parts)[number]
>(
  codeBlockContract,
  ({ code, language, title, caption, actions, defaultWrap = false, onCopy, ...props }, context) => {
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
        provided(title) ? context.part("title", "span", {}, title) : null,
        provided(caption) ? context.part("caption", "span", {}, caption) : null,
        context.part("language", "span", {}, languageLabel),
        context.part("actions", "div", {}, [
          provided(actions) ? actions : null,
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
  },
);
