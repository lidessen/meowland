import { resolve } from "node:path";
import { meowSite, type SiteConfig } from "meowpress/build";
import { buildPages, type DocsState } from "./pages";
import { StoryCanvas } from "./mdx";
import { journalFonts } from "meowtail/theme";
import { docsTheme } from "./theme";
import { SITE_DESCRIPTION, SITE_NAME, THEME_STYLESHEET } from "./document";

/** The site identity the agent-facing indexes describe. */
export const SITE_IDENTITY = {
  name: SITE_NAME,
  id: "meowland",
  description: SITE_DESCRIPTION,
  contentDirectory: "apps/docs/content",
} as const;

/**
 * The site configuration. The pages provider owns the whole site map, so the
 * package's own blog routes are not published alongside the documentation.
 */
export function createSiteConfig(state: DocsState, outputDirectory: string): SiteConfig {
  return meowSite({
    content: resolve(import.meta.dir, "content"),
    skillsDirectory: resolve(import.meta.dir, "content"),
    outputDirectory,
    theme: docsTheme,
    site: SITE_IDENTITY,
    themeStylesheet: THEME_STYLESHEET,
    // Journal's faces: published as files, fetched only once a reader picks Journal.
    fonts: journalFonts,
    // The provider paints the pages with the theme the configuration resolved,
    // so there is one theme and one way to reach it.
    pages: ({ posts, theme }) => buildPages(state, posts, theme),
    mdxComponents: { StoryCanvas },
  });
}
