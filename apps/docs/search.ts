import { resolve } from "node:path";

/** One page in the search index. */
export interface SearchEntry {
  /** Site path, ending in a slash. */
  url: string;
  title: string;
  /** Where the page sits: its eyebrow, such as "Component reference". */
  group: string;
  description: string;
  /** Sections a result can jump to. */
  sections: { id: string; title: string }[];
  /** The page's reading text, without code, collapsed and capped. */
  text: string;
}

const TEXT_LIMIT = 1600;

function decode(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, "&");
}

function plain(html: string): string {
  return decode(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/** Read one built page into an index entry, or undefined when it has no article. */
export function searchEntryFor(url: string, html: string): SearchEntry | undefined {
  const start = html.indexOf('<article class="docs-article">');
  if (start < 0) return undefined;
  const article = html.slice(start, html.indexOf("</article>", start));
  const title =
    /data-meowui-part="page-header\/title">([\s\S]*?)<\/h1>/.exec(article)?.[1] ??
    /<title>([^<]*)<\/title>/.exec(html)?.[1] ??
    url;
  const group = /data-meowui-part="page\/eyebrow">([\s\S]*?)<\/p>/.exec(article)?.[1] ?? "";
  const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? "";
  const sections = [
    ...article.matchAll(/<section id="([^"]+)"[^>]*>\s*<header[^>]*>\s*<h2[^>]*>([\s\S]*?)<\/h2>/g),
  ].map((match) => ({ id: match[1]!, title: plain(match[2]!) }));
  // Code is read on the page itself; the index keeps the words around it.
  const text = plain(
    article
      .replace(/<figure data-meowui-part="code-block\/root"[\s\S]*?<\/figure>/g, " ")
      .replace(/<aside class="docs-toc">[\s\S]*?<\/aside>/g, " "),
  ).slice(0, TEXT_LIMIT);
  return {
    url,
    title: plain(title),
    group: plain(group),
    description: decode(description),
    sections,
    text,
  };
}

/** Write `search-index.json` from every built page except the playground. */
export async function writeSearchIndex(directory: string): Promise<number> {
  const entries: SearchEntry[] = [];
  for await (const entry of new Bun.Glob("**/index.html").scan({ cwd: directory })) {
    if (entry.startsWith("gallery/")) continue;
    const url = "/" + entry.replace(/index\.html$/, "");
    const page = searchEntryFor(url, await Bun.file(resolve(directory, entry)).text());
    if (page) entries.push(page);
  }
  entries.sort((a, b) => a.url.localeCompare(b.url));
  await Bun.write(resolve(directory, "search-index.json"), JSON.stringify(entries));
  return entries.length;
}
