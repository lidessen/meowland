import type { Child } from "meowjsx";
import {
  createI18n,
  type Catalog,
  type CreateI18nOptions,
  type I18n,
  type MessageDescriptor,
  type MessageParams,
  type Message,
  type MissingMessage,
  type RichPart,
  type Translate,
  type TranslateOptions,
} from "meowjsx/i18n";
import { derived, isSignal, type ReadableSignal } from "meowjsx/signal";
import { themeMessages } from "./messages";

type Input = string | MessageDescriptor | ReadableSignal<MessageDescriptor>;
type AnyTranslate = (input: Input, params?: MessageParams, options?: TranslateOptions) => Message;
type AnyRich = (
  input: Input,
  parts: { readonly [name: string]: RichPart },
  params?: MessageParams,
  options?: TranslateOptions,
) => ReadableSignal<Child>;

function messageKey(source: string, context: string | undefined): string {
  return JSON.stringify([context ?? "", source]);
}

const declared: ReadonlySet<string> = new Set(
  Object.values(themeMessages).map((message) => messageKey(message.source, message.context)),
);

/** Fails the build when a sentence reaches the theme's instance without being in the table. */
function assertDeclared(source: string, context: string | undefined): void {
  if (declared.has(messageKey(source, context))) return;
  throw new Error(
    `Meowpress theme message is not declared in themeMessages (src/messages.ts): ${JSON.stringify(source)}` +
      (context ? ` with context ${JSON.stringify(context)}` : "") +
      ". Add it to the table and use the descriptor instead of an inline literal.",
  );
}

function checkInput(input: Input, options: TranslateOptions | undefined): Input {
  if (isSignal<MessageDescriptor>(input)) {
    // A Signal of a descriptor resolves on read, so the check runs on read.
    return derived(() => {
      const descriptor = input.value;
      assertDeclared(descriptor.source, descriptor.context ?? options?.context);
      return descriptor;
    });
  }
  if (typeof input === "string") assertDeclared(input, options?.context);
  else assertDeclared(input.source, input.context ?? options?.context);
  return input;
}

/**
 * An instance for the built-in theme: the same as `createI18n`, except that `t` and `t.rich`
 * refuse any source that is not declared in `themeMessages`. The theme and any component it
 * renders through `I18nProvider` therefore cannot carry a sentence the work list does not know.
 * `lookup` is not checked: it translates site-owned copy that no table can list.
 */
export function createThemeI18n(options: CreateI18nOptions): I18n {
  const inner = createI18n(options);
  const innerT = inner.t as unknown as AnyTranslate;
  const innerRich = inner.t.rich as unknown as AnyRich;
  const translate: AnyTranslate = (input, params, translateOptions) =>
    innerT(checkInput(input, translateOptions), params, translateOptions);
  const rich: AnyRich = (input, parts, params, translateOptions) =>
    innerRich(checkInput(input, translateOptions), parts, params, translateOptions);
  return { ...inner, t: Object.assign(translate, { rich }) as unknown as Translate };
}

/** A locale the site publishes, as a page sees it for the language switch and alternate links. */
export interface LocaleEntry {
  /** Canonical tag, written to `lang` and `hreflang`. */
  tag: string;
  /** URL segment, "" for the source tree. */
  segment: string;
  /** The language's own name, shown by the language switch. */
  label: string;
  isSource: boolean;
}

/**
 * What a page needs to know about the locale it is rendered for. Page functions receive it
 * explicitly because they are plain functions: the ambient `t` works only in component bodies.
 */
export interface PageLocale {
  /** Canonical tag, written to `<html lang>`. */
  readonly tag: string;
  readonly direction: "ltr" | "rtl";
  /** URL segment of a target locale (the lower-cased tag), or "" for the source locale. */
  readonly segment: string;
  /** The language site-owned copy and content are written in. */
  readonly source: string;
  /** The tree that keeps the unprefixed routes. */
  readonly isSource: boolean;
  /** Every locale the site publishes, the source first; one entry on a single-locale site. */
  readonly entries: readonly LocaleEntry[];
  /** Whether an unreviewed translation says so on the page. */
  readonly disclosure: boolean;
  /** Theme sentences. Its source language is always English. */
  readonly i18n: I18n;
  /** Site-owned copy (name, description, About, 404) in this locale, written in `source`. */
  copy(text: string): string;
}

export interface PageLocaleOptions {
  tag: string;
  source: string;
  segment: string;
  catalogs: Readonly<Record<string, Catalog>>;
  timeZone?: string;
  onMissing?: (miss: MissingMessage) => void;
  entries?: readonly LocaleEntry[];
  disclosure?: boolean;
}

export function createPageLocale(options: PageLocaleOptions): PageLocale {
  const i18n = createThemeI18n({
    source: "en",
    locale: options.tag,
    catalogs: options.catalogs,
    timeZone: options.timeZone,
    onMissing: options.onMissing,
  });
  // Site copy is written in the content source locale, not in the theme's English.
  const copyI18n = createI18n({
    source: options.source,
    locale: options.tag,
    catalogs: options.catalogs,
    timeZone: options.timeZone,
    onMissing: options.onMissing,
  });
  const tag = i18n.locale.value;
  return {
    tag,
    direction: i18n.direction.value,
    segment: options.segment,
    source: options.source,
    isSource: options.segment === "",
    entries: options.entries ?? [
      { tag, segment: options.segment, label: tag, isSource: options.segment === "" },
    ],
    disclosure: options.disclosure ?? true,
    i18n,
    copy: (text) => (text === "" ? text : copyI18n.lookup(text).value),
  };
}

let english: PageLocale | undefined;

/** The locale every page function uses when the caller passes none. */
export function defaultPageLocale(): PageLocale {
  english ??= createPageLocale({ tag: "en", source: "en", segment: "", catalogs: {} });
  return english;
}

/** Routes that exist once per locale; every other route exists only in the source tree. */
const TRANSLATED_ROUTES: ReadonlySet<string> = new Set(["/", "/posts/", "/thoughts/", "/about/"]);

/** The URL of an internal route for a locale. Every internal link of the theme goes through
 * it. A route that exists only in the source tree (skills) keeps its source URL. */
export function localePath(locale: PageLocale, path: string): string {
  if (locale.segment === "" || !TRANSLATED_ROUTES.has(path)) return path;
  return `/${locale.segment}${path}`;
}

/**
 * The URL of a content item, in the tree of the language it is written in. An original in the
 * source locale keeps the unprefixed route; anything else lives under its locale's segment.
 */
export function contentUrl(
  locale: PageLocale,
  item: { kind: string; slug: string; locale: string },
): string {
  const route = `/${item.kind}s/${item.slug}/`;
  if (item.locale === locale.source) return route;
  const entry = locale.entries.find((candidate) => candidate.tag === item.locale);
  return `/${entry?.segment ?? item.locale.toLowerCase()}${route}`;
}

/** The text of a message that carries named tags, with the parts supplied by the page. */
export function richMessage(
  locale: PageLocale,
  message: MessageDescriptor,
  parts: { readonly [name: string]: RichPart },
  params?: MessageParams,
): Child {
  return (locale.i18n.t.rich as unknown as AnyRich)(message, parts, params).value;
}
