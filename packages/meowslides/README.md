# MeowSlides

`meowslides` is a standalone presentation package that owns the player, pages and steps, activity
permission, reveals, the media lifecycle, presentation layouts and themes, and the trusted local MDX
authoring entry point. The package is currently preparing the public candidate `0.1.0-alpha.0` and is
not yet published to npm; release wiring and out-of-package acceptance do not imply actual
authorization to publish.

Meowtail keeps generic UI, layout, image preview and the standard application theme. The new package
depends one-way on Meowtail, MeowJSX and MeowCSS; the old `meowtail/presentation` and root presentation
exports have been removed, and no reverse-compatibility re-export is kept.

## Runtime and theme

The root entry point exports `Presentation`, `Reveal`, `PresentationLayout`, `PresentationText`,
`PresentationList`, `PresentationImage`, `PresentationVideo`, `PresentationAudio`,
`usePresentationActivity` and the existing `SlideDefinition`, `SlidePosition`, `SlideSession` and
other types.

`createMeowSlides` and `installMeowSlides` from `meowslides/registry` register only presentation
contracts. The host separately installs the generic `createMeowUI`; do not create a new Runtime for
every page.

```tsx
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { applyTheme, mountStyles } from "meowcss/web";
import { createMeowUI } from "meowtail";
import { Presentation, Reveal, createMeowSlides, type SlideDefinition } from "meowslides";
import { presentationTheme } from "meowslides/theme";

const runtime = createRuntime({ plugins: [createMeowUI(), createMeowSlides()] });
const slides: readonly SlideDefinition[] = [
  {
    id: "observation",
    title: "Observation",
    steps: 1,
    render: () => (
      <div>
        <h1>Observe one detail</h1>
        <Reveal at={1}>Explain the basis.</Reveal>
      </div>
    ),
  },
];
const removeStyles = mountStyles(document, presentationTheme.cssText);
const removeTheme = applyTheme(document.documentElement, presentationTheme);
const mounted = createWebRenderer(runtime).render(
  <Presentation title="Observation and evidence" slides={slides} active={false} />,
  document.querySelector("#app")!,
);
// On host teardown: mounted.unmount(); removeTheme(); removeStyles();
```

`presentationTheme` is the complete theme that includes generic UI; load only this one cssText.
`presentationOptions` and Meowtail's `standardOptions` are the same object and can be used for
light/dark/auto selection. `presentationThemeTokens` and `presentationThemeStyles` are read-only
assembly parts that reuse the original token/fragment identity of Meowtail's `standardThemeTokens`
and `standardThemeStyles`, not a second styles implementation.

Ordinary buttons in an MDX canvas inherit the presentation body scale by default, using em spacing and
natural height; this is a low-specificity default scoped to MDX pages, and explicit component size and
host class/style can still override it without changing generic UI tokens.

The complete contract for the player, keyboard navigation, position ownership, activity permission,
backgrounds, transitions and media cleanup is in [Player and lifecycle](PRESENTATION.md).

The content API, finite canvas budget, image contain/cover, nine-point framing, native lists and fixed
header/body/footer are in [Presentation content layout](PRESENTATION-LAYOUTS.md). `ratio="fill"` still
requires a finite parent; a narrow physical window scales as a whole by default and does not
automatically reflow logical columns.

## Authoring and tool boundaries

`meowslides/build` and the `meowslides` CLI handle trusted local MDX compilation, builds and the dev
server; runtime entry points do not import the compiler. Generated pages still mount the same
Presentation/Reveal Context after the `meowslides/mdx` adapter. Specific tool arguments follow the CLI
and implementation notes of the same version.

MDX is executable local code and allows imports and custom MeowJSX components; untrusted text must be
reviewed first, or keep using finite Markdown/JSON. There is no React runtime, execution tool
permissions, backend or automatic persistence.

### Start from one script file

An ordinary author only maintains `slides.mdx` and does not need to write main, a server, theme
assembly or component registration:

```mdx
# Observation

Describe one detail first.

---

# Explanation

Support your judgment with evidence.
```

In a consumer that installed the same-version candidate and compatible peers, the Bun commands are:

```sh
bunx --no-install meowslides dev slides.mdx --port 3030
bunx --no-install meowslides build slides.mdx --outdir dist
```

The dev server listens only on loopback; after the script, an imported local module or an asset
changes, it rebuilds and reloads the whole page; on error it keeps the last valid picture, shows the
error in the terminal, and continues after the fix. A reload rebuilds the session; this is a reload,
not state-preserving HMR. `dist/` is a browser output that can be opened with an ordinary static HTTP
server; double-clicking a file URL is not promised. The new package currently has no official npm
release, and an old published package cannot substitute for this round's candidate.

### Pages, layout and interaction

- A top-level `---` surrounded by blank lines splits pages; thematic breaks inside code blocks,
  blockquotes and JSX subtrees do not split pages. `text` immediately followed by `---` is treated by
  Markdown as a Setext heading. For a body horizontal rule, use `<hr />`.
- A page-leading `#` provides both the outline entry and the picture title and is shown only once. The
  default id is generated from the title; duplicate names need an explicit id, and stable deep links
  should also declare one.
- The optional first node `<Slide id="evidence" columns={2} steps={1} notes="Pause here" />` is
  compile-time metadata and accepts only static literals; it can also declare an explicit title.
  Unknown fields, computed expressions, duplicate declarations and invalid steps fail explicitly.
- Two- or three-column bodies explicitly declare two or three top-level `<div>…Markdown…</div>`
  groups. Columns are not guessed from the paragraph count; column ratios follow the existing 1/2/3,
  single/equal/wide-start/wide-end.
- Write images directly as `![alternative description](./forest.jpg)`; a standalone image becomes a
  presentation figure and local assets enter the output; mixed-in images remain inline img. Default
  contain; the theme allocates finite height to the image and following text; long content still needs
  page splitting and does not auto-shrink type.
- Reveals use `<Reveal at={1}>…</Reveal>` and the page declares the corresponding steps. Leave blank
  lines before and after Markdown inside JSX tags. Arbitrary components are not scanned to guess
  steps.
- For media, explicitly import the local file and then write
  `<PresentationVideo src={clip} label="Observation clip" />` or PresentationAudio. Subtitles can be
  ordinary track children; keep source and subtitle assets. Native video/audio does not automatically
  get the presentation lifecycle contract.

Complex interactions explicitly import ordinary MeowJSX components; local state is unmounted with
that component. When state must persist across pages, export a session factory from the component's
own module:

```mdx
import { QuickCheck } from "./QuickCheck.tsx";
export { createSession } from "./QuickCheck.tsx";

# Quick check

<QuickCheck session={props.session} />
```

`createSession` is called once each time a presentation is created, and different sessions are
isolated from each other. The script ESM currently supports imports and this explicitly exported
entry factory; other top-level declarations/exports, custom theme configuration and automatic state
migration are outside the supported set. Keep state and complex logic in imported modules, and do not
use module-level signals as per-run state. The tool does not execute the work module to read the
outline.

Theme defaults are available; advanced JSX hosts can use the complete `presentationTheme` and the
existing theme composition contract. The current MDX CLI does not accept YAML frontmatter, theme
plugin protocols or arbitrary compiler configuration. Component TypeScript source files can still be
checked independently; MDX does not provide full TS props checking or a complete source-map debugger.

The tool API exports `compileSlides(source, entry)`, `buildSlides({ entry, outdir })`,
`serveSlides({ outdir, port })` and `devSlides({ entry, outdir?, port?, onError? })` from
`meowslides/build`. This is the Bun tool entry point, and its declarations explicitly carry Bun/Node
types; do not import it into browser runtime. Type dependencies needed by the build and CLI are
declared by this package; subpath isolation does not mean compiler dependencies are not downloaded at
install time.

## Checks

After the root unified build, run `bun test packages/meowslides/tests/unit packages/meowslides/tests/build`,
`tsc --noEmit -p packages/meowslides/tsconfig.json`,
`tsc -p packages/meowslides/tsconfig.types.json`. Browser and out-of-package consumption of the actual
tarball are accepted separately; build, pack and the candidate do not mean released. See
[development checks](../../docs/development-checks.md) for the repository-wide commands.
