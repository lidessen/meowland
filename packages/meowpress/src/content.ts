import { compile, run } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { readdir, readFile, stat } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { parse as parseYaml } from "yaml";
import { Fragment, h, type Child, type Props } from "meowjsx/runtime";
import { renderToHtml } from "meowjsx/web";

export type ContentKind = "post" | "thought";

export type Frontmatter = Record<string, unknown>;

/** A content root containing `posts/`, `thoughts/`, and optional asset folders. */
export interface ContentSource {
  directory: string;
  /** Namespace slugs and asset paths from this source to avoid collisions. */
  slugPrefix?: string;
}

export type ContentSourceInput = string | ContentSource;
export type DuplicateContentPolicy = "first-wins" | "error";

export interface LoadSectionOptions {
  /** The first source wins by default, so the source order is an explicit overlay order. */
  duplicate?: DuplicateContentPolicy;
  /** Extra components available to MDX content pages. */
  components?: Record<string, MdxComponent>;
}

/** A component an MDX content page may use by name. */
export type MdxComponent = (props: Props) => Child;

export interface ContentItem {
  kind: ContentKind;
  slug: string;
  sourcePath: string;
  title: string;
  excerpt: string;
  body: string;
  html: string;
  metadata: Frontmatter;
  date?: Date;
  dateKey: string;
  timeLabel: string;
  tags: string[];
  readingMinutes: number;
  characterCount: number;
}

export interface ParsedDocument {
  metadata: Frontmatter;
  body: string;
}

export interface ContentAsset {
  sourcePath: string;
  assetRoot: string;
  relativePath: string;
}

export interface CollectContentAssetsOptions {
  /** Relative directory below every source, for example `assets` or `posts/assets`. */
  directory?: string;
  duplicate?: DuplicateContentPolicy;
}

const CONTENT_EXTENSIONS = new Set([".md", ".mdx"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asText(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function parseFrontmatter(source: string): ParsedDocument {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) return { metadata: {}, body: source };

  const parsed = parseYaml(match[1]);
  const metadata = isRecord(parsed) ? parsed : {};
  return { metadata, body: source.slice(match[0].length) };
}

function metadataValue(metadata: Frontmatter, keys: string[]): unknown {
  return keys.map((key) => metadata[key]).find((value) => value !== undefined);
}

function parseDate(value: unknown): Date | undefined {
  const text = asText(value);
  if (!text) return undefined;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function makeDateKey(value: unknown, date: Date | undefined): string {
  const text = asText(value);
  const explicitDate = text?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (explicitDate) return explicitDate;
  if (!date) return "undated";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function makeTimeLabel(value: unknown, date: Date | undefined): string {
  const text = asText(value);
  if (text) {
    return text.match(/(?:T|\s)(\d{2}:\d{2})/)?.[1] ?? "";
  }
  if (!date) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function titleFromBody(body: string, slug: string): string {
  const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (heading) return heading.replaceAll(/[*_`]/g, "");
  return slug
    .split("/")
    .at(-1)!
    .replaceAll(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function stripMarkdown(source: string): string {
  return source
    .replaceAll(/<!--[\s\S]*?-->/g, "")
    .replaceAll(/^#{1,6}\s+/gm, "")
    .replaceAll(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replaceAll(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replaceAll(/[`*_~]/g, "")
    .replaceAll(/^>\s?/gm, "")
    .replaceAll(/^[-*+]\s+/gm, "")
    .replaceAll(/^\d+\.\s+/gm, "")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function getTags(metadata: Frontmatter): string[] {
  const value = metadata.tags;
  if (Array.isArray(value)) return value.map(asText).filter(Boolean) as string[];
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function getReadingMinutes(text: string): number {
  return Math.max(1, Math.ceil(text.length / 400));
}

function Callout(props: Props): Child {
  const tone = asText(props.tone) ?? "note";
  return h("aside", { className: `mdx-callout mdx-callout-${tone}` }, props.children);
}

const MDX_COMPONENTS = {
  Callout,
};

async function renderMdx(
  source: string,
  components: Record<string, MdxComponent>,
): Promise<string> {
  const compiled = await compile(
    { value: source },
    {
      outputFormat: "function-body",
      remarkPlugins: [remarkGfm],
    },
  );
  const module = await run(String(compiled), {
    Fragment,
    jsx: h,
    jsxs: h,
  });
  const component = module.default as (props: Props) => Child;
  return renderToHtml(component({ components: { ...MDX_COMPONENTS, ...components } }));
}

async function renderSource(
  source: string,
  sourcePath: string,
  components: Record<string, MdxComponent>,
): Promise<string> {
  if (sourcePath.endsWith(".md")) {
    return Bun.markdown.html(source, {
      tagFilter: true,
    });
  }
  return renderMdx(source, components);
}

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
      continue;
    }
    if (CONTENT_EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf(".")))) {
      files.push(entryPath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

function isDraft(sourcePath: string, sectionDirectory: string, kind: ContentKind): boolean {
  if (kind !== "post") return false;
  const contentPath = relative(sectionDirectory, sourcePath);
  return contentPath.split(sep).some((part) => part.startsWith("_"));
}

function makeSlug(sourcePath: string, sectionDirectory: string): string {
  const contentPath = relative(sectionDirectory, sourcePath);
  return contentPath
    .replace(/\.(md|mdx)$/i, "")
    .split(sep)
    .join("/");
}

function normalizeSlugPrefix(prefix: string | undefined): string {
  return (prefix ?? "")
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .replaceAll(/\/+/g, "/");
}

function withSlugPrefix(prefix: string | undefined, slug: string): string {
  const normalizedPrefix = normalizeSlugPrefix(prefix);
  return normalizedPrefix ? `${normalizedPrefix}/${slug}` : slug;
}

export function normalizeContentSources(
  input: ContentSourceInput | readonly ContentSourceInput[],
): ContentSource[] {
  const sources = Array.isArray(input) ? input : [input];
  return sources.map((source) => {
    const normalized = typeof source === "string" ? { directory: source } : source;
    return {
      directory: resolve(normalized.directory),
      slugPrefix: normalizeSlugPrefix(normalized.slugPrefix) || undefined,
    };
  });
}

function duplicateContentError(kind: ContentKind, slug: string): Error {
  return new Error(`Duplicate ${kind} slug "${slug}" while merging content sources.`);
}

async function loadSectionFromSource(
  source: ContentSource,
  kind: ContentKind,
  options: LoadSectionOptions,
): Promise<ContentItem[]> {
  const sectionDirectory = resolve(source.directory, `${kind}s`);
  let sourceFiles: string[];
  try {
    sourceFiles = await collectFiles(sectionDirectory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const items: ContentItem[] = [];
  for (const sourcePath of sourceFiles) {
    if (isDraft(sourcePath, sectionDirectory, kind)) continue;

    const sourceText = await readFile(sourcePath, "utf8");
    const document = parseFrontmatter(sourceText);
    const slug = withSlugPrefix(source.slugPrefix, makeSlug(sourcePath, sectionDirectory));
    const dateValue = metadataValue(document.metadata, [
      "published_at",
      "publishedAt",
      "date",
      "created_at",
      "createdAt",
      "updated_at",
      "updatedAt",
    ]);
    const date = parseDate(dateValue) ?? (await stat(sourcePath)).mtime;
    const bodyWithoutLeadingHeading = document.body.replace(/^\s*#\s+.+?(?:\r?\n|$)+/, "");
    const plainText = stripMarkdown(bodyWithoutLeadingHeading);
    const title = asText(document.metadata.title) ?? titleFromBody(document.body, slug);
    const html = withoutLeadingHeading(
      await renderSource(document.body, sourcePath, options.components ?? {}),
    );

    items.push({
      kind,
      slug,
      sourcePath,
      title,
      excerpt: plainText.slice(0, 180),
      body: document.body,
      html,
      metadata: document.metadata,
      date,
      dateKey: makeDateKey(dateValue, date),
      timeLabel: makeTimeLabel(dateValue, date),
      tags: getTags(document.metadata),
      readingMinutes: getReadingMinutes(plainText),
      characterCount: plainText.length,
    });
  }

  return items;
}

export async function loadSection(
  sources: ContentSourceInput | readonly ContentSourceInput[],
  kind: ContentKind,
  options: LoadSectionOptions = {},
): Promise<ContentItem[]> {
  const merged = new Map<string, ContentItem>();
  const duplicatePolicy = options.duplicate ?? "first-wins";
  for (const source of normalizeContentSources(sources)) {
    const items = await loadSectionFromSource(source, kind, options);
    for (const item of items) {
      if (merged.has(item.slug)) {
        if (duplicatePolicy === "error") throw duplicateContentError(kind, item.slug);
        continue;
      }
      merged.set(item.slug, item);
    }
  }

  return [...merged.values()].sort((left, right) => {
    return (right.date?.getTime() ?? 0) - (left.date?.getTime() ?? 0);
  });
}

export function withoutLeadingHeading(html: string): string {
  return html.replace(/^\s*<h1>.*?<\/h1>\s*/s, "");
}

export async function collectAssetFiles(directory: string): Promise<string[]> {
  try {
    return await collectFilesForAssets(directory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function collectFilesForAssets(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFilesForAssets(entryPath)));
    } else {
      files.push(entryPath);
    }
  }
  return files.sort((left, right) => left.localeCompare(right));
}

export async function collectContentAssets(
  sources: ContentSourceInput | readonly ContentSourceInput[],
  options: CollectContentAssetsOptions = {},
): Promise<ContentAsset[]> {
  const directory = options.directory ?? "assets";
  const duplicatePolicy = options.duplicate ?? "first-wins";
  const assets = new Map<string, ContentAsset>();

  for (const source of normalizeContentSources(sources)) {
    const assetRoot = resolve(source.directory, directory);
    const sourceFiles = await collectAssetFiles(assetRoot);
    for (const sourcePath of sourceFiles) {
      const localPath = relative(assetRoot, sourcePath).split(sep).join("/");
      const relativePath = withSlugPrefix(source.slugPrefix, localPath);
      if (assets.has(relativePath)) {
        if (duplicatePolicy === "error") {
          throw new Error(`Duplicate asset path "${relativePath}" while merging content sources.`);
        }
        continue;
      }
      assets.set(relativePath, { sourcePath, assetRoot, relativePath });
    }
  }

  return [...assets.values()];
}

export function isDraftAsset(assetPath: string, assetRoot: string): boolean {
  return relative(assetRoot, assetPath)
    .split(sep)
    .some((part) => part.startsWith("_"));
}
