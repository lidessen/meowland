# A smaller authoring surface for meowtail

Status: design proposal, not implemented. This document is about what applications write when they
assemble screens with meowtail. It deliberately does not decide value ownership or bindings; that
question is parked in [value bindings](2026-10-20-value-bindings.md). It also does not change how
component implementations are written.

## The problem

The library has the right primitives and a few complete compositions (`AssistantView`, the chat
family). What sits between them is missing: a page is still assembled by nesting shells, layout
primitives, compound component parts and hand-written headings. A caller has to know which frame,
which container width, which stack gap, which card parts and which field wiring go together before
writing any content.

The cost shows up as structure, not as data. A representative full-screen story in this repository,
`workspace-composition.stories.tsx`, imports 17 meowtail names and nests eight levels before it
reaches the first input:

```tsx
<PageFrame variant="page" scrollOwner="layout"
  header={<Container width="content"><PageHeader title="…" description="…" /></Container>}>
  <Container width="content">
    <Stack gap="relaxed">
      <Card><CardContent><Field …><Input … /></Field></CardContent></Card>
      …
```

The same pattern repeats in the library's own documentation app, which had to define local
`PageTitle` and `Section` helpers and a set of `docs-*` classes on top of the public components
(apps/docs/parts.tsx, apps/docs/document.tsx). When the library's own consumer reinvents page and
section structure, the gap is in the public authoring surface.

The counts in the repository support the same reading:

| Evidence                                                                                           | Count                                             |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Story files that use `Stack` directly                                                              | 55 of 74                                          |
| Story files that use `Container` directly                                                          | 20 of 74                                          |
| Story files that use `PageFrame`                                                                   | 4 of 74                                           |
| `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`/`CardAction` tags in stories | 54                                                |
| `DialogPanel`/`DialogHeader`/`DialogActions` tags in stories                                       | 16                                                |
| Minimum distinct names for a three-field settings form                                             | 5 (`Field`, `Input`, `Select`, `Switch`, `Stack`) |
| Names and depth of the `workspace-composition` page                                                | 17 names, depth 8                                 |

The diagnosis is not "too many small components". It is that the mechanical structure between
components is paid by the caller on every screen, and the same structure is written differently
each time.

## What the real product shows

The sibling repository `../rossovia` is Meowland's Assistant/Dashboard product and the first real
consumer of this library (meowtail `0.2.0-alpha.2` from npm). It is private and was read-only here,
but its screens are the best evidence for which templates and containers matter.

The product's routes and workshop scenes cover: the conversation workbench (chat, composer, work
cards, context details); settings (a modal window with a navigation column and section panels,
including a schema-driven form renderer); memory and knowledge (a catalog with search, and a reading
dialog); services/cells (list, detail, lifecycle actions); the extension catalog; communication
channels with connection forms; the agent profile; and a set of dialogs (attachment preview,
command output, record reader, work detail, context details, settings, extension message card).

The authoring evidence is consistent:

- Imports across `web/src` are dominated by primitives: `Button` 25, `Icon` 18, `Stack` 11,
  `Inline` 9, `Alert` 7, `Field` 6, `Disclosure` 6, `Item` 5, `IconButton` 5, `Input` 4, `Card` 4,
  `StatusDot` 3, `Select` 3, `EmptyState` 3. `PageHeader` appears in 8 places.
- Pages are `PageHeader` + `Container width="page"` + `Stack` + area-specific rows and lists. There
  are 530 `className="…"` occurrences and each area owns a `.styles.ts` built from MeowCSS tokens.
  The product deliberately owns page layout: the README says the workspace styles carry page
  layout while the standard theme carries component presentation.
- The application shell is custom: `src/app/shell.tsx` composes `IconRail`, `Drawer`,
  `WindowTitleBar` and `Status`. `PageFrame` appears inside the settings modal layout, not as the
  app frame. There is no `AppShell` component in the library, and the product does not expect one.
- Dialogs repeat the same manual wiring in many places: create a container, mount
  `Dialog`/`DialogPanel`/`DialogHeader`, query the native dialog, call `showModal`, listen for
  close, unmount and clean up. Attachment preview, command details, record reader, work detail,
  context details, settings, and the extension message card all carry a version of it.
- The product already has its own finite runtime surface protocol for model-generated UI
  (`web/src/dynamic-ui/`, `ui.present` commands, a catalog of stack/text/button/input/select/
  textarea/notice). The authoring layer in this document is for hand-written pages; it must not
  duplicate that protocol.

The product points to four adjustments to this plan: `Page` has to work inside a host app shell
rather than own the viewport; the dialog wiring is the largest remaining ceremony and is approved
as `Modal`; the form family fits the schema-driven settings renderer as well as the hand-written
channel form; and when the product migrates, its templates have to be these real screens rather
than generic guesses. The first templates, however, serve the priority consumers — the
documentation app and meowbook — because they can be changed in this repository now.

## What the reference products do

Three references are useful here, and they are useful for different reasons. SwiftUI shows what
semantic containers do to authoring when the framework owns the platform. shadcn/ui shows how
composition, a field vocabulary and complete page blocks work in a web component collection that
the application owns as source. MyGo is a Go desktop-app framework, useful as a directional
reference for a small, obvious surface and complete app examples; its authoring details could not
be read in this environment.

### SwiftUI

SwiftUI's authoring is built on semantic containers rather than layout primitives. A `Form` groups
rows, a `Section` groups related rows with an optional header and footer, a `List` builds rows from
data, `NavigationStack` and `NavigationSplitView` own the app frame, `LabeledContent` pairs a label
with arbitrary content, and `ContentUnavailableView` owns the empty state. Controls are complete:
`TextField`, `Toggle`, `Picker` and `DatePicker` carry their label, and the container supplies the
row layout and accessibility traits. Cross-cutting values come from the environment; adaptivity
belongs to the container, not to the caller. Result builders (`ViewBuilder`) let `if`/`for` appear
inside content while staying type-checked.

What makes it work is not the syntax. It is that the framework owns the platform behavior, so one
declaration can produce structure, styling, labels and accessibility consistently. The limits are
the same mechanism: modifier order and automatic behavior can be opaque, and a view that needs an
unusual structure has to reproduce what the container was doing.

### shadcn/ui

shadcn/ui distributes source, not a runtime package. Its components are small accessible
primitives composed in the application, styled by design tokens. The form direction is instructive:
the older `Form` recipe needed a controller, a render prop and five coordinated parts; the current
`Field` family (`Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldSet`,
`FieldLegend`) wraps any control and owns the label, description, error and ARIA around it. Above
the parts, `blocks` are complete page compositions (dashboards, login, sidebar layouts) that a
project copies and adapts; a registry, an MCP server and `llms.txt` make them discoverable for
people and agents.

What makes it work is source ownership: the application can change any part, and Radix supplies the
accessible primitives underneath. That is also what does not transfer: meowtail is a package with
one implementation owner per position, not a copy-paste source collection, and its accessibility
comes from native elements and its own contracts rather than Radix.

### MyGo

MyGo is egoist's Go framework for desktop apps with a native UI or a web frontend. The product
already uses it as the Mac application shell (rossovia
`docs/records/2026-10-09-mygo-evaluation.md`). The user's observation is not about the API but about
the **floor**: native controls and framework defaults make an agent-written screen look acceptable
without design work. The reference application the user cites is sorrycc/mayoi; its repository or
screenshots could not be retrieved from this environment, so it remains a directional reference,
not a studied API.

Its `ui` package exposes declarative view-like elements (the package documents an `AspectRatio`
element, and elements carry platform-specific behavior), and complete applications such as a
terminal clone and desktop utilities are built with it. Its attraction is the same one that
motivates this document: a single language, a small obvious surface, and complete examples that
show a whole app instead of a component gallery.

The transferable lesson is the floor, not the native runtime. A component library can raise the
floor by shipping complete, already-finished compositions and templates; it should not copy native
control behavior or platform-owned styling. That is why this plan now treats the visual completeness
of `Page`, `Section`, `Form` and the templates as part of acceptance, not as a later polish step.

## What transfers and what does not

| Mechanism                              | Why it works there                                                              | What meowtail can take                                                                                       | What must not be copied                                     |
| -------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Semantic containers                    | The framework owns platform structure and behavior                              | Page, Section, Form and future overlay/data containers; roles, slots and heading depth                       | Native platform styling and hidden control behavior         |
| Complete controls                      | Label, control, validation and accessibility are one unit                       | `FormField` as the complete field; `Field`/`FieldGroup` as the composable primitive                          | Replacing app-specific flows with a generic control         |
| Composable field parts                 | Teams can adjust every part; primitives own accessibility                       | `Field` parts and ARIA centralization; a complete field on top                                               | Copy-paste source ownership and Radix/Tailwind dependencies |
| Blocks / templates                     | Copying a whole screen skips assembly                                           | A first-class template catalog in stories, docs and the agent index                                          | Shipping business pages as library components               |
| Registry / MCP / `llms.txt`            | Agents can discover and install complete units                                  | Templates and compositions in `llms.txt`/`agents.md`; the contract registry as the source of truth           | A second schema or a generated runtime catalog              |
| Environment / context                  | Cross-cutting values propagate without prop drilling                            | Section depth and page width context; theme root                                                             | Density switches or global per-component scaling            |
| State wrappers                         | SwiftUI separates data flow from view composition                               | Keep the value/state question separate (it is parked)                                                        | Hiding ownership inside the authoring layer                 |
| One obvious surface, complete examples | A small framework with whole-app examples is easy to start                      | Canonical templates and minimal entry points                                                                 | Native-runtime assumptions                                  |
| High default floor                     | Native controls and framework defaults make agent-written screens look finished | Complete compositions ship a finished default theme; templates are accepted visually, not only by line count | Native control behavior; platform-owned styling             |

The conclusion is not "make meowtail into SwiftUI" or "copy shadcn". It is that the leverage is in
semantic containers and complete controls, and the constraints are ownership and platform. The
authoring layer should take the container vocabulary, the complete field and the template catalog,
and leave out the framework-owned platform behavior, the copy-paste distribution and the hidden
state.

## What "simple" should mean

The target is not fewer characters for their own sake. An authoring surface is good when the
**minimum correct program** for a common screen is small: few names to discover, few nesting
decisions, no hand-written layout or ARIA wiring, and a default that is already usable. That is the
same criterion the [agent-era usage design](2026-10-20-agent-era-component-usage.md) applied to
forms, extended to the rest of the screen.

The system has four levers, and they are not equally expensive:

| Level | Lever                                                      | What it buys                                                              | Cost                                                                     |
| ----- | ---------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| L0    | Canonical templates in stories and docs                    | The agent copies a correct screen instead of inventing one                | Documentation only                                                       |
| L1    | Complete region compositions (page, section, form, dialog) | One element replaces a nesting tree and its wiring                        | New public components, theme parts and tests                             |
| L2    | A shared slot vocabulary and layout ownership              | Compositions are predictable and transferable; fewer per-screen decisions | Convention and review, no runtime                                        |
| L3    | Data-first screen descriptions (a finite screen schema)    | Very compact output for standard screens                                  | A second authoring model, schema maintenance, drift risk                 |
| L4    | A new syntax, DSL or MDX runtime for application UI        | The shortest possible output                                              | A parser/runtime this repository does not want; rejects the JSX contract |

The recommendation is **L0 + L1 + L2 now, L3 only if measurement shows the remaining cost is
structural data, L4 rejected**. The rest of this document specifies that slice.

## Container taxonomy

The references make the roles clearer. The authoring layer is a small set of containers, each with
one responsibility and the same slot vocabulary, plus complete controls inside them:

| Container role | Owner today                               | Slot shape                                                                   | Candidates                        |
| -------------- | ----------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------- |
| Page           | `Page` (new)                              | `title`, `description`, `actions`, `header`, `toolbar`, `notice`, `children` | first wave                        |
| Region         | `Section` (new)                           | `title`, `description`, `actions`, `footer`, `children`                      | first wave                        |
| Form           | `Form` + `FormField`                      | fields, `actions`, `errors`                                                  | separate track                    |
| Data           | `Table`, `ListGroup`                      | `label`, `columns`/`rows`, `toolbar`, empty/loading presentation             | `RecordSection` in wave two       |
| Overlay        | `Dialog` family                           | `open`, `title`, `description`, `actions`, `children`                        | complete dialog in wave two       |
| Navigation     | `PageFrame`, `RegionLayout`, `IconRail`   | navigation region + page                                                     | template only; no shell component |
| Feedback       | `EmptyState`, `Alert`, `SkeletonBoundary` | state + copy + action                                                        | `ContentRegion` in wave two       |

The table is a boundary as well as a plan: a new component must fit one row, take the shared slots,
and compose existing parts. A component that needs a new visual language or a business object is
not a container.

## Principles

1. **Semantic containers first.** A page, a region, a form and an overlay are the authoring units;
   layout primitives are the escape, not the default. This is the SwiftUI lesson that transfers.
2. **One element, one region.** A page, a section, a form, a dialog header/body/actions are regions
   with one owner. The caller supplies identity, content, actions and data.
3. **Structure as props, content as children.** Identity (`title`, `description`), actions and
   trailing regions are props; heterogeneous content stays JSX children. This keeps composition
   readable and keeps slots discoverable in types.
4. **Data for repeats, children for structure.** Homogeneous repeats (`items`, `options`,
   `columns`, `rows`, `fields`) are data arrays; page structure is children. Do not turn a page into
   one giant schema.
5. **One slot vocabulary.** The same role has the same name everywhere: `title`, `description`,
   `actions`, `children`, `footer`, `notice`. A predictable vocabulary transfers between
   compositions and cuts the per-component discovery cost.
6. **Compositions own rhythm and semantics, not looks.** Heading level, width, spacing and order
   come from the composition and the theme; colors, radii and type come from the theme only.
7. **Every composition is a thin arrangement of existing parts.** No second input, card or dialog
   look; the composition renders `PageFrame`, `Card`, `Field`, `Button` and so on. This is the
   `AssistantView` model.
8. **Escape hatches are explicit.** Every composition keeps the primitive path open: a `header`
   override, raw children, or dropping to `PageFrame`/`Card`/`Field` for a custom region.
9. **Generic only.** Page patterns that encode a business object stay applications or templates;
   the library gains generic regions, not a settings page or a billing page.
10. **Measure the minimum correct program.** The acceptance evidence is a before/after authoring
    benchmark, not a component count.

## First wave: page and section

The authoritative component list, grouping, consumers and order are in the
[authoring component catalog](2026-10-21-authoring-component-catalog.md). This document keeps the
reasoning behind the surface. The catalog's sequence wins if the two disagree; it follows the real
priority consumers (the documentation app, meowbook and meowpress) before the product migration.

### `Page`

A content-page composition for an existing page region. It renders `PageHeader`, a width-constrained
content container and the vertical section rhythm. It does not create a viewport or own scrolling:
the application shell (rail, bar, window) stays the host's, and `PageFrame` remains the primitive
for stand-alone frames, dialogs and region layouts.

```tsx
<Page
  title="Memory and knowledge"
  description="The active index for messages, saved files and Agent notes."
  actions={<Button variant="outline">Ask the Assistant to record</Button>}
  notice={<Alert tone="info">Read-only while the Assistant is preparing a record.</Alert>}
>
  <Section title="Recent">…</Section>
  <Section title="Saved">…</Section>
</Page>
```

| Prop          | Type                                | Behavior                                                                  |
| ------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| `title`       | `Child`                             | Page heading (h1). Required unless `header` is given.                     |
| `description` | `Child`                             | One line of purpose under the title.                                      |
| `actions`     | `Child`                             | Page-level actions, placed in the header.                                 |
| `header`      | `Child`                             | Escape hatch: replaces the whole header region (AppBar or custom chrome). |
| `toolbar`     | `Child`                             | Optional bar below the header, for filters or view controls.              |
| `notice`      | `Child`                             | Status row between the header and the content.                            |
| `width`       | `narrow \| content \| wide \| full` | Content width, default `content`.                                         |
| `children`    | `Child`                             | Page content, stacked with the page section rhythm.                       |

`Page` does not add a visual language. It arranges existing parts and lets the theme decide page
insets, header spacing and body rhythm. `PageFrame` stays public for application shells and
dialogs that need to own a viewport or a scroll region; the two are complementary, not competing.
The real product's pages are `PageHeader` + `Container` + `Stack` inside a custom shell, which is
exactly the region `Page` replaces.

### `Section`

One titled region inside a page or a card surface. It replaces the repeated
`<Stack><strong>heading</strong><span>copy</span>content</Stack>` and the hand-built Card header
composition.

```tsx
<Section
  title="Notifications"
  description="Choose how the project reaches you."
  actions={<Button variant="quiet" size="small">Reset</Button>}
  variant="card"
>
  <Form … />
</Section>
```

| Prop          | Type            | Behavior                                                                                |
| ------------- | --------------- | --------------------------------------------------------------------------------------- |
| `title`       | `Child`         | Section heading; optional only when the section is purely a grouping wrapper.           |
| `description` | `Child`         | Supporting copy under the heading.                                                      |
| `actions`     | `Child`         | Section-level actions on the heading row; wraps under the copy when narrow.             |
| `footer`      | `Child`         | Supporting note or actions after the content, matching the section footer role.         |
| `variant`     | `plain \| card` | `plain` is page rhythm; `card` uses the existing card surface as the section container. |
| `children`    | `Child`         | Section content.                                                                        |

The heading level is derived from context, not passed by the caller: a `Page` renders h1, a direct
`Section` renders h2, a nested `Section` renders h3. This is the same contextual approach
`Card` already uses for depth, and it removes a heading-level decision from every screen.

The `card` variant composes the existing `Card` parts instead of carrying a second card look. A
section can also be used outside `Page` (in a drawer, a dialog, or a pattern story); it then starts
at h2.

### `Modal` (wave two)

The complete dialog is now part of the approved direction, not a candidate: it is `Modal` in the
[catalog](2026-10-21-authoring-component-catalog.md). It takes a required `open` signal and an
`onOpenChange` callback, renders `title`/`description`/`actions`/children, and owns the native
dialog, `showModal`/`close`, Escape, backdrop handling, focus return and label ids. It composes the
existing `Dialog`/`DialogPanel`/`DialogHeader`/`DialogActions`; custom dialog interiors keep using
the primitives. The earlier idea of adding only `title`/`description`/`actions` props to
`DialogPanel` is dropped because `Modal` covers the standard case and the primitives already cover
the custom one.

### Form family

The [agent-era usage design](2026-10-20-agent-era-component-usage.md) already specifies `Form` and
`FormField` as the field-region composition. It is part of this authoring layer: forms stop being a
`Field`/`Input` assembly and become one `Form` with field elements. Its state model is still open
between the internal store and native `FormData`; that decision does not change the authoring
shape described here. The [catalog](2026-10-21-authoring-component-catalog.md) schedules it after
the documentation/workbench wave because those consumers do not need a form; the product migration
is the trigger to move it forward.

## Wave two candidates

The catalog fixes the order; these are the remaining design questions around that order.
`Modal` (the complete dialog) is approved and is described in the [catalog](2026-10-21-authoring-component-catalog.md);
it lands in wave two after the page/section slice.

- **`NavList` and the modal adoption.** The navigation list is the second authoring component for
  the docs sidebar and the meowbook catalog; `Modal` is the complete dialog. Both have a contract
  sketch in the catalog and need the same challenge before they ship.
- **Async region composition.** A region with `loading`, `empty` and `error` states plus content.
  It would compose `SkeletonBoundary`, `EmptyState` and `Alert`, which the product wires by hand on
  every list or detail region. The state facts stay the host's; the component only presents.
- **Application shell.** Not a component. The product builds its own shell from `IconRail`,
  `WindowTitleBar`, `Drawer` and `Status`, and the user has not seen a component library own this
  frame. A shell remains a template and an integration note, not a public component.
- **Record section.** A section with toolbar, table or list, empty state and selection. The data
  is already handled by `Table`; the value is the surrounding region. Wait for benchmark evidence.

None of these should be built until the first wave has been measured; adding them together would
create the variant surface this plan is trying to remove.

## Slot grammar

The vocabulary is part of the design, not an afterthought. New compositions use these names and
mean the same thing by them:

| Slot                          | Meaning                                                           | Typical content                    |
| ----------------------------- | ----------------------------------------------------------------- | ---------------------------------- |
| `title`                       | The region's name, rendered at the region's heading level         | text                               |
| `description`                 | One line of purpose or supporting copy                            | text                               |
| `eyebrow`                     | Optional small label above the title                              | text                               |
| `actions`                     | The primary actions for the region, grouped and wrapped together  | buttons, toolbar                   |
| `children`                    | The region's content                                              | arbitrary content                  |
| `footer`                      | A persistent region after the content                             | composer, action bar               |
| `notice`                      | A status row between identity and content                         | `Alert`                            |
| `toolbar`                     | Controls that apply to the whole region but are not page identity | filters, view switches             |
| `loading` / `empty` / `error` | Presentation for a region whose state is owned by the host        | slots, on region compositions only |

Two rules keep the vocabulary honest:

- A visual customization is not a slot. Colors, density and radii stay theme axes; a composition
  does not grow a `size`/`tone` prop just because one screen wanted it.
- If a composition cannot express a region with these slots, the answer is the primitive path, not
  another slot.

## Templates

Compositions remove structure; templates remove decisions. Templates ship in the consumer that owns
the page, not as library components, and each follows the same acceptance rule: authoring tier only,
no host CSS for layout, no local `Section`-like helper, no copied implementation, and a floor check
against the page it replaces.

The priority consumers, in order:

1. **Docs component page** — `Page` + `Section`, a live preview, install line, examples and the API
   reference; it replaces the docs app's local `PageTitle`/`Section` helpers and proves the floor.
2. **Docs package and home pages** — `Page`, `Section`, package cards and links.
3. **Docs example page** — preview and source with a caption.
4. **Meowbook workbench shell** — the catalog, preview stage, toolbar and observations; meowbook
   keeps owning its tool chrome, with `NavList` replacing the hand-built catalog navigation.
5. **Meowpress site pages** — home, list, post, about and skills pages; meowpress owns its theme,
   and whether it adopts meowtail at all is a package-boundary decision.
6. **Product screens** — conversation, settings modal, records catalog and reader, services list
   and detail, extensions/channels, profile, and the dialog set; these are the templates for the
   later product migration.

Templates live where their consumer lives: the docs templates in `apps/docs`, the workbench shell
in `meowbook`, the site pages in `meowpress`. Story-based examples in this repository remain the
gallery; the generated `llm.txt` and `agents.md` gain a template section that points at the
consumer pages, so an agent starts from a complete screen instead of searching the component list.
The template list is not a runtime registry and does not become a second catalog.

This is the shadcn `blocks` lesson adapted to a package: a complete screen is the unit a reader
copies, and discovery matters as much as the code.

## Syntax-level reductions

These are small but universal, and they should be verified rather than assumed:

- **Automatic JSX runtime.** MeowJSX already publishes `meowjsx/jsx-runtime`; consumers can set
  `"jsx": "react-jsx"` and `"jsxImportSource": "meowjsx"` and drop `import { h }` from every file.
  The repository's own classic transform still leaves 50 files importing `h`. Migrating the
  repository and documenting the consumer configuration is a separate, verifiable change; the
  templates should show the runtime the repository actually recommends.
- **Root import only.** The composition tier uses the existing root export. No `meowtail/layout`
  subpath and no second import site.
- **No new JSX helpers in the first wave.** `when`/`each` helpers or a data-flow DSL would add a
  second way to write conditionals and lists; the benchmark should show that the remaining cost is
  structural before any helper is considered.

## Measuring the result

The acceptance is an authoring benchmark plus a floor check, not an aesthetic score. The first
reference is the documentation app and the meowbook shell, because those are the priority
consumers; the product screens become the reference when their migration starts. Each template is
compared with the page it replaces, written with the current primitives and with the composition
tier.

| Metric                                                                     | Why it matters                                                        |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Distinct meowtail names imported                                           | discovery and API surface cost                                        |
| Non-content source lines                                                   | structural ceremony                                                   |
| Maximum JSX depth                                                          | nesting and review cost                                               |
| Explicit layout wrappers (`Stack`, `Container`, `PageFrame`, `Card` parts) | what the compositions absorbed                                        |
| Hand-written `htmlFor`/`id`/`aria-*` pairs                                 | wiring the composition is supposed to own                             |
| Decisions per screen (props set, variants chosen)                          | agent error surface                                                   |
| Host CSS or class names needed for layout                                  | whether defaults really finish the scene                              |
| Host CSS lines / classes removed from the template                         | the layout ownership the composition actually took                    |
| Visual floor                                                               | whether the template scene reads as finished without host design work |

The floor check is deliberately qualitative: open the template and the page it replaces at the
same viewport, theme and state (loading, empty, error, long content, narrow, dark), and compare
hierarchy, spacing, focus, status and action reachability. A template that saves lines but looks
like a bare component demo fails the check.

Reference points for the first benchmark: the docs app has local `PageTitle` and `Section` helpers
plus a docs-local preview/code/API-table set, and the meowbook shell builds its catalog and tree
navigation by hand. The later product benchmark has its own numbers (`PageHeader` in 8 places, 530
`className` uses, dialog wiring repeated in at least seven flows). The plan's success criterion is
a measured reduction on the code metrics **and** a template that passes the floor check for each
replaced page. No reduction number is promised before the benchmark runs.

## Staging

The [catalog](2026-10-21-authoring-component-catalog.md) is the authoritative sequence. This is the
same sequence in the language of this document:

1. **Wave 0: baseline.** Record the current docs pages and the meowbook shell as the benchmark:
   names, structural lines, depth, explicit layout wrappers, hand-written ARIA, decisions, host
   CSS, and a visual reference at 1440/390 in light and dark, including empty/loading/error states.
   Verify the automatic JSX runtime on a consumer fixture. This is not a product change.
2. **Wave 1: page and section.** `Page`, `Section`, the docs templates (component, package, home
   and example pages) and the `CodeBlock` title/caption enhancement. Adopt them in the
   documentation app, rebuild the benchmark pages and compare. An independent challenger checks
   the composition boundary before the contracts ship.
3. **Wave 2: navigation and modal.** `NavList` for the docs sidebar and the meowbook catalog, and
   `Modal` for the complete dialog, plus the workbench and site templates. Adopt them in docs and
   meowbook; each gets its own challenge and its own floor comparison.
4. **Wave 3: forms and deferred regions.** The Form family (`Form`, `FormField`, the `Field` live
   messages) when the product migration makes it the next real consumer; `ContentRegion` and
   `RecordSection` only if the post-migration benchmark still shows that wiring.
5. **Wave 4: decide L3.** If the benchmark still shows repeated structural data in the templates
   (for example a list region that is always the same five blocks), evaluate a finite data-first
   region schema. Do not build it speculatively.

Templates and docs ship with each wave, so an agent never has a composition that is not in the
canonical examples. Every wave is additive: no primitive is removed or renamed, no new package or
subpath is created, no theme token or visual scale is added, no JSON catalog entry is required, and
no release or version change is part of this proposal.

## Risks and counterexamples

- **Page and shell can fight.** `Page` is a content-page composition inside a host region; it
  must not grow a viewport, scroll owner or shell chrome, or it will conflict with the product's
  custom shell. `PageFrame` stays the primitive for frames, dialogs and region layouts; the docs
  must state the split. The real product is the counterexample to a full-screen `Page` by default.
- **Two ways to build a page.** `Page` and `PageFrame` will both exist. This is deliberate:
  `Page` is the content default; `PageFrame` is the frame escape. The README and the generated
  page must state which is the default, or the decision cost returns.
- **Composition bloat.** Each new composition is a new name and a new contract. The first wave is
  two components plus one additive prop set; every later wave needs benchmark evidence that the
  remaining ceremony is worth another name.
- **Section and Card can drift.** The `card` variant must compose the existing Card parts and the
  same tokens; it must not introduce a second card surface. A screenshot and a computed-style
  comparison belong in the review.
- **Heading levels can be wrong.** Context-derived levels need a reset at dialog/route boundaries,
  and a section used outside a page must still start at h2. This is testable without visual
  assertions.
- **State presentation can become business logic.** Loading, empty and error compositions present
  host facts; they must not fetch, infer or retry. The current `EmptyState`/`SkeletonBoundary`
  ownership rules already say this.
- **Templates can be copied blindly.** Templates must be small, content-driven and clearly owned by
  the application; a template is a starting point, not a page component in the library.
- **The benchmark can be gamed.** Line counts alone are meaningless; the scenes must stay
  behaviorally equal, use real content and be reviewed in the browser at wide and narrow sizes.
  The floor check is part of the benchmark, so a template that only saves lines fails.
- **The visual floor is theme work.** MyGo's high floor comes from native controls and platform
  defaults; meowtail's equivalent is the standard theme plus the composition's default layout.
  Adding `Page`/`Section` without finished theme rules will still produce a component demo. Plan
  the theme fragment and the visual review as part of the component, not as polish after it.
- **Private product screens must stay private.** The templates mirror the product's screens with
  fixed data and generic content; no product branding, business copy, network calls or private
  layout constants move into the library. The product can adopt the compositions later by its own
  change.
- **The dynamic UI layer already exists.** `dynamic-ui` is the product's finite runtime surface for
  model-generated UI. The authoring layer must not duplicate its protocol; if the two ever share
  components, that is an explicit product-side registration decision, not a library rewrite.
- **The complete dialog is a state decision, now approved as `Modal`.** It keeps the host's `open`
  signal and `onOpenChange` callback without the parked bind protocol, but the state ownership and
  the contract still need an explicit challenge before it ships.

## Open questions

- **Scope of "writing".** This plan covers application-side screen authoring. If the intended
  simplification is in component implementation (contracts, theme files, registry wiring), that is
  a different surface and needs its own plan.
- **`Page` or another name?** `Page` is the shortest description of "the complete page"; `PageFrame`
  and `PageHeader` already exist, so the docs must distinguish the three. Alternatives:
  `StandardPage`, `ContentPage`, `PageLayout`.
- **Which real screen is the first template?** The six are ordered from the product's routes and
  workshop scenes; settings, records and the conversation are the likely first three. The product
  owner should confirm the order before the benchmark is fixed.
- **Should the product's existing pages migrate, or only new screens use the compositions?** The
  templates can be validated in this repository first. Migrating `PageHeader` + `Container` +
  `Stack` pages in the product is a separate change with its own review and visual acceptance.
- **`Modal` contract details.** The complete dialog is approved and scheduled by the catalog; the
  remaining decisions are the name (`Modal` versus another), whether `open` is required, and
  whether the standard action row is a slot or a fixed composition. See the catalog's open
  decisions.
- **meowpress adoption.** The priority list includes meowpress, but it is currently independent of
  meowtail and owns its site theme. Keeping it template-only and adding meowtail as a peer are both
  coherent; the dependency decision belongs to that package.
- **Does `Section` cover cards, or is a one-shot card still needed?** The `card` variant is the
  proposal; if benchmark scenes still assemble card parts, revisit.
- **Are the SwiftUI and shadcn lessons applied at the right level?** This plan takes the semantic
  containers and the complete-field split, but not SwiftUI-style DSL or shadcn-style source
  ownership. If the product's authoring surface is closer to one of those references than to this
  reading, that changes the first wave.
- **What is the MyGo target?** Its repository shape is a directional reference only; a real snippet
  from the intended style is needed before copying its API or its examples.
- **Can we see Mayoi?** The reference application cited for the native floor is sorrycc/mayoi. Its
  source or screenshots were not retrievable here; a link or a screenshot would let us compare the
  floor case directly instead of taking the name as a direction.
- **How should the authoring layer relate to `dynamic-ui`?** The product's runtime surface has its
  own catalog and protocol. This plan does not touch it; if complete fields or page regions should
  also be available to model-generated surfaces, the product catalog decides when to register them.
- **Is data-first (L3) wanted?** If the product needs agents to emit runtime screen descriptions,
  that is a different problem from code generation and should be decided separately.
- **Should the repository migrate to the automatic JSX runtime?** It is an authoring improvement
  and a build-configuration change; consumers can adopt it independently, but the templates should
  match what the repository actually uses.

## Recommendation

Approve the [component catalog](2026-10-21-authoring-component-catalog.md) and start with its
wave 1: `Page`, `Section`, the `CodeBlock` title/caption enhancement, and the docs templates,
adopted in the documentation app and checked against the current pages with the floor criterion.
Then `NavList` and `Modal` in wave 2 and the meowbook adoption, the Form family in wave 3 when the
product migration makes it the next consumer, and the deferred regions only with evidence. Keep
the value/binding question parked, make no `AppShell` component, and keep meowpress a template
consumer until its dependency decision is made. The expected result is not a prettier spelling of
the same tree; it is that a standard page is built from regions instead of parts, ships at the
right visual floor, and the parts are still there when a page is genuinely custom.
