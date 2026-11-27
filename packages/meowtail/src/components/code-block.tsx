import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { h, type Child, type Props, type Context } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { IconButton } from "./icon-button";
import { Icon } from "../icons/icon";
import { copyTextToClipboard } from "../clipboard";
import { codeBlockOptions } from "./code-block.options";
export { codeBlockOptions } from "./code-block.options";

// The highlighter stays in this module. Themes use type-only component imports,
// so unused code surfaces drop out of the bundle.
import { highlightCode } from "../syntax-highlight";

/** A header part appears only when its prop has content; a Signal counts as provided. */
function provided(value: MaybeSignal<Child> | undefined): boolean {
  return value !== undefined && value !== null && value !== false;
}

const languageNames: Record<string, string> = {
  typescript: "TypeScript",
  ts: "TypeScript",
  javascript: "JavaScript",
  js: "JavaScript",
  tsx: "TSX",
  jsx: "JSX",
  json: "JSON",
  shellscript: "Shell",
  shell: "Shell",
  sh: "Shell",
  bash: "Shell",
  zsh: "Shell",
  python: "Python",
  py: "Python",
  go: "Go",
  rust: "Rust",
  rs: "Rust",
  yaml: "YAML",
  yml: "YAML",
  html: "HTML",
  css: "CSS",
  sql: "SQL",
  markdown: "Markdown",
  md: "Markdown",
};

/** The reader-facing name of a language id: `ts` reads TypeScript; unknown ids stay as given. */
export function codeLanguageName(language: string | undefined): string {
  const id = language?.trim();
  if (!id) return "Code";
  return languageNames[id.toLowerCase()] ?? id;
}

/** 1-based line numbers marked as added or removed inside a code block. */
export interface CodeBlockDiffLines {
  added?: readonly number[];
  removed?: readonly number[];
}

interface HighlightSpan {
  text: string;
  color?: string;
  fontStyle?: number;
}

function renderSpan(span: HighlightSpan): Child {
  return (
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
  );
}

function splitSpansByLine(spans: readonly HighlightSpan[]): Child[][] {
  const lines: Child[][] = [[]];
  for (const span of spans) {
    const pieces = span.text.split("\n");
    for (let i = 0; i < pieces.length; i++) {
      if (i > 0) lines.push([]);
      const piece = pieces[i]!;
      if (piece.length > 0) {
        lines[lines.length - 1]!.push(renderSpan({ ...span, text: piece }));
      }
    }
  }
  return lines;
}

function renderDecoratedLines(
  lines: readonly Child[],
  options: {
    showLineNumbers: boolean;
    highlightSet: ReadonlySet<number>;
    addedSet: ReadonlySet<number>;
    removedSet: ReadonlySet<number>;
  },
): Child[] {
  const { showLineNumbers, highlightSet, addedSet, removedSet } = options;
  return lines.map((lineContent, index) => {
    const lineNumber = index + 1;
    const diff = addedSet.has(lineNumber)
      ? "added"
      : removedSet.has(lineNumber)
        ? "removed"
        : undefined;
    const highlighted = highlightSet.has(lineNumber) ? "true" : undefined;
    return (
      <span data-line={String(lineNumber)} data-highlighted={highlighted} data-diff={diff}>
        {showLineNumbers ? (
          <span aria-hidden="true" data-line-number={String(lineNumber)}>
            {String(lineNumber)}
          </span>
        ) : null}
        <span data-line-text="">
          {lineContent}
          {index < lines.length - 1 ? "\n" : ""}
        </span>
      </span>
    );
  });
}

export interface CodeBlockProps extends Props, ThemedProps<typeof codeBlockOptions> {
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
  /** Displays a non-selectable 1-based line number gutter alongside each line. */
  showLineNumbers?: MaybeSignal<boolean>;
  /** 1-based line numbers emphasized with an accent tint and start-edge marker. */
  highlightLines?: MaybeSignal<readonly number[] | undefined>;
  /** 1-based line numbers tinted as added or removed diff lines. */
  diffLines?: MaybeSignal<CodeBlockDiffLines | undefined>;
  /** Hosts may supply a clipboard implementation; the default uses the browser clipboard. */
  onCopy?: (code: string) => Promise<void>;
}

/** A block of code with its language, an optional title, line annotations, soft wrap and copy. */
export function CodeBlock(
  {
    code,
    language,
    title,
    caption,
    actions,
    defaultWrap = false,
    showLineNumbers = false,
    highlightLines,
    diffLines,
    onCopy,
    ref,
    ...props
  }: CodeBlockProps,
  context: Context<typeof CodeBlock>,
) {
  // These are enumerated attributes, not native boolean attributes such as disabled.
  const wrap = signal(defaultWrap ? "true" : "false");
  const copying = signal(false);
  const copied = signal(false);
  const failure = signal("");
  const spansState = signal<{
    source: string;
    language: string | undefined;
    spans: HighlightSpan[];
  } | null>(null);
  const languageLabel = derived(() => codeLanguageName(unwrap(language)));
  const hasLineDecoration = derived(() => {
    const numbers = Boolean(unwrap(showLineNumbers));
    const highlights = unwrap(highlightLines);
    const diff = unwrap(diffLines);
    return (
      numbers ||
      Boolean(highlights && highlights.length > 0) ||
      Boolean(diff?.added && diff.added.length > 0) ||
      Boolean(diff?.removed && diff.removed.length > 0)
    );
  });
  let disposed = false;
  let copiedTimer: ReturnType<typeof setTimeout> | undefined;
  context.onCleanup(() => {
    disposed = true;
    clearTimeout(copiedTimer);
  });
  context.effect(() => {
    const currentCode = unwrap(code);
    const currentLanguage = unwrap(language);
    let active = true;
    void highlightCode(currentCode, currentLanguage).then((spans) => {
      if (!active || disposed || !spans) return;
      spansState.value = { source: currentCode, language: currentLanguage, spans };
    });
    return () => {
      active = false;
    };
  });
  const renderedCode = derived<Child>(() => {
    const currentCode = unwrap(code);
    const currentLanguage = unwrap(language);
    const cached = spansState.value;
    const reusableSpans =
      cached && cached.language === currentLanguage && currentCode.startsWith(cached.source)
        ? currentCode.length > cached.source.length
          ? [...cached.spans, { text: currentCode.slice(cached.source.length) }]
          : cached.spans
        : null;

    if (!hasLineDecoration.value) {
      return reusableSpans ? reusableSpans.map(renderSpan) : currentCode;
    }

    const lines: Child[] = reusableSpans
      ? splitSpansByLine(reusableSpans)
      : currentCode.split("\n");
    const highlightSet = new Set(unwrap(highlightLines) ?? []);
    const diff = unwrap(diffLines);
    const addedSet = new Set(diff?.added ?? []);
    const removedSet = new Set(diff?.removed ?? []);
    return renderDecoratedLines(lines, {
      showLineNumbers: Boolean(unwrap(showLineNumbers)),
      highlightSet,
      addedSet,
      removedSet,
    });
  });
  const copy = async () => {
    if (copying.value) return;
    copying.value = true;
    failure.value = "";
    const text = unwrap(code);
    try {
      if (onCopy) await onCopy(text);
      else await copyTextToClipboard(text);
      if (disposed) return;
      copied.value = true;
      clearTimeout(copiedTimer);
      copiedTimer = setTimeout(() => {
        if (!disposed) copied.value = false;
      }, 1600);
    } catch {
      if (!disposed) failure.value = "Copy failed; select the code and copy it manually.";
    } finally {
      if (!disposed) copying.value = false;
    }
  };
  return (
    <figure {...props} ref={[context.parts.root, ref]}>
      <figcaption ref={context.parts.header}>
        <span ref={context.parts.heading}>
          {provided(title) ? <span ref={context.parts.title}>{title}</span> : null}
          {provided(caption) ? <span ref={context.parts.caption}>{caption}</span> : null}
          <span ref={context.parts.language}>{languageLabel}</span>
        </span>
        <div ref={context.parts.actions}>
          {provided(actions) ? actions : null}
          <IconButton
            size="small"
            label="Soft wrap"
            aria-pressed={wrap}
            onClick={() => {
              wrap.value = wrap.value === "true" ? "false" : "true";
            }}
          >
            <Icon name="text-wrap" />
          </IconButton>
          <IconButton
            size="small"
            label={derived(() => (copied.value ? "Copied" : "Copy code"))}
            disabled={copying}
            data-copied={derived(() => String(copied.value))}
            onClick={copy}
          >
            <span ref={context.parts.copyIcon}>
              <Icon name="copy" />
            </span>
            <span ref={context.parts.copiedIcon}>
              <Icon name="check" />
            </span>
          </IconButton>
        </div>
      </figcaption>
      <pre
        tabIndex={0}
        aria-label="Code content"
        data-wrap={wrap}
        data-line-numbers={derived(() => (unwrap(showLineNumbers) ? "true" : undefined))}
        data-decorated={derived(() => (hasLineDecoration.value ? "true" : undefined))}
        ref={context.parts.content}
      >
        <code ref={context.parts.code}>{renderedCode}</code>
      </pre>
      {/* Success is announced and shown on the button; a failure stays visible until the next try. */}
      <span
        role="status"
        aria-live="polite"
        data-failed={derived(() => (failure.value ? "true" : undefined))}
        ref={context.parts.feedback}
      >
        {derived(() => failure.value || (copied.value ? "Copied" : ""))}
      </span>
    </figure>
  );
}
CodeBlock.meta = {
  name: "code-block",
  parts: [
    "root",
    "header",
    "heading",
    "title",
    "caption",
    "language",
    "actions",
    "copyIcon",
    "copiedIcon",
    "content",
    "code",
    "feedback",
  ],
  style: defineStyleProps(codeBlockOptions, { defaults: { size: "regular" } }),
} as const;
