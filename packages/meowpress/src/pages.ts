import type { ThemeDefinition } from "meowcss";
import type { ContentItem } from "./content";
import type { SiteIdentity } from "./identity";

/** A page supplied by the consumer of the site. */
export interface SitePage {
  /** Route path below the site root; "packages/meowtail" becomes /packages/meowtail/. */
  path: string;
  title: string;
  /** A complete HTML document for the route. */
  html: string;
  description?: string;
  /** Grouping used by the site index and the agent-facing indexes. */
  group?: string;
  order?: number;
}

/** What a page provider receives when the site is built. */
export interface SitePageContext {
  posts: readonly ContentItem[];
  thoughts: readonly ContentItem[];
  site: SiteIdentity;
  theme: ThemeDefinition;
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
