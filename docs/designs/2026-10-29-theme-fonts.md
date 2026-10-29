# Theme fonts

Status: proposal for review on 2026-10-29. Nothing here is implemented. Per the
[design-change method](../../.agents/skills/design-change/SKILL.md), an independent challenger
reviews the boundary below before implementation starts.

## The problem

`journalTheme` names `"Newsreader Variable"` for titles and reading copy, `"Inter Variable"` for
controls and `"JetBrains Mono Variable"` for code, then falls back to system faces. Its README
says the host loads the font files. No host does: the docs site, the Meowbook gallery and the
showcase all render Journal in Georgia, Charter or the platform UI face, so the theme reviewers
see is not the theme that was designed.

The one place that does load a theme font is Meowpress, and it does so by special case. The blog
theme prepends `@import "@fontsource-variable/geist";` to its `cssText`; the build string-replaces
that package name with a resolved path, lets Bun inline every `woff2` file as a base64 data URI,
and copies the OFL license when the CSS text contains the package name.

Three facts constrain the answer:

- **Not every host bundles CSS.** Meowbook previews and applications mount `theme.cssText` with
  `mountStyles` at run time. A bare `@import "@fontsource-variable/..."` in that text resolves to
  nothing there. Theme CSS has to stay complete and self-contained without a bundler.
- **Inlining defeats `unicode-range`.** Fontsource splits each family into subsets (latin,
  latin-ext, cyrillic, greek, vietnamese) so a browser fetches only the ones a page uses. Inlined,
  every subset is downloaded with the stylesheet. Measured on the 5.3.0 packages, Journal's
  weight-axis files are 222 KB (Newsreader, normal and italic), 453 KB (Inter) and 179 KB
  (JetBrains Mono): about 850 KB raw, 1.1 MB as base64, paid by every reader of the docs
  stylesheet even on the standard theme. As separate files, a Latin reader on Journal fetches
  about 210 KB (Newsreader 58 + 65 italic, Inter 48, JetBrains Mono 40), and a reader on another
  theme fetches nothing.
- **Fonts are third-party assets.** All three are SIL OFL 1.1. Whoever ships the files ships the
  license with them.

Out of scope: CJK faces. The theme stacks already fall back to Songti, PingFang and Noto CJK, and
shipping CJK fonts is a separate size decision. The standard and Meow themes use system faces and
need nothing.

## Options

### A font component

A `<Fonts />` or `<ThemeFonts />` MeowJSX component that inserts `@font-face` rules or `<link>`
elements when it mounts.

Rejected. A component's setup runs once per mount, but fonts belong to a document: two instances
register the same faces twice, and unmounting one must not remove faces another region still
uses, so the component would need a document-level reference count, which is a resource manager
in a component's clothing. Static pages (Meowpress, the docs site) also have to declare fonts in
the HTML head before first paint, where no component runs. The component would cover only the
runtime hosts and still need a second mechanism for static ones.

### `@import` in `cssText` (generalize the Meowpress precedent)

Rejected for the reasons above: it makes `cssText` depend on a bundler, which breaks
`mountStyles` hosts, and its default output inlines every subset. It also hides the license duty
inside a string search.

### Status quo: document that hosts load fonts

Keeps every package unchanged. The cost is that each host repeats the same package names, weights
and italic files, and nothing checks that a theme's named families are actually loaded. This is
the fallback if the challenger finds the manifest below not worth its code.

### Recommended: a font manifest beside the theme, loaded by each host

A theme that names web fonts also exports what it needs as data. Hosts turn that data into
`@font-face` rules in whatever way fits them. `cssText` and `ThemeDefinition` do not change.

## The contract

### The manifest

Meowtail exports `journalFonts` from `meowtail/theme`, next to `journalTheme`:

```ts
export const journalFonts = [
  {
    family: "Newsreader Variable",
    package: "@fontsource-variable/newsreader",
    styles: ["normal", "italic"],
  },
  { family: "Inter Variable", package: "@fontsource-variable/inter", styles: ["normal"] },
  {
    family: "JetBrains Mono Variable",
    package: "@fontsource-variable/jetbrains-mono",
    styles: ["normal"],
  },
] as const satisfies readonly ThemeFont[];
```

- `family` is exactly the name the theme's `type.*` stacks use. A unit test checks that every
  quoted family in the theme's font stacks is in the manifest or a known system face, so the
  manifest and the stacks cannot drift.
- `package` names a Fontsource variable package, whose layout (`wght.css`, `wght-italic.css`,
  `files/*.woff2`, `LICENSE`) the loaders rely on. Only the weight axis is loaded; the optical-size
  files are twice as large and no role uses them.
- `styles` lists the files to load. Newsreader needs italic because `type.quoteStyle` is italic in
  Journal; Inter and JetBrains Mono do not.

Meowtail does not depend on the font packages and ships no font files. A host that wants the faces
installs the packages it lists. The `ThemeFont` type lives in Meowtail beside `UiTokenValues`: it
describes Fontsource packages, which is a Meowtail decision, not a MeowCSS one.

### Meowpress: a `fonts` option

`meowSite({ fonts: journalFonts, ... })` replaces the Geist special case. For each entry the build:

1. resolves the package's `wght.css` (and `wght-italic.css` when listed) from the site's own
   dependencies,
2. copies the referenced `woff2` files into the output as hashed files and writes the
   `@font-face` rules with their `unicode-range` into a fonts stylesheet linked before the theme,
   with `font-display: swap`,
3. copies each package's `LICENSE` to `licenses/<package>-OFL.txt`.

The blog theme exports `blogFonts` for Geist and its default configuration passes it, so the
string replacement and the `includes('"@fontsource-variable/geist"')` license check are removed.
Geist stops being inlined, which changes the release-consumer assertion that the default CSS
contains `data:font/woff2;base64,`; that assertion becomes "the default output contains the Geist
`woff2` files, a fonts stylesheet linked before the theme, and `licenses/geist-OFL.txt`".

No `<link rel="preload">` by default. A preload forces the download, and a site with a theme
switch (the docs) only wants the active theme's files. A host can opt in for a single-theme site.

### The docs site

The docs pass `journalFonts` to Meowpress. The rules are always present, but a browser fetches a
font file only when an element uses that family, so Journal's files download only after a reader
picks Journal. The standard and Meow themes make no font requests.

### Meowbook gallery and other runtime hosts

The gallery preview imports the packages' CSS through its bundler (`import
"@fontsource-variable/newsreader/wght.css"` and so on), next to the theme registry in
`stories/preview.ts`. The same lazy fetching applies, and the faces are in place before a reader
switches the gallery to Journal. Applications do the same; the Journal README section shows the
imports and points at the manifest as the list to follow.

## What changes, by package

| Package     | Change                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| `meowtail`  | `ThemeFont` type, `journalFonts`; README Journal section; a test that stacks and manifest agree      |
| `meowpress` | `fonts` option and loader; `blogFonts`; Geist special case removed; release-consumer assertion moved |
| `apps/docs` | passes `journalFonts`; installs the three packages as dev dependencies                               |
| `meowbook`  | none; the Meowtail stories' preview imports the font CSS                                             |
| `meowcss`   | none                                                                                                 |

## Verification

- Meowpress unit test: a build with `fonts` emits the `woff2` files as separate hashed files, a
  fonts stylesheet with `unicode-range` and no data URIs, linked before the theme, and the license
  files; a build without `fonts` emits none of them.
- Docs browser test: on the standard theme the page requests no font file; after choosing Journal,
  `document.fonts.check('16px "Newsreader Variable"')` becomes true and a heading's used face is
  Newsreader.
- The release-consumer check for the default Meowpress site, updated as above.

## Questions for the challenger

1. Is the manifest worth its code over the status quo, given only one theme names web fonts
   today? The counterweight is Meowpress, which already needs a font mechanism and has a
   hard-coded one.
2. Should the manifest be tied to the Fontsource package layout, or name URLs and let a host
   supply files from anywhere? Tying it keeps loaders small and covers both current fonts; a
   URL form can be added if a theme ever needs a face Fontsource does not carry.
3. Is dropping Geist inlining an acceptable Meowpress behavior change for an `alpha` line, given
   it makes the default stylesheet smaller and lets subsets load lazily?
