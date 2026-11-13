import type { Catalog } from "meowjsx/i18n";
import { auditCatalog, type AuditMessage, type AuditResult } from "meowjsx/i18n/audit";
import { readFile, writeFile } from "node:fs/promises";
import { isAbsolute, relative } from "node:path";
import { parseDocument } from "yaml";
import {
  translationHash,
  type ContentItem,
  type ContentKind,
  type TranslationState,
} from "./content";
import type { SiteIdentity, SiteNotFound } from "./identity";
import type { ResolvedLocales } from "./locales";
import { themeMessages } from "./messages";

/** The route a content page is published under, in the tree of the language it is written in. */
export function contentRoute(
  kind: ContentKind,
  slug: string,
  locale: string,
  source: string,
): string {
  const route = `/${kind}s/${slug}/`;
  return locale === source ? route : `/${locale.toLowerCase()}${route}`;
}

/** A path as it is reported: relative to the working directory when it is inside it. */
export function reportedPath(path: string): string {
  const local = relative(process.cwd(), path);
  return local === "" || local.startsWith("..") || isAbsolute(local) ? path : local;
}

/** Where a translation of `original` would be written: `first.md` becomes `first.fr.md`. */
export function translationFilePath(original: ContentItem, segment: string): string {
  return original.sourcePath.replace(/\.(md|mdx)$/i, `.${segment}.$1`);
}

/** One page of the translation manifest: what exists, in which language, and what it trusts. */
export interface ManifestPage {
  kind: ContentKind;
  slug: string;
  locale: string;
  url: string;
  /** The content file, relative to the working directory when it is inside it. */
  file: string;
  state: "original" | TranslationState;
  /** The current provenance hash of the original this page belongs to. */
  hash: string;
  /** On a translation: the original's URL. */
  original?: string;
  /** On a translation: the source hash recorded when it was translated. */
  translatedFrom?: string;
}

/** One item of the work list: a page that is missing or stale in a target locale. */
export interface ContentWorkItem {
  kind: ContentKind;
  slug: string;
  state: "missing" | "stale";
  original: { locale: string; file: string; url: string; hash: string };
  target: { locale: string; file: string; url: string; hash: string };
  translatedFrom?: string;
}

/** What one locale still needs: interface sentences and content pages. */
export interface LocaleWork {
  messages: AuditResult;
  content: ContentWorkItem[];
}

/** One page a consumer's site map supplies, in the manifest when it names its language. */
export interface ManifestSitePage {
  path: string;
  locale?: string;
  original?: string;
}

/** The work list `meowpress locales` prints and `/translations.json` publishes. */
export interface TranslationReport {
  source: string;
  targets: readonly { tag: string; segment: string; label: string }[];
  /** Every content page, in every language, with the state of its translation. */
  pages: ManifestPage[];
  /** The consumer's own pages, when the site map is theirs. */
  sitePages: ManifestSitePage[];
  /** Per locale that needs work, keyed by canonical tag. */
  work: Record<string, LocaleWork>;
}

/** The sentences of the site's own configuration that go through the catalog. */
export function siteCopyMessages(
  site: SiteIdentity,
  notFound: SiteNotFound | false | undefined,
): AuditMessage[] {
  const messages: AuditMessage[] = [{ source: site.name }, { source: site.description }];
  const about = site.about;
  if (about) {
    messages.push({ source: about.heading }, ...about.paragraphs.map((source) => ({ source })));
    if (about.linksHeading !== undefined) messages.push({ source: about.linksHeading });
    for (const link of about.links ?? []) messages.push({ source: link.label });
  }
  if (notFound !== false) {
    for (const source of [notFound?.title, notFound?.message, notFound?.homeLabel]) {
      if (source !== undefined) messages.push({ source });
    }
  }
  return messages.filter((message) => message.source !== "");
}

/** The theme's declared sentences as audit messages. */
const THEME_AUDIT_MESSAGES: readonly AuditMessage[] = Object.values(themeMessages).map(
  (message) => ({ source: message.source, context: message.context, note: message.note }),
);

function pagesOf(originals: readonly ContentItem[], source: string): ManifestPage[] {
  const pages: ManifestPage[] = [];
  for (const original of originals) {
    const hash = translationHash(original);
    const url = contentRoute(original.kind, original.slug, original.locale, source);
    pages.push({
      kind: original.kind,
      slug: original.slug,
      locale: original.locale,
      url,
      file: reportedPath(original.sourcePath),
      state: "original",
      hash,
    });
    for (const translation of original.translations) {
      pages.push({
        kind: translation.kind,
        slug: translation.slug,
        locale: translation.locale,
        url: contentRoute(translation.kind, translation.slug, translation.locale, source),
        file: reportedPath(translation.sourcePath),
        state: translation.translationState ?? "stale",
        hash,
        original: url,
        ...(translation.translatedFrom === undefined
          ? {}
          : { translatedFrom: translation.translatedFrom }),
      });
    }
  }
  return pages;
}

function contentWork(
  originals: readonly ContentItem[],
  locale: string,
  segment: string,
  source: string,
): ContentWorkItem[] {
  const items: ContentWorkItem[] = [];
  for (const original of originals) {
    // Only a source-locale original has translations; its own language needs no work item.
    if (original.locale !== source) continue;
    const hash = translationHash(original);
    const translation = original.translations.find((item) => item.locale === locale);
    const originalUrl = contentRoute(original.kind, original.slug, source, source);
    if (!translation) {
      items.push({
        kind: original.kind,
        slug: original.slug,
        state: "missing",
        original: {
          locale: source,
          file: reportedPath(original.sourcePath),
          url: originalUrl,
          hash,
        },
        target: {
          locale,
          file: reportedPath(translationFilePath(original, segment)),
          url: contentRoute(original.kind, original.slug, locale, source),
          hash,
        },
      });
      continue;
    }
    if (translation.translationState === "current") continue;
    items.push({
      kind: original.kind,
      slug: original.slug,
      state: "stale",
      original: {
        locale: source,
        file: reportedPath(original.sourcePath),
        url: originalUrl,
        hash,
      },
      target: {
        locale,
        file: reportedPath(translation.sourcePath),
        url: contentRoute(original.kind, original.slug, locale, source),
        hash,
      },
      ...(translation.translatedFrom === undefined
        ? {}
        : { translatedFrom: translation.translatedFrom }),
    });
  }
  return items;
}

export interface TranslationReportOptions {
  locales: ResolvedLocales;
  catalogs: Readonly<Record<string, Catalog>>;
  site: SiteIdentity;
  notFound?: SiteNotFound | false;
  posts: readonly ContentItem[];
  thoughts: readonly ContentItem[];
  /** The consumer's own site map, when it supplies one. */
  pages?: readonly { path: string; locale?: string; original?: string }[];
}

/**
 * The work list and the manifest: every content page with the state of its translation, and what
 * each configured locale still needs. No IO and no writing; the CLI prints it and the build
 * publishes it.
 */
export function translationReport(options: TranslationReportOptions): TranslationReport {
  const { locales, catalogs, site, notFound } = options;
  const originals = [...options.posts, ...options.thoughts];
  const copy = siteCopyMessages(site, notFound);
  const work: Record<string, LocaleWork> = {};
  for (const locale of [locales.source, ...locales.targets.map((target) => target.tag)]) {
    const isTarget = locale !== locales.source;
    const isEnglish = locale === "en";
    // The theme's source language is English; every other locale needs its sentences.
    const messages = auditCatalog(
      isEnglish ? [] : THEME_AUDIT_MESSAGES,
      catalogs[locale] ?? {},
      locale,
      {
        extra: isTarget ? copy : [],
      },
    );
    if (!isTarget && isEnglish) continue;
    const segment =
      locales.targets.find((target) => target.tag === locale)?.segment ??
      locales.source.toLowerCase();
    work[locale] = {
      messages,
      content: isTarget ? contentWork(originals, locale, segment, locales.source) : [],
    };
  }
  return {
    source: locales.source,
    targets: locales.targets.map(({ tag, segment, label }) => ({ tag, segment, label })),
    pages: pagesOf(originals, locales.source),
    sitePages: (options.pages ?? []).map((page) => ({
      path: page.path,
      ...(page.locale === undefined ? {} : { locale: page.locale }),
      ...(page.original === undefined ? {} : { original: page.original }),
    })),
    work,
  };
}

/** One work item as a line a person or an agent reads in a terminal. */
export function formatReport(report: TranslationReport): string {
  const lines: string[] = [];
  for (const [locale, work] of Object.entries(report.work)) {
    for (const index of work.messages.missing) {
      const context = index.context === undefined ? "" : ` [${index.context}]`;
      lines.push(`${locale} message: ${JSON.stringify(index.source)}${context}`);
    }
    for (const item of work.content) {
      if (item.state === "missing") {
        lines.push(`${locale} missing: ${item.target.file}`);
        continue;
      }
      const from = item.translatedFrom ?? "an unrecorded version";
      lines.push(
        `${locale} stale: ${item.target.file} (translated from ${from}; original is ${item.original.hash})`,
      );
    }
  }
  return lines.join("\n");
}

const FRONTMATTER = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;

/**
 * Write the current provenance hash of the original into a translation's frontmatter, after the
 * translation has been written or revised. A file without frontmatter gains one.
 */
export async function stampTranslation(
  file: string,
  originals: readonly ContentItem[],
): Promise<{ file: string; hash: string }> {
  const translation = originals
    .flatMap((original) => original.translations)
    .find((item) => item.sourcePath === file);
  if (!translation?.original) {
    throw new Error(`Not a translation of any content original: ${file}`);
  }
  const hash = translationHash(translation.original);
  const text = await readFile(file, "utf8");
  const match = text.match(FRONTMATTER);
  let next: string;
  if (!match) {
    next = `---\ntranslation:\n  source: ${hash}\n---\n\n${text}`;
  } else {
    const document = parseDocument(match[1]!);
    document.setIn(["translation", "source"], hash);
    const rest = text.slice(match[0].length);
    next = `---\n${String(document).trimEnd()}\n---\n${rest}`;
  }
  await writeFile(file, next, "utf8");
  return { file, hash };
}
