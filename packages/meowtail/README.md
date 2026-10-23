# Meowtail

`meowtail` provides cross-application components, semantic layout, the standard theme, and the complete Assistant composition. Networking, execution, permissions, and persistence are adapted by the host; the library carries no Rossovia business state or backend.

The [component catalog](COMPONENTS.md) owns the complete component list, grouping and status.
The usage notes below explain selected contracts; detailed Agent, Assistant and JSON contracts
remain in their linked guides.

## Presentation package

The presentation player, Reveal, media lifecycle, presentation content layouts, and themes have moved into the separate [MeowSlides](../meowslides/README.md). Meowtail does not depend on the presentation package in reverse, and the old `meowtail/presentation` and root presentation exports are removed; shared UI and layout are still provided by this package.

This package's npm name is `meowtail`; existing APIs such as `createMeowUI`, `installMeowUI`, and `createMeowUICatalog`, along with runtime style identity, stay unchanged. Use the new package import path; do not derive new function names, `data-*` markers, or CSS variables from the package name.

Application authors writing their own components (the shadcn/ui and Tailwind equivalents, the style floor and the audit) start with [Authoring](AUTHORING.md). See [Assistant](ASSISTANT.md) for the usage contract of the complete composition and [JSON catalog](JSON.md) for the finite JSON entry point. Implementation and independent acceptance of both are still in progress; the API descriptions and early artifact verification on this page do not equal a same-source acceptance pass for all current source code.

## Runtime compatibility

The current alpha requires `meowjsx@^0.1.1-alpha.1`: live component props use its public
`derived` signal primitive. Earlier JSX stable and alpha builds do not provide that export.
The existing MeowCSS peer range remains compatible.

## Minimal browser integration

In a browser entry point containing `<main id="app"></main>`, first complete component registration on the same runtime, full CSS loading, and theme root binding, then render content.
Importing components only, installing the registry only, or using `Theme` only cannot replace these three steps; if any one is missing, the page may still show native controls without the standard theme's sizes and states.

```tsx
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Button, Inline, Stack, createMeowUI } from "meowtail";
import { standardTheme, standardOptions } from "meowtail/theme";
import { applyTheme, mountStyles } from "meowcss/web";

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("Missing app root");
const runtime = createRuntime();
const uninstall = runtime.use(createMeowUI());
const removeStyles = mountStyles(root.ownerDocument, standardTheme.cssText);
const removeTheme = applyTheme(root, standardTheme, standardOptions.select({ scheme: "light" }));
const mounted = createWebRenderer(runtime).render(
  <Stack align="start">
    <strong>Connection settings</strong>
    <Inline gap="compact">
      <Button>Save</Button>
      <Button variant="quiet">Cancel</Button>
    </Inline>
  </Stack>,
  root,
);

// Dispose with the host that owns this mount.
const dispose = () => {
  mounted.unmount();
  removeTheme();
  removeStyles();
  uninstall();
};
```

The theme root provides an inheritable body font, font size, line height, and text color; local theme configuration inherits the outer typography, while components still own their own control and heading scales.
This does not include a global `html/body` margin reset, page background, or page whitespace, and does not automatically reset arbitrary `h1/h2/p`.
Use `PageFrame` / `Container` for page space, `Stack` for related content, and `Inline` for a group of actions; the complete Assistant can use `AssistantView` directly, without rebuilding a page from bare Cards.
`CardHeader/Title/Content/Footer` express relationships inside a card, while native content follows document semantics; do not wrap every layer of content in its own surface.
Compare Meowbook's `buttons`, `card-composition`, and `workspace-composition`; they show action relationships, card structure, and a scrolling workspace respectively. A stress state does not mean the product must display all states at once.
See [Component installation and style delivery](#component-installation-and-style-delivery) for static CSS delivery and local configuration; the Increment in `examples/browser` is only a package-integration smoke test, not a page design template.

## Directory structure

```text
src/
  components/   # Base components such as Button, Card, Input, and Dialog; one component per file
  chat/         # Conversation components such as ChatFrame, ChatMessage, and ChatComposer
  icons/        # Brand marks and small icons; one icon per file
  registry/     # Contract aggregation, meowjsx type declarations, and the installation entry point
  shared/       # Small utilities shared inside components
  theme/        # Standard theme token definitions and TS styles organized by part
tests/
  unit/         # Bun, grouped by components/chat/icons/shared/theme
  types/        # Public type contracts using *.types.ts / *.types.tsx, verified by tsc
  browser/      # Playwright, grouped by components/chat/theme/catalog
```

Product facts, navigation adaptation, and application-specific styles stay in the host; this package provides shared activity panels, the complete Assistant composition, shared page shells, and region layouts, so consumers do not need to rebuild whole pages.
Shared components keep visual extension points for host applications through
className, and the standard theme provides default styles from `meowtail/theme`
in the same package based on the registry's component/part identity. The MeowUI registry is a runtime contract
and installation entry point, not a shadcn-style source distribution directory.

## Current components

`PageFrame` accepts header, toolbar, notice, footer, and children, allocates available height between the page header and body, and provides the shared page outer edge.
The optional `notice` sits between the header and the scrolling body; the optional `footer` stays after the body, so a composer or action bar does not need to float over content.
Business content and iframes go into the body and no longer each subtract the header height from the viewport.
The default `variant="page"` provides a bounded width and the page outer edge; `variant="workspace"` is for full-width toolbars and continuous reading/input workspaces, where the shell does not add another page inset and content components keep owning reading width and a safe bottom edge.
Both shells constrain the body height; the header takes its natural height, actions can wrap, and content expanded in place can overlay the main region.
`AppBar` is the compact application chrome used in `PageFrame`'s header slot: one title, one optional status line (usually `ChatStatus`), and the actions for the whole screen. It is distinct from `PageHeader` (page title block) and the keyboard `Toolbar`; use it for continuous small-screen workspaces, not as a second page header on desktop pages.

`scrollOwner="content"` is the default, where the body hands scrolling to an existing inner container; `scrollOwner="layout"` has the body itself carry natural flow and scrolling. Titles, close buttons, and other header actions do not go inside the body scroll region.
Only `content` mode allocates stretch space to direct content roots; `layout` mode keeps controls' own default sizes.
`RegionLayoutDescription` declares page regions with a named matrix; the browser host calls
`mountRegionLayout(host, layout, options)` and gets `regions` content roots, `showGroup`, `back`, and `dispose`.
Authors put content into these roots; rectangular regions, finite sizes, local arrangement, and scroll ownership share the same validation and renderer.
`content` rows claim space by natural content, and `fill` rows claim the remainder; when space is short, content regions keep actions reachable according to their scroll owner. Components should limit their own long content rather than relying on the shell's default clipping to preserve reading space.
Multiple columns project to one column in narrow windows; a region's `compactRow="content" | "fill"` can specify natural height or remaining height in that projection, and when omitted it is derived from the original matrix row. It does not change grouping, desktop geometry, content mounting, or scroll owner.
See unified Extension region layout (historical reference in the original product repository) for
cross-module contracts and shared use between built-ins and extensions.
The original product's wiring and UI acceptance are historical evidence and cannot replace independent verification after this library's migration.

`CodeBlock` accepts raw `code` and an optional `language`, loads Shiki highlighting on demand for known syntaxes, and provides independent copy and soft-wrap toggles.
Shiki is reached only from the `CodeBlock` and `ReadBlock` modules. `JsonBlock` and `AssistantView` render a code surface, so importing either one pulls the same highlighter. Importing `standardTheme`, `createMeowUI`, or any other component does not. The package declares `sideEffects: false`, which lets a bundler drop those modules when their exports are unused. The highlighter stays on demand for a mounted code surface; it is not registered as a side effect of the theme.
Wrapping changes only the display; copying preserves the original whitespace. When the browser clipboard fails, it shows feedback. The host can bind `onCopy` to another
clipboard implementation, and the component does not execute code. With no language it shows "Code", and `defaultWrap` sets the initial wrap state.
Unknown languages or failed highlight loads keep a plain-text display.

`Checkbox`, `Switch`, and `SegmentedControl` provide native form selection; `Tabs` handles switching panels that stay mounted.
A `Checkbox` can be `indeterminate` for a parent of mixed children; assistive technology reads `aria-checked="mixed"`.
`Slider` is a native range with a visible figure for the same value; `NumberInput` steps and clamps a number and formats the committed figure.
`Progress` is a labeled native progress bar, determinate or indeterminate; `Spinner` remains the wait with no known amount. `ChatTask` reuses `Progress` for explicit host progress.
`Avatar` shows a picture or initials; `ChatMessage` still takes any avatar child in its identity column, because that slot already hosts icons and other artwork.
`Link` is a themed inline text link. It is not `ResourceLink`, which remains the whole-row reference to an openable object.
`Table` shows host rows in columns that the user can sort, resize, and multi-select; row order and records stay with the caller.
`Accordion` groups `Disclosure` sections in single- or multiple-open mode.
`Menu`, `MenuButton`, `ContextMenu`, `HoverCard`, `Toast`, and `RiskConfirmation` provide menus, previews, and feedback, while business actions and display lifetimes are the host's responsibility.
`MenuButton` is a button that opens the existing `Menu`; `ContextMenu` opens that same `Menu` from a right-click or Shift+F10, including nested items.
Menu's Tab / Shift+Tab closes the whole menu chain and leaves along the native order without activating menu items; Escape closes one layer at a time and returns to that layer's entry point.
`TerminalBlock`, `ReadBlock`, `DiffBlock`, `SearchBlock`, `WebBlock`, and `JsonBlock/JsonTree`
display host-provided output; components do not execute tools or read files. `ReadBlock` accepts `lang`, loads highlighting when it first enters the viewport, and keeps unknown languages as plain text.
`ImagePreview` unifies image loading, failure, and the preview frame; `ImageLightbox` provides single-image viewing;
`ShortcutKeys`, `PathLabel`, `StateDot`, and `TextShimmer` provide supporting presentation.

`Pill` is for compact capsule labels or actions, with selected state provided by the host; static labels use `Badge`, which supports outline, solid, and quiet presentation.

Shared components added by the UI revision (system design draft (historical reference in the original product repository)):
`StatusDot` expresses state as processing (accent pulse), success, returned (hollow green; an execution return does not mean the goal is complete),
warning, danger, unknown (hollow gray; do not pretend to know), and idle; the dot itself carries no text.
`Status` accepts `state` and a required `label`, treating the decorative dot and visible state text as one content unit; the standard theme fixes the dot at 7px
and exposes no `size` or `halo`. `label` keeps `Child` composition and excludes direct empty values and booleans; callers must ensure
strings, arrays, and dynamic content are actually non-empty and visible, and use content suitable for inline presentation. `ListRow.status` and
`ResourceCard.status` still accept `Child` and can take `Status`; `WorkCard`, `Timeline`, and similar components keep their internal markers
and are not mechanically replaced with imperative rewrites, per-signal dots, or decorative dot matrices without per-dot text. The caller still reviews the non-empty semantics of status text.
`Tag` is a static fact next to content
(neutral, emphasized, orange count, monospace path), while selection and filtering still use `Pill`; `ProcessGroup` and `ProcessStep` are collapsible step records;
`WorkCard` is a single control in a conversation that points to one piece of work; `IconRail`, `RailItem`, and `RailSection` form a 56px icon rail that expands on hover or keyboard
focus into a 256px drawer over the content, and a collapsed group folds into one icon that shows the current position of its items with an orange dot.
`Button`'s `outline` is the secondary level, plus `accent` (a soft background related to current activity) and `stop` (to interrupt running work).
Details and page structures added in the second stage: `DetailSection` (a block with a hairline; its title is a small label rather than a page title), `Timeline` and
`TimelineItem` (events threaded on one line, with markers following `StatusDot` semantics), `ResourceLink` (a whole-row reference to an openable object:
a link when href is present, otherwise a button); `PageHeader` (page name, one-sentence purpose, an optional `leading` mark before the title, and page-level actions; `Page` forwards `leading` into that header), `ListGroup` and `ListRow` (sibling entries share one
outline, an editing area can expand below a row, and a standalone row with `tone="accent"` is a summary row), `ResourceCard` (a capability on an overview page, with a dashed
low-contrast disabled state); `Drawer` is a narrow-screen native modal panel that slides in from the start edge, with backdrop clicks and Escape handed to the host to update `open`. `SegmentedControl`
tightens its track and selected state to match the design draft. The narrow-screen `ChatComposer` stacked layout puts "add, input, send" on one row and keeps model selection below.
Every color, size, radius, shadow and duration is a role in one tree, `uiTokens` in `theme/tokens.ts` (surface, inverse, line, ink, state, action, control, accent, status, type, space, icon, radius, shadow, motion, layout, glyph; CSS names `--ui-<group>-<key>`). Accent expresses only "happening now" and "where you are", while the main action stays black and white. The rules for each group are in [AGENTS.md](AGENTS.md#design-system).

`ChatToolCall` uses `label` for the action and `summary` for the short target still visible when collapsed; input/output are reactive lazy text,
and overlong results collapse through the shared `OutputBlock` and copy in full. queued/running/waiting/success/error/cancelled/unknown
each represent host facts, and complete stays for compatibility. onRetry/onCancel only notify the host; the component does not execute tools or update business state automatically.
`TaskList` is an ordered plan an agent works through: `items` is a list of `{ id, label, state, progress? }`, where `state` is the same `ChatExecutionState` ChatTask uses and `progress` is checked host progress (`{ value, max }`, shown as a percent; out-of-range values throw `RangeError`). The header shows `title` (default "Tasks"), a ring for the aggregate state and the done count (`1/5`, announced as "1 of 5 done"); native details collapses the list (`defaultOpen`, default true). Rows keep their DOM by `id`; the running row's label shimmers, done and canceled rows are struck through, and every row also states its state in text. It is a display of host facts, not an executable task or a ChatTask record.
`ChatReasoning` shows a model's visible reasoning: `label` names the current activity (shimmering while `active`), `doneLabel` is the folded summary the host measures (for example "Thought for 12s"), and `text` is plain streamed text whose blank lines separate paragraphs. While active it stays open and shows only the newest lines under a fading top edge, with no script measuring or scrolling; when the host clears `active` it folds into one disclosure row. It is unrelated to the composer's reasoning-effort choice (`reasoningOptions`). Neither component is in the JSON catalog or `AssistantMessagePart` yet.
`ChatTask` provides a title, state, public execution summary, separate executionText/replyText, optional native progress, and children/footer;
execution success without a received public reply is still presented accurately. It defaults to unknown; unknown progress is omitted rather than faking percentages.
`ChatProcess` aggregates records with native details, and tasks and tools continue to reuse Stack/Inline/Grid, sources, attachments, artifacts, and code components.
For existing/added/host boundaries across the full lifecycle and the coherent composition rules, see [Agent components](AGENT-COMPONENTS.md);
for real default compositions, see agent-workflow, agent-workflow-narrow, and agent-workflow-assistant in Meowbook.
The existing AssistantView JSON catalog also gains finite tool/task parts and onToolAction while reusing the same components;
it adds no separate ChatTask/ChatToolCall JSON entry, recursive task tree, or arbitrary object interpretation. See the [JSON contract](JSON.md) for the supported set.

`ChatMessageList` row spacing is declared by the column and read by the rows: the column sets `--chat-row-pitch` on every non-first row, and rows use it for their
top margin, with the first row's top margin coming from the list's own inset. When the host mounts messages one by one, it can insert a layout-free container
(`display: contents`) between the column and the rows, and row spacing matches that of direct children. Tool calls, process groups, and sources share one set of row metrics
(leading box, gaps, and row box) and scale with the `--chat-font-body` delta relative to 14px: changing the conversation font size
moves the glyph box, glyphs, row box, and expanded-body indentation together. Content owned by a row (expanded body, rows inside a group) hangs on the row label's
axis and is hierarchically distinct from the label itself; entries beside the row stay on the same axis.

Consecutive replies pass the same avatar with `continuation`, and the theme keeps the avatar column while hiding repeated avatars; the body axis does not depend on adjacent DOM structure. Groups without an avatar keep the avatar-free layout.

See [Component development conventions](AGENTS.md) for the default scale and component development order. Calibrate new components on the same screen as existing controls in Meowbook
first, then integrate them into applications; the theme's font sizes, control heights, and three-level spacing form one set of relationships, and each component does not get its own new sizes.
Buttons and single-line fields share one ladder: 36px by default, 28px compact, 44px large, so they line up in one row. Information blocks are tight inside; page edges, standalone blocks, and reading areas should have generous whitespace.
Local spacing tokens are not the ceiling for page whitespace, and not every level is uniformly compressed.

Use `uiTokens.type.body` for interface body text, `uiTokens.type.caption` for supporting descriptions, `uiTokens.type.body` for long-form and conversation body text,
`uiTokens.type.title` for local titles, and `uiTokens.type.pageTitle` for complete page titles; do not use the page-title scale for field labels.
`uiTokens.type.display` (`--ui-type-display`) is the serif stack for page and section titles. The default is Iowan Old Style, Palatino, Georgia, Times New Roman, Songti SC, Songti TC, Noto Serif SC, then `serif`. Body text stays on `uiTokens.type.sans`. A host overrides the variable on an ancestor; it does not need a second theme. The horizontal padding of ordinary controls comes from
`uiTokens.control.inset` (text inside field surfaces uses `uiTokens.control.fieldInset`); group, section, and panel express whitespace within a group, between areas, and at container edges respectively.
Relative indentation in reading paragraphs, media sizes, graph coordinates, and touch targets still follow real usage and do not adopt control scales.

`PageFrame`'s page edge uses `pageInsetBlock` / `pageInsetInline`, and narrow windows use the corresponding
`pageInsetCompactBlock` / `pageInsetCompactInline`; page whitespace is not compressed into local panel padding.
`ResourceCard` uses unified local titles, body text, supporting text, and card radius; padding and vertical rhythm for compact overview objects are defined only in component theme tokens,
without arbitrary pixel or density parameters. Identities that need checking use the supporting text color and a monospace font, and the disabled state does not erase
the name or the reason the action is unavailable.
Meowbook's `page-structure-long-content` adds compositions with long names, precise identifiers, adjacent states, and disabled actions;
`EmptyState` passes through the caller's native attributes, and state urgency and loading facts still come from the host.

Run `bun test packages/meowtail/tests/unit` from the repository root to run the Bun tests in `tests/unit`; typechecking and the component behavior regressions in `tests/browser` run separately. File ownership and naming follow the test file organization specification (historical reference in the original product repository).
Browser tests start only this package's Meowbook scenes and do not need the Dashboard. Component interaction, layout, conversation components, and theme
regressions all live in `tests/browser`; the catalog there verifies the actual integration of this package's showcase configuration as a Meowbook consumer.
Meowbook's own tool and standalone fixture tests are still handled by `test:meowbook`.
A complete UI regression also requires running the Meowbook tests and the browser scenes in this package's `playwright.config.ts`.

`ChoiceGroup` directly displays a small number of single-choice options and reuses native radio keyboard, form, and required validation.
It supports option descriptions, disabled options, controlled values, and form reset; it does not handle submission.
`ChatQuestion` lays out the question, supporting description, answer content, feedback, and actions; the meaning of answer modes, asynchronous submission, and cancellation
is the host's responsibility. The standard theme follows the compact work scale and keeps related actions grouped rather than stretching them to the container edges by default.

### Layout and content composition

`Stack` arranges vertically; `Inline` arranges horizontally and allows wrapping by default. Both provide `gap` (none/compact/normal/relaxed),
`align`, and `justify`; `Inline wrap={false}` explicitly keeps a single line. Components keep direction and arrangement structure, and the theme decides semantic spacing.
`Grid` arranges automatically by container width by default, with `minColumnWidth` set to compact/normal/wide; `columns={1|2|3|4}` can also be specified.
A fixed column count does not silently become a responsive count. `Container width` is narrow/content/wide/page/full, and the theme controls the maximum content width.
Stack stretches by default so forms and content regions fill the width; when mixing labels and buttons, use `align="start"` to keep natural sizes,
or put the actions in an Inline. Fields, actions, and long text clearly choose stretch, start, or baseline alignment according to their content relationship.

Local layout can freely nest these JSX components: first choose the horizontal, vertical, or parallel relationship, then use `LayoutItem` when space needs allocating,
while content and native semantics are still carried by real components. The page shell and named region matrix allocate page space and do not limit component composition inside a region;
no new serializable recursive layout template or second layout engine was added.

Use this set of layout primitives and do not reimplement direction, alignment, and spacing in applications. Stack/Inline/Grid `rowGap` and
`columnGap` default to auto (following gap) and can use the same semantic spacing independently. Layouts can use `as="header"` or
`as="footer"` to keep region semantics; components do not choose business breakpoints, text truncation, or wrapping strategies for the host.

`ActionRail` is one action row with named `leading`, `trailing`, and `submit` slots. The rail owns start/end anchoring and the rule that the submit action stays visible while flexible leading and trailing actions wrap; callers pass actions rather than layout classes. `MetaRow` is one page-level fact row: `items` carry an optional icon and a short label, separators are generated between facts, `progress` appends one optional progress fact (finite values clamp to 0–100; non-finite values are omitted), and `align`/`progressTone` select the two finite presentations. Neither component owns business state or actions.

`Toolbar` is horizontal by default and allows wrapping; `orientation="vertical"` arranges it vertically. It provides one Tab stop for its own buttons and for the action set of native input-like buttons and links with href; arrow keys, Home / End move within the current set, and horizontal orientation respects RTL. Native Input, Textarea, Select, and composite controls that manage their own keyboard keep independent Tab stops and editing keys; nested Toolbars do not consume them twice. Entries that are hidden, disabled, inert, or explicitly set to `tabIndex=-1` by the author are excluded from the action set, and dynamic membership changes do not steal focus. Enter / Space still activate along native control behavior, and complex inputs are not automatically folded into an overflow menu; unmounting restores the tabindex values this component managed and preserves the caller's subsequent valid attributes.

`LayoutItem` controls space allocation for direct children: `grow` defaults to false, `shrink` to true,
`basis` to auto, and `alignSelf` to auto. Its root with Stack/Inline/Grid keeps min-width:0 and min-height:0
so nested children can accept the finite space the parent allocates; whether long identifiers
break or body text truncates is decided by the content. Use it only when child space needs controlling, not as a wrapper around every element.

For a vertical workspace, first have the host or PageFrame provide a finite height, then allocate the body remainder with `LayoutItem grow`.
Content that actually scrolls explicitly uses `overflow: auto`; layout components do not clip content by default and do not choose a scroll owner automatically.
When continuing with layout components such as Stack in between, keep using shrinkable roots; when inserting host wrappers such as native divs, the wrapper still has to handle its own
height and minimum size. A Stack without a height constraint keeps natural flow, and actions with `shrink={false}` keep their natural size.

```tsx
// Label and value belong to one group; mixed font sizes align along the text baseline.
<Inline gap="compact" align="baseline">
  <small>Default connection</small>
  <strong>Codex</strong>
  <small>gpt-6-luna</small>
</Inline>

// The body uses the remaining width; the action keeps its natural size.
<Inline wrap={false}>
  <LayoutItem grow><Stack gap="compact">{title}{description}</Stack></LayoutItem>
  <LayoutItem shrink={false}><Button>Edit connection</Button></LayoutItem>
</Inline>

// Actions sit close together, with clearer line spacing when they wrap.
<Inline as="footer" gap="compact" rowGap="normal">{actions}</Inline>
```

Meowbook's "Layout composition · Text baseline and fixed actions" covers these compositions and long model identifiers together.

### Text and reading content

`Text` is one run of copy in a theme text role: `variant` is `body` (default), `secondary`, `caption`, or `eyebrow` (the small-caps group label used by menus, navigation groups and specimen labels), and `as` is `p` (default), `span`, or `div`. Emphasis and fine print keep their native `strong`, `em` and `small` inside it. Headings stay with `PageHeader`, `Page` and `Section`, field labels with `Field`, and code with the code components; Text has no tone, because state color belongs to `Status`, `Badge` and `Alert`, which carry non-color cues.

`Prose` holds long-form reading content: native `h2`–`h4`, paragraphs, lists, quotes, `pre`/`code`, rules, tables, links and images inside it take one reading rhythm, shared with chat message content and rendered assistant markdown. `measure="reading"` (default) caps lines at `uiTokens.layout.measure`; `measure="fill"` takes the parent's width; `as` is `div`, `article`, or `section`. Arranging controls and cards stays with Stack, Inline and Grid. Neither component joins the JSON catalog, and Meowslides keeps its own presentation typography.

`DescriptionList` / `DescriptionItem term={...}` organize related labels and values with native `dl` / `dt` / `dd`.
Labels in the same group take their natural width up to a cap, and values share a column start; when the local container is too narrow, each item stacks label above value
based on the local width, not the whole window. By default it keeps semantic font sizes and wrappable long text, and provides no surface, padding, or independent scrolling.
It needs the parent container to allocate available width and does not promise a layout that tightens width to content; the current Web theme uses CSS subgrid and container queries.
Labels and arbitrary values accept `Child`; values continue to compose existing layouts and controls, and no metadata schema or extra action slot is provided.
Code fonts, truncation, and fixed-size child content are decided by the consumer; ordinary text and long identifiers can wrap by default.
The public parts are `description-list/root` and `description-item/root/term/value`, and native attributes pass through to each component root.

```tsx
<DescriptionList>
  <DescriptionItem term="Working directory">
    <Inline wrap={false} gap="compact" align="start">
      <LayoutItem grow>
        <code>{workspacePath}</code>
      </LayoutItem>
      <LayoutItem shrink={false}>
        <Button size="small">Copy directory</Button>
      </LayoutItem>
    </Inline>
  </DescriptionItem>
  <DescriptionItem term="Access mode">Read-only</DescriptionItem>
</DescriptionList>
```

Meowbook's `description-list-composition` shows wide and narrow local containers, long labels and identifiers,
actions and inputs inside values in one viewport, for checking shared columns, natural reflow, native semantics, and draft continuity; it does not mean a business page has been accepted.

`Card` supports CardHeader, CardTitle, CardDescription, CardAction, CardContent, and CardFooter.
The default `variant="auto"` takes depth from the render tree Context: the standard theme presents the top level as an independent surface and blends descendants into the parent; an explicit variant takes precedence.
Depth follows the logical component tree, so an overlay does not automatically become a new root just because it visually leaves the parent card; overlay content that needs an independent surface uses surface explicitly.
Title can specify h2–h6; heading levels are still decided by document structure and are not guessed automatically from card nesting.
Ordinary internal groups use the shared surface, standalone items can explicitly use `variant="surface"`, and `variant="embedded"` explicitly blends into the parent surface.
Nesting does not mean borders and shadows must be repeated. Complex content still uses Stack/Inline/Grid layout; do not turn Card into a universal layout component.

`FieldGroup` organizes fields with native fieldset/legend and supports disabling the whole group; Field continues to handle association for a single field.
`AspectRatio ratio={16/9}` controls layout ratio; the caller chooses media object-fit and clipping.
`Separator` keeps horizontal/vertical separator semantics.

`Tabs` uses the required id, label, and items (value/label/content/disabled) to create associated tabs/tabpanels;
it supports arrow keys, Home/End, a controlled value Signal, and defaultValue. Panels stay mounted when switching, so drafts are not lost.
`Breadcrumb items` is an array of label/href, and the last item marks the current location.
`Tooltip` uses `trigger(bindings)` to add text descriptions to named focusable controls; it appears after a mouse delay, appears immediately on keyboard focus,
and closes on Escape; do not put necessary information or interactive content only in a Tooltip—use Popover for the latter.
`Alert tone` expresses visual state, and `role` explicitly chooses status/alert; urgency is not inferred from color. `tone="neutral"` is the quiet notice: the same structure, tinted with the muted ink instead of a status color.
`Alert layout="bar"` is the compact page-notice form: one line with a status dot, body text and a trailing action. `marker="none"` removes that dot; the default `marker="dot"` keeps it. The default `layout="block"` keeps title/body/actions for outcomes that need reading and draws no dot. Use `bar` in `PageFrame`'s notice slot; it is a semantic notice shape, not a device variant.

`Skeleton` is an aria-hidden placeholder; the caller provides the content region's aria-busy and loading copy.
`SkeletonBoundary active={loading} label="Updating details"` applies skeleton presentation to already mounted content;
`active` accepts a boolean or Signal, and toggling does not unmount children, preserving input drafts and component state.
While loading, the region is marked aria-busy and its content is inert, and screen readers get the caller-provided loading copy from a status outside the region.
Focus inside the content is released when loading starts and is not automatically reclaimed when it finishes. Callers should put available actions such as cancel and retry outside the boundary.
Underneath it uses MeowJSX Web's shared skeleton controller, which uniformly removes detail from text, images, icons, and inputs; this is loading presentation only and does not
start requests, time anything, or decide completion. When there is no content geometry on first load, the caller still uses `Skeleton` to provide placeholder structure.
When the host explicitly wires an `observation` hub into the Web renderer, the boundary gets its source from the render tree Context and subscribes to its own
component subtree; nested boundaries are located by contract and node ownership, not by function name. An ordinary unobserved renderer still uses the local DOM
approach and does not force the component index on. Both approaches keep supplementary listeners for external DOM and theme changes.
`Spinner label` provides a readable loading state and does not claim real progress.

The native select control `Select` reuses browser option, keyboard, and form semantics and provides a `root` part; the theme decides visuals. It is used both for the Meowbook tool appearance and for scene theme selection. The control keeps native `size` (row count) semantics and does not reuse it as a visual size.

`Popover` is a non-modal general overlay; it does not set a menu role or trap focus by default. It requires `id` and
`trigger(bindings)`; the trigger button exposes the bindings, and content goes in children. It supports `open` Signal / `defaultOpen`,
`onOpenChange`, `align`, `matchTriggerWidth`, `role`, and `labelledBy`. `triggerId` can associate with an external Field.
It uses the browser Popover API's top-layer hosting and depends on browsers that support that API; positioning uses `@floating-ui/dom`'s
offset/flip/shift/size and autoUpdate while open, cleaned up on close or unmount. An outside click closes the topmost layer,
and Escape returns to the current layer's entry point; focus moved outside is not reclaimed. Content is reached in ordinary Tab order, and menu keyboard rules are provided by the consumer.
Local DOM controls handle Escape first; a child's `preventDefault()` means consumed, and when unconsumed only the original topmost calls the existing `onKeyDown` once and tries to close, re-checking the original layer after the callback so the same key cannot close the parent. `stopPropagation()` alone blocks custom dispatch and does not promise to prevent native Dialog default cancellation. Normal focus return still requires a successful close and an available trigger; a controlled refusal to close, an external deliberate focus move, and unmount are not forcibly overridden, and caller exceptions are not swallowed.
After positioning and height limiting, only the topmost overlay scrolls its currently focused internal item into view, without moving focus or scrolling outer layers.
The parts are `root/panel`; surface, spacing, and motion belong to the theme.

`ChoiceSelect` implements custom single selection on Popover; native `Select` continues to serve system pickers and multiple selection.
`options` is `{ value, label, disabled?, group? }[]`; it supports `defaultValue` or a controlled `value` Signal,
and `onValueChange` receives selections. Arrow keys, Home/End, character search, Enter/Space, Escape, and Tab work.
`id` is used for Field association; `name/required/disabled/form` connect to a native form control, and a required failure blocks submission and focuses the
trigger. Error messages use the browser's native validation copy. Reset restores the uncontrolled default value, and a controlled value still belongs to the caller.
The theme visually hides the native form carrier; a hidden input is not used to fake required validation. It provides no custom multiple selection or asynchronous search.
The parts are `root/trigger/value/indicator/list/group/option/native/validation`.

- Basics: Button, AddButton, IconButton, MenuButton, Card, Badge, Avatar, Input, NumberInput,
  Textarea, Select, Field, SearchInput, Slider, Progress, Link, Disclosure, Accordion, Table,
  Separator, NavItem, EmptyState.
- Dialogs: Dialog, DialogPanel, DialogHeader, DialogActions.
- Chat: ChatFrame, ChatHeader, ChatStatus, ChatConversation, ChatMessageList, ChatMessage, ChatBubble,
  ChatMessageActions, ChatComposer, ChatToolCall, ChatAttachments, ChatProcess, ChatSources.
- Icons: the finite semantic set `Icon` and `iconNames` sourced from the pinned Lucide dependency, caller-supplied `IconSource` and `IconNode`, and the `meowtail/icons/lucide` pass-through for application icons, plus MeowlandMark, DoodleCat, NotesIcon, TasksIcon, SearchIcon, PlusIcon, GithubIcon, ExternalArrowIcon.

Icons outside the semantic set go through `IconSource` with structural `IconNode` data from a trusted source. The pinned pass-through at `meowtail/icons/lucide` re-exports the installed Lucide version, so an application can use any Lucide icon without adding its own icon dependency; JSON surfaces keep only the finite `iconNames` set:

```tsx
import { IconSource } from "meowtail/icons";
import { Bell } from "meowtail/icons/lucide";

<IconSource source={Bell} size={16} label="Notifications" />;
```

Before adding a component, confirm it can be reused in more than two applications or scenes; page components used once by an application should not be moved
here just to "extract" them.

`Field` associates its label through `htmlFor`; the caller supplies the matching control `id`.
For a single control child, it merges visible description and error ids from `htmlFor`, `descriptionId`, or `errorId`
with the child's original `aria-describedby`, including a host Signal. It manages only its own ids.
Multiple control children and custom compositions require the caller to pass association attributes explicitly.
Top-level `description` and `error` Signals keep their message parts mounted and update content, `hidden`, and
associations without remounting the control, preserving drafts and focus. `null`, `undefined`, `false`, and `""`
are empty messages; `0` is content. Field does not inspect arbitrary VNodes, Promises, or nested Signals for DOM visibility.
Explicit `invalid`, including `false` or a boolean Signal, takes precedence; otherwise a provided error derives the
live invalid state, clearing `aria-invalid` to `"false"` when the message empties. Without either input, the child's
original `aria-invalid` is preserved. Field supplies no validation, submission, focus management, or automatic announcement.

`Dialog` handles only the native `<dialog>` structure, label association, and panel/header/actions partitioning; opening, closing,
Escape, focus return, and submission results are still controlled by the application. It has no Radix-like context, portal, or focus trap;
do not assume the component already provides those behaviors.
`DialogPanel header={...}` and `Drawer header={...}` explicitly compose the shared `PageFrame`, with the title and close
sharing a fixed header and the body as the only main scroll region. `DialogPanel as="form"` keeps native form ownership and submission;
short content takes its natural height, and long content inherits the host dialog's maximum height. It does not scan children to guess a title or compute the header height twice.
Consumers put `DialogHeader` into the header prop and put the body and existing trailing actions into children; the native window,
cancellation, drafts, and opening method still belong to the host. The body scroll reference is obtained through the public `page-frame/body` part.
DialogPanel distributes standard whitespace inside its direct header and body, ensuring that focus outlines of the first and last body controls stay within its scroll viewport; an arbitrary Child header separates with the same `spaceSection`, and without a header the body takes panel whitespace on all four sides. The existing DialogHeader composition keeps its original content geometry, and a stable total height is not promised for arbitrary custom headers; no new gap prop was added. The fixed title, exit, and single body scroll remain separate, and it is not promised that any extremely small height is enough to read. Native Dialog opening, cancellation, and caller focus premises are unchanged; the theme whitespace fix does not mean all pointer/system focus paths have been verified.

`EmptyState size="compact"` is for a local empty list or an unselected content region, keeping the title, description, and actions while removing decorative artwork.
The default `size="default"` keeps the full-page empty state; loading and failure still use their existing feedback and do not become empty states.
`illustration` replaces the default `DoodleCat`. `null` and `false` leave the illustration part out. Presence is fixed for the mount, and compact size still hides that part when it is present.

`ChatAttachments` accepts `items: readonly ChatAttachmentItem[]`, where each item has
`id`, `name`, `url`, `mediaType`, and an optional `sizeBytes`; `label` defaults to "Message attachments".
The caller provides URLs, and the component does not fetch data. Images are shown by default as accessible new-window links with lazy-loaded previews and become preview buttons when `onPreview` is provided;
file links download with the original file name and show B / KB / MB when a valid size is available.
The theme uses the `root/entry/image/preview/file/icon/details/name/size/previewButton/remove` parts of `chat-attachments`
through `partSelector(chatAttachmentsContract, part)`.
Each item can provide `onRemove`, passed only when a draft needs a remove action; upload, file deletion, and URL lifecycles still belong to the host.

`ComposerPanel` composes one `ChatComposer` and an optional page-level meta row, usually a `MetaRow`. It refines the same internal writing surface rather than wrapping the whole form in a second surface. Draft, actions, submission and the external supporting hint stay in `ChatComposer`. Narrow composition stays with `ChatComposer`'s own layout and the page/footer edge; the panel has no device variant.

`ChatFrame` provides reading margins only for a direct `ChatComposer`; if a footer, Card, or other wrapper container owns that region's space,
the Composer inside uses its natural width within that container and is no longer narrowed or margined by an ancestor Frame.

`ChatComposer`'s `hintId` associates the hint node with the input through `aria-describedby`;
`onInput` is bound on the textarea and `onSubmit` on the outer form. `value` supports Signals, and
`submitDisabled` only prevents submission, which suits continued editing while waiting for a result; `disabled` prevents both editing and submission.
Request state, submitted snapshots, and the latest draft are managed by the caller. `attachments` holds materials to send, and `inputLabel` provides the input name.
The form groups a writing `surface` and its supporting `hint`. Attachments, input and actions stay inside the surface; the hint follows outside its rounded edge and focus outline, associated with the textarea by `hintId`. Page-level metadata follows the whole composer.
`surface="none"` removes only the internal writing surface's chrome and padding for explicit bare embedding; it does not move the hint back inside a surface.
`layout="inline"` puts short drafts and actions on the same row, and long drafts keep growing; its external hint appears on focus. The default `stacked` keeps the tool row at the bottom of the writing surface. On narrow screens, attach/input/send share the writing row and model selection sits below it; the supporting hint remains outside the surface and wraps. The `hero` hint retains its visually hidden presentation.
`layout="hero"` uses the input height of the desktop master blank conversation. `trailing` composes selection entry points such as provider and model to the left of the send button;
a controlled `ChoiceSelect` can be passed, expanding grouped options upward with `placement="top"`, `align="end"`, and `matchTriggerWidth={false}`.
Option sources, current values, and the actual switching of runtime configuration are still the host's responsibility.

`ChatMessage` handles identity, arrangement, and state, wrapping `ChatBubble` around content by default and keeping the original call style.
To show attachments, processes, and text separately, set `surface="none"` and compose `ChatBubble` with other components yourself.
Bubble's `auto` reads the message role through Context and the theme decides the background; `plain` / `filled` can also be chosen explicitly.
`header` / `footer` are slots for supplementary material and delivery feedback, and business state still comes from the host.

`ChatConversation` is an optional scroll container, and the host must provide a constrained height.
It follows appended content when near the bottom, keeps position when scrolled up, and provides a return-to-latest button.
The return action participates in normal layout after the message viewport, claiming its own height when shown and returning the space to messages when hidden; it never floats above historical body text.
It does not implement history prepending, per-message anchors, or persisted reading restoration. Do not stack it on top of an existing application scroll controller;
the Dashboard keeps using its own controller. `ChatMessageList` still provides only message-record semantics.

A host that already has a scroll owner can use `ChatConversationLatest` alone. It is a normal-flow button that installs no controller, sets no positioning container, and does not allocate height to an arbitrary host viewport on its own.
For example, the following `transcript`, `latestHidden`, and three callbacks all come from the host's existing controller:

```tsx
import { h } from "meowjsx";
import { Stack, LayoutItem } from "meowtail";
import { ChatMessageList, ChatConversationLatest } from "meowtail/chat";

<Stack gap="none" style={{ height: "100%" }}>
  <LayoutItem
    grow
    basis={0}
    role="region"
    aria-label="Message reading area"
    tabIndex={0}
    style={{ overflowY: "auto", overflowAnchor: "none" }}
    ref={connectTranscriptViewport}
    onScroll={readTranscriptPosition}
  >
    <ChatMessageList>{transcript}</ChatMessageList>
  </LayoutItem>
  <ChatConversationLatest hidden={latestHidden} onClick={returnToLatest} />
</Stack>;
```

The parent container must provide a finite height; the LayoutItem in the example is the only scroll viewport, and the button is its sibling.
The host handles reading position, show/hide, append following, and holding position; `returnToLatest` should scroll to the end, hand focus back to that viewport with `preventScroll`, and then hide the action.
Do not turn the snippet into absolute positioning and expect it to avoid the body automatically, and do not protect the middle of history with message-end padding or device offsets.

`SearchInput` provides a shared shell with a search icon and a native search input; `label` is the required accessible name.
`className` applies to the shell and `inputClassName` to the input; `id/name/value/disabled/readOnly/aria-*`
and events all pass to the input, keeping Field descriptions and error associations. Filtering, submission, and result state remain the consumer's responsibility.
The parts are `root/icon/control`, and the theme decides the default surface, focus, and error boundary.

`PathPicker` composes a controlled path input with an optional browse button. The caller provides `value/onValueChange`,
the accessible name `label`, and an async `onChoose` that returns a path or `null` (canceled); `kind="file" | "directory"`
only determines the button text, and the host injects the actual selection capability. Without `onChoose`, manual entry still works.
The component handles waiting, failure feedback, and ignoring results after unmount; it temporarily locks the input while in flight and does not write back an old selection after the parent value or disabled/read-only state changes.
Choosing only fills in the path; it does not read files, upload files, or grant access. Descriptions, validation, and saving remain the caller's responsibility.

`Disclosure` uses native details/summary, accepts `summary: Child` and content children, and supports
`open/name/onToggle` and other native attributes. `summaryClassName` and `contentClassName` are for host layout;
the parts are `root/summary/icon/content`. `Accordion` groups several Disclosures, with `type="single"` or
`type="multiple"`, and still does not own business content.

## Standard theme (meowtail/theme)

The standard theme exports `standardTheme`, `standardOptions`, and typed `uiTokens`. The read-only `standardThemeTokens` and `standardThemeStyles` are theme assembly primitives that let extended themes such as MeowSlides reuse the same token/fragment objects; they do not install components or touch the DOM. `standardTheme.cssText` is one complete stylesheet. A second theme built by copying token objects would break that shared identity, and the theme entry lists every fragment, so unused rules are not dropped from this binding. Hosts mount the full sheet. Tokens and styles
are both defined in TypeScript; components match CSS through stable part markers and style options, and theme plugins no longer generate
visual class names. See TypeScript tokens and parameterized configuration (historical reference in the original product repository) for the complete design.

Style files use `<responsibility>.styles.ts`; the standard theme groups them by component and conversation responsibility, and application styles are maintained with application modules.
See the style file organization (historical reference in the original product repository) for naming, component family boundaries, and cascade organization.
Existing styles have been migrated to this specification, and historical conversation overrides have been merged back into the files owned by messages and the composer.

### Design language

Compose pages from the roles below. Their current values live in the role tree in
[theme tokens](src/theme/tokens.ts); component styles apply them to named parts.
Meowbook's [`design-language` panorama](stories/language.stories.tsx) puts typography, actions,
navigation, fields, execution states, and conversation on one board. The
[`settings-workflow` scene](stories/settings-workflow.stories.tsx) shows a complete local edit,
validation, correction, and save sequence. These are composition references, not backend integrations.

| Text role       | Current standard theme                           | Use                                                                                |
| --------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| UI body         | `uiTokens.type.body`, 14px                       | Settings, control labels, and ordinary interface content                           |
| Conversation    | `chatTokens.fontBody`, 15px with 1.7 line height | Chat prose; this scale does not enlarge settings                                   |
| Supporting text | `uiTokens.type.caption`, 12px                    | Descriptions, timestamps, and state labels                                         |
| Headings        | `fontTitle`, 16px; `fontPageTitle`, 24px         | Component titles and page titles, with heading levels chosen by document structure |

`PageHeader` and `Section` titles use the serif `uiTokens.type.display` stack at their existing
24px and 16px sizes. A nested `Section` title (h3 and below) is a 14px subheading and keeps
`uiTokens.type.sans`, because a bold serif at body size loses its shapes. Body text and controls keep
`uiTokens.type.sans`; other component titles retain their own font rules. Heading levels still follow
document structure.

The main action uses `Button`'s default `primary` variant: a near-black fill in light mode and a near-white fill in
dark mode, paired with `onPrimary`. Use `outline` for a secondary action and `quiet` for dismissal
or a less prominent action. Accent marks current activity and location: processing, active navigation,
and soft selected surfaces. An accent action belongs to that activity rather than replacing the main
action everywhere. Use `stop` to interrupt running work and `danger` for a destructive action; the
latter has its own filled-action foreground/background pair.

Status includes visible words. `Status` pairs a decorative marker with the caller's label; the host
decides which state its evidence supports.

| State                | Marker             | Meaning                                                           |
| -------------------- | ------------------ | ----------------------------------------------------------------- |
| `processing`         | Pulsing accent     | Work is happening now                                             |
| `success`            | Solid green        | Connected, enabled, or confirmed complete, as stated by the label |
| `returned`           | Hollow green       | Execution returned; goal completion still needs checking          |
| `warning` / `danger` | Solid orange / red | Needs attention / failed or unreadable                            |
| `unknown`            | Hollow gray        | Current state has not been verified                               |
| `idle`               | Quiet solid gray   | Known to be standing by                                           |

Choose space by relationship and region. `Stack`, `Inline`, and `Grid` map compact/normal/relaxed
gaps to group/section/panel tokens: 8/20/24px. A `Field` uses the 8px group gap between its label,
description, control, and error; `FieldGroup` uses 20px between fields. Separate setting groups with
a relaxed Stack, as in the workflow scene. Page edges have their own scale: `Container width="page"`
uses 36px block and 48px inline insets, changing to 20px and 16px at widths up to 768px. Do not add
that inset again inside a shell that already provides it. A narrow Container limits width to 480px
without supplying page gutters.

Density follows the activity. Navigation and metadata can stay compact; form groups need clear
boundaries; conversation uses a maximum reading width of 720px and 28px between messages. Use the existing
layout and content roles to make these differences. The standard theme has no global density axis.

For settings that are being read, `DescriptionList` aligns terms and values and stacks them when its
local container narrows. For continuous editing, compose `FieldGroup`, `Field`, native controls,
and one explicit save action. In the workflow scene, edits remain in a local draft; an invalid submit
keeps the draft, focuses the email field, and shows a correction beside it. A valid correction clears
the error, and a successful local save updates feedback beside the action. The host owns validation,
focus, announcements, and persistence. `Field` binds live description/error Signals without remounting
the control; its full association and invalid-state contract is [above](#current-components).

Light and dark are explicit schemes; `auto` follows the system preference and is the default.
Change root configuration to switch scheme while retaining mounted controls, drafts, and expanded
content. Shared role names, spacing, and hierarchy stay the same across schemes; use the theme's
foreground/background pairs rather than copying a light-mode color into a dark surface. See
[root configuration](#root-configuration-and-local-overrides) for local scheme inheritance.

The composition work also drew on Mobbin references for [regional density in Mixpanel](https://mobbin.com/screens/68f21e8a-40d7-4ea0-8c18-c35f9163b566),
[grouped settings in Ghost](https://mobbin.com/screens/15e989a8-cee4-4822-acce-be522e08caf0),
[continuous editing in HubSpot](https://mobbin.com/screens/9808b928-3000-4bb1-b001-8f4b9f5793b8), and
[field-local correction in Melio](https://mobbin.com/screens/b542daad-cc71-4d22-8622-ffe080d82e31).
These relationships inform composition; theme values and component behavior are defined by this package.

### Component installation and style delivery

Component installation and style loading are two explicit steps. `createMeowUI()` registers components and style prop adapters;
`standardTheme.cssText` provides the complete CSS with variable declarations and component rules. A dynamic host can assemble it like this:

```tsx
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Button, createMeowUI } from "meowtail";
import { standardTheme, standardOptions } from "meowtail/theme";
import { applyTheme, mountStyles } from "meowcss/web";

const runtime = createRuntime({ plugins: [createMeowUI()] });
const web = createWebRenderer(runtime);
const removeStyles = mountStyles(container.ownerDocument, standardTheme.cssText);
const removeTheme = applyTheme(
  container,
  standardTheme,
  standardOptions.select({ scheme: "light" }),
);
const mounted = web.render(<Button variant="quiet">Cancel</Button>, container);

// When the host is destroyed:
mounted.unmount();
removeTheme();
removeStyles();
```

When using defaultRuntime, call `installMeowUI(defaultRuntime)` and use the same runtime for the initial render and dynamic controls.
No separate standard theme plugin needs to be installed. Valid values, defaults, and carrying parts for style props
are declared by the component contract's `defineStyleProps`; the adapter consumes the props so style options such as variant are not passed through as ordinary DOM attributes.
`ThemedProps` provides union types and Signal inputs; components keep open native Props and therefore do not promise to reject all unknown attributes.

A static host composes `standardTheme.cssText` with application CSS at build time, writes a `.css` file loaded by HTML,
and outputs root attributes through `themeAttributes(standardTheme, config)`. Styles can load before client-side
JavaScript runs. The Dashboard and Meowbook use this delivery path;
dynamic previews use `mountStyles(document, cssText)`, with the host holding the returned cleanup function.
Source code maintains no `.css` files, and generated CSS is still a browser asset. Module imports themselves do not access the DOM;
`mountStyles` does not deduplicate across calls, so the host should assemble once within the document or application lifecycle.

### Root configuration and local overrides

`standardOptions` has a built-in scheme; the current standard theme defaults to `auto` and supports light/dark/auto.
The standard visuals use DeepSeek Harness as their baseline: system fonts, 14px body, 12px supporting text, and 16px titles; buttons
and single-line fields use 28/36/44px for small/default/large. Controls, menus, and large panels use their corresponding
radii and materials, and applications compose pages from the same language. See [third-party notices](THIRD_PARTY_NOTICES.md) for reference sources and licenses,
and the migration record (historical reference in the original product repository) for the implementation scope and verification not yet finished.

```tsx
import { Theme } from "meowcss/web";

<Theme theme={standardTheme} config={standardOptions.select({ scheme: "dark" })}>
  <Button>Save</Button>
  <Theme config={standardOptions.select({ scheme: "light" })}>
    <Preview />
  </Theme>
</Theme>;
```

`Theme` binds configuration only and does not load CSS. Dimensions omitted from a local config inherit from the parent; removing a local selection restores
inheritance, and component instances and drafts do not need rebuilding. Existing DOM roots use `applyTheme`, static HTML uses
`themeAttributes`, and the three share attribute semantics. Do not create a new Theme component for each theme.

### Styles and component options

Ordinary CSS keeps the template form; tokens and parts are referenced in TypeScript to avoid hand-writing generated names:

```ts
import { buttonContract, buttonOptions } from "meowtail";
import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "meowtail/theme";

const applicationStyles = css`
  .toolbar ${partSelector(buttonContract, "root")} {
    border-radius: ${uiTokens.radius.lg};
    ${buttonOptions.when({ variant: "quiet" })} {
      color: ${uiTokens.status.info};
    }
  }
`;
```

The host explicitly composes CSS in the order of standard theme, application base, and application overrides. hover, focus, media queries, and animation
continue to be handled by CSS; native states match on native attributes, and component style options use `when`. `className` and
`style` remain application extension entry points, and business layout does not enter the standard theme.

Custom tokens use `defineTokens`, and `defineTheme` composes options, complete defaults, token
sets, and CSS fragments in one call. Component bindings come from typed part references in the fragment; do not convert the fragment to a string early and
lose that information. Measurement variables without defaults use `tokenRef`, whose `.name` is passed to `setProperty`.
See [MeowCSS](../meowcss/README.md) for pure generation and typed adapter usage and scope boundaries.

After building and installing the local package, run `bunx --no-install meowbook serve --config packages/meowtail/meowbook.config.ts` from the repository root to
open component scenes and check light/dark, desktop and narrow screens, input drafts, and state switching. Sizes are Web adaptations;
see the DeepSeek migration record above for the current visual baseline. See meow-design (historical reference in the original product repository)
for design judgment and polishing methods; its historical exploration recipes are not the standard theme specification.

### Lifecycle extensions

Static visuals use CSS. Use a shadow only when real DOM, instance state, listeners, or cleanup are needed:

```ts
// Web shadow: context.element is a real Element.
import { defineShadow } from "meowjsx/web";

runtime.use({
  shadows: [
    defineShadow(Button, "root", (props, context) => {
      const active = context.signal(false);
      context.effect(() => {
        context.element.classList.toggle("is-active", active.value);
      });
      const enter = () => {
        active.value = true;
      };
      const leave = () => {
        active.value = false;
      };
      context.element.addEventListener("pointerenter", enter);
      context.element.addEventListener("pointerleave", leave);
      context.onCleanup(() => {
        context.element.removeEventListener("pointerenter", enter);
        context.element.removeEventListener("pointerleave", leave);
      });
    }),
  ],
});
```

Register centrally; do not generate wrapper components. A shadow shares the signal/effect/onCleanup lifecycle API with components.
Plugin uninstall blocks later application; instance cleanup for existing elements is handled by the unmount of their mount. Do not use
renderToHtml + innerHTML instead of browser mounting that needs a lifecycle.

### Files and verification

- `meowcss`: shared token/option/CSS generation; `meowcss/meowjsx` handles typed parts and automatic carriers; `meowcss/web` handles the DOM theme lifecycle. See [MeowCSS](../meowcss/README.md).
- `src/theme/tokens.ts`: the design system's role tree (`uiTokens`) and the chat, alert and logo sets.
- `src/theme/base.styles.ts` and the `*.styles.ts` files under `components/chat/icons/shared`: CSS templates written by responsibility;
  highlight-specific tokens live in `shared/code-highlight.tokens.ts`.
- `src/theme/index.ts`: explicit assembly and public exports of the standard theme.
- `bun test packages/meowtail/tests/unit`: component and standard theme contracts; shared token/option contracts are verified in MeowCSS tests.
- `tsc --noEmit --project packages/meowtail/tsconfig.json`: typechecks the implementation, showcase scenes, browser tests, and
  public type contracts in `tests/types/`; type cases are not run by Bun.
- `tests/browser/theme/parameterized-theme.spec.ts`: parameterized theme, local override, and real component composition regressions, targeting
  the standalone test scenes in `tests/fixtures/theme-prototype-demo.tsx` and `tests/fixtures/real-controls-demo.tsx`,
  loaded by this package's dedicated Playwright test config and not part of the component gallery.
- Dashboard composition verification for Rossovia is still maintained by the product repository and is not a runnable command in this library; the library keeps no tests that depend on a product checkout.

Browser acceptance covers the corresponding scenes and cannot be replaced by passing types or build. Component registration must apply to the runtime that actually renders;
content that needs a lifecycle is mounted with render rather than inserted as an HTML string.
