import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  GalleryConfig,
  GalleryLink,
  GallerySettings,
  StoryConfig,
  StoryEntry,
} from "../types";
import { discoverStories, sourcePath, type DiscoveredStory, type TemporaryStory } from "./discover";
import { standardTheme } from "meowtail/theme";
import { themeAttributes } from "meowcss";
import { canvasStyles } from "../web/canvas.styles";
import { chromeThemeStyles, galleryStyles } from "../web/gallery.styles";

const sourceDirectory = resolve(import.meta.dir, "..");
const moduleExtension = import.meta.url.endsWith(".ts") ? ".ts" : ".js";
const jsxEntry = fileURLToPath(import.meta.resolve("meowjsx"));
/**
 * Runs before the canvas paints: the scheme comes from the `scheme` parameter, or else from the
 * same-origin page that embeds the canvas, so the frame starts in the host's scheme instead of
 * white until the story's bundle and theme load.
 */
const canvasSchemeScript = `(() => {
  let scheme = new URLSearchParams(location.search).get("scheme");
  if (!scheme && parent !== window)
    try { scheme = parent.document.documentElement.getAttribute("data-meowui-color-scheme"); } catch {}
  if (scheme === "light" || scheme === "dark" || scheme === "auto")
    document.documentElement.setAttribute("data-meowui-color-scheme", scheme);
})();`;

export interface PreparedStories {
  stories: DiscoveredStory[];
  modules: Map<string, { file: string; exportName: string }>;
  directory: string;
  cleanup(): Promise<void>;
}

function literal(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(literal).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .map(([key, item]) => `[${JSON.stringify(key)}]:${literal(item)}`)
      .join(",")}}`;
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new Error("Generated props must be JSON values");
  return encoded;
}

export async function prepareStories(
  config: StoryConfig,
  temporary?: TemporaryStory,
): Promise<PreparedStories> {
  const stories = await discoverStories(config, temporary);
  // Keep generated sources within the consumer root so TS/Bun resolve its dependencies.
  const directory = await mkdtemp(join(resolve(config.root), ".meowbook-"));
  const modules = new Map<string, { file: string; exportName: string }>();
  const cleanup = () => rm(directory, { recursive: true, force: true });
  try {
    for (const [index, story] of stories.entries()) {
      if (!story.generated) {
        modules.set(story.id, { file: story.file, exportName: story.exportName });
        continue;
      }
      const file = join(directory, `generated-${index}.story.tsx`);
      await writeFile(
        file,
        [
          `import { h } from ${JSON.stringify(jsxEntry)};`,
          `import { defineStory } from ${JSON.stringify(join(sourceDirectory, `index${moduleExtension}`))};`,
          `import { ${story.generated.component} as Target } from ${JSON.stringify(story.file)};`,
          `const props = ${literal(story.generated.props)} satisfies Parameters<typeof Target>[0];`,
          `export const Generated = defineStory({ id: ${JSON.stringify(story.id)}, title: ${JSON.stringify(story.title)}, render: () => <Target {...props} /> });`,
        ].join("\n"),
      );
      modules.set(story.id, { file, exportName: "Generated" });
    }
    return { stories, modules, directory, cleanup };
  } catch (error) {
    await cleanup();
    throw error;
  }
}

export async function checkPrepared(config: StoryConfig, prepared: PreparedStories): Promise<void> {
  const project = await sourcePath(config.root, config.tsconfig);
  const tsconfig = join(prepared.directory, "tsconfig.json");
  const tsc = join(
    dirname(fileURLToPath(import.meta.resolve("typescript/package.json"))),
    "bin/tsc",
  );
  // Let the installed compiler resolve extends, includes and explicit files. In particular,
  // consumer ambient declarations must survive adding generated story roots.
  const show = Bun.spawn(["bun", tsc, "--project", project, "--showConfig", "--pretty", "false"], {
    cwd: config.root,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [resolvedText, resolvedErrors, resolvedCode] = await Promise.all([
    new Response(show.stdout).text(),
    new Response(show.stderr).text(),
    show.exited,
  ]);
  if (resolvedCode !== 0) throw new Error(`${resolvedText}${resolvedErrors}`.trim());
  const resolvedConfig = JSON.parse(resolvedText) as { files?: string[] };
  const existingFiles = (resolvedConfig.files ?? []).map((file) => resolve(dirname(project), file));
  await writeFile(
    tsconfig,
    JSON.stringify({
      extends: project,
      compilerOptions: { noEmit: true, incremental: false, composite: false },
      files: [...prepared.modules.values()]
        .map((module) => module.file)
        .concat(await sourcePath(config.root, config.preview), ...existingFiles),
    }),
  );
  const process = Bun.spawn(["bun", tsc, "--project", tsconfig, "--pretty", "false"], {
    cwd: config.root,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ]);
  if (code === 0) return;
  let diagnostic = `${stdout}${stderr}`.trim();
  for (const story of prepared.stories) {
    const generated = prepared.modules.get(story.id);
    if (!story.generated || !generated) continue;
    const base = generated.file.slice(prepared.directory.length + 1);
    if (diagnostic.includes(base))
      diagnostic += `\nStory ${story.id}: ${story.file}:${story.line} (generated: ${generated.file})`;
  }
  throw new Error(diagnostic || `TypeScript check failed with exit code ${code}`);
}

export async function checkStories(
  config: StoryConfig,
  temporary?: TemporaryStory,
): Promise<StoryEntry[]> {
  const prepared = await prepareStories(config, temporary);
  try {
    await checkPrepared(config, prepared);
    return manifest(prepared.stories);
  } finally {
    await prepared.cleanup();
  }
}

function manifest(stories: readonly DiscoveredStory[]): StoryEntry[] {
  return stories.map(({ generated: _generated, ...entry }) => entry);
}

/** The browser half of the gallery config: data only, with each story's docs link resolved. */
function gallerySettings(
  { docsLink, ...settings }: GalleryConfig,
  entries: readonly StoryEntry[],
): GallerySettings {
  if (!docsLink) return settings;
  const docsLinks: Record<string, GalleryLink> = {};
  for (const entry of entries) {
    const link = docsLink(entry);
    if (link) docsLinks[entry.id] = { label: link.label, href: link.href };
  }
  return { ...settings, docsLinks };
}

export async function buildStories(
  config: StoryConfig,
  outdir: string,
  temporary?: TemporaryStory,
  options: { capture?: boolean } = {},
): Promise<StoryEntry[]> {
  const prepared = await prepareStories(config, temporary);
  try {
    await checkPrepared(config, prepared);
    const entries = manifest(prepared.stories);
    const loaders = [...prepared.modules]
      .map(
        ([id, module]) =>
          `${JSON.stringify(id)}: () => import(${JSON.stringify(module.file)}).then(module => module[${JSON.stringify(module.exportName)}])`,
      )
      .join(",\n");
    const preview = await sourcePath(config.root, config.preview);
    await writeFile(join(prepared.directory, "canvas.css"), canvasStyles.text);
    await writeFile(
      join(prepared.directory, "gallery.css"),
      [standardTheme.cssText, chromeThemeStyles, galleryStyles.text].join("\n"),
    );
    await writeFile(
      join(prepared.directory, "canvas-entry.ts"),
      [
        `import { bootCanvas } from ${JSON.stringify(join(sourceDirectory, `web/index${moduleExtension}`))};`,
        `const loaders = {${loaders}};`,
        `void bootCanvas({ capture: ${Boolean(options.capture)}, manifest: ${JSON.stringify(entries)}, loadStory(id) { const load = loaders[id]; if (!load) throw new Error("Unknown story: " + id); return load(); }, loadEnvironment: () => import(${JSON.stringify(preview)}).then(module => module.default) });`,
      ].join("\n"),
    );
    await writeFile(
      join(prepared.directory, "canvas.html"),
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Meowbook canvas</title>${options.capture ? "" : `<script>${canvasSchemeScript}</script>`}<link rel="stylesheet" href="./canvas.css"></head><body><div id="story-state" data-status="loading" role="status">Loading the scenario…</div><main id="story-root"></main><script type="module" src="./canvas-entry.ts"></script></body></html>`,
    );
    const galleryFile = join(sourceDirectory, "web/index.html");
    const gallery = (await readFile(galleryFile, "utf8")).replace(
      /(src|href)="(\.[^"]+)"/g,
      (_match, key: string, path: string) =>
        `${key}="${relative(prepared.directory, resolve(dirname(galleryFile), path.replace(/\.ts$/, moduleExtension)))}"`,
    );
    const attributes = Object.entries(themeAttributes(standardTheme))
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");
    await writeFile(
      join(prepared.directory, "index.html"),
      gallery
        .replace("<html ", `<html ${attributes} `)
        .replace("</head>", '<link rel="stylesheet" href="./gallery.css"></head>'),
    );
    await mkdir(resolve(outdir), { recursive: true });
    const result = await Bun.build({
      entrypoints: [
        join(prepared.directory, "index.html"),
        join(prepared.directory, "canvas.html"),
      ],
      root: prepared.directory,
      outdir: resolve(outdir),
      target: "browser",
      splitting: true,
      minify: options.capture
        ? { whitespace: true, syntax: true, identifiers: false, keepNames: true }
        : true,
    });
    if (!result.success) throw new Error(result.logs.map(String).join("\n"));
    // The published manifest names each story file from the config root, so a deployed gallery
    // does not carry the build machine's directories.
    const published = entries.map((entry) => ({
      ...entry,
      file: relative(config.root, entry.file).split(sep).join("/"),
    }));
    await writeFile(join(resolve(outdir), "manifest.json"), JSON.stringify(published, null, 2));
    if (config.gallery)
      await writeFile(
        join(resolve(outdir), "gallery.json"),
        JSON.stringify(gallerySettings(config.gallery, entries), null, 2),
      );
    return entries;
  } finally {
    await prepared.cleanup();
  }
}
