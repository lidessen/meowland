import { type ThemeDefinition } from "meowcss";
import { removeLegacyIsFallbacks } from "meowcss/bundle";
import { blogFonts, blogTheme } from "./theme";
import { FONT_EXTERNAL, publishFonts, type SiteFont } from "./fonts";
import { DEFAULT_SITE, type SiteIdentity, type SiteNotFound } from "./identity";
import { constants } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
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
  llmFullText,
  llmText,
  notFoundPage,
  postPage,
  skillPage,
  skillsIndexPage,
  thoughtPage,
} from "./site";
import { loadSkills } from "./skills";
import { sitePageFile, sitePageMarkdownFile, type SitePage, type SitePageProvider } from "./pages";
import { publishSite, validateBuildDestination, validateOutputDirectory } from "./output";

export { sitePageMarkdownFile } from "./pages";
export type { SitePage, SitePageContext, SitePageProvider } from "./pages";
export type { ContentItem, ContentSource, ContentSourceInput } from "./content";
export type { SiteFont } from "./fonts";
export type { SiteIdentity, SiteNotFound } from "./identity";

export interface SiteConfig {
  /** Roots containing posts, thoughts and optional assets. Defaults to `content/`. */
  content?: ContentSourceInput | readonly ContentSourceInput[];
  /** Root used to discover public `skills/`. Defaults to the current project directory. */
  skillsDirectory?: string;
  /** Static output directory for the generated site. Defaults to `dist/`. */
  outputDirectory?: string;
  /** Defaults to this package's own Blog theme. */
  theme?: ThemeDefinition;
  /** Include project `.agents/skills/` in the public build. Defaults to false. */
  includeProjectSkills?: boolean;
  /** Alternate root for `.agents/skills/` when `includeProjectSkills` is enabled. */
  projectRootDirectory?: string;
  /** Site name, description, repository links and About copy; unset fields use neutral defaults. */
  site?: Partial<SiteIdentity>;
  /** Consumer-supplied pages replace the built-in site map. */
  pages?: SitePageProvider;
  /** Copy for the built-in root `404.html`, or false to omit it. */
  notFound?: SiteNotFound | false;
  /**
   * Markdown that opens `llms.txt` and `llms-full.txt` after the site summary: what an agent must
   * know before following any link, such as how to install and set up what the site documents.
   */
  agentGuide?: string;
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
  includeProjectSkills?: boolean;
  projectRootDirectory?: string;
  site: SiteIdentity;
  pages?: SitePageProvider;
  notFound?: SiteNotFound | false;
  agentGuide?: string;
  mdxComponents: Record<string, MdxComponent>;
  themeStylesheet: string;
  fonts: readonly SiteFont[];
}

/** Define a site config in the app package without taking on the build pipeline. */
export function meowSite(config: SiteConfig = {}): ResolvedSiteConfig {
  const themeStylesheet = config.themeStylesheet ?? DEFAULT_THEME_STYLESHEET;
  if (basename(themeStylesheet) !== themeStylesheet || !themeStylesheet.endsWith(".css"))
    throw new Error(`Expected a theme stylesheet file name: ${themeStylesheet}`);
  return {
    content: normalizeContentSources(config.content ?? "content"),
    skillsDirectory: resolve(config.skillsDirectory ?? "."),
    outputDirectory: resolve(config.outputDirectory ?? "dist"),
    theme: config.theme ?? blogTheme,
    includeProjectSkills: config.includeProjectSkills,
    projectRootDirectory: config.projectRootDirectory
      ? resolve(config.projectRootDirectory)
      : undefined,
    site: { ...DEFAULT_SITE, ...config.site },
    pages: config.pages,
    notFound: config.notFound,
    agentGuide: config.agentGuide,
    mdxComponents: config.mdxComponents ?? {},
    themeStylesheet,
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

async function writeAssets(
  destination: string,
  sources: readonly ContentSourceInput[],
  directory: "assets" | "posts/assets",
): Promise<void> {
  const assets = await collectContentAssets(sources, { directory });
  for (const asset of assets) {
    if (isDraftAsset(asset.sourcePath, asset.assetRoot)) continue;
    const path = directory === "assets" ? asset.relativePath : join(directory, asset.relativePath);
    const target = join(destination, path);
    await mkdir(dirname(target), { recursive: true });
    try {
      await copyFile(asset.sourcePath, target, constants.COPYFILE_EXCL);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      throw new Error(`Content asset would replace a generated file: ${path}`);
    }
  }
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
    throw: false,
    // Published font files stay separate, so subsets load by unicode-range instead of inline.
    external: [FONT_EXTERNAL],
  });
  if (!result.success)
    throw new Error(
      ["Unable to build site static HTML", ...result.logs.map((log) => log.message)].join("\n"),
    );
  // Bun writes legacy :-webkit-any()/:-moz-any() copies of every :is() rule; Safari misreads them.
  for (const output of result.outputs)
    if (output.path.endsWith(".css"))
      await writeFile(output.path, removeLegacyIsFallbacks(await readFile(output.path, "utf8")));
}

/** Consumer pages are written inside the generated directory and never above it. */
function consumerPageFile(
  generatedDirectory: string,
  path: string,
  fileFor: (path: string) => string = sitePageFile,
): string {
  const file = fileFor(path);
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

/** Files the build writes itself; a page's Markdown copy may not take their place. */
const RESERVED_MARKDOWN = new Set(["agents.md"]);

/** Each page's Markdown copy, written straight into the output next to its route. */
async function writeConsumerMarkdown(
  outputDirectory: string,
  pages: readonly SitePage[],
): Promise<void> {
  for (const page of pages) {
    if (page.markdown === undefined) continue;
    if (RESERVED_MARKDOWN.has(sitePageMarkdownFile(page.path)))
      throw new Error(`Site page Markdown would replace the agent index: ${page.path}`);
    await writePage(
      outputDirectory,
      consumerPageFile(outputDirectory, page.path, sitePageMarkdownFile),
      page.markdown,
    );
  }
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

export async function buildSite(input: SiteConfig | ResolvedSiteConfig = {}): Promise<void> {
  const config = meowSite(input);
  await validateOutputDirectory(config);
  await validateBuildDestination(config.outputDirectory);
  const outputParent = dirname(config.outputDirectory);
  await mkdir(outputParent, { recursive: true });
  const workspace = await mkdtemp(join(outputParent, ".meowpress-build-"));
  try {
    const outputDirectory = join(workspace, "output");
    const result = await writeSite({ ...config, outputDirectory }, join(workspace, "source"));
    await validateBuildDestination(config.outputDirectory);
    await publishSite(outputDirectory, config.outputDirectory);
    console.log(`Built ${result} into ${config.outputDirectory}.`);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}

async function writeSite(config: ResolvedSiteConfig, generatedDirectory: string): Promise<string> {
  const [posts, thoughts, skills] = await Promise.all([
    loadSection(config.content, "post", { components: config.mdxComponents }),
    loadSection(config.content, "thought", { components: config.mdxComponents }),
    config.pages
      ? Promise.resolve([] as Awaited<ReturnType<typeof loadSkills>>)
      : loadSkills(config.skillsDirectory, {
          includeProjectSkills: config.includeProjectSkills,
          projectRootDirectory: config.projectRootDirectory,
        }),
  ]);
  const timeline = [...posts, ...thoughts].sort(
    (left, right) => (right.date?.getTime() ?? 0) - (left.date?.getTime() ?? 0),
  );

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
    if (config.notFound !== false) {
      entrypoints.push(
        await writePage(
          generatedDirectory,
          "404.html",
          notFoundPage(config.notFound ?? {}, config.theme, config.site, config.themeStylesheet),
        ),
      );
    }
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
  await writeAssets(generatedDirectory, config.content, "assets");
  await buildStaticHtmlFromEntrypoints(entrypoints, generatedDirectory, config.outputDirectory);
  if (pages) await writeConsumerMarkdown(config.outputDirectory, pages);
  await writeAssets(config.outputDirectory, config.content, "posts/assets");
  const full = pages ? llmFullText(config.site, pages, config.agentGuide) : undefined;
  await Promise.all([
    writeFile(
      join(config.outputDirectory, "llm.txt"),
      llmText(posts, thoughts, config.site, pages, config.agentGuide),
      "utf8",
    ),
    writeFile(
      join(config.outputDirectory, "llms.txt"),
      llmText(posts, thoughts, config.site, pages, config.agentGuide),
      "utf8",
    ),
    ...(full === undefined
      ? []
      : [writeFile(join(config.outputDirectory, "llms-full.txt"), full, "utf8")]),
    writeFile(
      join(config.outputDirectory, "agents.md"),
      agentMarkdown(
        posts,
        thoughts,
        config.site,
        pages,
        config.content.some(
          (source) =>
            typeof source !== "string" &&
            (source.postsDirectory !== undefined || source.thoughtsDirectory !== undefined),
        ),
      ),
      "utf8",
    ),
  ]);
  return pages
    ? `${posts.length} content items and ${pages.length} site pages`
    : `${posts.length} posts and ${thoughts.length} thoughts`;
}
