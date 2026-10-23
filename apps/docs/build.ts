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
import { createSiteConfig } from "./site.config";
import { type DocsState } from "./pages";
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
  const catalog = buildCatalog(stories);
  const packages = await readPackages(root);
  const sources = new Map<string, StorySource>();
  for (const story of stories) {
    const source = await readStorySource(root, story);
    if (source) sources.set(story.id, source);
  }

  const state: DocsState = { catalog, packages, sources };
  await buildSite(createSiteConfig(state, outputDirectory));
  await removeEmptyScriptChunks(outputDirectory);
  await highlightStaticCode(outputDirectory);
  await writeSearchIndex(outputDirectory);
  await writeFavicon(outputDirectory);

  await buildStories(meowbookConfig, resolve(outputDirectory, "gallery"));
  await buildStories(slidesConfig, resolve(outputDirectory, "gallery/slides"));

  console.log(
    `Built ${catalog.components.length} component pages, ${catalog.examples.length} example pages and ${packages.length} package pages into ${outputDirectory}.`,
  );
}

if (import.meta.main) {
  await buildDocs();
}
