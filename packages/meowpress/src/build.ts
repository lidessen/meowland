import { type ThemeDefinition } from "meowcss";
import { blogTheme } from "./theme";
import { DEFAULT_SITE, type SiteIdentity } from "./identity";
import { mkdir, rm, writeFile, cp } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  collectContentAssets,
  isDraftAsset,
  loadSection,
  normalizeContentSources,
  type ContentItem,
  type ContentSourceInput,
} from "./content";
import {
  aboutPage,
  agentMarkdown,
  homePage,
  listPage,
  llmText,
  postPage,
  skillPage,
  skillsIndexPage,
  thoughtPage,
} from "./site";
import { loadSkills } from "./skills";

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
}

export interface ResolvedSiteConfig {
  content: readonly ContentSourceInput[];
  skillsDirectory: string;
  outputDirectory: string;
  theme: ThemeDefinition;
  projectRootDirectory?: string;
  site: SiteIdentity;
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
  });
  if (!result.success) {
    console.error(result.logs);
    throw new Error("Unable to build site static HTML");
  }
}

async function writeContentPages(
  generatedDirectory: string,
  posts: ContentItem[],
  thoughts: ContentItem[],
  theme: ThemeDefinition,
  site: SiteIdentity,
): Promise<string[]> {
  const entrypoints: string[] = [];
  for (const post of posts) {
    entrypoints.push(
      await writePage(
        generatedDirectory,
        `posts/${post.slug}/index.html`,
        postPage(post, posts, thoughts, theme, site),
      ),
    );
  }
  for (const thought of thoughts) {
    entrypoints.push(
      await writePage(
        generatedDirectory,
        `thoughts/${thought.slug}/index.html`,
        thoughtPage(thought, theme, site),
      ),
    );
  }
  return entrypoints;
}

export async function buildSite(input: SiteConfig | ResolvedSiteConfig): Promise<void> {
  const config = meowSite(input);
  const generatedDirectory = resolve(config.outputDirectory, "../.generated");

  const [posts, thoughts, skills] = await Promise.all([
    loadSection(config.content, "post"),
    loadSection(config.content, "thought"),
    loadSkills(config.skillsDirectory, {
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

  const entrypoints = await Promise.all([
    writePage(generatedDirectory, "index.html", homePage(timeline, config.theme, config.site)),
    writePage(generatedDirectory, "about/index.html", aboutPage(config.theme, config.site)),
    writePage(
      generatedDirectory,
      "posts/index.html",
      listPage("post", posts, config.theme, config.site),
    ),
    writePage(
      generatedDirectory,
      "thoughts/index.html",
      listPage("thought", thoughts, config.theme, config.site),
    ),
    writePage(
      generatedDirectory,
      "skills/index.html",
      skillsIndexPage(skills, config.theme, config.site),
    ),
  ]);
  entrypoints.push(
    ...(await writeContentPages(generatedDirectory, posts, thoughts, config.theme, config.site)),
  );
  for (const skill of skills) {
    const skillPath =
      skill.scope === "public" ? `skills/${skill.slug}` : `skills/project/${skill.slug}`;
    entrypoints.push(
      await writePage(
        generatedDirectory,
        `${skillPath}/index.html`,
        skillPage(skill, config.theme, config.site),
      ),
    );
  }

  await writeFile(
    join(generatedDirectory, "blog-theme.css"),
    config.theme.cssText.replaceAll(
      '"@fontsource-variable/geist"',
      JSON.stringify(fileURLToPath(import.meta.resolve("@fontsource-variable/geist"))),
    ),
    "utf8",
  );
  await stageAssets(generatedDirectory, config.content);
  await buildStaticHtmlFromEntrypoints(entrypoints, generatedDirectory, config.outputDirectory);
  if (config.theme.cssText.includes('"@fontsource-variable/geist"')) {
    const licensesDirectory = join(config.outputDirectory, "licenses");
    await mkdir(licensesDirectory, { recursive: true });
    await cp(
      fileURLToPath(import.meta.resolve("@fontsource-variable/geist/LICENSE")),
      join(licensesDirectory, "geist-OFL.txt"),
    );
  }
  await copyPostAssets(config.outputDirectory, config.content);
  await Promise.all([
    writeFile(
      join(config.outputDirectory, "llm.txt"),
      llmText(posts, thoughts, config.site),
      "utf8",
    ),
    writeFile(
      join(config.outputDirectory, "llms.txt"),
      llmText(posts, thoughts, config.site),
      "utf8",
    ),
    writeFile(
      join(config.outputDirectory, "agents.md"),
      agentMarkdown(posts, thoughts, config.site),
      "utf8",
    ),
  ]);
  await rm(generatedDirectory, { recursive: true, force: true });

  console.log(`Built ${posts.length} posts and ${thoughts.length} thoughts into site dist/.`);
}
