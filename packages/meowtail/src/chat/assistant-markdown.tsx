import { defineComponent, derived, type Signal } from "meowjsx";
import { Marked, Renderer } from "marked";

const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (value) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[value]!,
  );

export function assistantSafeLink(href: string): string | undefined {
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
  const link = assistantSafeLink(href);
  return link
    ? `<a href="${escape(link)}" target="_blank" rel="noreferrer"${title ? ` title="${escape(title)}"` : ""}>${label}</a>`
    : label;
};
const markdown = new Marked({ renderer, gfm: true, breaks: true });

/** Raw HTML and images are text. Only explicit safe external links become navigation. */
export const assistantMarkdown = (text: string): string =>
  markdown.parse(text, { async: false }) as string;

export const assistantMarkdownContract = { name: "assistant-markdown", parts: ["root"] } as const;
export const AssistantMarkdown = defineComponent<
  { text: Signal<string> },
  "assistant-markdown",
  "root"
>(assistantMarkdownContract, ({ text }, context) =>
  context.part("root", "div", {
    dangerouslySetInnerHTML: derived(() => ({ __html: assistantMarkdown(text.value) })),
  }),
);
