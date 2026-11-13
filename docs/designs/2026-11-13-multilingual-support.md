# Multilingual support for MeowJSX and Meowpress

Status: accepted for implementation, third revision. The project owner chose the direction of the
second revision (source text as identity, one `t`, provenance, a work list). An independent
challenger then tested it against the code; its findings and how each changed the text are in
[Challenger review](#challenger-review). Implementation progress is recorded in
[Work packages](#work-packages). The mainstream shape of the first revision is kept under
[What changed from the mainstream design](#what-changed-from-the-mainstream-design).

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
      <span>{t("{count, plural, one {# min read} other {# mins read}}", { count })}</span>
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
  static HTML reads it once. There is no separate string form to choose between.
- **A message Signal never becomes a string by accident.** TypeScript accepts an object in a
  template literal, in `+` and in `join`, and host attributes are typed `unknown`, so types alone
  do not catch `${t("Posts")} · ${name}`. The returned Signal therefore carries a `toString` and
  `Symbol.toPrimitive` that throw, naming `.value` and the `t(template, params)` form. A prop
  typed `string` still rejects it at compile time. String builders (document titles, Markdown
  indexes) read `.value` on purpose.
- **The source is written as a literal.** `t`'s type refuses a value of type `string`. Types
  cannot require a syntactic literal (a `const` union passes), so completeness is the audit's
  job, not the type's; see [The audit](#the-audit).
- **Message format is ICU MessageFormat**, the subset `{name}`, `plural`, `selectordinal`,
  `select` and `#`, one string per message. An apostrophe is literal unless it directly precedes
  `{`, `}` or `#`; catalogs should prefer U+2019 in prose. Parsed messages are cached per
  instance. Parameter names are inferred from the literal only when it has no `,` inside braces,
  no nested brace and no apostrophe; any other template takes loose parameters and is checked by
  the audit.
- **Context and note are separate.** `options.context` is part of the identity and separates
  homographs. `options.note` is the translator's note and is not identity, so rewording it does
  not orphan a translation. Both are literals.
- **Catalog shape.** A flat object from source to translation. A source that has contexts maps to
  an object from context to translation, with `""` as the entry without context. An empty string
  is a missing translation. Lookup uses own properties only.
- **Lookup.** The locale, then its parents by dropping subtags (`zh-Hant-TW`, `zh-Hant`, `zh`),
  then the source text itself. The source text is a correct degraded state, not a key on screen.
  `onMissing({ source, context, locale })` reports each miss once.
- **Ambient `t` is for component bodies only.** The module-level `t` reads the nearest
  `I18nProvider` while a component function runs and binds the returned Signal to that instance,
  so reading `.value` later in a handler still follows the locale. Inside a component without a
  provider it yields the source text. **Anywhere else it throws**: a handler, a `derived` body, a
  `keyed` row callback, code after `await`, module top level, or JSX built in a plain function
  before it is rendered. The error names `i18n.t` and `defineMessages`. This needs one core
  addition: `context.ts` exposes whether a component body is running, which `useContext` alone
  cannot tell from "rendering without a provider".
- **`i18n.t`** has the same signature and works anywhere. Code that is not a component body, such
  as Meowpress's page functions and Markdown indexes, receives the instance and uses it.
- **Instance.** `createI18n({ source, locale, catalogs, load?, timeZone?, onMissing? })` returns a
  plain object independent of any `Runtime`: `locale` (writable Signal), `direction` (Signal,
  derived from the locale's script because Bun exposes neither `getTextInfo` nor `textInfo`), `t`,
  `lookup`, `number`, `date`, `addCatalog` and `setLocale` (loads through `load` first and writes
  the Signal after, so a switch never flashes the source language; the last call wins).
- **`lang` and `dir`** are bound by the host on the element it owns:
  `lang={i18n.locale} dir={i18n.direction}`. The entry never touches the document.
- **Identity.** The Context and the in-render fact live in one module each;
  `entry-identity.test.ts` gains a case that provides through the built entry and reads from a
  separately bundled component. `./i18n` and `./i18n/audit` use no Bun or DOM globals, because
  release acceptance imports every export under Node.

### Variables and dynamic text

The identity is the **template**, never the rendered sentence. What varies falls into five cases,
each with one answer:

| What varies                                 | How it is written                                                                                 | Visible to the audit |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------- |
| A value inside a sentence                   | `t("Hello, {name}", { name })`; a parameter may be a Signal, and numbers use the locale's format  | yes, one message     |
| Number, gender or another grammatical form  | `plural`, `selectordinal` and `select` inside the same template                                   | yes, one message     |
| An element inside a sentence                | `t.rich("Read <link>the guide</link>", { link: (children) => <a href="/guide/">{children}</a> })` | yes, one message     |
| One of a known set, chosen at run time      | `defineMessages({ open: "Open", closed: "Closed" })`, then `t(labels[status])`                    | yes, each member     |
| Text that is data (titles, names, API text) | not interface copy; the owner of the data supplies it per locale                                  | not applicable       |

- **Sentences are never concatenated.** `t("Hello, ") + name` breaks in languages with a different
  word order and is reported by the audit, as is a template literal passed to `t`.
- **`t.rich`** returns a `ReadableSignal<Child>`. Tags are named, carry no attributes and map to
  functions the caller supplies, so a translation can move or reorder a link but cannot introduce
  markup. A tag the caller did not supply is an `invalid` audit item.
- **`defineMessages`** is how a literal is declared away from its use: at module level, in a
  table keyed by a status or an error code. It returns typed descriptors and does not look
  anything up; `t` accepts a literal, a descriptor or a Signal of a descriptor, and nothing else.
  A choice that changes at run time is `t(derived(() => labels[status.value]))`, called in the
  component body, or one `select` template with the Signal as a parameter. `t` is never called
  inside `derived`: that body runs outside the component and would throw.
- **Data is not copy.** A post title, a user's name or a message a server composed is content.
  It reaches the component already in the right language from whoever owns it: Meowpress content
  files for a site, the host's backend for an application. Passing it through a catalog would
  make the catalog an unbounded second database.
- **One named exception: `i18n.lookup(text, options?)`.** Some strings are data to the code but a
  small set known to their owner, such as `site.name` and `site.description` in a Meowpress
  config. `lookup` translates a non-literal string and, because the scanner cannot see it, the
  owner must hand the same set to `auditCatalog` as extra messages. Meowpress does this for its
  config copy. It is deliberately a different name from `t`, so a reader of the code can tell
  which strings the audit guarantees and which it was told about.

### The audit

Two pure, IO-free functions exported from `meowjsx/i18n/audit`:

- `extractMessages(code, file)` finds call sites of `t`, `.t`, `t.rich`, `.lookup` and
  `defineMessages` and parses only the argument list at each one. A first argument that is one
  string literal becomes a message with its source, context, note and position. Anything else,
  including a template literal, a concatenation or an identifier that is not a descriptor table
  member, is returned as a `dynamic` item with file and line; it is reported, never skipped.
  Importing `t` under another name is reported as well. The scanner does not claim to understand
  the program: what it cannot read becomes a work item.
- `auditCatalog(messages, catalog, locale)` returns the work list:
  - `missing`: a source with no translation, or an empty one;
  - `unused`: a catalog entry no code refers to, paired with the closest missing source when one
    is similar, so an edited sentence carries its old translation as a starting point;
  - `invalid`: a translation that does not parse, whose arguments differ from the source's
    (which also catches an apostrophe that swallowed a placeholder), or that uses a rich tag the
    source does not have.

A command for applications, `meowjsx i18n check`, is deferred: MeowJSX has no bin today, a Bun
shebang would be its first Bun requirement, and Meowpress does not need it (its theme declares a
message table). The functions ship first; the command is the last work package and is only added
once an application needs the loop.

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
  through the same catalog: the theme passes those configured strings through `i18n.lookup`, and
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

## Challenger review

An independent challenger read the second revision against the code and ran two probes (a runtime
probe against `packages/meowjsx/src`, a type probe with TypeScript 6.0.2; the pinned 7.0.2 was not
installed there). Verdict: ready after changes. The findings that changed the mechanism:

- **Ambient `t` missed the provider in about half of the theme.** Meowpress's page functions
  build JSX in plain functions, where no context scope is active, and `agentMarkdown`/`llmText`
  never render. The probe rendered the source text there. Result: ambient `t` is restricted to
  component bodies and throws elsewhere; page functions take the instance.
- **"Outside render returns the source text" was a silent bug**, and the second revision's own
  `t` inside `derived` advice hit it. Result: the throw above, the in-render fact in
  `context.ts`, and `t` accepting a Signal of a descriptor.
- **Types do not stop a Signal from being stringified.** The probe printed
  `[object Object] · Site` with no type error. Result: the throwing `toString`.
- **Literal types do not make a scan complete.** A `const` union passes the type and has no
  literal at the call. Result: the scanner reports what it cannot read as `dynamic`, and
  Meowpress fails its build when a source reaches an instance that is not in its message table.
- **Meowpress conflated two source languages** and never said where the theme's messages come
  from at a consumer, where the theme is compiled code. Result: the rules below.

### Amendments to Part 2

These override the earlier text where they differ.

- **Two sources.** The theme's interface source is always `en`. Every configured locale other
  than `en`, including the content source locale, needs a catalog for theme sentences. Config
  copy is written in the content source locale and is a work item only for target locales.
- **The theme declares its messages** in one exported `defineMessages` table. `meowpress locales`
  reads that table and the config; it runs no scanner and needs no `meowjsx` command.
- **Config copy that goes through `lookup`:** `site.name`, `site.description`, `about.heading`,
  `about.paragraphs[]`, `about.linksHeading`, `about.links[].label` and the three `notFound`
  strings. The `title === site.name` comparison happens before lookup. `agentGuide` stays in the
  source language.
- **Pairing.** The duplicate key becomes slug and locale, and pairing happens after the source
  overlay. `first.md` together with `first.<source>.md` is an error. A set with no source-locale
  member has no original: its members are each originals in their own language and none is
  stale. A translation inherits `date`, `tags` and `category` from its original unless it sets
  them. When configuring a locale changes an existing slug (`notes.fr.md` was `/posts/notes.fr/`),
  the build reports it. `SitePageContext.posts` and `thoughts` stay originals only; translations
  arrive on each item.
- **Provenance hash.** The first 12 hex characters of SHA-256 over the original's resolved title,
  a newline, and its body with line endings normalised to LF. The work list gives the current
  hash and the recorded one; it does not promise a diff, which the agent gets from the
  repository's history. `stamp` rewrites frontmatter through a YAML document round-trip and adds
  frontmatter to a file that has none.
- **Disclosure** of unreviewed translations is switched with `locales.disclosure: false`, not by
  emptying a catalog entry.
- **Routes.** `localePath` falls back to the source route for routes that exist only there
  (skills). Stylesheet and image paths gain one level under a prefix. Translated bodies are not
  rewritten: root-absolute links an author wrote stay as written, and post assets are referenced
  root-absolutely. The root `404.html` links each locale's home; per-locale `404.html` files are
  written and described as host-dependent. A locale tag that collides with a route, an asset
  directory or a consumer page is refused during the build, when all of them are known. The URL
  segment and the file suffix are the canonical tag in lower case.
- **Client script copy** ("Copy", "Copied" in the skill browser) moves to `data-*` attributes
  written at build time.
- **`/translations.json`** is reserved like `agents.md` and is written only when `locales` is
  configured. `site.url` is an origin without a path.
- **Unchanged output.** One snapshot of the current HTML is taken before the theme moves to
  `t`, because JSX whitespace at split sentences decides whether the output stays identical.
- **CLI.** `locales` and `stamp <file>` need the argument parser reworked; the project root for
  them is `--root`, not a positional.

## Work packages

Reordered after the review so each one fits one implementer and the mechanism is proved end to end
by the second.

1. **Core `t`.** `src/i18n.ts` and the `./i18n` export: `t` with `{name}` and `plural`,
   `createI18n`, `I18nProvider`, lookup chain, the throwing `toString`, the in-render fact and
   the throw outside component bodies, `number`, `date`, `direction`, `setLocale`. Tests fail
   on: a mounted text or attribute that does not follow `locale.value`; a parent tag skipped in
   lookup; `ru` with count 3 not selecting `few`; a `setLocale` race where the earlier load
   wins; `t` in a handler or a `derived` body not throwing; a `.value` read in a handler that
   ignores a later locale change; a stringified message not throwing; a context read across the
   built entry.
2. **Meowpress interface locales.** The message table, the instance in page functions,
   `locales`, `site.timeZone`, `localePath` with depth, `<html lang dir>`, prefixed routes with
   untranslated content always linked. The snapshot of current output passes unchanged; a new
   test builds a two-locale site and reads `/fr/index.html`.
3. **Rest of the message surface.** `select`, `selectordinal`, `t.rich`, `defineMessages` with
   Signal descriptors, `lookup`, and the audit functions.
4. **Content.** Suffix pairing, provenance, the three states, notices, inheritance.
5. **Publishing and the loop.** Manifest, per-locale agent indexes, alternates, the language
   switch, `meowpress locales` and `stamp`. One browser pass over the switch and the notices.
6. **Documentation and the consumer skill**, including the list-fill-stamp loop in
   [skills/meowland](../../skills/meowland/SKILL.md).
7. **Deferred:** `meowjsx i18n check` and the pseudo-locale.

### Implementation status and handoff

Recorded on 2026-11-13 on branch `ccr-f569f565-518h28`. Work package numbers are the ones above;
package 3 was done before package 2 because the theme needs `defineMessages` and `lookup`.

| Package                        | State                                                                      |
| ------------------------------ | -------------------------------------------------------------------------- |
| 1. Core `t`                    | Done and committed.                                                        |
| 3. Rest of the message surface | Done and committed, including `meowjsx/i18n/audit`.                        |
| 2. Meowpress interface locales | Done and committed.                                                        |
| 4. Content                     | Not started.                                                               |
| 5. Publishing and the loop     | Not started.                                                               |
| 6. Documentation and the skill | Not started, apart from the README sections each package wrote for itself. |
| 7. Deferred                    | `meowjsx i18n check` and the pseudo-locale, by decision.                   |

Evidence, kept separate by who ran it:

- **Run by the lead after each package:** the package's own unit tests and typecheck, the
  repository lint and format check, and a hand-written probe of the new behavior (packages 1 and 3) or a rebuilt two-locale site (package 2).
- **Reported by the implementers and not repeated by the lead:** the full `bun run test` (974
  passing after package 2) and `bun run typecheck`, the docs app build, and the Meowpress browser
  suite (20 passing).
- **Not done by anyone:** a look at a target-locale page in a browser, right-to-left layout, and
  installed-state acceptance from packed archives.

What a successor needs to know:

- **Unchanged English output is pinned.** `tests/unit/output-snapshot.test.ts` compares two
  fixture sites byte for byte against snapshots taken from the source before the theme moved to
  messages. The only accepted difference is on skill pages: the copy button gained
  `data-copy-label` and `data-copied-label`, and the inline script reads them. Regenerate only on
  purpose, with `MEOWPRESS_UPDATE_SNAPSHOTS=1`.
- **Scope of package 2.** Target locales get home, about, the two archives and `404.html`. Post
  and thought detail pages under a prefix, suffix pairing and provenance are package 4. Entries
  in a target tree carry the source locale as `lang` today; package 4 replaces that with the
  item's own locale.
- **Two instances per page.** Theme sentences use an instance whose source is always `en`; site
  config copy uses a second one whose source is the content source locale.
- **Counts are not pluralized in English.** "min read", "characters" and similar pass the count
  as text with a plain `{count}` placeholder, because ICU `#` would group digits and change
  today's output ("1 characters" is preserved). A translation may still use `plural`.
- **Not in the message table.** Skill-graph roles and details are produced in `skills.ts` as data
  and stay English.
- **New theme sentences go into `src/messages.ts` first**, or the build throws: the theme's
  instance refuses a source that is not in the table.
- **Core change wider than the design said.** The in-render fact needed `reactive.ts` and
  `keyed.ts` to mark `derived` reads, effects, flushed jobs, `mapSignal` functions and `keyed`
  callbacks as outside a component body, not only `context.ts`. `mapSignal` allocates one closure
  per read as a result. It is correct and tested, and worth a look before release.
- **Known gaps in package 3.** The scanner is heuristic for unusual TSX (`<T>x` assertions, type
  positions) and has no tests there. `auditCatalog` does not validate plural categories against
  the locale.
- **The English-only sweep is slow here.** The exact command from the root AGENTS file did not
  finish within two minutes in this container. Running the same pattern over
  `git ls-files -co --exclude-standard` gives the same answer quickly.
- **Tests that import `meowpress/build` run the built `dist`,** so `bun run build` comes first.
- **Release.** Nothing is versioned, packed or published. Meowpress's `meowjsx` peer range still
  has to rise to the first version that exports `./i18n`.

Meowpress's `meowjsx` peer range rises to the first version that exports `./i18n`. Release follows
[local releasing](../releasing.md) and is not part of this work.

## Open decisions

The project owner accepted the recommendations below; they are kept as the record of what was
chosen and what the alternative was.

1. **Source text as identity.** Recommended as above. Keeping keys is the conservative choice if
   handing catalogs to an external translation team is a real near-term need.
2. **A `meowjsx` command.** Decided after the review: deferred. The audit functions ship first
   and Meowpress wraps them; the command is added when an application needs it.
3. **Where provenance lives.** Recommended: the translation's frontmatter, so it travels with the
   file. The alternative is a lock file next to the content, in the manner of `skills-lock.json`,
   which keeps machine state out of authored files but drifts when files move.
4. **Disclosure of unreviewed translations.** Recommended: on by default. A site can remove the
   line by marking translations reviewed or with `locales.disclosure: false`.
5. **Published catalogs for the built-in theme.** Recommended: none in the package; a site's
   agent fills `locales/<locale>.json` from the work list in one pass. Shipping translated
   catalogs would need a new exception to the English-only rule in the root AGENTS file.
6. **Default `site.timeZone`.** Recommended for now: keep `Asia/Shanghai` to preserve output;
   `UTC` is the neutral default and a visible change for existing sites.
