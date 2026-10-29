import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { buildStories, discoverStories } from "meowbook/bun";
import { buildSite } from "meowpress/build";
import { buildCatalog } from "./catalog";
import { removeEmptyScriptChunks } from "./cleanup";
import { readStorySource, type StorySource } from "./code";
import { writeFavicon } from "./favicon";
import { highlightStaticCode } from "./highlight";
import { writeSearchIndex } from "./search";
import { readPackages } from "./packages";
import { readComponentProps, splitSummary } from "./props";
import { createSiteConfig } from "./site.config";
import { type DocsState } from "./pages";
import { LOGO, SITE_NAME } from "./document";
import { DOCS_APPEARANCE_STORE, DOCS_THEME_STORE } from "./theme";
import type { GalleryConfig, StoryConfig } from "meowbook";
import meowbookConfig from "./meowbook.config";
import slidesConfig from "./slides.meowbook.config";

/** The repository root. */
export const root = resolve(import.meta.dir, "../..");

/** Where the site is written. */
export const outputDirectory = resolve(import.meta.dir, "dist");

/**
 * Build the documentation site.
 *
 * The order matters: the story manifest is read first, because the pages are
 * generated from it; the site is built next, because it clears its output
 * directory; the galleries are built last, because they live inside it.
 */
export async function buildDocs(): Promise<void> {
  const stories = await discoverStories(meowbookConfig);
  const packages = await readPackages(root);
  const sources = new Map<string, StorySource>();
  for (const story of stories) {
    const source = await readStorySource(root, story);
    if (source) sources.set(story.id, source);
  }
  const catalog = buildCatalog(stories, (story) => {
    const source = sources.get(story.id);
    return source?.render?.code ?? source?.code;
  });

  const props = await readComponentProps(resolve(root, "packages/meowtail/src"));
  // What a component is comes from the first sentence of its JSDoc; a story description says
  // what one example shows.
  for (const component of catalog.components) {
    const summary = props.get(component.title)?.summary;
    if (summary) component.summary = splitSummary(summary).summary.replace(/`/g, "");
  }
  const state: DocsState = { catalog, packages, sources, props };
  await buildSite(createSiteConfig(state, outputDirectory));
  await removeEmptyScriptChunks(outputDirectory);
  await highlightStaticCode(outputDirectory);
  await writeSearchIndex(outputDirectory);
  await writeFavicon(outputDirectory);

  // The site build fingerprints the mark again, so the galleries take whatever name it wrote.
  const stem = LOGO.replace(/\.png$/, "");
  const logo = (await readdir(outputDirectory)).find((name) => name.startsWith(stem));
  const brand = { name: SITE_NAME, tag: "playground", logo: logo && `/${logo}`, href: "/" };
  // Each story's docs page is known only once the catalog is built, so the link joins here.
  const pages = new Map<string, string>();
  for (const example of catalog.examples) pages.set(example.story.id, `/${example.path}/`);
  for (const component of catalog.components)
    for (const story of component.stories)
      if (!pages.has(story.id)) pages.set(story.id, `/${component.path}/`);
  await buildStories(
    withGallery(meowbookConfig, {
      brand,
      links: [{ label: "Presentations", href: "/gallery/slides/" }],
      docsLink: (story) => {
        const href = pages.get(story.id);
        return href ? { label: "Docs", href } : undefined;
      },
      appearance: {
        schemeStorageKey: DOCS_APPEARANCE_STORE,
        themeStorageKey: DOCS_THEME_STORE,
        // The values are the `theme` parameter the Meowtail stories' environment reads.
        themes: [
          { value: "standard", label: "Standard", chrome: "standard" },
          { value: "journal", label: "Journal", chrome: "journal" },
          { value: "meow", label: "Meow", chrome: "meow" },
        ],
      },
    }),
    resolve(outputDirectory, "gallery"),
  );
  await buildStories(
    withGallery(slidesConfig, {
      brand,
      links: [{ label: "Components", href: "/gallery/" }],
      docsLink: () => ({ label: "Docs", href: "/packages/meowslides/" }),
      appearance: { schemeStorageKey: DOCS_APPEARANCE_STORE },
    }),
    resolve(outputDirectory, "gallery/slides"),
  );

  console.log(
    `Built ${catalog.components.length} component pages, ${catalog.examples.length} example pages and ${packages.length} package pages into ${outputDirectory}.`,
  );
}

/** A gallery that wears the site's brand and shares the reader's appearance with its pages. */
function withGallery(config: StoryConfig, gallery: GalleryConfig): StoryConfig {
  return { ...config, gallery };
}

if (import.meta.main) {
  await buildDocs();
}
