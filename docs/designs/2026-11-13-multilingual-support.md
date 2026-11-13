# Multilingual support for MeowJSX and Meowpress

Status: proposed. Nothing is implemented. The independent challenger review the
[design-change method](../../.agents/skills/design-change/SKILL.md) requires before a mechanism
changes has not run yet; the author's own counterexamples are in
[Counterexamples that shaped the design](#counterexamples-that-shaped-the-design), and the
decisions that belong to the project owner are in [Open decisions](#open-decisions).

## The problem

Neither package can serve a reader in a second language today.

- **MeowJSX** has no notion of a locale. An application keeps its own lookup table, and because
  setup runs once per mount, a language switch either remounts the tree (losing state) or is wired
  by hand through Signals in every component.
- **Meowpress** hard-codes English in the built-in theme. `src/site.tsx` holds about 60 visible
  strings (navigation, headings, empty states, `aria-label`s, "min read"), every document says
  `<html lang="en">`, and dates are formatted with `en-US`. `src/content.ts` formats time labels
  with `zh-CN` and pins both date keys and time labels to `Asia/Shanghai`. One site has one
  language tree: a slug is one page, and there is no way to publish a translation next to it or to
  tell a reader or a crawler that one exists. Internal links are root-absolute (`/posts/`), so a
  second tree cannot be added by copying the first.

The expected behavior:

1. A MeowJSX component reads translated copy and locale-aware formatting from its render-tree
   environment. Static HTML gets the strings for the render's locale; a mounted tree follows a
   locale change through Signals without remounting.
2. A Meowpress site declares its locales, puts translations next to the original content, and gets
   one route tree per locale with translated chrome, correct `lang`/`dir`, a language switch,
   `hreflang` alternates and per-locale agent indexes. A site that declares nothing builds
   byte-for-byte what it builds today.

## Scope

In scope: a DOM-free `meowjsx/i18n` entry, and Meowpress locales for content, routes, the built-in
theme and the agent indexes.

Not in this design:

- **Meowtail's default labels** (`"Send"`, `"Close"`, `"Previous"` and similar prop defaults).
  Hosts already override them through props. Reading them from the same context is a follow-up
  that Meowtail owns; this design only guarantees the seam it would use (an optional context read
  that returns `undefined` without a provider).
- **Translating content.** Meowpress pairs files an author wrote; it does not translate.
- **Language negotiation.** No redirect by `Accept-Language` or `navigator.language`; the output
  stays static and script-free, and the reader chooses with a link.
- **ICU MessageFormat** in the core. A `format` seam lets a host plug one in.
- **Messages in the JSON entry.** JSON descriptions keep carrying resolved text from the host.
- **Meowslides and Meowbook.**

## Part 1: `meowjsx/i18n`

A new DOM-free subpath. It is not re-exported from the root, so applications that do not translate
pay nothing, and it uses only ECMAScript `Intl`, which the core `tsconfig` (no `dom` lib,
`types: []`) already allows. It joins `tsconfig.core.json`'s `include`.

### Shape

```tsx
import { createI18n, I18nProvider, useI18n } from "meowjsx/i18n";

const i18n = createI18n({
  locale: "fr", // a string, or a WritableSignal<string> the host already owns
  fallbackLocale: "en",
  messages: {
    en: {
      "nav.posts": "Posts",
      "post.minutes": { one: "{count} min read", other: "{count} mins read" },
      greeting: "Hello, {name}",
    },
    fr: { "nav.posts": "Articles", greeting: "Bonjour, {name}" },
  },
});

function Header(_props: {}, _ctx: Context<typeof Header>) {
  const { t, text } = useI18n();
  return (
    <nav aria-label={text("nav.label")}>
      <a href="/posts/">{text("nav.posts")}</a>
    </nav>
  );
}

render(
  <I18nProvider value={i18n}>
    <Header />
  </I18nProvider>,
  container,
);
i18n.locale.value = "en"; // mounted text and attributes update in place
```

### Contract

- **Instance.** `createI18n(options)` returns a plain object that is independent of any `Runtime`:
  `locale` (a `WritableSignal<string>`), `direction` (a `ReadableSignal<"ltr" | "rtl">`), `t`,
  `text`, `has`, `number`, `date`, `plural`, `addMessages(locale, messages)` and
  `setLocale(locale)`. Locale tags are canonicalized with `Intl.getCanonicalLocales`; an invalid
  tag throws at creation or at the write.
- **`t(key, params?)` returns a string** computed from the current locale. It reads the locale
  Signal, so it is tracked wherever a Signal read is tracked. Static HTML and one-shot code call it
  directly.
- **`text(key, params?)` returns a `ReadableSignal<string>`**, which is `derived(() => t(...))`
  with `params` values unwrapped when they are Signals. Mounted components use it for children and
  attributes; it is the form that keeps "setup runs once, Signals carry later changes" true. There
  is no third mechanism: no whole-tree re-render and no remount on a locale change.
- **Messages are data.** A catalog is a flat record from key to a string or a plural record keyed
  by `Intl.PluralRules` categories (`zero`, `one`, `two`, `few`, `many`, `other`; `other` is
  required). A plural record is selected by `params.count`. No functions, so a catalog can be a
  JSON file and never becomes an execution capability.
- **Interpolation.** `{name}` is replaced by the parameter; numbers are formatted with the
  locale's `Intl.NumberFormat`. `{{` and `}}` are literal braces. A placeholder without a parameter
  stays visible as written and is reported as missing.
- **Lookup order.** The locale, then its parents by dropping subtags (`zh-Hant-TW`, `zh-Hant`,
  `zh`), then `fallbackLocale` and its parents, then the key itself. Every miss that reaches the
  fallback or the key calls `onMissing({ key, locale, resolved })` once per key and locale; the
  default reports nothing, so the host decides whether a miss is a warning or a build failure.
- **Types.** Keys are checked against the `fallbackLocale` catalog; other catalogs are `Partial`
  of it. Parameters are `Record<string, string | number>` in the first slice (see open decisions).
- **Formatting.** `number(value, options?)`, `date(value, options?)` and `plural(count)` wrap
  `Intl` with a per-locale formatter cache and read the locale Signal like `t`.
  `createI18n({ timeZone })` sets the default zone for `date`, so a static build does not depend on
  the machine that runs it.
- **Direction.** `direction` comes from the locale's script after `Intl.Locale#maximize()`,
  checked against a short list of right-to-left scripts. `getTextInfo()` is not used: the Bun
  version in this repository exposes neither `getTextInfo` nor `textInfo`.
- **Lazy catalogs.** With `load: (locale) => Promise<Messages>`, `setLocale(locale)` loads and
  adds the catalog first and writes the Signal after, so a switch never flashes the fallback.
  Writing `locale.value` directly stays synchronous and uses what is loaded. Concurrent
  `setLocale` calls resolve in order; only the last one writes.
- **Environment.** `I18nProvider` is the `Provider` of one module-level Context whose default is
  `undefined`. `useI18n()` throws a named error without a provider, because silently rendering keys
  hides the mistake; `useOptionalI18n()` returns `undefined` for libraries whose defaults work
  without one. Nested providers are valid and give a subtree its own locale, such as a quotation.
  Like every Context read, both run only during synchronous render.
- **`lang` and `dir`.** The host owns its container and document. It binds
  `lang={i18n.locale} dir={i18n.direction}` on the element it controls; the entry installs no
  `prepareContainer` hook and never touches `document.documentElement`.
- **`format` seam.** `createI18n({ format })` replaces interpolation and plural selection with
  `(message, params, locale) => string` for hosts that need ICU MessageFormat. Lookup, fallback,
  Signals and context are unchanged.

### Identity

The Context lives in the `meowjsx/i18n` module and nowhere else, under the same rule as the other
entries: one render graph, one copy. `entry-identity.test.ts` gains a case that provides through
the built `./i18n` export and reads through a component bundled separately. Two `createI18n`
instances remain valid isolation, as two Runtimes are.

### Alternatives

- **Nothing in MeowJSX; Meowpress keeps a private table.** The smallest change, and enough for a
  static build. It leaves mounted applications with the remount-or-hand-wire choice and gives
  Meowtail nothing to read later, so the second consumer would create a second mechanism.
- **A third-party library (i18next, FormatJS).** Works for strings, but none is Signal-aware, so
  each needs the same adapter this entry is, and each brings a parser the common case does not
  use. The `format` seam keeps them available.
- **A runtime plugin instead of Context.** A plugin is per Runtime; locale is per subtree and must
  reach static HTML and deferred regions, which Context already does.
- **`t` returns a Signal.** One function instead of two, but every string-typed prop (most of
  Meowtail's labels) and every static caller would need `.value`. The string form stays primary
  and `text` is the reactive form.
- **Root export.** Rejected to keep the root's surface and bundle unchanged.

## Part 2: Meowpress

### Configuration

```ts
export default meowSite({
  locales: {
    default: "en",
    available: {
      en: { label: "English" },
      fr: {
        label: "Français",
        site: { description: "Un journal de billets et de notes." },
        messages: { "nav.posts": "Articles", "nav.about": "À propos" },
      },
    },
  },
  site: { name: "My site", url: "https://example.com" },
});
```

- Without `locales` the site has one locale, `en`, and the build output does not change.
- `available[locale].label` is the name the language switch shows, written in that language.
- `available[locale].site` overrides `SiteIdentity` copy for that locale: `name`, `description`
  and `about`. Identity that is not copy (`id`, `url`, `repositorySourceUrl`, `images`) is shared.
- `available[locale].messages` overrides keys of the built-in theme catalog. The package ships the
  `en` catalog; a missing key falls back to English, and the build prints one line per locale with
  the count of fallen-back keys (`--strict-locales` turns that line into a failure).
- `notFound: { title, message, homeLabel }` keeps working as the default locale's override of the
  three matching catalog keys.
- `site.url` is new: the public origin. It is needed for `hreflang` and canonical links, which
  must be absolute.
- `site.timeZone` is new and replaces the two hard-coded `Asia/Shanghai` uses. Its default stays
  `Asia/Shanghai` so existing sites keep their date keys; changing that default is a separate
  decision.

A single-language site in another language is the degenerate case and needs no second mechanism:
`locales: { default: "fr", available: { fr: { label: "Français", messages } } }`.

### Content

A translation is a sibling file with the locale before the extension:

```text
content/posts/first.md        default locale
content/posts/first.fr.md     the same post in French
content/posts/only-fr.fr.md   a post that exists only in French
```

- The suffix is read only when it canonicalizes to a configured locale, so `notes.v2.md` keeps its
  slug `notes.v2`. Both files above have the slug `first`; the pair is the translation set.
- `ContentItem` gains `locale: string` and `translations: Readonly<Record<string, string>>` (the
  locales in which the same slug exists, mapped to their URLs). Duplicate detection is keyed by
  locale and slug. Drafts, assets, `slugPrefix` and source overlay order are unchanged, and assets
  are shared between locales.
- Thoughts follow the same rule.
- Public skills are repository files and are not translated; see the limits below.

### Routes

The default locale keeps today's unprefixed routes. Every other locale is published under its
canonical tag:

```text
/                      /fr/
/posts/                /fr/posts/
/posts/first/          /fr/posts/first/
/about/                /fr/about/
/404.html              /fr/404.html
```

All internal links in the built-in theme go through one `localePath(locale, path)` helper instead
of string literals. A locale tag that equals an existing top-level route or content slug
(`posts`, `thoughts`, `skills`, `about`, `assets`, `fonts`, `licenses`) is refused at config time.

**Untranslated items.** A reader of `/fr/` still sees a post that exists only in English: it is
listed in the French timeline and archive with its language marked, the entry carries
`lang="en"`, and it links to the English URL. No second copy of the page is published, so there is
no duplicate content and no page whose chrome and body disagree silently.
`locales.untranslated: "omit"` leaves such items out of the other trees instead; the default is
`"link"`.

### Documents

Each built-in page is rendered inside `<I18nProvider>` with an instance created for the page's
locale, and the theme's components read copy through `useI18n()`. This is the consumer that proves
Part 1 in static HTML.

- `<html lang dir>` come from the page locale.
- Dates use the page locale and `site.timeZone`. Date keys (`2026-11-13`) stay locale-neutral
  because they are also grouping keys.
- With `site.url`, a page that has translations links each one and itself with
  `<link rel="alternate" hreflang>` plus `x-default` for the default locale, and every page gets a
  canonical link. Without `site.url` the build emits neither and says so once; relative
  `hreflang` values are not valid.
- The header gains a language switch when more than one locale is configured: a plain list of
  links, each with `lang` and `hreflang`, pointing to the same page in that locale when the
  translation exists and to that locale's home otherwise. No script.
- The feed filter script selects by `data-*` values and is not affected.

### Agent indexes

`/llms.txt`, `/llm.txt` and `/agents.md` stay at the root, describe the default locale, and gain a
`Languages` section that links `/<locale>/llms.txt`. Each other locale gets its own `llms.txt`
below its prefix. The root markers that `hasBuiltSite` checks do not move.

### Consumer-owned pages

A `pages` provider still owns the whole site map, including its languages. It receives
`locales` in `SitePageContext` and content items that carry `locale` and `translations`, and it
may set `locale` on a `SitePage`; pages with a non-default locale are indexed in that locale's
`llms.txt`. The package does not rewrite the provider's HTML, so `lang`, alternates and the
language switch inside those documents are the provider's.

### Limits stated up front

- **Skills pages exist once**, in the default locale. Other locales' navigation links there. A
  translated chrome around untranslated skill files is the alternative; it doubles the pages for
  no translated content, so it is left out until someone needs it.
- **Right-to-left layout is not claimed.** `dir="rtl"` is emitted, but the Journal theme's layout
  has not been checked in that direction; that needs a browser pass before the README promises it.
- **Fonts.** The default faces (Newsreader, Inter, JetBrains Mono) cover Latin, Cyrillic and
  Greek subsets. Other scripts fall back to system fonts unless the site lists faces in `fonts`.
- **Reading time and excerpts** stay character-based (`length / 400`, first 180 characters), which
  reads differently per script. Not changed here.

## Counterexamples that shaped the design

- **A post that exists in one language only.** A strict "one tree per locale, every page
  translated" model would drop it from the other trees or force a duplicate. This produced the
  `untranslated: "link"` default and the per-entry `lang`.
- **`hreflang` without an origin.** `SiteIdentity` has no URL today and search engines ignore
  relative alternates. This produced `site.url` and the rule to emit nothing rather than invalid
  links.
- **Setup runs once.** A `t` that returns a string, used as a child of a mounted component, would
  never update. This produced `text` as a derived Signal, and kept `t` for static and string-typed
  callers.
- **A static host with one `404.html`.** GitHub Pages serves only the root file. Per-locale
  `404.html` files are still written for hosts that pick the nearest one; the root page stays in
  the default locale.
- **A file named `changelog.v2.md`.** Suffix detection by "anything after the last dot" would
  change its slug. Only configured locales are read as a suffix.
- **A locale named `posts`.** It would collide with a route; refused at config time.
- **English-only repository rule.** Shipping translated catalogs in the package would add
  non-English strings to the repository. The package ships `en` and takes the rest from the site
  (see open decisions).
- **Build machine time zone and Bun's `Intl`.** Dates must not move with the CI region, and
  `getTextInfo` is missing in Bun; hence the explicit `timeZone` and the script-based direction.

## Work packages

Each slice ends in an observable result and can ship on its own.

1. **`meowjsx/i18n`.** New `src/i18n.ts`, the `./i18n` export, `tsconfig.core.json` include,
   README section. Tests fail on: a mounted text or attribute that does not change when
   `locale.value` changes; a fallback chain that skips a parent tag; a plural record resolved with
   the wrong category (`ru`, count 3 is `few`); a `setLocale` race where the earlier load wins; a
   context read across the built entry boundary.
2. **Meowpress catalog, one locale.** Move the theme's strings to the `en` catalog and render
   through `useI18n()`; add `locales` with a single entry, `site.timeZone` and `localePath`. The
   existing site and build tests must pass unchanged (same HTML for a site without `locales`); a
   new test builds a single-locale `fr` site and asserts `lang="fr"` and overridden copy.
3. **Meowpress multiple locales.** Suffix pairing, prefixed routes, untranslated policy, language
   switch, alternates, per-locale agent indexes and 404, `SitePageContext.locales`. Tests build a
   temporary two-locale site through `meowpress/build`. One browser pass over the switch at
   desktop and mobile widths in both schemes.
4. **Documentation and the consumer skill.** Meowpress and MeowJSX READMEs,
   [skills/meowland](../../skills/meowland/SKILL.md), and a record of the outcome here.

Meowpress's `meowjsx` peer range must rise to the first version that exports `./i18n`; slices 2
and 3 cannot be published before slice 1 is. Release follows [local releasing](../releasing.md)
and is not part of this work.

## Open decisions

These belong to the project owner; the recommendation is first in each.

1. **Translated catalogs in the package.** Recommended: ship `en` only and let the site provide
   the rest. Bundling other languages (for example `zh-CN`) is friendlier for site authors but
   needs a new, explicit exception to the English-only rule in the root AGENTS file.
2. **Translation layout.** Recommended: the file suffix (`first.fr.md`). The alternative is a
   `locale` field on `ContentSource`, which suits translations kept in another directory or
   repository; it can be added later on the same `(locale, slug)` key without changing the first.
3. **Default-locale prefix.** Recommended: unprefixed, so existing URLs survive. A
   `prefixDefaultLocale` option would need a root redirect page, which is the first script or
   meta refresh in the output.
4. **Typed message parameters.** Recommended: keys only in the first slice. Inferring `{name}`
   from the fallback catalog with template literal types is possible and can be added without a
   runtime change.
5. **Rich messages** (a link or emphasis inside a translated sentence). Recommended: a later
   slice, `rich(key, { link: (children) => <a>{children}</a> })`. Until then such sentences are
   split into separate keys.
6. **Default `site.timeZone`.** Recommended for now: keep `Asia/Shanghai` to preserve output.
   A neutral `UTC` default is more defensible for a library and would be a visible change for
   existing sites.
