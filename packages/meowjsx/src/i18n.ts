import { createContext, isInComponentBody, useContext } from "./context";
import { derived, signal, unwrap } from "./reactive";
import type { MaybeSignal, ReadableSignal, WritableSignal } from "./types";

/**
 * Internationalization for MeowJSX. DOM-free: it uses only ECMAScript and `Intl`.
 * The source sentence is the message identity; a message is a `ReadableSignal`
 * that follows the locale, the catalogs and any Signal parameter.
 */

/** A translation, or translations of one source keyed by context (`""` = no context). */
export type CatalogEntry = string | { readonly [context: string]: string };
/** Flat map from source text to its translation in one locale. */
export type Catalog = { readonly [source: string]: CatalogEntry };
/** A message value; reading `.value` yields the current string. */
export type Message = ReadableSignal<string>;
export type MessageParam = MaybeSignal<string | number>;
export type MessageParams = { readonly [name: string]: MessageParam };

export interface TranslateOptions {
  /** Part of the message identity; separates homographs. */
  readonly context?: string;
  /** A note for translators. Never part of the identity and ignored at run time. */
  readonly note?: string;
}

export interface MissingMessage {
  readonly source: string;
  readonly context?: string;
  readonly locale: string;
}

export interface CreateI18nOptions {
  /** Language the source sentences are written in. */
  readonly source: string;
  /** Initial locale, or a Signal to adopt as `locale`. Defaults to `source`. */
  readonly locale?: string | WritableSignal<string>;
  readonly catalogs?: { readonly [locale: string]: Catalog };
  /** Loads the catalog of a locale that `setLocale` has not seen yet. */
  readonly load?: (locale: string) => Promise<Catalog>;
  /** Default time zone of `date()`. */
  readonly timeZone?: string;
  /** Called once per (source, context, locale) that has no translation. */
  readonly onMissing?: (miss: MissingMessage) => void;
}

declare const looseParams: unique symbol;
type Loose = typeof looseParams;

/**
 * Parameter names of a template. Only a template without `,` inside braces, without
 * a nested brace, without a space inside a name and without an apostrophe is
 * analyzed; any other template is `Loose`.
 */
type ParamNames<S extends string, Found extends string = never> = S extends `${string}'${string}`
  ? Loose
  : S extends `${string}{${infer Inner}}${infer Rest}`
    ? Inner extends `${string}${"," | "{" | " "}${string}`
      ? Loose
      : ParamNames<Rest, Found | Inner>
    : Found;

type TranslateArguments<S extends string> = [ParamNames<S>] extends [never]
  ? [params?: { readonly [name: string]: never } | undefined, options?: TranslateOptions]
  : [ParamNames<S>] extends [Loose]
    ? [params?: MessageParams, options?: TranslateOptions]
    : [params: { readonly [Name in ParamNames<S>]: MessageParam }, options?: TranslateOptions];

/**
 * `t(source, params?, options?)`. The source must be written as a literal: a value of
 * type `string`, or a template literal with a runtime part, is refused. Named parameters are required when the literal is simple.
 */
export interface Translate {
  <S extends string>(
    source: {} extends Record<S, 1> ? never : S,
    ...rest: TranslateArguments<S>
  ): Message;
}

export interface I18n {
  readonly locale: WritableSignal<string>;
  readonly direction: ReadableSignal<"ltr" | "rtl">;
  readonly t: Translate;
  number(value: MaybeSignal<number>, options?: Intl.NumberFormatOptions): ReadableSignal<string>;
  date(
    value: MaybeSignal<Date | number>,
    options?: Intl.DateTimeFormatOptions,
  ): ReadableSignal<string>;
  addCatalog(locale: string, catalog: Catalog): void;
  /**
   * Loads the catalog first when `load` is given and the locale has none, then writes
   * `locale`. With concurrent calls only the last one writes.
   */
  setLocale(locale: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Message format: {name}, {name, plural, =N {...} one {...} other {...}} and #.
// The AST is a union so `select` and `selectordinal` can be added as node types.
// ---------------------------------------------------------------------------

const PLURAL_CATEGORIES = new Set(["zero", "one", "two", "few", "many", "other"]);

type Node =
  | { readonly type: "text"; readonly value: string }
  | { readonly type: "arg"; readonly name: string }
  | { readonly type: "pound" }
  | {
      readonly type: "plural";
      readonly name: string;
      readonly exact: ReadonlyMap<number, readonly Node[]>;
      readonly categories: ReadonlyMap<string, readonly Node[]>;
    };

class ParseFailure extends Error {}

function parseTemplate(template: string): readonly Node[] {
  let index = 0;

  const fail = (reason: string): never => {
    throw new ParseFailure(`${reason} at position ${index}`);
  };
  const skipSpace = (): void => {
    while (index < template.length && /\s/.test(template[index]!)) index += 1;
  };
  const readToken = (stop: RegExp): string => {
    const start = index;
    while (index < template.length && !stop.test(template[index]!)) index += 1;
    return template.slice(start, index);
  };

  function parseNodes(inPlural: boolean, nested: boolean): Node[] {
    const nodes: Node[] = [];
    let text = "";
    const flush = (): void => {
      if (text) nodes.push({ type: "text", value: text });
      text = "";
    };
    while (index < template.length) {
      const char = template[index]!;
      if (char === "'") {
        const next = template[index + 1];
        if (next === "'") {
          text += "'";
          index += 2;
        } else if (next === "{" || next === "}" || next === "#") {
          index += 1;
          // A quoted section runs to the next apostrophe, or to the end of the text.
          while (index < template.length) {
            if (template[index] === "'") {
              if (template[index + 1] === "'") {
                text += "'";
                index += 2;
                continue;
              }
              index += 1;
              break;
            }
            text += template[index];
            index += 1;
          }
        } else {
          text += "'";
          index += 1;
        }
      } else if (char === "{") {
        flush();
        index += 1;
        nodes.push(parseArgument());
      } else if (char === "}") {
        if (!nested) fail("Unmatched }");
        break;
      } else if (char === "#" && inPlural) {
        flush();
        nodes.push({ type: "pound" });
        index += 1;
      } else {
        text += char;
        index += 1;
      }
    }
    flush();
    return nodes;
  }

  function parseArgument(): Node {
    skipSpace();
    const name = readToken(/[\s,{}]/);
    if (!name) fail("Missing argument name");
    skipSpace();
    if (template[index] === "}") {
      index += 1;
      return { type: "arg", name };
    }
    if (template[index] !== ",") return fail("Expected , or }");
    index += 1;
    skipSpace();
    const kind = readToken(/[\s,{}]/);
    if (kind !== "plural") return fail(`Unsupported argument type "${kind}"`);
    skipSpace();
    if (template[index] !== ",") return fail("Expected , after plural");
    index += 1;
    return parsePluralBranches(name);
  }

  function parsePluralBranches(name: string): Node {
    const exact = new Map<number, readonly Node[]>();
    const categories = new Map<string, readonly Node[]>();
    for (;;) {
      skipSpace();
      if (index >= template.length) return fail("Unclosed plural argument");
      if (template[index] === "}") {
        index += 1;
        break;
      }
      const selector = readToken(/[\s{}]/);
      skipSpace();
      if (!selector || template[index] !== "{") return fail("Expected a selector and {");
      index += 1;
      const body = parseNodes(true, true);
      if (template[index] !== "}") return fail("Unclosed plural branch");
      index += 1;
      if (selector.startsWith("=")) {
        if (!/^=\d+$/.test(selector)) return fail(`Invalid selector "${selector}"`);
        const value = Number(selector.slice(1));
        if (exact.has(value)) return fail(`Duplicate selector "${selector}"`);
        exact.set(value, body);
      } else {
        if (!PLURAL_CATEGORIES.has(selector)) return fail(`Invalid selector "${selector}"`);
        if (categories.has(selector)) return fail(`Duplicate selector "${selector}"`);
        categories.set(selector, body);
      }
    }
    if (!categories.has("other")) return fail('A plural needs an "other" branch');
    return { type: "plural", name, exact, categories };
  }

  return parseNodes(false, false);
}

// ---------------------------------------------------------------------------
// Locales
// ---------------------------------------------------------------------------

const RTL_SCRIPTS = new Set([
  "Arab",
  "Hebr",
  "Thaa",
  "Syrc",
  "Nkoo",
  "Adlm",
  "Rohg",
  "Mand",
  "Samr",
  "Mend",
]);

function canonicalLocale(tag: string): string {
  try {
    const [canonical] = Intl.getCanonicalLocales(tag);
    if (canonical) return canonical;
  } catch {
    // Reported below with the offending tag.
  }
  throw new Error(`meowjsx/i18n: invalid locale tag ${JSON.stringify(tag)}`);
}

/** `zh-Hant-TW` gives `zh-Hant-TW`, `zh-Hant`, `zh`. Extension subtags are not parents. */
function localeChain(locale: string): string[] {
  const parts = locale.split("-");
  const end = parts.findIndex((part, position) => position > 0 && part.length === 1);
  const base = end < 0 ? parts : parts.slice(0, end);
  const chain: string[] = [];
  for (let length = base.length; length > 0; length -= 1)
    chain.push(base.slice(0, length).join("-"));
  return chain;
}

function isLocaleOrChildOf(locale: string, parent: string): boolean {
  return locale === parent || locale.startsWith(`${parent}-`);
}

function scriptDirection(locale: string): "ltr" | "rtl" {
  const script = new Intl.Locale(locale).maximize().script;
  return script !== undefined && RTL_SCRIPTS.has(script) ? "rtl" : "ltr";
}

function ownEntry(catalog: Catalog, source: string): CatalogEntry | undefined {
  return Object.hasOwn(catalog, source) ? catalog[source] : undefined;
}

function translationFor(catalog: Catalog, source: string, context: string | undefined) {
  const entry = ownEntry(catalog, source);
  let found: unknown;
  if (typeof entry === "string")
    found = context === undefined || context === "" ? entry : undefined;
  else if (typeof entry === "object" && entry !== null)
    found = Object.hasOwn(entry, context ?? "") ? entry[context ?? ""] : undefined;
  return typeof found === "string" && found !== "" ? found : undefined;
}

const MESSAGE_IS_A_SIGNAL =
  "meowjsx/i18n: a message is a Signal, not a string. Read .value for the current string, " +
  'or pass variables through t("template {name}", { name }) instead of concatenating.';

function refuseString(): never {
  throw new Error(MESSAGE_IS_A_SIGNAL);
}

function messageSignal(read: () => string): Message {
  const message = derived(read);
  Object.defineProperties(message, {
    toString: { value: refuseString },
    [Symbol.toPrimitive]: { value: refuseString },
  });
  return message;
}

// ---------------------------------------------------------------------------
// Instance
// ---------------------------------------------------------------------------

type ParamValues = ReadonlyMap<string, unknown>;

export function createI18n(options: CreateI18nOptions): I18n {
  const sourceLocale = canonicalLocale(options.source);
  const initial = options.locale ?? sourceLocale;
  const locale: WritableSignal<string> =
    typeof initial === "string" ? signal(canonicalLocale(initial)) : initial;
  if (typeof initial !== "string") canonicalLocale(initial.value);

  const catalogs = new Map<string, Catalog>();
  const catalogVersion = signal(0);
  const parsed = new Map<string, readonly Node[]>();
  const reported = new Set<string>();
  const formatters = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat | Intl.PluralRules>();
  const canonicalCache = new Map<string, string>();
  let latestSwitch = 0;

  const addCatalog = (target: string, catalog: Catalog): void => {
    const tag = canonicalLocale(target);
    catalogs.set(tag, { ...catalogs.get(tag), ...catalog });
    catalogVersion.value += 1;
  };
  for (const [tag, catalog] of Object.entries(options.catalogs ?? {})) addCatalog(tag, catalog);

  const currentLocale = (): string => {
    const tag = locale.value;
    let canonical = canonicalCache.get(tag);
    if (canonical === undefined) {
      canonical = canonicalLocale(tag);
      canonicalCache.set(tag, canonical);
    }
    return canonical;
  };

  const formatter = <F extends Intl.NumberFormat | Intl.DateTimeFormat | Intl.PluralRules>(
    kind: string,
    tag: string,
    formatOptions: object | undefined,
    create: () => F,
  ): F => {
    const key = `${kind}\u0000${tag}\u0000${JSON.stringify(formatOptions ?? {})}`;
    let cached = formatters.get(key);
    if (!cached) {
      cached = create();
      formatters.set(key, cached);
    }
    return cached as F;
  };
  const numberFormat = (tag: string, formatOptions?: Intl.NumberFormatOptions) =>
    formatter("number", tag, formatOptions, () => new Intl.NumberFormat(tag, formatOptions));

  const parse = (template: string, describe: string): readonly Node[] => {
    let nodes = parsed.get(template);
    if (!nodes) {
      try {
        nodes = parseTemplate(template);
      } catch (error) {
        if (!(error instanceof ParseFailure)) throw error;
        throw new Error(
          `meowjsx/i18n: cannot parse ${describe} ${JSON.stringify(template)}: ${error.message}`,
        );
      }
      parsed.set(template, nodes);
    }
    return nodes;
  };

  const format = (nodes: readonly Node[], values: ParamValues, tag: string, pound?: string) => {
    let output = "";
    for (const node of nodes) {
      if (node.type === "text") output += node.value;
      else if (node.type === "pound") output += pound ?? "#";
      else if (node.type === "arg") {
        const value = values.get(node.name);
        if (value === undefined) output += `{${node.name}}`;
        else output += typeof value === "number" ? numberFormat(tag).format(value) : String(value);
      } else {
        const value = values.get(node.name);
        if (value === undefined) {
          output += `{${node.name}}`;
          continue;
        }
        const count = typeof value === "number" ? value : Number(value);
        const display = Number.isNaN(count) ? String(value) : numberFormat(tag).format(count);
        const branch =
          node.exact.get(count) ??
          node.categories.get(
            formatter("plural", tag, undefined, () => new Intl.PluralRules(tag)).select(count),
          ) ??
          node.categories.get("other")!;
        output += format(branch, values, tag, display);
      }
    }
    return output;
  };

  const report = (source: string, context: string | undefined, tag: string): void => {
    const key = JSON.stringify([tag, context ?? null, source]);
    if (reported.has(key)) return;
    reported.add(key);
    options.onMissing?.({ source, ...(context === undefined ? {} : { context }), locale: tag });
  };

  const resolve = (source: string, context: string | undefined, tag: string) => {
    if (isLocaleOrChildOf(tag, sourceLocale)) return { template: source, describe: "message" };
    for (const candidate of localeChain(tag)) {
      const catalog = catalogs.get(candidate);
      const found = catalog && translationFor(catalog, source, context);
      if (found !== undefined)
        return { template: found, describe: `translation of ${JSON.stringify(source)}` };
    }
    report(source, context, tag);
    return { template: source, describe: "message" };
  };

  const translate = (
    source: string,
    params?: MessageParams,
    translateOptions?: TranslateOptions,
  ): Message => {
    const context = translateOptions?.context;
    return messageSignal(() => {
      const tag = currentLocale();
      void catalogVersion.value;
      const values = new Map<string, unknown>();
      if (params) {
        for (const name of Object.keys(params)) values.set(name, unwrap(params[name]));
      }
      const { template, describe } = resolve(source, context, tag);
      return format(parse(template, describe), values, tag);
    });
  };

  const number: I18n["number"] = (value, formatOptions) =>
    derived(() => numberFormat(currentLocale(), formatOptions).format(unwrap(value)));

  const date: I18n["date"] = (value, formatOptions) =>
    derived(() => {
      const tag = currentLocale();
      const effective =
        options.timeZone !== undefined && formatOptions?.timeZone === undefined
          ? { ...formatOptions, timeZone: options.timeZone }
          : formatOptions;
      return formatter(
        "date",
        tag,
        effective,
        () => new Intl.DateTimeFormat(tag, effective),
      ).format(unwrap(value));
    });

  const direction = derived(() => scriptDirection(currentLocale()));

  const setLocale = async (next: string): Promise<void> => {
    const tag = canonicalLocale(next);
    const ticket = (latestSwitch += 1);
    if (options.load && !isLocaleOrChildOf(tag, sourceLocale) && !catalogs.has(tag)) {
      addCatalog(tag, await options.load(tag));
    }
    if (ticket === latestSwitch) locale.value = tag;
  };

  return {
    locale,
    direction,
    t: translate as Translate,
    number,
    date,
    addCatalog,
    setLocale,
  };
}

// ---------------------------------------------------------------------------
// Ambient t
// ---------------------------------------------------------------------------

const I18nContext = createContext<I18n | undefined>(undefined);

/** Provides one instance to the components below it. */
export const I18nProvider = I18nContext.Provider;

/** The nearest provided instance, or `undefined`. Read it in a component body. */
export function useI18n(): I18n | undefined {
  return useContext(I18nContext);
}

type AnyTranslate = (source: string, params?: MessageParams, options?: TranslateOptions) => Message;

let sourceOnly: I18n | undefined;

function ambientTranslate(
  source: string,
  params?: MessageParams,
  options?: TranslateOptions,
): Message {
  if (!isInComponentBody()) {
    throw new Error(
      "meowjsx/i18n: t() reads the nearest I18nProvider and works only while a component " +
        "function body runs. In a handler, a derived body, a keyed callback, after await, at " +
        "module top level or in a plain function, use the instance: i18n.t(...).",
    );
  }
  // Without a provider the message is its source text; plural rules are those of "en".
  const instance = useContext(I18nContext) ?? (sourceOnly ??= createI18n({ source: "en" }));
  return (instance.t as AnyTranslate)(source, params, options);
}

/**
 * Translates `source` with the nearest `I18nProvider`, or renders the source text when
 * there is none. Callable only while a component function body runs; elsewhere it throws.
 */
export const t = ambientTranslate as Translate;
