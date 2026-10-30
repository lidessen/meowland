# Meowbook

`meowbook` is the MeowJSX Web component development package. It provides a static story index, an isolated canvas, selective component replacement and an ordinary browser test entry point; it does not depend on Storybook and does not include the old Notes/Tasks application.

The Gallery is itself rendered by MeowJSX and reuses Meowtail's Button, Input, Icon and standard theme through its own runtime, so it does not affect the story execution environment. Meowbook only maintains the tool's catalog, canvas and inspection drawer layout. Inspection notes are collapsed by default, and a narrow screen chooses stories through the catalog button.

The tool centers on the canvas: it fits the available space by default, and fixed device widths are for explicit comparison. The latest interaction feedback appears directly at the bottom, and the full log expands on demand. Search shows the match count; on a narrow screen the catalog supports closing with the backdrop, Escape and focus return. The appearance menu in the header holds one choice for light, dark or follow system, and it paints both the tool and the story: the gallery opens its canvas with `embedded=1&scheme=<choice>`, so an environment that reads `embedded` draws no controls of its own, and a later change reaches the open canvas without remounting it. The standalone link in the header opens the canvas without `embedded`, where the environment keeps its own controls, for example to inspect a dark story apart from the tool.

### Hosting the gallery in a site

`gallery` in the config dresses the gallery for the site that serves it. Every field is optional; without it, the gallery is Meowbook's own.

```ts
export default defineConfig({
  // root, stories, preview, tsconfig as above
  gallery: {
    brand: { name: "Acme", tag: "workbench", logo: "/logo.png", href: "/" },
    links: [{ label: "Guides", href: "/guides/" }],
    docsLink: (story) =>
      story.component ? { label: "Docs", href: `/components/${story.component}/` } : undefined,
    componentLabel: (story) => story.component?.replace(/([a-z])([A-Z])/g, "$1 $2"),
    appearance: {
      schemeStorageKey: "acme-appearance",
      themeStorageKey: "acme-theme",
      themes: [
        { value: "standard", label: "Standard" },
        { value: "dark-brand", label: "Brand" },
      ],
    },
  },
});
```

- `brand` replaces the name, the short tag (an empty string hides it), the 28px mark (one URL, or `{ light, dark }` to follow the scheme) and where the mark leads.
- `links` are quiet header links to related pages, such as a second gallery of the same site.
- `docsLink` runs once per story at build time; the header shows its result while that story is current. Only the results reach the browser.
- `componentLabel` names a story's component in the catalog row, the story header and the tab title, so a site can show `CardHeader` as "Card Header". It runs once per story at build time and only the names reach the browser. Stories of one component in one group must get the same name, or the build stops; without it the gallery shows `component`, else `title`. The catalog search matches the name as well as the component and title.
- `appearance` lets the site and the gallery share the reader's choice through `localStorage`. A missing key means follow system and the first theme, so those are stored by removing the key. With two or more `themes`, the menu also offers a theme, and the gallery passes the chosen value to the canvas as its `theme` URL parameter; the values must be the ones the environment reads. A theme can also name the Meowtail theme that paints the gallery's own chrome while it is chosen (`chrome: "standard" | "journal" | "meow"`); the chrome keeps whatever faces the page already has, since the gallery loads no web fonts of its own. A choice made in another tab of the same site reaches the gallery.

`buildStories` writes these settings as `gallery.json` next to `manifest.json`. The published `manifest.json` names each story `file` relative to the config root, so a deployed gallery does not carry the build machine's directories; the entries `buildStories` and `list` return keep absolute paths.

## Usage

Meowbook assembles stories from the consumer's own config. After installing the package, run in the consumer directory:

```sh
bunx --no-install meowbook list --config meowbook.config.ts --json
bunx --no-install meowbook check --config meowbook.config.ts
bunx --no-install meowbook serve --config meowbook.config.ts --port 13004
bunx --no-install meowbook capture --config meowbook.config.ts --story composer --depth all
```

The CLI requires Bun. After installing `meowbook` and its `meowjsx`, `meowcss` and `meowtail` peers, use the installed CLI commands above in the consumer directory.
The public entry points are `meowbook`, `meowbook/web`, `meowbook/bun` and `meowbook/playwright`.
The published package ships compiled JS, declaration files and the gallery HTML; building and capture do not read the library repository's source directories.
Static builds use `buildStories(config, outdir)` from `meowbook/bun`; the CLI provides list, check, serve and capture.
`meowbook/bun` is the Bun tool entry point, and `meowbook/playwright` is for Node/Bun capture scripts;
the declarations of these two entry points explicitly load the host type dependencies declared by this package, so consumers do not need to install an ambient type package themselves.
They cannot be used as pure browser entry points. Browser preview code uses the root entry point and `meowbook/web`.
`--json` writes only structured results to stdout; errors go to stderr and return a non-zero status. The server only listens on loopback and runs in the foreground, and Ctrl-C cleans up the temporary build for this run. Restart the server after source changes; the first version has no HMR.

```ts
import { defineConfig } from "meowbook";
export default defineConfig({
  root: import.meta.dir,
  stories: ["src/**/*.stories.tsx", "src/components/**/*.tsx"],
  preview: "preview.ts",
  tsconfig: "tsconfig.json",
});
```

`preview.ts` default-exports an environment function that mounts the consumer's TS styles, binds the theme root and returns the runtime used for execution.
The style lifecycle is owned by the environment; switching stories in the same document cleans up first, and the gallery and canvas each own their own document:

```ts
import { createRuntime } from "meowjsx";
import { createMeowUI, meowUIComponents } from "meowtail";
import { standardTheme } from "meowtail/theme";
import { applyTheme, mountStyles } from "meowcss/web";
import type { PreviewEnvironment } from "meowbook";
export default (({ root, onCleanup }) => {
  onCleanup(mountStyles(root.ownerDocument, standardTheme.cssText));
  onCleanup(applyTheme(root.ownerDocument.documentElement, standardTheme));
  return createRuntime({ plugins: [createMeowUI({ components: meowUIComponents })] });
}) satisfies PreviewEnvironment;
```

## Stories and annotations

```tsx
import { h } from "meowjsx";
import { defineStory } from "meowbook";
export const Primary = defineStory({
  id: "button/primary",
  title: "Primary button",
  group: "Basic components",
  groupOrder: 10,
  component: "Button",
  variant: "Action levels",
  render: () => <Button>Save</Button>,
  setup({ root, signal, onCleanup, report }) {
    /* Register interactions and cleanups here. */
  },
  async ready({ root }) {
    /* Wait for this story's real async readiness condition. */
  },
});
```

The catalog groups by `group`; `groupOrder` is an optional finite number, and smaller values come first. Different values in the same group take the minimum; groups without a value keep discovery order and come after. The same `component` in a group merges into one catalog entry, and `variant` is used as the short story label on the component page. When omitted, each story is displayed separately; `title` and `covers` still participate in search, and searching for story keywords enters the matching story.

`id/title/group/component/variant` must be static string literals, and `groupOrder` must be a static finite number; named exports call `defineStory` imported from the package directly, and computed ids, object spreads or custom wrappers are not supported. `list` only parses source files and does not execute story modules; the config file is trusted executable code.

Simple props can be written in the JSDoc of the exported component, one JSON object per line:

```tsx
/** @story {"id":"button/disabled","props":{"label":"Save","disabled":true}} */
export function Button(props: { label: string; disabled?: boolean }) {
  /* ... */
}
```

The annotation generates real typed JSX, which the consumer's TypeScript config then checks. Type errors include the original component path and annotation location. JSON values are supported, and functions/imports inside the annotation are not executed; an open index signature still follows the original component type.

Temporary previews reuse the same check and build chain without writing a permanent story, using the installed CLI and consumer config described above. The `meowbook.config.ts` and story ids in this document are consumer examples; when viewing shared stories inside the library repository from the root, use `--config apps/showcase/meowbook.config.ts`. A local tarball install does not mean the package has been published publicly.

Paths resolve inside the config root. Omitting the props file means `{}`; required properties still error as usual.

## Selective child component replacement

```tsx
import { defineStory, replaceComponent } from "meowbook";
import { Placeholder } from "meowbook/web";
export const LayoutOnly = defineStory({
  id: "panel/layout",
  title: "Layout preview",
  replacements: [replaceComponent(Chart, () => <Placeholder label="Chart" height={240} />)],
  render: () => <Panel />,
});
```

Replacement happens by function identity before the execution runtime calls the component, and the original component does not execute. Pre-created VNodes, Signals, Promises and multiple instances are all covered. Replacement components go through the normal lifecycle, theme and cleanup; an environment must also register any shadow a replacement needs. The rule is a `pre` plugin, follows the runtime's first match and does not replace recursively.

A partial preview explicitly shows the replacement marker; `#story-replacements` provides hit counts (including zero hits). Direct function calls, module import side effects and private renderers are not controlled by replacement. A complete story and a partial story use different ids, and a placeholder story cannot prove complete behavior.

## Component capture

For large catalogs, first narrow discovery with `list --query <text> --json`, for example `--query composer` or `--query process`.
The query is case-insensitive and matches literal substrings of id, title, group, component name and variant; full source information is retained, and zero matches return an empty array.
It is only for catalog discovery and does not change which stories or components capture selects.

`capture` reuses discovery, typechecking and the canvas, builds once, and uses a separate Chromium context for each story.
By default it outputs the whole-story image and local component images for the next layer; local images are cropped from the same viewport original without remounting components:

```sh
bunx --no-install meowbook capture --config meowbook.config.ts --story composer
bunx --no-install meowbook capture --config meowbook.config.ts --story composer --depth all --viewport 390x844 --dpr 2 --color-scheme dark
bunx --no-install meowbook capture --config meowbook.config.ts --story buttons --select button --depth 0
bunx --no-install meowbook capture --config meowbook.config.ts --all --select button --json
bunx --no-install meowbook capture --config meowbook.config.ts --all --full-page --out /tmp/meowland-ui-review --json
bunx --no-install meowbook capture --config meowbook.config.ts \
  --component packages/meowtail/src/components/button.tsx --export Button
```

`--story`, `--all` and the temporary component entry point are mutually exclusive. Temporary props are still provided by `--props-file`, with paths relative to the config root.
The default depth is `1`, and the first non-transparent component layer is `0`; fragments and built-in Context Providers are transparent automatically.
Other transparent components are marked next to their declaration; core does not interpret capture metadata:

```ts
import type { ComponentMetadata } from "meowbook";
Layout.metadata = { capture: { transparent: true } } satisfies ComponentMetadata;
```

`--select` exactly matches the display name of the actual component or the replaced component and keeps all instances with the same name; explicitly selecting a transparent component also captures it.
The component name comes first from `.meta.name`, then from the retained function name; anonymous components can only use the name of the current instance.
The complete tree keeps transparent, hidden, off-screen, ancestor-clipped and out-of-range nodes, and instance IDs are only valid within this mount.

Complex transforms, clip-path, mask and similar ranges are marked as approximate; private renderers, direct function calls and native popups cannot reconstruct the internal instance tree.

The default environment is `1100x900`, DPR `1`, light and reduced motion; `--device` first expands a Playwright device preset, then applies explicit parameters. The viewport is `64–4096` CSS pixels per side, DPR `0.25–4`, at most 32 million pixels; `--timeout` is `1–120000` milliseconds per story, default `30000`, excluding the build. Color preference comes from the browser media query; a story that does not respond to that preference cannot be considered a verified dark theme. Mobile device presets are still simulated.

Default artifacts are written to the config root's `dist/meowbook/captures/<run>/`, and `--out` can specify the parent directory.
Each run has its own `index.html`, `manifest.json`, whole and local PNGs, and ARIA snapshot.
The report opens directly offline: the thumbnail overview at the top shows stories, status and environment, then the story detail shows the original image or the saved whole-image region along the component tree; the manifest stores the complete instance tree, environment, sources, replacement log and rerun command, without copying props content. During a batch, a failure continues with the other stories and is not a zero exit; canceling keeps completed artifacts and unexecuted items.
During batch select, a single story that does not match is not a failure, but zero matches in the whole batch is a failure. A successful screenshot does not mean UI acceptance passed.

The same observation snapshot separately saves read-only `activeFocus` and `scrollViews`; the offline report presents them together with the original image and ARIA in the "DOM focus and scroll facts" panel. focus reads the DOM active element along open shadows and associates the deepest and unique instance through the same observation membership; `activeFocus.part` is the nearest part containing the focus node, and that part node is not guaranteed to be the active element. scroll facts save actual client / scroll sizes and offsets; the explicit `declaredOwner` comes from existing PageFrame / Region attributes, and declared and actual overflow are different facts, so double scrolling is not automatically judged a defect.

When an instance has no mapping, ownership is not unique, an iframe cannot be observed or a potentially non-open shadow needs internals, keep `unknown` with an accurate reason; ordinary host DOM information cannot reliably discover all closed shadows, and observing DOM focus in a native Select does not mean the system popup / native AX has been observed. `none` only means no active control was observed within the observed range. Instance identity is limited to this renderer and establishes no second tree, long-lived subscription or readiness state; reading does not move focus, scroll, change the original PNG, or sample input values, passwords, body text or complete props. The original image and ARIA may still contain user content, and the fact fields do not automatically desensitize existing capture artifacts.

Long pages can additionally save `full-page.png` with `--full-page`, and the scene's `fullPage` in the manifest provides the relative path; `environment.fullPageSize` records the pixel size. The viewport whole image and component-tree local crops are still based on the original viewport, to avoid scrolling or enlarging the viewport changing responsive effects. The full-page image is also subject to the 32-million-pixel limit, and exceeding it fails explicitly instead of silently truncating.
It shows the currently rendered document and does not expand internal scroll containers or trigger lazy loading; those states still require interaction evidence.

Interactive captures use the same capture function. First start a canvas with `serve --capture` that keeps component names and enables observation, then use ordinary Playwright to perform hover, input or focus:

```ts
import { resolve } from "node:path";
import { capturePage } from "meowbook/playwright";
await page.goto("http://127.0.0.1:13003/canvas.html?story=composer");
await page.locator('#story-state[data-status="ready"]').waitFor({ state: "attached" });
await page.getByRole("textbox").fill("Draft");
const result = await capturePage(page, {
  name: "filled",
  testLocation: "composer.spec.ts",
  depth: "all",
  fullPage: true,
});
const scene = result.manifest.scenes[0];
if (scene?.status === "success" && scene.frame) {
  console.log(resolve(result.directory, scene.frame));
  if (scene.fullPage) console.log(resolve(result.directory, scene.fullPage));
}
```

`capturePage` keeps the caller's Page, input, focus and environment and does not navigate or remount; failed artifacts are marked as diagnostic images.
API scene image paths are relative to `result.directory`; read `frame`, `fullPage` or `guides` from `manifest.scenes` for actually successful scenes instead of guessing file names. The CLI's `--json` receipt additionally provides absolute-path `artifacts`.
An ordinary canvas without the capture interface enabled reports that capture capability is missing. Interactive capture is reproduced by the caller's script or the steps recorded by the test and does not generate an equivalent story rerun command.
The capture contract is described by this page together with the exported types.

### Batch capture of real pages

For pages already running, use `--url` without loading a story config or building the showcase. A single page must explicitly provide a native CSS ready selector (Playwright extensions such as `:visible` are not supported):

```sh
bunx --no-install meowbook capture --url http://127.0.0.1:13001/ \
  --ready 'main[data-ready="true"]' --root main --channel chrome --json
bunx --no-install meowbook capture --url http://127.0.0.1:13001/ \
  --pages /absolute/path/capture-pages.ts --all --json
```

`--pages` is a trusted local executable TypeScript / JavaScript file; the CLI resolves the path relative to the current directory, and the default export is a `CapturePagePlan` factory. The factory receives `{ baseURL, request }` and can dynamically discover the current extension through API requests in the same browser context, returning at most 500 `LiveCaptureEntry` items: a unique `id`, `title`, `ready`, an optional `root` and `async prepare(page)`. `prepare` explicitly navigates, selects a page or prepares state, and does not accept CLI JavaScript strings. Types are imported from `meowbook/bun`.

The plan runs as a batch through `--all`, or selects one entry with `--scene <id>`; zero matches fails explicitly. The batch shares a context session, each entry creates a new Page, and prepare and capture are limited by the per-scene timeout. Failures continue with the remaining entries; canceling keeps completed photos, failure diagnostics and unexecuted items, delivers one overview report and exits non-zero.
Chromium is used by default; `--channel chrome` uses the locally installed Chrome.
You can also connect to a running dedicated Chrome DevTools endpoint with `--cdp http://127.0.0.1:<port>/`; this is mutually exclusive with `--channel`, and the endpoint only allows loopback HTTP(S) addresses without credentials, query parameters or fragments.
Capture creates its own context and at the end releases only that context and connection; it does not reuse or close existing browser tabs.

Sources, the current page and visible iframe regions are kept in the report; ordinary pages have no component instance tree, so `--select` / automatic `--guides` are not supported, but an explicit CSS `--guide` is available. When the skeleton capture interface is missing, `--focus` fails explicitly.
Capture does not change CSP, iframe sandbox or authentication mechanisms. Remote URLs require HTTPS, HTTP is allowed only on loopback, and embedded usernames and passwords in URLs are rejected; query parameters and fragments do not enter the manifest or rerun commands, and reproduction of navigation conditions containing them is the trusted plan's responsibility. Photos and ARIA may contain page content, and the caller keeps the artifacts.

## Browser and Agent

### Focus assets

`--focus` can be passed repeatedly with CSS selectors; all matches keep their original pixels, while observable HTML text in other areas becomes light-colored bars, and images, SVG and native controls become same-size placeholders that preserve line breaks, line width and alignment. The page background and geometry stay as they are, and a clean original is also kept.

```sh
bunx --no-install meowbook capture --config meowbook.config.ts --story field-group \
  --focus 'fieldset:first-of-type' --json
bunx --no-install meowbook capture --config meowbook.config.ts --story page-structure \
  --focus '[data-meowui-part="resource-card/root"]' \
  --guide '[data-meowui-part="resource-card/root"]' --guide-lines bottom --json
```

`--focus-padding` defaults to 12 CSS px and can be set from 0–128; expansion is limited by ancestor clipping. Multiple targets keep separate regions and do not light up the content between them.
For forms, choose a field container that includes the label and description; padding does not automatically find semantically related elements.
Invalid, zero-visible-match or over-limit selections fail explicitly; at most 12 selectors, 512 characters per selector and 48 visible targets.

Outputs `focus.png` and `focus.json`; `--full-page` adds `focus-full-page.png`.
When guides are also requested, it outputs `focus-guides.png` and an optional `focus-guides-full-page.png`, focusing first and then drawing guides.
Guides and the clear region are selected separately, and guides do not expand the clear region. The JSON receipt lists absolute paths; the offline report shows the original and focus images side by side, stacked on narrow screens.

Playwright `capturePage` uses `focus: { selectors: string[], padding?: number }`.
All Meowbook canvases explicitly create one `ComponentObservation` shared by the loading skeleton and the capture projection; the capture interface is still only open in capture mode. The projection reads the current instance from `read()` and does not build a second component Map; the content root excludes the showcase container, and unmounting the view releases the observation center. Observation facts belong to the current renderer and do not constitute a product readiness or system AX contract.
Meowbook calls the shared skeleton controller in `meowjsx/web` for temporary capture and then cleans up; it does not change text, layout, focus, input values or scroll state. An existing SkeletonBoundary loading state keeps its original ownership.
Special decorations on native controls, complex backgrounds, pseudo-elements and external iframes are not guaranteed to be fully skeletonized; this feature is not a desensitization tool for sensitive content.
Rotation, clipping and similar targets are marked with rectangle approximations in metadata, and occlusion is not removed. A focus image is a processed asset; color, contrast and overall hierarchy must be judged from the original image.

### Alignment guides and measurement assets

Without writing a temporary browser script, `capture` can generate the original image, a numbered guide image and geometry JSON at the same time:

```sh
# Draw boundaries and center lines from the existing component selection and depth; compare same-named components as groups
bunx --no-install meowbook capture --config meowbook.config.ts --story composer --guides --json

# Specify the exact elements to compare with CSS selectors; each selector is a group, keeping all matches
bunx --no-install meowbook capture \
  --config meowbook.config.ts --story page-structure \
  --guide '[data-meowui-part="resource-card/root"]' \
  --guide-lines bottom --full-page \
  --out /tmp/meowbook-guides --json

# Compare the edges, center and width of the reading area and the input box
bunx --no-install meowbook capture \
  --config meowbook.config.ts --story conversation-layout \
  --guide 'article[data-chat-role="assistant"], [data-meowui-part="chat-composer/root"]' \
  --guide-lines left,right,center-x --json
```

`--guides` and `--guide` are mutually exclusive. The former reuses the component selection of `--select` and `--depth`, while the latter uses native browser CSS selectors, not Playwright selectors or scripts; it does not change the selection of local component photos.
`--guide-lines` can pick from `left,right,top,bottom,center-x,center-y` as needed, comma-separated, all by default; when only one line is selected, the label also shows the difference relative to the first item in the group. Card action comparisons commonly use `bottom`, and reading-column comparisons commonly use `left,right,center-x`. To compare different roles as one group, use one CSS comma selector.
At most 12 selectors, at most 512 characters each and 48 targets in total; exceeding the limit fails explicitly, so narrow the range by comparison target.
Invalid selectors or no capturable match also fail explicitly, and no apparently successful empty annotation image is delivered.

The receipt's `artifacts[]` directly provides the absolute paths of the original image, annotation image and measurement file.
The scene manifest's `guides` links `guides.png`, an optional `guides-full-page.png` and `measurements.json`, which the offline report can expand under Alignment guides. The original image and component local images remain unannotated; guides only appear in the additional photos, auxiliary lines use a manual popover in the native top layer, cover native modal dialogs and existing popovers, and are not affected by page-ancestor transform or overflow clipping; they do not close business overlays or take focus.
After capture, the temporary overlay is cleaned up and interaction state is retained.

JSON target numbers correspond to the image, recording viewport and document coordinates, width and height, as well as left/right/top/bottom edge, center and width/height differences relative to the first target in the group. Different selectors form separate groups; cross-group comparison directly reads target coordinates.
All sizes are CSS pixels, and images are still output at the specified DPR. What is measured is the axis-aligned bounding box, not text baselines; rotation, multi-root components, clipping and occlusion need to be judged with the original image, and identical boundaries do not prove visual alignment.
By default only targets visible in the current viewport are drawn; with `--full-page`, CSS targets can include document off-screen content and will not expand internal scroll containers, trigger lazy loading or penetrate iframe / shadow root.

After interaction, reuse the same API directly:

```ts
const result = await capturePage(page, {
  name: "expanded-alignment",
  guides: { selectors: ['[data-meowui-part="resource-card/root"]'], lines: ["bottom"] },
  fullPage: true,
});
```

First look at the original image to establish the task and design judgment, then check doubts with a small number of targets. Differences are measurement facts, not automatic defect judgments; for example, when body text and the input box have the same center but different widths, discuss the relationship of the reading column instead of writing it directly as not centered.
Guides cannot replace visual judgment of color, typography, hierarchy, density and overall aesthetics.

- `/manifest.json` provides id, path, export name and line number; `/canvas.html?story=<id>` is an isolated canvas.
- Wait for the `#story-state[data-status="ready"]` attribute or attached state; this marker hides once ready, so the default visible wait will time out. A failure becomes `error` and keeps the error message, which cannot be overwritten by inspection results. `capturePage` waits for ready itself, and the caller still needs to wait for the target control before acting.
- Desktop 1100px, mobile 390px, tablet 768px and fluid switching do not remount; switching stories and resetting use a new document.
- The Meowbook shell also adapts to phones: catalog drawer, no automatic search focus on touch, edge-to-edge canvas on narrow screens, scrollable inspection panel on short screens; verify the tool shell and the story viewport separately. 390px/short-screen/landscape browser simulation does not equal real-device soft-keyboard acceptance.
- `onCleanup` runs in reverse order, and cleanups registered after cancel run immediately; `signal` is used to abort custom async work.
- `ready` is declared by the story author and cannot rely on automatic delays to infer stability. The Bun server and iframe are development isolation, not a security sandbox; story code should be trusted, and data/API mocks are bound by the consumer.

Ordinary Playwright Test can access the URLs above without a dedicated component test adapter. This package's `playwright.config.ts` fixes Chromium and the viewport, keeps screenshots/traces on failure; test steps attach the original story location, and a normal run outputs 390/1100px screenshots. This is currently responsive-width testing (height 900, DPR 1, desktop input) and does not represent real-device testing. No cross-platform pixel baseline is established; no overflow or name notes does not mean design acceptance.

The Playwright CLI can separately use `bunx --package @playwright/cli playwright-cli` to operate the same ordinary URL; it does not become an internal Meowbook dependency or text protocol.

## Layered verification

After repository dependencies are ready, run `bun run --cwd packages/meowbook test` from the root to verify mechanical contracts. For browser verification, enter `packages/meowbook` and use the actual Playwright config:

```sh
bunx --no-install playwright test --config playwright.config.ts
bunx --no-install playwright test --config playwright.capture.config.ts
```

The first command only starts the package's own fixtures and verifies renderer lifecycle, canvas, measurement and gallery behavior; the second verifies capture observation, transparent selection, DPR cropping, input retention and failure diagnostics. They do not start the product app and do not prove Rossovia has switched consumption.
Meowbook only keeps fixture specs. Integration with real consumers is executed by the consumer's own Playwright config:
the Meowtail catalog, search and mobile specs are in `packages/meowtail/tests/browser` and run through its `playwright.config.ts`;
product page specs and data are maintained by each consumer and are not distributed with this package.
Browser commands require an installed Playwright Chromium. Installing the package does not download a browser automatically; prepare it explicitly in your own environment with `bunx --no-install playwright install chromium`, or use an installed Chrome through `--channel chrome` during capture.
