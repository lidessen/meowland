# Multilingual support for MeowJSX and Meowpress

Status: proposed, second revision. Nothing is implemented. The first revision followed the
mainstream shape (key catalogs, a `t`/`text` pair, hand-maintained sibling translations); this one
re-derives the design from who does the work now. The mainstream shape is kept under
[What changed from the mainstream design](#what-changed-from-the-mainstream-design) with the
reason for each departure. The independent challenger review the
[design-change method](../../.agents/skills/design-change/SKILL.md) requires before a mechanism
changes has not run yet; decisions that belong to the project owner are in
[Open decisions](#open-decisions).

## The problem

Neither package can serve a reader in a second language today.

- **MeowJSX** has no notion of a locale. Setup runs once per mount, so a language switch either
  remounts the tree or is wired by hand through Signals in every component.
- **Meowpress** hard-codes English in the built-in theme (about 60 visible strings in
  `src/site.tsx`), every document says `<html lang="en">`, dates use `en-US`, and `src/content.ts`
  pins date keys and time labels to `Asia/Shanghai`. A slug is one page; a translation cannot be
  published next to it, and internal links are root-absolute, so a second tree cannot be added by
  copying the first.

## Who does the work now

Mainstream i18n was shaped by a division of labor: a developer writes code, a translator works
later in separate files through a vendor or a translation system, and the two never see each
other's material. Message keys, extraction pipelines, catalog files per locale and silent runtime
fallback all exist to decouple those two people in time.

In this repository's working model the author of the code, the translator and the reviewer's first
pass are the same agent, in the same session, with the source in front of it. Translation is no
longer the scarce step. What is scarce is what the
[component-usage design](2026-10-20-agent-era-component-usage.md) already measured: the size of the
minimum correct program, and the cost to **verify** and **repair** it. Applied here:

| Cost     | Mainstream shape                                                        | What lowers it                                                  |
| -------- | ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| Discover | provider, hook, two lookup functions, catalog layout, plural format     | one function; the first working program needs no setup          |
| Decide   | invent a key name; choose the reactive or the string form per call site | the source text is the identity; one return type                |
| Assemble | add the key to every catalog, keep them aligned                         | nothing to add until a locale is added; then one generated list |
| Verify   | a stale or missing translation is invisible until a reader finds it     | staleness is a mechanical fact a command reports                |
| Repair   | a wrong choice (string child in a mounted tree) fails silently          | wrong choices are type errors or listed work items              |

Four consequences drive the design:

1. **Source text is the identity.** The agent writes the sentence where it is used. Code stays
   readable without opening a catalog, a single-language application is already correct, and
   editing the sentence invalidates its translations by construction instead of leaving them
   silently wrong.
2. **Translation is derived state with provenance.** A translation records what it was translated
   from. "Missing" and "stale" become facts the build computes, not judgment.
3. **The tool emits a work list, not a warning.** One command prints, as JSON, every missing and
   stale item with its source, context and file. That is the loop an agent runs: list, fill,
   list again until empty. The library never calls a model; the host's agent does the translating.
4. **Agents are also readers.** An agent reading the site wants the original and the status of
   each translation, not N parallel trees to crawl.

## Scope

In scope: a DOM-free `meowjsx/i18n` entry with its audit functions, and Meowpress locales for
content, routes, the built-in theme, the agent indexes and a work-list command.

Not in this design: Meowtail's default labels (a follow-up Meowtail owns; they are props today),
language negotiation or redirects (the output stays static and script-free), messages in the JSON
entry, Meowslides and Meowbook, and any call to a translation model from the packages.

## Part 1: `meowjsx/i18n`

A DOM-free subpath, not re-exported from the root. It uses only ECMAScript `Intl`, which the core
`tsconfig` already allows, and joins `tsconfig.core.json`'s `include`.

### The minimum program

```tsx
import { t } from "meowjsx/i18n";

function Header() {
  return (
    <nav aria-label={t("Primary navigation")}>
      <a href="/posts/">{t("Posts")}</a>
      <span>
        {t("{count, plural, one {# min read} other {# mins read}}", { count })}
      </span>
    </nav>
  );
}
```

That is a complete, correct single-language component: no provider, no catalog, no key. Adding a
language is additive and touches no component:

```tsx
import { createI18n, I18nProvider } from "meowjsx/i18n";
import fr from "./locales/fr.json";

const i18n = createI18n({ source: "en", locale: "fr", catalogs: { fr } });
render(
  <I18nProvider value={i18n}>
    <App />
  </I18nProvider>,
  container,
);
i18n.locale.value = "en"; // mounted text and attributes update in place
```

```json
{
  "Primary navigation": "Navigation principale",
  "Posts": "Articles",
  "{count, plural, one {# min read} other {# mins read}}": "{count, plural, one {# min de lecture} other {# min de lecture}}"
}
```

### Contract

- **One function, one return type.** `t(source, params?, options?)` returns a
  `ReadableSignal<string>`. A mounted child or attribute binds to it and follows a locale change;
  static HTML reads it once. There is no separate string form to choose between. A prop typed
  `string` rejects it at compile time, and the author writes `.value` there on purpose; the
  mistake that used to render a stale string silently is now a type error.
- **The source must be a literal.** `t`'s type refuses a value of type `string`, so a dynamic
  sentence cannot be passed. This is what makes the audit below complete: every message in a
  program is visible to a scanner.
- **Message format is ICU MessageFormat**, the subset `{name}`, `plural`, `selectordinal`,
  `select` and `#`. It is one string per message, so a catalog is a flat JSON object and a
  message is never split across keys. It is also the format models already write correctly for
  languages with several plural categories. Placeholders are inferred from the literal, so a
  missing parameter is a type error for simple arguments and an audit error for all of them.
- **Context is also the translator's note.** `t("Post", undefined, { context: "noun: a blog
article" })` separates homographs and tells the translator what a two-word string means, which
  is where short interface copy goes wrong. In the catalog such a source maps to an object from
  context to translation instead of to a string.
- **Lookup.** The locale, then its parents by dropping subtags (`zh-Hant-TW`, `zh-Hant`, `zh`),
  then the source text itself. The source text is a correct degraded state, not a key on screen.
  `onMissing({ source, context, locale })` reports each miss once.
- **Ambient and explicit.** The module-level `t` reads the nearest `I18nProvider` during
  synchronous render and binds the returned Signal to that instance, so reading `.value` later in
  an event handler still follows the locale. Without a provider it yields the source text.
  `i18n.t` has the same signature for code that runs outside render. Nested providers give a
  subtree its own locale.
- **Instance.** `createI18n({ source, locale, catalogs, load?, timeZone?, onMissing? })` returns a
  plain object independent of any `Runtime`: `locale` (writable Signal), `direction` (Signal,
  derived from the locale's script because Bun exposes neither `getTextInfo` nor `textInfo`), `t`,
  `number`, `date`, `addCatalog` and `setLocale` (loads through `load` first and writes the Signal
  after, so a switch never flashes the source language; the last call wins).
- **`lang` and `dir`** are bound by the host on the element it owns:
  `lang={i18n.locale} dir={i18n.direction}`. The entry never touches the document.
- **Identity.** The Context lives in this module only; `entry-identity.test.ts` gains a case that
  provides through the built entry and reads from a separately bundled component.

### The audit

Two pure, IO-free functions exported from `meowjsx/i18n/audit`:

- `extractMessages(code, file)` returns every literal `t(...)` call with its source, context,
  placeholders and position.
- `auditCatalog(messages, catalog, locale)` returns the work list:
  - `missing`: a source with no translation;
  - `unused`: a catalog entry no code refers to, paired with the closest missing source when one
    is similar, so an edited sentence carries its old translation as a starting point;
  - `invalid`: a translation that does not parse, or whose arguments differ from the source's.

`meowjsx i18n check [--json] [--write]` wraps them for an application: it scans the project,
prints the list, exits non-zero when it is not empty, and with `--write` adds the missing sources
to each catalog with an empty value for the agent to fill. The JSON form is the contract; the
plain form prints one actionable line per item, following the
[capture design](2026-11-12-agent-preview-capture.md)'s rule that output must be something an
agent can act on.

A later slice adds a pseudo-locale (accented, lengthened text generated from the source). A
Meowbook capture in that locale shows any sentence that bypassed `t` as plain text and any layout
that breaks under longer copy, which turns "did I wrap everything" into a picture.

## Part 2: Meowpress

### Configuration

```ts
export default meowSite({
  locales: { source: "en", targets: { fr: { label: "Français" } } },
  site: { name: "My site", url: "https://example.com" },
});
```

- Without `locales` the build output does not change.
- Interface copy for a target comes from `locales/<locale>.json` in the project, the same catalog
  format as Part 1. The built-in theme keeps its English sentences inline through `t`, so its
  source stays readable and existing tests keep matching.
- Site-owned copy (`site.name`, `site.description`, `site.about`, `notFound`) is translated
  through the same catalog: the theme passes those configured strings through the instance, and
  the work list includes them. No per-locale copy of `SiteIdentity` is configured.
- `site.url` is new, the public origin that absolute `hreflang` and canonical links need.
  `site.timeZone` is new and replaces the two hard-coded `Asia/Shanghai` uses, keeping that value
  as its default so existing date keys do not move.

### Content: translations with provenance

```text
content/posts/first.md        the original
content/posts/first.fr.md     its French translation
content/posts/only-fr.fr.md   an original written in French
```

A locale suffix is read only when it is a configured locale, so `notes.v2.md` keeps its slug. Files
that share a slug are one translation set; the one in the source locale is the original, and a set
without one treats its only member as an original in its own language.

A translation records what it came from:

```yaml
---
title: Premier billet
translation:
  source: 3f9a1c2e # hash of the original's body and title when this was translated
  reviewed: false # optional; set by a person
---
```

From that the build knows three states without anyone tracking them: **current** (the hash matches
the original), **stale** (the original changed since) and **missing**. `ContentItem` gains
`locale`, `translations` and `translationState`.

- A **stale** translation is still published, with a short notice that the original has changed
  and a link to it. `locales.stale: "fail"` makes it a build error for sites that would rather not
  publish it.
- A translation without `reviewed: true` carries a quiet line saying it is a translation and
  linking the original. Readers are told what they are reading; the wording is in the catalog.
- A **missing** translation does not produce a page. In the target locale's timeline and archive
  the original is listed with its language marked and `lang` set on the entry, linking to the
  original's URL. `locales.untranslated: "omit"` leaves it out instead.

### The work list

```sh
meowpress locales            # plain: one line per item
meowpress locales --json     # the contract
meowpress locales stamp content/posts/first.fr.md
```

`--json` prints, per target locale, the interface messages from Part 1's audit (theme sentences
and site copy, with context) and the content items that are missing or stale: source path, target
path, the current source hash, and for a stale item the hash it was translated from, so the agent
can diff the original between the two and revise only what changed. `stamp` writes the current
source hash into a translation's frontmatter after it has been written or revised.

The loop for "add French to this blog" is therefore: add the locale to the config, run the list,
write what it names, stamp, run the list until it is empty, build. Nothing in the loop needs the
agent to know the theme's strings or the content tree in advance.

### Routes and documents

The source locale keeps today's unprefixed routes; each target is published under its tag
(`/fr/`, `/fr/posts/first/`, `/fr/404.html`). Internal links go through one
`localePath(locale, path)` helper. A locale tag equal to an existing top-level route is refused at
config time.

Each page renders inside an `I18nProvider` for its locale. `<html lang dir>` and date formatting
follow the page locale. With `site.url`, pages link their translations with
`<link rel="alternate" hreflang>` and `x-default`, plus a canonical link; without it neither is
emitted and the build says so once. With more than one locale the header shows a script-free
language switch that points to the same page where the translation exists and to that locale's
home otherwise.

### Agents as readers

- `/translations.json` is the same manifest the work list prints, published: every page, its
  locale, its original, its state and hashes. An agent reads one file to know what exists and what
  to trust.
- `/llms.txt`, `/llm.txt` and `/agents.md` stay at the root and index **originals**, each in its
  own language with that language marked, followed by one line per target locale linking
  `/<locale>/llms.txt`. An agent that can read the original is never sent to a derived copy by
  default.
- Markdown copies of pages carry `lang` and, for translations, the original's URL and state.

### Consumer-owned pages

A `pages` provider still owns the whole site map. It receives `locales` and the instance factory
in `SitePageContext`, content items with the fields above, and may set `locale` and `original` on
a `SitePage` so its pages enter the manifest and the per-locale index. The package does not
rewrite the provider's HTML.

### Limits stated up front

- Skills pages exist once, in the source locale; skill files are repository material, not posts.
- `dir="rtl"` is emitted, but the Journal theme's layout is not claimed in that direction until a
  browser pass has looked at it.
- The default faces cover Latin, Cyrillic and Greek; other scripts use system fonts unless the
  site lists faces in `fonts`.
- Reading time and excerpts stay character-based.

## What changed from the mainstream design

| Mainstream (first revision)                              | Now                                                    | Why                                                                                                          |
| -------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Keys (`"nav.posts"`) with catalogs per locale            | The source sentence is the identity                    | No name to invent or align; code is readable; an edited sentence cannot keep a wrong translation silently    |
| `t` returns a string, `text` returns a Signal            | One `t` returning a Signal                             | The wrong choice was a silent bug in mounted trees; now it is a type error                                   |
| Provider required, `useI18n()` throws without it         | Works with no setup; provider adds languages           | The first program is correct; internationalizing is additive                                                 |
| Plural records keyed by category; ICU left to a seam     | ICU subset in the core                                 | One string per message keeps catalogs flat and auditable; it is the format translators, human or model, know |
| Missing translations fall back at run time, with a count | A command lists missing, stale and invalid items       | The gap becomes a finite, machine-readable task                                                              |
| Sibling translation files with no relation recorded      | Translations record the source hash                    | Staleness is the failure a multilingual site actually has, and it was invisible                              |
| Per-locale copies of site identity in config             | Site copy goes through the same catalog                | One mechanism and one work list                                                                              |
| Parallel `llms.txt` trees                                | Originals first, plus a published translation manifest | An agent reader wants the source and the state                                                               |

What the mainstream shape does better, stated plainly:

- **Fixing a typo in the source invalidates its translations.** With keys it would not. Here the
  audit pairs the unused entry with the new source so the old translation is carried over in one
  step, but it is a step.
- **Long sentences are long keys**, and catalogs are less pleasant to read by hand.
- **A human translation team with its own tooling** expects key catalogs. A site that works that
  way can still do it: the catalog is a flat JSON object and ICU is the interchange format those
  tools speak; only the identity differs.
- **`.value` at string-typed props** is a visible cost of the single return type.

## Work packages

1. **`meowjsx/i18n`**: `t`, instance, provider, ICU subset, types. Tests fail on: a mounted text
   or attribute that does not follow `locale.value`; a parent tag skipped in lookup; `ru` with
   count 3 not selecting `few`; a `setLocale` race where the earlier load wins; a `.value` read
   in a handler that ignores a later locale change; a context read across the built entry.
2. **Audit**: `extractMessages`, `auditCatalog`, `meowjsx i18n check`. Tests fail on: a literal
   call the scanner misses; a translation with different arguments passing; an edited sentence
   not paired with its old entry.
3. **Meowpress, one locale**: theme sentences through `t`, `locales` with only a source,
   `site.timeZone`, `localePath`. Existing site and build tests pass unchanged; a new test builds
   a site whose source locale is `fr`.
4. **Meowpress, targets**: suffix pairing, provenance and the three states, routes, notices,
   switch, alternates, manifest, agent indexes, `meowpress locales` and `stamp`. Tests build a
   temporary two-locale site through `meowpress/build` and edit the original to prove the
   translation turns stale. One browser pass over the switch and the notices.
5. **Documentation and the consumer skill**, including the list-fill-stamp loop in
   [skills/meowland](../../skills/meowland/SKILL.md).

Meowpress's `meowjsx` peer range rises to the first version that exports `./i18n`. Release follows
[local releasing](../releasing.md) and is not part of this work.

## Open decisions

The recommendation is first in each.

1. **Source text as identity.** Recommended as above. Keeping keys is the conservative choice if
   handing catalogs to an external translation team is a real near-term need.
2. **A `meowjsx` command.** Recommended: add the `meowjsx i18n check` bin, because the loop needs
   one command. MeowJSX has no CLI today; the alternative is to export only the audit functions
   and let Meowpress and each application wrap them.
3. **Where provenance lives.** Recommended: the translation's frontmatter, so it travels with the
   file. The alternative is a lock file next to the content, in the manner of `skills-lock.json`,
   which keeps machine state out of authored files but drifts when files move.
4. **Disclosure of unreviewed translations.** Recommended: on by default. A site can remove the
   line by marking translations reviewed or by emptying that catalog entry.
5. **Published catalogs for the built-in theme.** Recommended: none in the package; a site's
   agent fills `locales/<locale>.json` from the work list in one pass. Shipping translated
   catalogs would need a new exception to the English-only rule in the root AGENTS file.
6. **Default `site.timeZone`.** Recommended for now: keep `Asia/Shanghai` to preserve output;
   `UTC` is the neutral default and a visible change for existing sites.
