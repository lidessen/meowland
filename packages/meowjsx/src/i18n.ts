import { createContext, isInComponentBody, useContext } from "./context";
import { type MessageNode, ParseFailure, parseTemplate } from "./i18n-message";
import { derived, isSignal, signal, unwrap } from "./reactive";
import type { Child, MaybeSignal, ReadableSignal, WritableSignal } from "./types";

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

/** A literal source, or `never` for a value of type `string`. */
type Literal<S extends string> = {} extends Record<S, 1> ? never : S;

/**
 * Tag names of a rich template: `<link>` and `<b>` give `"link" | "b"`. Closing tags, and
 * angle brackets that cannot be a tag (a space inside), are not names.
 */
type TagNames<
  S extends string,
  Found extends string = never,
> = S extends `${string}<${infer Name}>${infer Rest}`
  ? Name extends `/${string}` | `${string}${" " | "<" | ">"}${string}` | ""
    ? TagNames<Rest, Found>
    : TagNames<Rest, Found | Name>
  : Found;

/** Wraps the formatted content of one tag; the result replaces `<tag>...</tag>`. */
export type RichPart = (children: Child) => Child;
export type RichParts<S extends string = string> = {
  readonly [Name in TagNames<S>]: RichPart;
};

/**
 * A message declared away from its use. It carries its own context and note; `t` accepts it,
 * or a Signal of it, where it accepts a literal.
 */
export interface MessageDescriptor<S extends string = string> {
  readonly source: S;
  readonly context?: string;
  readonly note?: string;
}
/** One entry of a `defineMessages` table. */
export type MessageSpec = string | MessageDescriptor;
type SpecSource<V> = V extends string ? V : V extends { readonly source: infer S } ? S : never;
/** A spec whose source has type `string` becomes `never`, so the table must use literals. */
type CheckedSpec<V> = [SpecSource<V>] extends [never]
  ? never
  : SpecSource<V> extends infer S extends string
    ? {} extends Record<S, 1>
      ? never
      : V
    : never;
export type MessageTable<T> = {
  readonly [Key in keyof T]: MessageDescriptor<Extract<SpecSource<T[Key]>, string>>;
};

/**
 * `t(source, params?, options?)`. The source must be written as a literal: a value of
 * type `string`, or a template literal with a runtime part, is refused. Named parameters are
 * required when the literal is simple. A descriptor from `defineMessages`, or a Signal of one,
 * is accepted in place of the literal; its parameters are not inferred.
 */
export interface Translate {
  <S extends string>(source: Literal<S>, ...rest: TranslateArguments<S>): Message;
  (
    message: MessageDescriptor | ReadableSignal<MessageDescriptor>,
    params?: MessageParams,
    options?: TranslateOptions,
  ): Message;
  /**
   * A message with named tags: `<link>the guide</link>`. `parts` maps each tag to a function
   * that wraps its content. Tags carry no attributes, so a translation can move or reorder a
   * tag but cannot introduce markup.
   */
  readonly rich: TranslateRich;
}

export interface TranslateRich {
  <S extends string>(
    source: Literal<S>,
    parts: RichParts<S>,
    ...rest: TranslateArguments<S>
  ): ReadableSignal<Child>;
}

export interface I18n {
  readonly locale: WritableSignal<string>;
  readonly direction: ReadableSignal<"ltr" | "rtl">;
  readonly t: Translate;
  /**
   * Translates text the scanner cannot see, such as site configuration copy. The text and its
   * translation are literal: no placeholder, plural or apostrophe is interpreted. Its owner
   * hands the same set to `auditCatalog` as extra literal messages.
   */
  lookup(text: string, options?: TranslateOptions): Message;
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

/**
 * Declares messages at module level, away from their use. It performs no lookup: each entry
 * becomes a frozen descriptor that `t` translates where it is used.
 */
export function defineMessages<const T extends { readonly [name: string]: MessageSpec }>(table: {
  readonly [Key in keyof T]: CheckedSpec<T[Key]>;
}): MessageTable<T> {
  const entries: [string, MessageDescriptor][] = [];
  for (const [name, spec] of Object.entries(table as { [name: string]: unknown })) {
    const value = typeof spec === "string" ? { source: spec } : spec;
    if (
      typeof value !== "object" ||
      value === null ||
      typeof (value as { source?: unknown }).source !== "string"
    ) {
      throw new Error(
        `meowjsx/i18n: defineMessages entry ${JSON.stringify(name)} must be a source string or ` +
          "an object with a string source.",
      );
    }
    const { source, context, note } = value as {
      source: string;
      context?: unknown;
      note?: unknown;
    };
    if (
      (context !== undefined && typeof context !== "string") ||
      (note !== undefined && typeof note !== "string")
    ) {
      throw new Error(
        `meowjsx/i18n: defineMessages entry ${JSON.stringify(name)} has a non-string context or note.`,
      );
    }
    entries.push([
      name,
      Object.freeze({
        source,
        ...(context === undefined ? {} : { context }),
        ...(note === undefined ? {} : { note }),
      }),
    ]);
  }
  return Object.freeze(Object.fromEntries(entries)) as MessageTable<T>;
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

function messageSignal<T>(read: () => T): ReadableSignal<T> {
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
  const parsed = new Map<string, readonly MessageNode[]>();
  const parsedRich = new Map<string, readonly MessageNode[]>();
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

  const parse = (template: string, describe: string, rich: boolean): readonly MessageNode[] => {
    const cache = rich ? parsedRich : parsed;
    let nodes = cache.get(template);
    if (!nodes) {
      try {
        nodes = parseTemplate(template, { rich });
      } catch (error) {
        if (!(error instanceof ParseFailure)) throw error;
        throw new Error(
          `meowjsx/i18n: cannot parse ${describe} ${JSON.stringify(template)}: ${error.message}`,
        );
      }
      cache.set(template, nodes);
    }
    return nodes;
  };

  type RenderTag = (name: string, children: Child) => Child;

  /** Appends the formatted nodes to `out`; adjacent text is merged into one string. */
  const emit = (
    nodes: readonly MessageNode[],
    values: ParamValues,
    tag: string,
    pound: string | undefined,
    out: Child[],
    renderTag: RenderTag | undefined,
  ): void => {
    const pushText = (value: string): void => {
      const last = out.length - 1;
      if (last >= 0 && typeof out[last] === "string") out[last] += value;
      else out.push(value);
    };
    for (const node of nodes) {
      if (node.type === "text") pushText(node.value);
      else if (node.type === "pound") pushText(pound ?? "#");
      else if (node.type === "arg") {
        const value = values.get(node.name);
        if (value === undefined) pushText(`{${node.name}}`);
        else pushText(typeof value === "number" ? numberFormat(tag).format(value) : String(value));
      } else if (node.type === "tag") {
        const inner: Child[] = [];
        emit(node.children, values, tag, pound, inner, renderTag);
        if (!renderTag) throw new Error("meowjsx/i18n: a tag is only valid in t.rich messages");
        out.push(renderTag(node.name, inner));
      } else if (node.type === "select") {
        const value = values.get(node.name);
        if (value === undefined) {
          pushText(`{${node.name}}`);
          continue;
        }
        const branch = node.branches.get(String(value)) ?? node.branches.get("other")!;
        emit(branch, values, tag, pound, out, renderTag);
      } else {
        const value = values.get(node.name);
        if (value === undefined) {
          pushText(`{${node.name}}`);
          continue;
        }
        const count = typeof value === "number" ? value : Number(value);
        const display = Number.isNaN(count) ? String(value) : numberFormat(tag).format(count);
        const rules = formatter(
          node.ordinal ? "ordinal" : "plural",
          tag,
          undefined,
          () => new Intl.PluralRules(tag, node.ordinal ? { type: "ordinal" } : undefined),
        );
        const branch =
          node.exact.get(count) ??
          node.categories.get(rules.select(count)) ??
          node.categories.get("other")!;
        emit(branch, values, tag, display, out, renderTag);
      }
    }
  };

  const format = (nodes: readonly MessageNode[], values: ParamValues, tag: string): string => {
    const out: Child[] = [];
    emit(nodes, values, tag, undefined, out, undefined);
    return out.join("");
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

  const paramValues = (params: MessageParams | undefined): Map<string, unknown> => {
    const values = new Map<string, unknown>();
    if (params) {
      for (const name of Object.keys(params)) values.set(name, unwrap(params[name]));
    }
    return values;
  };

  /** The source and context behind a literal, a descriptor or a Signal of a descriptor. */
  const readSource = (
    input: string | MessageDescriptor | ReadableSignal<MessageDescriptor>,
    translateOptions: TranslateOptions | undefined,
  ): { source: string; context: string | undefined } => {
    const value = isSignal<MessageDescriptor | string>(input) ? input.value : input;
    if (typeof value === "string") return { source: value, context: translateOptions?.context };
    if (typeof value === "object" && value !== null && typeof value.source === "string") {
      return { source: value.source, context: value.context ?? translateOptions?.context };
    }
    throw new Error(
      "meowjsx/i18n: t() needs a literal source, a defineMessages descriptor or a Signal of one.",
    );
  };

  const translate = (
    input: string | MessageDescriptor | ReadableSignal<MessageDescriptor>,
    params?: MessageParams,
    translateOptions?: TranslateOptions,
  ): Message =>
    messageSignal(() => {
      const tag = currentLocale();
      void catalogVersion.value;
      const values = paramValues(params);
      const { source, context } = readSource(input, translateOptions);
      const { template, describe } = resolve(source, context, tag);
      return format(parse(template, describe, false), values, tag);
    });

  const translateRich = (
    input: string,
    parts: { readonly [name: string]: RichPart },
    params?: MessageParams,
    translateOptions?: TranslateOptions,
  ): ReadableSignal<Child> =>
    messageSignal<Child>(() => {
      const tag = currentLocale();
      void catalogVersion.value;
      const values = paramValues(params);
      const { source, context } = readSource(input, translateOptions);
      const { template, describe } = resolve(source, context, tag);
      const out: Child[] = [];
      emit(parse(template, describe, true), values, tag, undefined, out, (name, children) => {
        const part = Object.hasOwn(parts, name) ? parts[name] : undefined;
        if (typeof part !== "function") {
          throw new Error(
            `meowjsx/i18n: the ${describe === "message" ? "message" : describe} uses the tag ` +
              `<${name}> but t.rich(${JSON.stringify(source)}) was given no part for it ` +
              `(parts: ${Object.keys(parts).join(", ") || "none"}).`,
          );
        }
        return part(children);
      });
      return out;
    });

  const lookup = (text: string, lookupOptions?: TranslateOptions): Message =>
    messageSignal(() => {
      const tag = currentLocale();
      void catalogVersion.value;
      // Both the text and its translation are literal: no placeholder is interpreted.
      return resolve(text, lookupOptions?.context, tag).template;
    });

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
    t: Object.assign(translate, { rich: translateRich }) as unknown as Translate,
    lookup,
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

type AnyTranslate = (
  input: string | MessageDescriptor | ReadableSignal<MessageDescriptor>,
  params?: MessageParams,
  options?: TranslateOptions,
) => Message;
type AnyRich = (
  source: string,
  parts: { readonly [name: string]: RichPart },
  params?: MessageParams,
  options?: TranslateOptions,
) => ReadableSignal<Child>;

let sourceOnly: I18n | undefined;

function ambientInstance(name: string): I18n {
  if (!isInComponentBody()) {
    throw new Error(
      `meowjsx/i18n: ${name} reads the nearest I18nProvider and works only while a component ` +
        "function body runs. In a handler, a derived body, a keyed callback, after await, at " +
        "module top level or in a plain function, use the instance: i18n.t(...). Declare " +
        "messages away from their use with defineMessages.",
    );
  }
  // Without a provider the message is its source text; plural rules are those of "en".
  return useContext(I18nContext) ?? (sourceOnly ??= createI18n({ source: "en" }));
}

function ambientTranslate(
  input: string | MessageDescriptor | ReadableSignal<MessageDescriptor>,
  params?: MessageParams,
  options?: TranslateOptions,
): Message {
  return (ambientInstance("t()").t as unknown as AnyTranslate)(input, params, options);
}

function ambientRich(
  source: string,
  parts: { readonly [name: string]: RichPart },
  params?: MessageParams,
  options?: TranslateOptions,
): ReadableSignal<Child> {
  return (ambientInstance("t.rich()").t.rich as unknown as AnyRich)(source, parts, params, options);
}

/**
 * Translates with the nearest `I18nProvider`, or renders the source text when there is none.
 * Callable only while a component function body runs; elsewhere it throws.
 */
export const t = Object.assign(ambientTranslate, { rich: ambientRich }) as unknown as Translate;
