import { Marked, Renderer, type Token, type Tokens } from "marked";

const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (value) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[value]!,
  );

/** Only explicit external and mail links navigate; everything else stays text. */
export function safeMarkdownLink(href: string): string | undefined {
  try {
    const url = new URL(href);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

const renderer = new Renderer();
renderer.html = ({ text }) => escape(text);
renderer.image = ({ text }) => escape(text);
renderer.link = function ({ href, title, tokens }) {
  const label = this.parser.parseInline(tokens);
  const link = safeMarkdownLink(href);
  return link
    ? `<a href="${escape(link)}" target="_blank" rel="noreferrer"${title ? ` title="${escape(title)}"` : ""}>${label}</a>`
    : label;
};
const markdown = new Marked({ renderer, gfm: true, breaks: true });

/** Raw HTML and images are text. Only explicit safe external links become navigation. */
export function renderMarkdown(text: string): string {
  return markdown.parse(text, { async: false }) as string;
}

/** Replace a match with spaces, so positions in the rest of the string stay put. */
function blank(text: string, pattern: RegExp): string {
  return text.replace(pattern, (match) => " ".repeat(match.length));
}

/**
 * Complete the open tail of streamed Markdown so incomplete syntax does not flash as raw markers:
 * close an unclosed code span, `**`, `~~` or `*` in the last paragraph, and show a half-typed link
 * as its text. Text inside an open fence, an indented code block, a code span or a URL is left
 * alone; `_` and `__` are not repaired, so snake_case never gains a marker.
 */
export function repairMarkdownTail(text: string): string {
  const fences = text.match(/^ {0,3}(?:```|~~~)/gm)?.length ?? 0;
  if (fences % 2 === 1) return text;
  const split = text.lastIndexOf("\n\n");
  const head = split < 0 ? "" : text.slice(0, split + 2);
  let tail = split < 0 ? text : text.slice(split + 2);
  if (/^(?: {4}|\t)/.test(tail)) return text;

  // A link whose target is still arriving reads as its text until it closes. Only `](` marks a
  // link; `[1]`, `[ ]` and `array[0` are ordinary text.
  tail = tail.replace(/!?\[([^\]\n]*)\]\([^)\n]*$/, "$1");

  // Close an open code span first; markers inside code are not emphasis.
  const ticks = (tail.match(/`/g) ?? []).length;
  if (ticks % 2 === 1) return head + tail + "`";

  let scan = blank(tail, /`[^`]*`/g);
  // Markers inside URLs and autolinks are part of the address.
  scan = blank(scan, /<[^>\s]*>|\b(?:https?:\/\/|mailto:)\S*/g);
  // Bullets, spaced operators ("5 * 3") and escapes are not emphasis.
  scan = blank(scan, /^[ \t]*[*+-][ \t]/gm);
  scan = blank(scan, /\\[*~`_]/g);
  scan = blank(scan, /(?<=\s)(?:\*\*|\*|~~)(?=\s)/g);
  const open: { marker: string; at: number }[] = [];
  for (const marker of ["**", "~~"]) {
    const count = scan.split(marker).length - 1;
    if (count % 2 === 1) open.push({ marker, at: scan.lastIndexOf(marker) });
    scan = blank(scan, new RegExp(marker.replace(/[*~]/g, "\\$&"), "g"));
  }
  const singles = (scan.match(/\*/g) ?? []).length;
  if (singles % 2 === 1) open.push({ marker: "*", at: scan.lastIndexOf("*") });
  if (open.length === 0) return head + tail;
  // Close the innermost opener first; a closing marker cannot follow a space.
  open.sort((left, right) => right.at - left.at);
  const content = tail.trimEnd();
  // An opener with nothing after it yet is dropped rather than closed around nothing.
  if (open.some((entry) => entry.at + entry.marker.length >= content.length))
    return repairMarkdownTail(head + content.slice(0, open[0]!.at).trimEnd());
  return head + content + open.map((entry) => entry.marker).join("");
}

export interface MarkdownBlock {
  /** Stable while the block keeps its position and element. */
  key: string;
  /** The block's own element; its attributes come from the token, never from parsed HTML. */
  tag:
    | "p"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "ul"
    | "ol"
    | "pre"
    | "blockquote"
    | "hr"
    | "table";
  start?: number;
  /** Safe inner HTML from the shared renderer. */
  html: string;
  /** Set for fenced and indented code, so a host can draw it itself. */
  code?: { code: string; language: string | undefined };
}

function tagFor(token: Token): MarkdownBlock["tag"] | undefined {
  switch (token.type) {
    case "paragraph":
    case "text":
    case "html":
      return "p";
    case "heading":
      return `h${Math.min(6, Math.max(1, (token as Tokens.Heading).depth))}` as MarkdownBlock["tag"];
    case "list":
      return (token as Tokens.List).ordered ? "ol" : "ul";
    case "code":
      return "pre";
    case "blockquote":
      return "blockquote";
    case "hr":
      return "hr";
    case "table":
      return "table";
    default:
      return undefined;
  }
}

/** Strip the one element the renderer wrapped the block in, keeping its safe content. */
function innerOf(html: string, tag: string): string {
  const trimmed = html.trim();
  if (tag === "hr") return "";
  const open = new RegExp(`^<${tag}(?:\\s[^>]*)?>`);
  const close = `</${tag}>`;
  if (open.test(trimmed) && trimmed.endsWith(close))
    return trimmed.replace(open, "").slice(0, -close.length);
  // A block the renderer did not wrap (escaped raw HTML) is its own text.
  return trimmed;
}

/** Top-level blocks of the text; link definitions anywhere apply to every block. */
export function markdownBlocks(text: string): readonly MarkdownBlock[] {
  const tokens = markdown.lexer(text);
  const blocks: MarkdownBlock[] = [];
  for (const token of tokens) {
    const tag = tagFor(token);
    if (!tag) continue;
    const single = Object.assign([token], { links: tokens.links });
    const html = innerOf(markdown.parser(single), tag);
    const index = blocks.length;
    const start =
      tag === "ol" && typeof (token as Tokens.List).start === "number"
        ? ((token as Tokens.List).start as number)
        : undefined;
    const code =
      token.type === "code"
        ? { code: (token as Tokens.Code).text, language: (token as Tokens.Code).lang || undefined }
        : undefined;
    blocks.push({
      key: `${index}:${tag}${start === undefined || start === 1 ? "" : `:${start}`}`,
      tag,
      ...(start === undefined || start === 1 ? {} : { start }),
      html,
      ...(code ? { code } : {}),
    });
  }
  return blocks;
}
