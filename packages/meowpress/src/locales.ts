import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Catalog } from "meowjsx/i18n";

/** Languages a site publishes. The source locale keeps today's unprefixed routes. */
export interface SiteLocales {
  /** Language of the content and of site-owned copy such as `site.name`. */
  source: string;
  /** Other locales, published under `/<tag>/`. The label is the language's own name. */
  targets?: Record<string, { label: string }>;
  /** `link` lists originals that have no translation in a target tree; `omit` leaves them out. */
  untranslated?: "link" | "omit";
  /** Accepted and stored; stale translations are handled with content pairing. */
  stale?: "notice" | "fail";
  /** Accepted and stored; unreviewed-translation notices are handled with content pairing. */
  disclosure?: boolean;
  /** Inline catalogs by locale; they win over `locales/<tag>.json`. */
  catalogs?: Record<string, Catalog>;
}

export interface ResolvedLocaleTarget {
  /** Canonical tag, for example `zh-Hant`. */
  tag: string;
  /** URL segment and catalog file name: the canonical tag in lower case. */
  segment: string;
  label: string;
}

export interface ResolvedLocales {
  source: string;
  targets: readonly ResolvedLocaleTarget[];
  untranslated: "link" | "omit";
  stale: "notice" | "fail";
  disclosure: boolean;
  /** Inline catalogs keyed by canonical tag. */
  catalogs: Readonly<Record<string, Catalog>>;
}

/** Top-level names the built-in routes and assets already use. */
export const RESERVED_SEGMENTS: readonly string[] = [
  "posts",
  "thoughts",
  "skills",
  "about",
  "assets",
  "fonts",
  "licenses",
];

export function localeSegment(tag: string): string {
  return tag.toLowerCase();
}

function canonicalTag(tag: string, where: string): string {
  try {
    const [canonical] = Intl.getCanonicalLocales(tag);
    if (canonical) return canonical;
  } catch {
    // Reported below with the offending tag.
  }
  throw new Error(`Invalid locale tag in ${where}: ${JSON.stringify(tag)}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function checkCatalog(value: unknown, where: string): Catalog {
  if (!isRecord(value)) throw new Error(`Expected a catalog object in ${where}`);
  for (const [source, entry] of Object.entries(value)) {
    const valid =
      typeof entry === "string" ||
      (isRecord(entry) &&
        Object.values(entry).every((translation) => typeof translation === "string"));
    if (!valid) {
      throw new Error(
        `Catalog entry ${JSON.stringify(source)} in ${where} must be a string or an object of strings`,
      );
    }
  }
  return value as Catalog;
}

function assertNotReserved(tag: string, taken: ReadonlySet<string>): void {
  if (taken.has(localeSegment(tag))) {
    throw new Error(
      `Locale "${tag}" would be published under /${localeSegment(tag)}/, which collides with an existing route or directory`,
    );
  }
}

function isResolved(input: SiteLocales | ResolvedLocales): input is ResolvedLocales {
  return Array.isArray((input as { targets?: unknown }).targets);
}

/** Validate and canonicalize the `locales` option. Returns undefined when it is not set. */
export function resolveLocales(
  input: SiteLocales | ResolvedLocales | undefined,
): ResolvedLocales | undefined {
  if (input === undefined) return undefined;
  // A resolved config passes through `meowSite` again when it is handed to `buildSite`.
  if (isResolved(input)) return input;
  if (!isRecord(input) || typeof input.source !== "string")
    throw new Error('locales.source must be a language tag such as "en"');
  const source = canonicalTag(input.source, "locales.source");
  const targets: ResolvedLocaleTarget[] = [];
  const seen = new Map<string, string>([[source, input.source]]);
  const fixed = new Set(RESERVED_SEGMENTS);
  for (const [rawTag, target] of Object.entries(input.targets ?? {})) {
    const tag = canonicalTag(rawTag, "locales.targets");
    if (tag === source) throw new Error(`Locale target "${rawTag}" is the source locale`);
    if (seen.has(tag))
      throw new Error(`Locale "${rawTag}" repeats "${seen.get(tag)}" after canonicalisation`);
    seen.set(tag, rawTag);
    if (!isRecord(target) || typeof target.label !== "string" || target.label.trim() === "")
      throw new Error(`Locale target "${rawTag}" needs a label, the language's own name`);
    assertNotReserved(tag, fixed);
    targets.push({ tag, segment: localeSegment(tag), label: target.label });
  }
  const segments = new Map<string, string>();
  for (const target of targets) {
    const clash = segments.get(target.segment);
    if (clash)
      throw new Error(`Locales "${clash}" and "${target.tag}" share the URL /${target.segment}/`);
    segments.set(target.segment, target.tag);
  }
  const untranslated = input.untranslated ?? "link";
  if (untranslated !== "link" && untranslated !== "omit")
    throw new Error('locales.untranslated must be "link" or "omit"');
  const stale = input.stale ?? "notice";
  if (stale !== "notice" && stale !== "fail")
    throw new Error('locales.stale must be "notice" or "fail"');
  const disclosure = input.disclosure ?? true;
  if (typeof disclosure !== "boolean") throw new Error("locales.disclosure must be a boolean");
  const catalogs: Record<string, Catalog> = {};
  for (const [rawTag, catalog] of Object.entries(input.catalogs ?? {})) {
    const tag = canonicalTag(rawTag, "locales.catalogs");
    catalogs[tag] = { ...catalogs[tag], ...checkCatalog(catalog, `locales.catalogs.${rawTag}`) };
  }
  return { source, targets, untranslated, stale, disclosure, catalogs };
}

/**
 * Catalogs by canonical tag: `<directory>/<tag-lower-case>.json` for the source and every target
 * locale when the file exists, with the inline catalog merged over it. A missing file is an empty
 * catalog, so every sentence falls back to English.
 */
export async function loadLocaleCatalogs(
  locales: ResolvedLocales,
  directory: string,
): Promise<Record<string, Catalog>> {
  const catalogs: Record<string, Catalog> = {};
  const tags = [locales.source, ...locales.targets.map((target) => target.tag)];
  for (const tag of new Set([...tags, ...Object.keys(locales.catalogs)])) {
    let fromFile: Catalog = {};
    if (tags.includes(tag)) {
      const file = join(directory, `${localeSegment(tag)}.json`);
      let text: string | undefined;
      try {
        text = await readFile(file, "utf8");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      if (text !== undefined) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch (error) {
          throw new Error(
            `Locale catalog is not valid JSON: ${file} (${(error as Error).message})`,
          );
        }
        fromFile = checkCatalog(parsed, file);
      }
    }
    catalogs[tag] = { ...fromFile, ...locales.catalogs[tag] };
  }
  return catalogs;
}

/**
 * Refuse a target whose URL segment is already a top-level route or directory of the output.
 * `taken` holds the names only the build knows: content asset roots, slug prefixes and the first
 * segment of every consumer page.
 */
export function assertNoRouteCollisions(
  locales: ResolvedLocales,
  taken: ReadonlySet<string>,
): void {
  for (const target of locales.targets) assertNotReserved(target.tag, taken);
}

/** The first path segment of a route or asset path, lower-cased, or undefined for the root. */
export function firstSegment(path: string): string | undefined {
  return path
    .split(/[\\/]/)
    .find((part) => part !== "")
    ?.toLowerCase();
}
