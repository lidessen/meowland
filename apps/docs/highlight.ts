import { resolve } from "node:path";
import { h } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { CodeBlock, highlightCode } from "meowtail";
import "./runtime";

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
};

function unescape(html: string): string {
  return html.replace(/&(?:amp|lt|gt|quot|#39|#x27);/g, (entity) => ENTITIES[entity]!);
}

function escape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** One code element's highlighted markup, or undefined to keep the plain text. */
export async function highlightMarkup(
  escaped: string,
  language: string | undefined,
): Promise<string | undefined> {
  if (escaped.includes("<")) return undefined;
  const spans = await highlightCode(unescape(escaped), language);
  if (!spans) return undefined;
  return spans
    .map((span) => {
      const text = escape(span.text);
      const style = [
        span.color ? `color:${span.color}` : "",
        (span.fontStyle ?? 0) & 1 ? "font-style:italic" : "",
        (span.fontStyle ?? 0) & 2 ? "font-weight:bold" : "",
      ]
        .filter(Boolean)
        .join(";");
      return style ? `<span style="${style}">${text}</span>` : text;
    })
    .join("");
}

const CODE_BLOCK =
  /(<figure data-meowui-part="code-block\/root"[^>]*>[\s\S]*?<span data-meowui-part="code-block\/language">([^<]*)<\/span>[\s\S]*?<code data-meowui-part="code-block\/code">)([\s\S]*?)(<\/code>)/g;
const FENCE = /(<pre><code class="language-([a-z0-9-]+)">)([\s\S]*?)(<\/code><\/pre>)/g;

async function replaceAsync(
  html: string,
  pattern: RegExp,
  replace: (match: RegExpMatchArray) => Promise<string>,
): Promise<string> {
  const matches = [...html.matchAll(pattern)];
  if (!matches.length) return html;
  const parts: string[] = [];
  let last = 0;
  for (const match of matches) {
    parts.push(html.slice(last, match.index), await replace(match));
    last = match.index! + match[0].length;
  }
  parts.push(html.slice(last));
  return parts.join("");
}

/**
 * Highlight every code surface in the built pages with the library's own highlighter. The site
 * ships no client runtime, so CodeBlock's in-browser highlighting never runs here; the colors
 * are the theme's code variables, so both schemes follow the theme.
 */
export async function highlightStaticCode(directory: string): Promise<number> {
  let touched = 0;
  for await (const entry of new Bun.Glob("**/*.html").scan({ cwd: directory })) {
    if (entry.startsWith("gallery/")) continue;
    const file = resolve(directory, entry);
    const html = await Bun.file(file).text();
    const highlight = async (match: RegExpMatchArray) => {
      const [, open, language, body, close] = match;
      return open + ((await highlightMarkup(body!, language)) ?? body) + close;
    };
    // Markdown fences become the library's code surface first, so every code block on the
    // site has one header, one frame and one palette.
    let updated = html.replace(FENCE, (_whole, _open, language: string, body: string) =>
      renderToHtml(h(CodeBlock, { code: unescape(body), language })),
    );
    updated = await replaceAsync(updated, CODE_BLOCK, highlight);
    if (updated === html) continue;
    await Bun.write(file, updated);
    touched += 1;
  }
  return touched;
}
