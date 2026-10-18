# Splitting out the presentation package and the MDX authoring entry

This record first completes the design and key feasibility validation; the user then explicitly replied "split it", authorizing this round's implementation of `packages/meowslides`. The design rationale below is retained, while actual implementation and validation follow this round's receipt and public exports; the package name does not imply npm name availability or a release commitment. See the [author experience record](2026-10-18-presentation-authoring-experience.md) for the earlier author-burden review; this record promotes MDX to the primary authoring entry, replacing the earlier priority of "JSX shorthand first, MDX later".

## Recommendation

A separate package is worthwhile. Presentations already have their own finite canvas, slide and step navigation, activity permission, media lifecycle, diagnostics, dedicated theme, and authoring tools, and are no longer just a set of examples of ordinary UI components.

Meowtail keeps generic UI, generic layouts such as Stack/Inline/Grid, and generic capabilities such as ImagePreview; the presentation package owns playback, reveals, presentation-specific Layout/Image/List/Text, the presentation theme, and MDX authoring. Complex interactions continue to be written as MeowJSX components, without introducing React or building a second player.

Recommend `slides.mdx` as one file with multiple slides by default; authors maintain only the script, assets, and necessary interactive components, while themes and session extensions need optional configuration only. The tool provides genuinely usable dev/build, so authors do not copy main, registry, theme, cleanup, media declarations, and build scripts.

## Verified compilation and runtime boundaries

Based on the current `769f489` source/existing dist, this used the repository's already-installed `@mdx-js/mdx@3.1.1` with no new dependencies.

The official compiler allows specifying [jsxImportSource](https://mdxjs.com/packages/mdx/) and supports providing a component mapping through the [components prop](https://mdxjs.com/guides/injecting-components/). Actual experiment results:

| Item                                   | Actual result                                                                                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| program + `jsxImportSource: "meowjsx"` | Imports jsx/jsxs/Fragment from `meowjsx/jsx-runtime`; no React runtime import                                                                                  |
| development compilation                | Generates `meowjsx/jsx-dev-runtime` imports; development browser output was not run this round                                                                 |
| function-body + run                    | Injects the MeowJSX automatic runtime; component mapping and static HTML output pass; compatibility probe only                                                 |
| Browser ESM module                     | Bun bundles two slides; plain Markdown, JS module imports, and local SVG work                                                                                  |
| Events and reactivity                  | A counter button updates the Signal; after crossing slides, the count held by the external session is still 1                                                  |
| Context and steps                      | MDX mounts under a real Presentation; Reveal is hidden at step 0 and shown at step 1; the activity Context is true and records false after leaving the slide   |
| Lifecycle                              | The probe mounts once and cleans up once when leaving the slide; the container empties after host unmount; browser pageerror count is zero                     |
| AST pagination                         | Only top-level thematicBreak is recognized; horizontal rules inside code fences, blockquotes, or JSX subtrees do not paginate                                  |
| Setext                                 | `Title\n---` is a heading, not pagination; only a top-level horizontal rule after a blank line paginates                                                       |
| Standalone image paragraph             | A small AST transform turns a standalone image into a block-level Image; the static result produces no p > figure, and inline small images keep the native img |
| Plain body grouping                    | The browser host puts MDX body content in one flow area and does not treat each paragraph as an independent grid item                                          |

The experiment files are in the ignored directory `artifacts/presentation-mdx-feasibility/`: experiment.ts, slides.mdx, main.tsx, compile-facts.json, browser-facts.json, and browser.png. It is a bounded probe with a hand-written host, title, and slide array, **not a completed MDX plugin or single-file authoring product**. The image-paragraph transform only validates static structure and is not equal to full image build/theme acceptance.

The recommended production path is build-time `compile(..., { jsxImportSource: "meowjsx", outputFormat: "program" })`, leaving ESM and local asset resolution to the bundler. Audience browsers do not load the MDX compiler and do not receive dynamic text through run/evaluate; `@mdx-js/react` or React MDXProvider is not needed.

MeowJSX's jsx/jsxs/Fragment already share core. The new package must not inline separate copies of runtime, Context, contracts, tokens, or fragments; explicitly creating multiple runtimes is still valid isolation.

## Package responsibilities and dependencies

| Entry point/role                           | Responsible for                                                                               | Dependencies that should not enter this graph                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Presentation package runtime               | Presentation, slides/steps/activity, Reveal, media, presentation content components and types | MDX compiler, filesystem, CLI, Meowbook, Playwright                    |
| Presentation package theme                 | Presentation tokens/styles, composed with the Meowtail standard UI theme                      | build/dev, browser automation                                          |
| Presentation package build subpath and CLI | MDX/AST, asset graph, generated host, build, watch rebuild/reload, error reporting            | Not imported back from runtime/theme                                   |
| Meowtail                                   | Generic components, layouts, component registration, and the standard application theme       | Does not depend back on the presentation package                       |
| Meowbook                                   | Scenarios, review, screenshots, and fixtures                                                  | Not a prerequisite for starting a normal script or an audience runtime |

The presentation runtime depends one-way on Meowtail, MeowJSX, and MeowCSS; JSX/CSS in the same install graph are provided by compatible peers. Bun is the initial tool host and can follow the repository's tool conventions; no Vite ecosystem is introduced for MDX at the same time.

First isolate the module graph with an independent subpath of one presentation package; this keeps the compiler out of the browser bundle but **cannot guarantee that npm installs never download compiler dependencies**. If a real install-cost need for runtime-only consumers appears later, split a tooling package then; do not build a multi-package platform for a need that has not appeared.

### Moving the presentation directory is not enough

The current presentation implementation is still coupled to:

- `meowtail/src/registry/index.ts`: imports presentation contracts, the component name table, the default registration array, and type extensions.
- `meowtail/src/theme/index.ts`: imports presentation tokens/styles and merges them into standardTheme.
- Root and `meowtail/presentation` public exports, plus existing stories, examples, both courseware sets, and external consumers.

A facade transition was originally considered; after the user explicitly authorized the split, this round chose a one-time migration of the presentation implementation, registry ownership, theme fragments, and in-repository consumers. The presentation package installs the generic UI registry plus its own presentation registry, and the presentation theme reuses the generic token/fragment objects.

The old Meowtail root presentation exports and `meowtail/presentation` are removed and marked by a new local breaking candidate version; compatibility cannot be solved by Meowtail re-exporting the new package in reverse, or a cycle forms. Existing official npm versions are not overwritten, and out-of-repository consumers such as Rossovia are not switched unilaterally.

## The shortest authoring model

### Single file with multiple slides first

| Approach                                | Advantages                                                                                      | Cost                                                                                     | Recommendation                                                                      |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| slides.mdx + top-level horizontal rules | Write the script continuously, move slides intuitively, few files; suits short and medium works | Pagination/shared ESM/source positions need tool handling; top-level rules are preserved | Default                                                                             |
| One slide per file + ordering entry     | Natural module isolation, fewer collaborator conflicts, file-level metadata is direct           | Maintain files and order from the start; cross-slide imports/assets are scattered        | Optional later for large works; do not implement a second protocol at the same time |
| Paired Slide tags on every slide        | Clear boundaries, standard MDX elements                                                         | Repeated wrappers, closing tags, and Markdown blank-line requirements                    | Not the default                                                                     |

`---` must be recognized as a top-level thematicBreak in the MDX AST; do not split the whole text with a regex. Leave blank lines around pagination; a top-level body horizontal rule is preserved as pagination, and the same syntax is not promised to also mean a decorative line. For a body rule, explicitly use `<hr />`. No `::right::`, custom reveal directives, or repeated YAML frontmatter are added.

### Slide-level metadata

The optional first node `<Slide id="evidence" steps={1} />` is a **proposed compile-time declaration**, not a really mounted Slide component. The MVP accepts static id/title/columns/steps/notes; it rejects spread, function calls, object paths, and arbitrary computation, and reports unknown fields, invalid column ratios/steps, and duplicate ids with the original file position.

The first `#` heading on each slide feeds the outline and is displayed once by the default header, so authors do not write the title twice. Without an explicit id, the id is generated from the static heading; duplicate headings/ids or a slide with neither a heading nor a title require the author to fill it in explicitly, and a drifting position is never silently generated from the slide number. Changing the heading may change the default deep link; write an id for a stable reference. Dynamic titles or special covers are handled by explicit metadata or advanced JSX slides.

The following is the recommended plain-authoring form, **not yet a public capability**:

```mdx
import { QuickCheck } from "./QuickCheck.tsx";

# Observe the habitat

Observe, compare, explain.

---

<Slide id="evidence" steps={1} />

# Look for evidence

![The habitat in the forest](./forest.jpg)

<Reveal at={1}>

Name one detail that supports your judgment.

</Reveal>

<QuickCheck />
```

### Components, layouts, themes, media, and reveals

- The default components map provides only a few presentation components; Reveal and PresentationVideo/Audio/Image reuse the existing implementation. Custom components are imported explicitly and written against MeowJSX's component, Signal, and event contracts; React hooks components are not made compatible by this.
- Plain headings, paragraphs, lists, blockquotes, and code are handled by the presentation theme. By default the whole single-column body is one flow area. Markdown's ul cannot be mapped directly to PresentationList, which takes items; keep ul/li semantics or go through an explicit AST transform.
- A standalone image paragraph becomes a block-level presentation image; an inline image keeps the native inline img. contain and alt are preserved by default; a complete asset image requires rewriting the local Markdown URL into a bundler-traceable asset, not just copying the string into the artifact.
- Two columns are declared with `columns={2}`, and the body explicitly writes two top-level `<div>…Markdown…</div>` groups. The tool passes column groups to the existing Layout; each group may contain multiple paragraphs. Left/right is not guessed from paragraph count, and line breaks in the Markdown root Fragment do not become grouping rules. A mismatched group count is diagnosed.
- The default theme is enough to start in the first phase. Optional whole-deck configuration selects a theme or mapping via a static `export const deck = { title: "…", theme: "standard" }` at the top of the file; the first version accepts built-in theme identifiers only, and complex external theme imports can go in advanced configuration. No slide-level theme engine is needed.
- Media example: after `import clip from "./clip.mp4"`, write `<PresentationVideo src={clip} label="Observation clip" />`; audio works the same way. Subtitles are ordinary track child nodes plus local assets. Native video/audio does not automatically get the activity permission and leave-slide pause contract.
- The reveal example uses the current `<Reveal at={1}>…</Reveal>` and slide-level steps. Steps stay explicit; nested components are not scanned/executed to "auto-discover" them.

## ESM, state, and error positions must not be hidden

Single-file paginated compilation must not copy all ESM text into every slide module, causing top-level variables, module side effects, or exports to execute multiple times. Production compilation needs shared ESM modules to keep their identity, with slide components importing only the bindings they need; the temporary experiment only proves the basic shared-import path, not that arbitrary declaration hoisting is implemented.

MDX top-level code follows JavaScript module semantics and does not automatically become "executed once per session". Ordinary local interactive components unmount when leaving the slide; cross-slide state is held by an optional createSession factory and passed to MDX through props.session or a session component mapping. Do not turn top-level `signal()` into a default mode shared by multiple previews, and do not execute modules on the server just to read titles.

The compiler resolves the static outline and metadata on the build side and does not call page components; actual MDX page content mounts under the normal CurrentSlide Context. The author's position is still the sole owner; the host's inactive permission must not be overridden by a work's props spread.

In the first phase, dev may rebuild automatically and reload the whole page, explicitly resetting the session; this is not called state-preserving HMR. Errors should include the original slides.mdx page, line, and column; shared modules, post-pagination source maps, missing assets, and reload-failure recovery all need later implementation and tests and cannot be replaced by the current temporary script.

## Reusing MeowPress and Meowbook

MeowPress already has an MDX dependency; `src/content.ts` uses compile/function-body/run followed by renderToHtml, and owns site frontmatter, dates, articles, and static asset rules. Its compiler configuration and asset-handling experience are worth referencing, but its internal methods are not public exports, so do not import across packages privately or turn the article pipeline into a presentation host. Extract small genuinely shared capabilities only with evidence later; do not split out a generalized content platform now.

Meowbook can consume generated JSX pages or existing Presentation fixtures, reusing component observation, screenshots, and behavior regressions. However, current discovery recognizes only explicit stories and does not treat MDX files as stories directly; the tool must generate an adapter entry. The existing serve has no HMR either, so its name cannot be borrowed to claim edit-refresh is implemented. The presentation runtime does not depend on Meowbook.

## Trust boundary

MDX is trusted local code: imports, expressions, and component execution are allowed and carry the corresponding JS runtime permissions; local configuration and plugins are code too. The [official documentation](https://mdxjs.com/packages/mdx/) states clearly that run/evaluate executes JavaScript. Compiling MDX into ESM does not turn untrusted content into safe data.

Text generated by a model, uploaded, or fetched externally is not run as MDX by default. Review it and bring it into a trusted work first, or use the existing finite Markdown/JSON paths; do not extend the JSON entry into an MDX evaluator, and do not promise a sandbox along the way.

## Minimum scope and open validation list from the design phase

The minimum scope agreed in the design phase is: a single slides.mdx, AST pagination, static slide metadata/single heading, plain flow and image transforms, explicit column groups, existing reveal/media mapping, local asset builds, the default theme, a unified generated host, and one dev/build path. Later the user authorized the actual migration, with the original complex presentation kept as an experiment ground. The same short script should validate the practical operations and error recovery for "change title, add slide, swap image, add step, add interaction".

Items to validate at the design stage include: the new package manifest/public exports and installed state; the MDX/Bun loader; shared ESM and the session factory API; metadata validation; the default theme for two columns/long text/narrow screens/short windows; media/subtitle assets; lifecycle; watch/reload; source maps/TS component props checks; Meowbook adaptation and consumer migration. The static deck configuration did not enter this round's implementation support set, and full HMR, source maps, and TS props checking inside MDX remain future capabilities.

The initial feasibility probe only verified desktop compilation compatibility and cannot replace acceptance of the later authorized implementation. See the [implementation receipt](../records/2026-10-18-meowslides-mdx.md) for actual implementation, same-version checks, install consumption, wide/narrow/short window evidence, and explicit limitations; nothing was pushed, published, or deployed.
