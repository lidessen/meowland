# Meowpress

Meowpress builds a static blog from Markdown and MDX, with a built-in Journal-based theme for posts, short notes
and public skills. A project can supply its own theme or page map through `meowpress/build`.

The built-in theme renders functional icons as inline SVG through Meowtail's Lucide-backed
`Icon`, not font glyphs. Custom pages can use `Icon` or `IconSource` from `meowtail/icons`
and the full Lucide set from `meowtail/icons/lucide`; brand artwork such as `GithubIcon`
stays separate. Icons render at build time and need no browser script or icon font.

## Build and preview a site

Use Bun and install this version of `meowpress` with compatible `meowcss` and `meowjsx` peers.
When trying a workspace build, install the archives from `bun run build` and `bun run pack` in your
project. From that project, add your first post and build the site.

```sh
mkdir -p content/posts
printf '# First post\n\nHello from Meowpress.\n' > content/posts/first.md
bunx --no-install meowpress build
```

Meowpress builds `dist/index.html` and `dist/posts/first/index.html`. Put short notes in
`content/thoughts/` and public skills in `skills/<name>/SKILL.md`. `llms.txt` and `agents.md`
describe the generated site. The default theme includes `404.html` for static hosts that serve a
custom error page.

Run `bunx --no-install meowpress preview` to serve the built files at `http://127.0.0.1:4173`.
Run the build again after editing content. Deploy the `dist/` directory to a static host.

## Configure an existing repository

Place `meowpress.config.ts` in the project root when your content lives outside the default
folders or when you want to change the site name. This example uses `blog/` for posts, `notes/`
for short notes and `blog/assets/images/` for the homepage image.

```ts
import { meowSite } from "meowpress/build";

export default meowSite({
  content: {
    directory: ".",
    postsDirectory: "blog",
    thoughtsDirectory: "notes",
    assetsDirectory: "blog/assets",
  },
  site: {
    name: "My site",
    images: { hero: "images/cover.svg" },
  },
});
```

The directory names in `content` are relative to its `directory`. Posts from `blog/` still have
URLs under `/posts/`, and notes still have URLs under `/thoughts/`. Meowpress copies `posts/assets/`
to `/posts/assets/`. Set `postAssetsDirectory` to change the source of those files. Posts and assets
whose paths contain a file or folder name starting with `_` are treated as drafts.

Pass a project path after `build` or `preview` to run from another directory. The project root
defaults to the current directory and is the base for relative config paths and output.
The CLI looks for `meowpress.config.ts`, then `site.config.ts`. Use `--config <file>` to choose a
file explicitly. `meowpress` and `meowpress --config ./site.config.ts` also build, and `preview`
accepts `--port <port>`.

Builds replace the generated output after they succeed. Meowpress reuses a nonempty default
`dist/` only when it contains the previous build's `agents.md` and `llms.txt`. If another tool
owns `dist/`, set `outputDirectory` to a separate directory and reserve it for generated files.

`includeProjectSkills: true` opts in to publishing `.agents/skills/`. Set `projectRootDirectory`
to choose the root for those skills. Set `notFound: false` to omit the built-in `404.html`, or
supply `notFound: { title, message, homeLabel }` to change its copy.

## Site URL and time zone

`site.url` is the public origin of the site, without a path, such as `https://example.com`. It is
validated and stored without a trailing slash; the build does not use it for output yet. `site.timeZone`
is an IANA time zone, `Asia/Shanghai` by default. It decides the day key and the `HH:mm` label of a
post or thought whose date has no calendar date in its text (a date from the file's modified time,
or text such as `September 1, 2026 23:30 UTC`). A date written as `2026-09-01` or as an ISO
timestamp keeps its written day. An invalid value fails when the config is resolved.

## Languages

Without `locales`, a site has one locale, English, unprefixed routes and no catalogs. Setting
`locales` publishes the theme and the content in more languages.

```ts
export default meowSite({
  locales: {
    source: "en",
    targets: { fr: { label: "Français" } },
    untranslated: "link",
    stale: "notice",
    disclosure: true,
  },
});
```

- `source` is the language the content and the site-owned copy are written in. It keeps today's
  unprefixed routes. Each `targets` tag is published under `/<tag>/`, with the tag in lower case
  (`zh-Hant` becomes `/zh-hant/`); `<html lang>` keeps the canonical tag, and `dir="rtl"` is added
  for right-to-left scripts. `label` is the language's own name. A target equal to the source, an
  invalid tag, or two tags that are the same after canonicalisation fail when the config is
  resolved.
- The theme's own sentences are written in English and declared in one table, exported as
  `themeMessages`. Every locale other than English takes them from `locales/<tag>.json`, a flat
  object from the English sentence to its translation (a sentence with a `context` maps to an
  object from context to translation). `localesDirectory` changes the directory, which resolves
  against the project directory. `locales.catalogs.<tag>` supplies the same format inline and wins
  over the file. A missing file is an empty catalog; invalid JSON, or a file that is not an object
  of strings, fails the build and names the file. The source locale needs a catalog too when it is
  not English.
- A sentence with no translation shows its English text. After the build, one line per locale
  reports how many sentences fell back and which file to fill. A site without `locales` prints
  nothing.
- Site-owned copy is translated through the same catalogs, keyed by the text as written in
  `source`: `site.name`, `site.description`, `site.about.heading`, `paragraphs`, `linksHeading` and
  each link `label`, and the three `notFound` strings. The source tree prints them as written.
  `agentGuide` is not translated.
- Each target gets `/<tag>/` (home), `/<tag>/about/`, `/<tag>/posts/`, `/<tag>/thoughts/`,
  `/<tag>/404.html` (a host decides whether it serves the file) and a page for every content item
  written in that language. Dates follow the page locale. Every internal link goes through one
  helper that points a route that exists only in the source tree, such as skills, to its source
  URL. Skills pages exist once, in the source locale.
- With more than one locale the header shows a script-free language switch that points to the same
  page where the translation exists and to that locale's home otherwise. With `site.url`, pages
  also carry `<link rel="canonical">`, one `<link rel="alternate" hreflang>` per version and
  `x-default` for the source; without `site.url` neither is emitted and the build says so once.
- A target's tag may not equal a top-level route, content asset directory, slug prefix or
  consumer page path; the build fails and names the tag. A `pages` provider still owns the whole
  site map: no locale tree is written for it, and it receives the resolved `locales` in its
  context.

### Translated content

A file name may carry a locale suffix. `content/posts/first.fr.md` is the French translation of
`content/posts/first.md`; `only-fr.fr.md` without a `only-fr.md` is an original written in French.
The suffix is read only for a configured locale, so `notes.v2.md` keeps its slug, and it uses the
canonical tag in lower case. Files that share a kind and slug are one translation set; the member
in the source locale is the original, and a set without one is a set of originals, one per
language. `first.md` next to `first.en.md` is an error, because both claim the same slug in the
source locale.

A translation records what it was translated from:

```yaml
---
title: Premier billet
translation:
  source: 3f9a1c2e
  reviewed: false
---
```

`translation.source` is the first 12 hex characters of SHA-256 over the original's resolved title,
a newline and its body with line endings normalised to LF. `reviewed: true` marks a translation a
person has checked. Both fields are optional; a translation without a recorded hash counts as
stale. From that the build knows three states without anyone maintaining them: **current** (the
recorded hash matches the original), **stale** (the original changed since) and **missing**.

- A current or stale translation is published under `/<tag>/<kind>s/<slug>/`.
- A stale translation is still published, with a notice that the original has changed and a link
  to it. `stale: "fail"` makes it a build error instead, for a site that would rather not publish
  it.
- A translation without `reviewed: true` carries a quiet line saying it is a translation and
  linking the original; `disclosure: false` removes that line.
- A missing translation produces no page. In the target's timeline and archives the original is
  listed with its language marked and `lang` on the entry, linking the original's URL;
  `untranslated: "omit"` leaves it out instead.
- A translation inherits `date`, `tags` and `category` from its original unless it sets them. A
  file whose name used to be its slug (`notes.fr.md` used to publish at `/posts/notes.fr/`) now
  reads as a suffix, and the build reports the URL that changed.

### The work list

```sh
meowpress locales                    # one line per missing or stale item
meowpress locales --json             # the same list as a contract
meowpress locales stamp content/posts/first.fr.md
```

The report holds, for each target locale, the interface messages the audit finds missing, unused
or invalid (theme sentences and site copy), and the content items that are missing or stale with
the original's file, URL and current hash, the target file and, for a stale item, the hash it was
translated from. `stamp` writes the original's current hash into a translation's frontmatter after
it has been written or revised, and adds frontmatter to a file that has none. The loop for "add
French to this blog" is: configure the locale, run `locales`, write what it names, stamp, run
`locales` again until it is empty, then build. A site without `locales` refuses both commands.

### Agents as readers

`/translations.json` is published when `locales` is configured and is reserved like `agents.md`:
it is the same report the work list prints, so an agent can read one file to know what exists and
what to trust. The root `/llms.txt`, `/llm.txt` and `/agents.md` index the originals, each in its
own language with that language marked, then link each target's index. A target tree gets
`/<tag>/llms.txt`, `/<tag>/llm.txt` and `/<tag>/agents.md` next to its pages; they list that tree's
pages and the originals it shows untranslated, marked with their language and linked to the source
URL. A `pages` provider that sets `locale` and `original` on a `SitePage` enters the manifest and
the per-locale index; its Markdown copy starts with `<!-- lang: fr; original: /guides/ -->`.

A right-to-left target is laid out in that direction: the theme's chrome and Meowtail's prose
mirror through logical properties, dates follow the page locale, and code blocks stay
left-to-right. Inline code inside right-to-left prose is still subject to the Unicode bidi
algorithm, as on any site. The default faces cover Latin, Cyrillic and Greek; other scripts use
system fonts unless the site lists faces in `fonts`.

## Build from code

`meowSite()` resolves configuration and `buildSite()` writes the site. Both are exported from
`meowpress/build`. Use trusted local configuration and MDX, which execute code during a build.

## Pages a consumer owns

A consumer that supplies `pages` owns the whole site map. The provider receives the content that was
already loaded and returns complete documents; the package writes them at their paths, adds them to
the agent-facing indexes, and does not publish its own blog routes next to them. One site map, one
owner.

```ts
import { meowSite, type SitePage } from "meowpress/build";

export default meowSite({
  content: [{ directory: "/path/to/content" }],
  outputDirectory: "/path/to/dist",
  themeStylesheet: "site-theme.css",
  pages: ({ posts, theme }): SitePage[] =>
    posts.map((post) => ({
      path: post.slug,
      title: post.title,
      html: renderDocument(post, theme),
    })),
});
```

- `pages` is a provider of complete HTML documents. A path that resolves above the site root is
  refused rather than clamped.
- `SitePageContext` carries the resolved `locales` and `pageLocale(tag)`, the locale instance the
  built-in pages use, with the site's catalogs, time zone and missing-message reporting. A page
  that sets `locale` and `original` enters `/translations.json` and the per-locale index.
- A page's optional `markdown` is the same page for agents. It is published next to the route
  (`components/button.md` for `/components/button/`, `index.md` for the root), and `llms.txt`,
  `llm.txt` and `agents.md` link it instead of the HTML. `llms.txt` follows the
  [llms.txt](https://llmstxt.org/) shape: the site summary, then one section of links per page
  `group` with each page's `description`. `llms-full.txt` holds every Markdown copy in one file.
- `agentGuide` is Markdown that opens `llms.txt` and `llms-full.txt` after the summary: what an
  agent must know before following any link, such as how to install and set up the documented
  packages.
- `mdxComponents` adds named components to the MDX content pages; the built-in `Callout` stays
  available.
- `themeStylesheet` names the theme stylesheet the build writes, so a consumer page can link it. It
  applies to the built-in pages as well, so a renamed stylesheet never leaves a page linking a file
  that was not written.

The whole theme can be replaced with `theme: defineTheme(...)`; all static pages output that theme's root attributes and default options.
The build writes `theme.cssText` to a temporary CSS file, then lets Bun handle the other assets, and finally delivers through a stylesheet link,
so the theme applies without client-side JavaScript.

`fonts` lists the web fonts the theme names, as Fontsource variable packages
(`{ family, package, styles }`, the same shape as Meowtail's `journalFonts`). The build publishes
each package's weight-axis `woff2` files into `fonts/` with a content hash, puts their `@font-face`
rules first in the theme stylesheet with each subset's `unicode-range`, and copies each license to
`licenses/<name>-OFL.txt`. A browser fetches only the files a page's text and families use, and
nothing for a family the page does not use, so a site with a theme switch pays only for the active
theme. The built-in blog theme defaults to `blogFonts`, which shares Journal’s font list:
Newsreader (normal and italic), Inter,
and JetBrains Mono. Any other theme defaults to no fonts; set `fonts` explicitly to provide them,
or set `fonts: []` to omit font assets.
Install the listed packages in the site; nothing depends on an external font service.
The default pages need no images. The `hero`, `feed` and `about` keys of `site.images`
can explicitly set decorative image paths, for example `images/cover.svg`; paths are relative to the content root's `assets/`, the library handles each page depth,
and assets are delivered along the existing asset build flow. When no About image is set, the first letter of the site name is used.
Font packages resolve from the project root first, then from this package, which carries the
three default font families.

## Independent verification

Once repository dependencies are ready, run `bun run --cwd packages/meowpress test` and
`bun run --cwd packages/meowpress typecheck`. Tests live in `tests/unit/`; real build tests create temporary content, themes and images through the public
`meowpress/build` entry,
covering Markdown, MDX, Thought output and draft page/asset exclusion, without reading Blog content or invoking the Blog build.

After `bun run build`, run `bun run --cwd packages/meowpress test:browser` for the Journal
browser regressions. The fixture server builds a temporary site through `meowpress/build` and
cleans it up on exit. The suite covers desktop and mobile widths in light and dark schemes,
repeated feed and skill-browser interactions, clipboard copy, deep 404 stylesheets, no-JavaScript
content, and wide-content containment. Screenshots are written to `packages/meowpress/test-results/`.
