import { type ThemeDefinition } from "meowcss";
import { blogFonts, blogTheme } from "./theme";
import { FONT_EXTERNAL, publishFonts, type SiteFont } from "./fonts";
import { DEFAULT_SITE, type SiteIdentity } from "./identity";
import { mkdir, rm, writeFile, cp } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import {
  collectContentAssets,
  isDraftAsset,
  loadSection,
  normalizeContentSources,
  type ContentItem,
  type ContentSourceInput,
  type MdxComponent,
} from "./content";
import {
  aboutPage,
  agentMarkdown,
  DEFAULT_THEME_STYLESHEET,
  homePage,
  listPage,
  llmText,
  postPage,
  skillPage,
  skillsIndexPage,
  thoughtPage,
} from "./site";
import { loadSkills } from "./skills";
import { sitePageFile, type SitePage, type SitePageProvider } from "./pages";

export type { SitePage, SitePageContext, SitePageProvider } from "./pages";
export type { ContentItem } from "./content";
export type { SiteFont } from "./fonts";
export type { SiteIdentity } from "./identity";

export interface SiteConfig {
  /** One or more roots containing `posts/`, `thoughts/`, and optional assets. */
  content: ContentSourceInput | readonly ContentSourceInput[];
  /** Workspace root used to discover public `skills/` and project `.agents/skills/`. */
  skillsDirectory: string;
  /** Static output directory for the generated site. */
  outputDirectory: string;
  /** Defaults to this package's own Blog theme. */
  theme?: ThemeDefinition;
  /** Optional project root when project Skills live outside `skillsDirectory`. */
  projectRootDirectory?: string;
  /** Site name, description, repository links and About copy; unset fields use neutral defaults. */
  site?: Partial<SiteIdentity>;
  /** Consumer-supplied pages; the site writes and indexes them next to its own. */
  pages?: SitePageProvider;
  /** Extra components available to MDX content pages. */
  mdxComponents?: Record<string, MdxComponent>;
  /** Stylesheet file name for the theme; defaults to "blog-theme.css". */
  themeStylesheet?: string;
  /**
   * Web fonts the theme names, published as separate files with their licenses. Defaults to Geist
   * for the default Blog theme and to none for any other theme.
   */
  fonts?: readonly SiteFont[];
}

export interface ResolvedSiteConfig {
  content: readonly ContentSourceInput[];
  skillsDirectory: string;
  outputDirectory: string;
  theme: ThemeDefinition;
  projectRootDirectory?: string;
  site: SiteIdentity;
  pages?: SitePageProvider;
  mdxComponents: Record<string, MdxComponent>;
  themeStylesheet: string;
  fonts: readonly SiteFont[];
}

/** Define a site config in the app package without taking on the build pipeline. */
export function meowSite(config: SiteConfig): ResolvedSiteConfig {
  return {
    content: normalizeContentSources(config.content),
    skillsDirectory: resolve(config.skillsDirectory),
    outputDirectory: resolve(config.outputDirectory),
    theme: config.theme ?? blogTheme,
    projectRootDirectory: config.projectRootDirectory
      ? resolve(config.projectRootDirectory)
      : undefined,
    site: { ...DEFAULT_SITE, ...config.site },
    pages: config.pages,
    mdxComponents: config.mdxComponents ?? {},
    themeStylesheet: config.themeStylesheet ?? DEFAULT_THEME_STYLESHEET,
    fonts:
      config.fonts ?? (config.theme === undefined || config.theme === blogTheme ? blogFonts : []),
  };
}

async function writePage(
  generatedDirectory: string,
  pathname: string,
  html: string,
): Promise<string> {
  const target = join(generatedDirectory, pathname);
  await mkdir(resolve(target, ".."), { recursive: true });
  await writeFile(target, html, "utf8");
  return target;
}

async function stageAssets(
  generatedDirectory: string,
  sources: readonly ContentSourceInput[],
): Promise<void> {
  const assets = await collectContentAssets(sources, { directory: "assets" });
  await Promise.all(
    assets
      .filter((asset) => !isDraftAsset(asset.sourcePath, asset.assetRoot))
      .map(async (asset) => {
        const target = join(generatedDirectory, asset.relativePath);
        await mkdir(resolve(target, ".."), { recursive: true });
        await cp(asset.sourcePath, target, { force: true });
      }),
  );
}

async function copyPostAssets(
  outputDirectory: string,
  sources: readonly ContentSourceInput[],
): Promise<void> {
  const assets = await collectContentAssets(sources, { directory: "posts/assets" });
  await Promise.all(
    assets
      .filter((asset) => !isDraftAsset(asset.sourcePath, asset.assetRoot))
      .map(async (asset) => {
        const target = join(outputDirectory, "posts/assets", asset.relativePath);
        await mkdir(resolve(target, ".."), { recursive: true });
        await cp(asset.sourcePath, target, { force: true });
      }),
  );
}

async function buildStaticHtmlFromEntrypoints(
  entrypoints: string[],
  generatedDirectory: string,
  outputDirectory: string,
): Promise<void> {
  const result = await Bun.build({
    entrypoints,
    root: generatedDirectory,
    outdir: outputDirectory,
    target: "browser",
    minify: true,
    // Published font files stay separate, so subsets load by unicode-range instead of inline.
    external: [FONT_EXTERNAL],
  });
  if (!result.success) {
    console.error(result.logs);
    throw new Error("Unable to build site static HTML");
  }
}

/** Consumer pages are written inside the generated directory and never above it. */
function consumerPageFile(generatedDirectory: string, path: string): string {
  const file = sitePageFile(path);
  const target = resolve(generatedDirectory, file);
  const inside = relative(generatedDirectory, target);
  if (!inside || inside.startsWith("..") || isAbsolute(inside)) {
    throw new Error(`Site page path stays inside the site root: ${path}`);
  }
  return file;
}

async function writeConsumerPages(
  generatedDirectory: string,
  pages: readonly SitePage[],
): Promise<string[]> {
  const entrypoints: string[] = [];
  for (const page of pages) {
    entrypoints.push(
      await writePage(
        generatedDirectory,
        consumerPageFile(generatedDirectory, page.path),
        page.html,
      ),
    );
  }
  return entrypoints;
}

async function writeContentPages(
  generatedDirectory: string,
  posts: ContentItem[],
  thoughts: ContentItem[],
  theme: ThemeDefinition,
  site: SiteIdentity,
  stylesheet: string,
): Promise<string[]> {
  const entrypoints: string[] = [];
  for (const post of posts) {
    entrypoints.push(
      await writePage(
        generatedDirectory,
        `posts/${post.slug}/index.html`,
        postPage(post, posts, thoughts, theme, site, stylesheet),
      ),
    );
  }
  for (const thought of thoughts) {
    entrypoints.push(
      await writePage(
        generatedDirectory,
        `thoughts/${thought.slug}/index.html`,
        thoughtPage(thought, theme, site, stylesheet),
      ),
    );
  }
  return entrypoints;
}

export async function buildSite(input: SiteConfig | ResolvedSiteConfig): Promise<void> {
  const config = meowSite(input);
  const generatedDirectory = resolve(config.outputDirectory, "../.generated");

  const [posts, thoughts, skills] = await Promise.all([
    loadSection(config.content, "post", { components: config.mdxComponents }),
    loadSection(config.content, "thought", { components: config.mdxComponents }),
    config.pages
      ? Promise.resolve([] as Awaited<ReturnType<typeof loadSkills>>)
      : loadSkills(config.skillsDirectory, {
          projectRootDirectory: config.projectRootDirectory,
        }),
  ]);
  const timeline = [...posts, ...thoughts].sort(
    (left, right) => (right.date?.getTime() ?? 0) - (left.date?.getTime() ?? 0),
  );

  await rm(config.outputDirectory, { recursive: true, force: true });
  await rm(generatedDirectory, { recursive: true, force: true });
  await mkdir(config.outputDirectory, { recursive: true });
  await mkdir(generatedDirectory, { recursive: true });

  // A consumer that supplies its own pages owns the whole site map; the package's
  // own blog routes are not published alongside them.
  const pages = config.pages
    ? await config.pages({
        posts,
        thoughts,
        site: config.site,
        theme: config.theme,
      })
    : undefined;

  const entrypoints: string[] = [];
  if (pages) {
    entrypoints.push(...(await writeConsumerPages(generatedDirectory, pages)));
  } else {
    entrypoints.push(
      ...(await Promise.all([
        writePage(
          generatedDirectory,
          "index.html",
          homePage(timeline, config.theme, config.site, config.themeStylesheet),
        ),
        writePage(
          generatedDirectory,
          "about/index.html",
          aboutPage(config.theme, config.site, config.themeStylesheet),
        ),
        writePage(
          generatedDirectory,
          "posts/index.html",
          listPage("post", posts, config.theme, config.site, config.themeStylesheet),
        ),
        writePage(
          generatedDirectory,
          "thoughts/index.html",
          listPage("thought", thoughts, config.theme, config.site, config.themeStylesheet),
        ),
        writePage(
          generatedDirectory,
          "skills/index.html",
          skillsIndexPage(skills, config.theme, config.site, config.themeStylesheet),
        ),
      ])),
      ...(await writeContentPages(
        generatedDirectory,
        posts,
        thoughts,
        config.theme,
        config.site,
        config.themeStylesheet,
      )),
    );
    for (const skill of skills) {
      const skillPath =
        skill.scope === "public" ? `skills/${skill.slug}` : `skills/project/${skill.slug}`;
      entrypoints.push(
        await writePage(
          generatedDirectory,
          `${skillPath}/index.html`,
          skillPage(skill, config.theme, config.site, config.themeStylesheet),
        ),
      );
    }
  }

  // Font faces come first in the one theme stylesheet; the bundled stylesheet sits at the output
  // root, next to the published font directory its rules reference.
  const fontFaces = await publishFonts(config.fonts, config.outputDirectory);
  await writeFile(
    join(generatedDirectory, config.themeStylesheet),
    fontFaces ? `${fontFaces}\n${config.theme.cssText}` : config.theme.cssText,
    "utf8",
  );
  await stageAssets(generatedDirectory, config.content);
  await buildStaticHtmlFromEntrypoints(entrypoints, generatedDirectory, config.outputDirectory);
  await copyPostAssets(config.outputDirectory, config.content);
  await Promise.all([
    writeFile(
      join(config.outputDirectory, "llm.txt"),
      llmText(posts, thoughts, config.site, pages),
      "utf8",
    ),
    writeFile(
      join(config.outputDirectory, "llms.txt"),
      llmText(posts, thoughts, config.site, pages),
      "utf8",
    ),
    writeFile(
      join(config.outputDirectory, "agents.md"),
      agentMarkdown(posts, thoughts, config.site, pages),
      "utf8",
    ),
  ]);
  await rm(generatedDirectory, { recursive: true, force: true });

  console.log(
    pages
      ? `Built ${posts.length} content items and ${pages.length} site pages into site dist/.`
      : `Built ${posts.length} posts and ${thoughts.length} thoughts into site dist/.`,
  );
}
