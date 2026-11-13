import type { ThemeDefinition } from "meowcss";
import type { ContentItem } from "./content";
import type { SiteIdentity } from "./identity";
import type { PageLocale } from "./locale";
import type { ResolvedLocales } from "./locales";

/** A page supplied by the consumer of the site. */
export interface SitePage {
  /** Route path below the site root; "packages/meowtail" becomes /packages/meowtail/. */
  path: string;
  title: string;
  /** A complete HTML document for the route. */
  html: string;
  /**
   * The same page as Markdown for agents. When present it is published next to the route (see
   * `sitePageMarkdownFile`), and the agent-facing indexes link it instead of the HTML document.
   */
  markdown?: string;
  description?: string;
  /** Grouping used by the site index and the agent-facing indexes. */
  group?: string;
  order?: number;
  /** Canonical tag of the language this page is written in, when it is not the content source. */
  locale?: string;
  /** The route of the page this one translates, when it is a translation. */
  original?: string;
}

/** What a page provider receives when the site is built. */
export interface SitePageContext {
  posts: readonly ContentItem[];
  thoughts: readonly ContentItem[];
  site: SiteIdentity;
  theme: ThemeDefinition;
  /** The resolved `locales` option; undefined for a single-locale site. */
  locales?: ResolvedLocales;
  /**
   * The page locale for a configured tag, with the site's catalogs, time zone and `onMissing`
   * reporting — the same instance the built-in pages use. An unconfigured tag throws.
   */
  pageLocale: (tag: string) => PageLocale;
}

/** Supplies the consumer's own pages for the site. */
export type SitePageProvider = (
  context: SitePageContext,
) => readonly SitePage[] | Promise<readonly SitePage[]>;

/** The route a page is published under, with a leading and a trailing slash. */
export function sitePageUrl(path: string): string {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  return normalized ? `/${normalized}/` : "/";
}

/** The output file a page is written to, relative to the site root. */
export function sitePageFile(path: string): string {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  return normalized ? `${normalized}/index.html` : "index.html";
}

/**
 * The Markdown copy of a page, relative to the site root: "index.md" for the root and
 * "components/button.md" for /components/button/, the convention llms.txt readers expect.
 */
export function sitePageMarkdownFile(path: string): string {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  return normalized ? `${normalized}.md` : "index.md";
}

/** Where an agent reads a page: its Markdown copy when it has one, its HTML route otherwise. */
export function sitePageAgentUrl(page: SitePage): string {
  return page.markdown === undefined
    ? sitePageUrl(page.path)
    : `/${sitePageMarkdownFile(page.path)}`;
}
