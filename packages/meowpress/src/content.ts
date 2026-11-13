import { compile, run } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { createHash } from "node:crypto";
import { lstat, readdir, readFile, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { parse as parseYaml } from "yaml";
import { Fragment, h, type Child, type Props } from "meowjsx/runtime";
import { renderToHtml } from "meowjsx/web";
import { DEFAULT_TIME_ZONE } from "./identity";

export type ContentKind = "post" | "thought";

export type Frontmatter = Record<string, unknown>;

/** Whether a translation still matches the original it records. */
export type TranslationState = "current" | "stale";

/**
 * The locales a content tree may carry, so a file-name suffix is read only when it names a
 * configured locale: `notes.v2.md` keeps its slug, `notes.fr.md` is a French translation.
 */
export interface ContentLocales {
  /** The language of an unsuffixed file, and the one whose file in a set is the original. */
  source: string;
  /** Other canonical tags, written as a lower-case file-name suffix. */
  targets?: readonly string[];
}

/** A content root containing `posts/`, `thoughts/`, and optional asset folders. */
export interface ContentSource {
  directory: string;
  /** Markdown and MDX posts, relative to the source root. Defaults to "posts". */
  postsDirectory?: string;
  /** Markdown and MDX thoughts, relative to the source root. Defaults to "thoughts". */
  thoughtsDirectory?: string;
  /** Assets for site pages and styles, relative to the source root. Defaults to "assets". */
  assetsDirectory?: string;
  /** Assets copied to /posts/assets/, relative to the source root. Defaults to "posts/assets". */
  postAssetsDirectory?: string;
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
  /** IANA time zone for day keys and time labels. Defaults to "Asia/Shanghai". */
  timeZone?: string;
  /** Locales a file-name suffix may name. Without it every item is written in English. */
  locales?: ContentLocales;
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
  /** Canonical tag of the language the item is written in. */
  locale: string;
  /**
   * The slug the file name would have without locale suffixes, set only when a suffix was read.
   * `notes.fr.md` reports `notes.fr` here and resolves to `notes`.
   */
  previousSlug?: string;
  /** On an original: the translations that share its slug, sorted by language. */
  translations: ContentItem[];
  /** On a translation: whether it still matches the original it records. */
  translationState?: TranslationState;
  /** On a translation: the original it was translated from. */
  original?: ContentItem;
  /** On a translation: the source hash recorded in its frontmatter, when it has one. */
  translatedFrom?: string;
}

/** The `translation` frontmatter block of a translation. */
export interface TranslationRecord {
  /** The provenance hash of the original when this file was translated. */
  source?: string;
  /** A person marked the translation as reviewed; unset means it was not. */
  reviewed?: boolean;
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

/** Frontmatter keys a date may be written under, in precedence order. */
const DATE_KEYS = [
  "published_at",
  "publishedAt",
  "date",
  "created_at",
  "createdAt",
  "updated_at",
  "updatedAt",
];

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

function makeDateKey(value: unknown, date: Date | undefined, timeZone: string): string {
  const text = asText(value);
  const explicitDate = text?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (explicitDate) {
    const parsed = new Date(`${explicitDate}T00:00:00Z`);
    if (!Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(explicitDate)) {
      return explicitDate;
    }
  }
  if (!date) return "undated";
  // The "en-US" formatter only produces the numeric parts that are read back below.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")!.value;
  const month = parts.find((part) => part.type === "month")!.value;
  const day = parts.find((part) => part.type === "day")!.value;
  return `${year.padStart(4, "0")}-${month}-${day}`;
}

function makeTimeLabel(value: unknown, date: Date | undefined, timeZone: string): string {
  const text = asText(value);
  if (text) {
    return text.match(/(?:T|\s)(\d{2}:\d{2})/)?.[1] ?? "";
  }
  if (!date) return "";
  // "zh-CN" with hour12 false is only the way to print a 24-hour HH:mm; it is not a display locale.
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone,
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
  if (sourcePath.toLowerCase().endsWith(".md")) {
    return Bun.markdown.html(source, {
      tagFilter: true,
    });
  }
  return renderMdx(source, components);
}

async function collectFiles(
  directory: string,
  assetRoots: ReadonlySet<string>,
  skipNestedAssets: boolean,
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (assetRoots.has(entryPath) || (skipNestedAssets && entry.name === "assets")) continue;
      files.push(...(await collectFiles(entryPath, assetRoots, skipNestedAssets)));
      continue;
    }
    const extension = entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase();
    if (entry.isFile() && CONTENT_EXTENSIONS.has(extension)) {
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

/** Canonical tag by lower-cased file-name suffix, for the locales a content tree may carry. */
function localeSuffixes(locales: ContentLocales | undefined): Map<string, string> {
  const suffixes = new Map<string, string>();
  if (!locales) return suffixes;
  for (const tag of [locales.source, ...(locales.targets ?? [])]) {
    suffixes.set(tag.toLowerCase(), tag);
  }
  return suffixes;
}

/**
 * Split a configured locale off the last segment of a slug. The suffix is read only when it
 * names a configured locale, so `notes.v2.md` keeps its slug and `notes.fr.md` is French.
 */
function splitLocaleSuffix(
  slug: string,
  suffixes: ReadonlyMap<string, string>,
): { slug: string; locale?: string } {
  const slash = slug.lastIndexOf("/");
  const name = slug.slice(slash + 1);
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return { slug };
  const locale = suffixes.get(name.slice(dot + 1).toLowerCase());
  if (locale === undefined) return { slug };
  return { slug: `${slug.slice(0, slash + 1)}${name.slice(0, dot)}`, locale };
}

/**
 * The provenance hash of an original: the first 12 hex characters of SHA-256 over its resolved
 * title, a newline, and its body with line endings normalised to LF.
 */
export function translationHash(item: { title: string; body: string }): string {
  return createHash("sha256")
    .update(`${item.title}\n${item.body.replaceAll("\r\n", "\n")}`)
    .digest("hex")
    .slice(0, 12);
}

/** The `translation` frontmatter block, when it has the expected shape. */
export function translationRecord(metadata: Frontmatter): TranslationRecord {
  const value = metadata.translation;
  if (!isRecord(value)) return {};
  return {
    source: typeof value.source === "string" ? value.source : undefined,
    reviewed: value.reviewed === true,
  };
}

/** A translation inherits the date, tags and category of its original unless it sets them. */
function inheritFromOriginal(item: ContentItem, original: ContentItem): void {
  if (metadataValue(item.metadata, DATE_KEYS) === undefined) {
    item.date = original.date;
    item.dateKey = original.dateKey;
    item.timeLabel = original.timeLabel;
  }
  if (metadataValue(item.metadata, ["tags"]) === undefined) item.tags = [...original.tags];
  if (item.metadata.category === undefined && original.metadata.category !== undefined) {
    item.metadata.category = original.metadata.category;
  }
}

/**
 * Group items that share a slug into translation sets. With a source-locale member it is the
 * original and the others record provenance against it; without one every member is an original
 * in its own language and none is stale.
 */
function pairTranslations(items: ContentItem[], source: string): ContentItem[] {
  const sets = new Map<string, ContentItem[]>();
  for (const item of items) {
    const key = `${item.kind}\u0000${item.slug}`;
    const members = sets.get(key) ?? [];
    members.push(item);
    sets.set(key, members);
  }

  const originals: ContentItem[] = [];
  for (const members of sets.values()) {
    members.sort((left, right) => left.locale.localeCompare(right.locale));
    const original = members.find((member) => member.locale === source);
    if (!original) {
      originals.push(...members);
      continue;
    }
    original.translations = members.filter((member) => member !== original);
    for (const translation of original.translations) {
      translation.original = original;
      translation.translatedFrom = translationRecord(translation.metadata).source;
      translation.translationState =
        translation.translatedFrom === translationHash(original) ? "current" : "stale";
      inheritFromOriginal(translation, original);
    }
    originals.push(original);
  }

  return originals.sort((left, right) => {
    return (right.date?.getTime() ?? 0) - (left.date?.getTime() ?? 0);
  });
}

function normalizeSlugPrefix(prefix: string | undefined): string {
  const normalized = (prefix ?? "")
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .replaceAll(/\/+/g, "/");
  if (normalized.split("/").some((segment) => segment === "." || segment === "..")) {
    throw new Error(`Content slug prefix must not contain "." or "..": ${prefix}`);
  }
  return normalized;
}

function withSlugPrefix(prefix: string | undefined, slug: string): string {
  const normalizedPrefix = normalizeSlugPrefix(prefix);
  return normalizedPrefix ? `${normalizedPrefix}/${slug}` : slug;
}

export function normalizeContentSources(
  input: ContentSourceInput | readonly ContentSourceInput[],
  baseDirectory = process.cwd(),
): ContentSource[] {
  const sources = Array.isArray(input) ? input : [input];
  return sources.map((source) => {
    const normalized: ContentSource = typeof source === "string" ? { directory: source } : source;
    const directory = resolve(baseDirectory, normalized.directory);
    for (const mapping of [
      normalized.postsDirectory,
      normalized.thoughtsDirectory,
      normalized.assetsDirectory,
      normalized.postAssetsDirectory,
    ]) {
      if (mapping !== undefined) sourceDirectory(directory, mapping);
    }
    return {
      ...normalized,
      directory,
      slugPrefix: normalizeSlugPrefix(normalized.slugPrefix) || undefined,
    };
  });
}

function sourceDirectory(root: string, path: string): string {
  const target = resolve(root, path);
  const local = relative(root, target);
  if (isAbsolute(path) || local === ".." || local.startsWith(`..${sep}`) || isAbsolute(local)) {
    throw new Error(`Content directory must stay inside its source root: ${path}`);
  }
  return target;
}

/** Check every segment below a source root before walking a configured directory. */
async function isSourceDirectory(root: string, target: string): Promise<boolean> {
  try {
    let path = root;
    if (!(await lstat(path)).isDirectory()) return false;
    for (const segment of relative(root, target).split(sep).filter(Boolean)) {
      path = resolve(path, segment);
      if (!(await lstat(path)).isDirectory()) return false;
    }
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function assetDirectory(source: ContentSource, directory: string): string {
  const mapping =
    directory === "assets"
      ? source.assetsDirectory
      : directory === "posts/assets"
        ? source.postAssetsDirectory
        : undefined;
  return sourceDirectory(source.directory, mapping ?? directory);
}

function duplicateContentError(kind: ContentKind, slug: string): Error {
  return new Error(`Duplicate ${kind} slug "${slug}" while merging content sources.`);
}

async function loadSectionFromSource(
  source: ContentSource,
  kind: ContentKind,
  options: LoadSectionOptions,
): Promise<ContentItem[]> {
  const mapping = kind === "post" ? source.postsDirectory : source.thoughtsDirectory;
  const sectionDirectory = sourceDirectory(source.directory, mapping ?? `${kind}s`);
  if (!(await isSourceDirectory(source.directory, sectionDirectory))) return [];
  const assetRoots = new Set([
    assetDirectory(source, "assets"),
    assetDirectory(source, "posts/assets"),
  ]);
  if (assetRoots.has(sectionDirectory)) return [];
  const sourceFiles = await collectFiles(sectionDirectory, assetRoots, mapping !== undefined);

  const timeZone = options.timeZone ?? DEFAULT_TIME_ZONE;
  const sourceLocale = options.locales?.source ?? "en";
  const suffixes = localeSuffixes(options.locales);
  const items: ContentItem[] = [];
  const seen = new Map<string, string>();
  for (const sourcePath of sourceFiles) {
    if (isDraft(sourcePath, sectionDirectory, kind)) continue;

    const sourceText = await readFile(sourcePath, "utf8");
    const document = parseFrontmatter(sourceText);
    const fileSlug = withSlugPrefix(source.slugPrefix, makeSlug(sourcePath, sectionDirectory));
    const { slug, locale: suffixLocale } = splitLocaleSuffix(fileSlug, suffixes);
    const locale = suffixLocale ?? sourceLocale;
    const key = `${locale}\u0000${slug}`;
    const clash = seen.get(key);
    if (clash !== undefined) {
      throw new Error(
        `Duplicate ${kind} "${slug}" for locale "${locale}": ${clash} and ${sourcePath}`,
      );
    }
    seen.set(key, sourcePath);
    const dateValue = metadataValue(document.metadata, DATE_KEYS);
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
      dateKey: makeDateKey(dateValue, date, timeZone),
      timeLabel: makeTimeLabel(dateValue, date, timeZone),
      tags: getTags(document.metadata),
      readingMinutes: getReadingMinutes(plainText),
      characterCount: plainText.length,
      locale,
      ...(suffixLocale === undefined ? {} : { previousSlug: fileSlug }),
      translations: [],
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
      // Pairing happens after the overlay, so a translation and its original are different keys.
      const key = `${item.locale}\u0000${item.slug}`;
      if (merged.has(key)) {
        if (duplicatePolicy === "error") throw duplicateContentError(kind, item.slug);
        continue;
      }
      merged.set(key, item);
    }
  }

  return pairTranslations([...merged.values()], options.locales?.source ?? "en");
}

/**
 * Every item written in one locale: the originals in that language and the translations of
 * originals written in another one. These are the pages a locale's tree publishes.
 */
export function localizedItems(originals: readonly ContentItem[], locale: string): ContentItem[] {
  return originals
    .flatMap((original) => [original, ...original.translations])
    .filter((item) => item.locale === locale)
    .sort((left, right) => (right.date?.getTime() ?? 0) - (left.date?.getTime() ?? 0));
}

/**
 * The entries a locale's tree lists: its own pages, and the original of anything not translated
 * into it — marked with the original's language and linked to where it is published.
 */
export function treeItems(
  originals: readonly ContentItem[],
  locale: string,
  options: { source: string; untranslated: "link" | "omit" },
): ContentItem[] {
  const items: ContentItem[] = [];
  for (const original of originals) {
    const translation = original.translations.find((item) => item.locale === locale);
    if (original.locale === locale) items.push(original);
    else if (translation) items.push(translation);
    else if (options.untranslated === "link") items.push(original);
  }
  return items.sort((left, right) => (right.date?.getTime() ?? 0) - (left.date?.getTime() ?? 0));
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
    } else if (entry.isFile()) {
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
    const assetRoot = assetDirectory(source, directory);
    if (!(await isSourceDirectory(source.directory, assetRoot))) continue;
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
