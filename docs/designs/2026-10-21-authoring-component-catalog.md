# Authoring component catalog

Status: proposal. This is the concrete list and grouping that follows from the
[authoring-surface design](2026-10-20-authoring-surface.md). That document keeps the reasoning and
the rejected alternatives; this one decides **which components to build, how they are grouped, who
uses them first, and in what order**.

Scope decisions carried in:

- First consumers are **meowbook, the documentation app and meowpress**; the private product's pages
  migrate later, as a separate change.
- The product's `dynamic-ui` runtime surface and the parked value/binding work are out of scope.
- Reuse comes first. A new component is added only where a real consumer repeats mechanical
  structure; business pages, shells and docs-only compositions are not moved into the library.

## What the references tell us to build

The reference toolkits are useful for the **shape of the catalog**, not for copying widgets:

- SwiftUI groups its surface into semantic containers (`Form`, `Section`, `List`,
  `NavigationSplitView`, `LabeledContent`) and complete controls (`TextField`, `Toggle`, `Picker`).
- shadcn/ui groups small accessible parts, complete `Field` parts, and complete page blocks; its
  registry makes the units discoverable.
- MyGo's `ui` package is a full widget toolkit: layout, navigation, controls, forms, overlays, data,
  content, feedback, plus a theme and accessibility bases. Mayoi is a complete native application
  built on it, and its high floor is the result of the toolkit's complete widget set and one
  cohesive theme ([MyGo](https://github.com/egoist/mygo), [Mayoi](https://github.com/sorrycc/mayoi)).

The comparison that matters: **meowtail already covers most MyGo widget categories.** Its layout,
controls, data display, content and feedback components are broad enough for the priority
consumers. The missing layer is the **authoring region** (page/section), the **complete modal**, a
**data-first navigation list**, the **form family** and a few content conveniences. This catalog
does not try to reach MyGo's widget count.

### Coverage map

| MyGo `ui` category                                                        | Meowtail today                                                                                                                                                         | Gap for the authoring layer                                   |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Layout (Column, Row, Box, Grid, Split, Scroll)                            | `Stack`, `Inline`, `Grid`, `Container`, `PageFrame`, `RegionLayout`, `LayoutItem`                                                                                      | none; keep as primitives                                      |
| Navigation (Sidebar, Breadcrumbs, Tabs, Segmented, Router)                | `IconRail`/`RailItem`, `NavItem`, `Breadcrumb`, `Tabs`, `SegmentedControl`                                                                                             | a data-first `NavList` for catalog/site navigation            |
| Controls (buttons, text inputs, select, checkbox, switch, slider, number) | `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `ChoiceGroup`, `ChoiceSelect`, `Checkbox`, `Switch`, `Slider`, `NumberInput`, `SegmentedControl`, `SearchInput` | none for the priority consumers                               |
| Forms (Form, Field, Fieldset, description/error)                          | `Field`, `FieldGroup`, and the field controls                                                                                                                          | `Form` + `FormField`; live description/error on `Field`       |
| Overlays (Modal, DialogBase, AlertDialog, Popover, Menu, Tooltip, Toast)  | `Dialog` family, `Drawer`, `Popover`, `HoverCard`, `Menu`, `ContextMenu`, `Tooltip`, `Toast`, `RiskConfirmation`                                                       | a complete `Modal`                                            |
| Data (List, Table, Tree)                                                  | `ListGroup`/`ListRow`, `Table`, `DescriptionList`, `Timeline`                                                                                                          | none now; `Tree` deferred                                     |
| Content (Text, RichText, Icon, Image, code)                               | `CodeBlock`, output blocks, `ImagePreview`, `Icon`, `Avatar`, `Badge`, `Tag`, `Pill`                                                                                   | `CodeBlock` title/caption enhancement                         |
| Feedback (Alert, Progress, Spinner, Meter, Toast)                         | `Alert`, `EmptyState`, `Progress`, `Spinner`, `SkeletonBoundary`, `Status`, `StatusDot`, `Toast`                                                                       | none now; `ContentRegion` deferred                            |
| Theme and accessibility                                                   | one theme assembly, tokens, native semantics, contracts                                                                                                                | the new compositions must use the same theme; no second scale |

The conclusion is a **short new list**, not a rewrite of the component library.

## Usage tiers

The groups below also define how the catalog is presented to authors:

- **Tier A — authoring compositions.** One element per page, region, form or overlay. The default
  path for an agent or a human writing a screen: `Page`, `Section`, `Form`/`FormField`, `Modal`,
  `NavList`, and the existing complete `AssistantView`/chat compositions.
- **Tier B — content and data components.** Used inside a Tier A region: `PageHeader` (inside
  `Page`; usually not used directly), `Card`/`ResourceCard`, `ListGroup`/`ListRow`, `Table`,
  `DescriptionList`, `Timeline`, `CodeBlock`, `Alert`, `EmptyState`, `Status`, `Badge`, `Tag`,
  `Avatar`, `Link`, and the output blocks.
- **Tier C — primitives and internals.** Escape hatches and shell pieces: layout primitives
  (`Stack`, `Inline`, `Grid`, `Container`, `LayoutItem`), compound parts (`CardHeader`, `CardTitle`,
  `DialogPanel`, `DialogHeader`), shell pieces (`IconRail`, `RailItem`, `AppBar`, `WindowTitleBar`,
  `Drawer`), `RegionLayout`, and the JSON/registry internals.

The documentation and the agent index lead with Tier A, describe Tier B next, and keep Tier C as
the advanced path. This is how the catalog reduces decisions without hiding capability.

## The list

### Group 1 — Page and regions

| Component                                                                       | Status          | Purpose                                                                                                                                                                      | First consumers           | Wave  |
| ------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----- |
| `Page`                                                                          | new             | Content-page composition: `PageHeader` (title/description/actions/eyebrow), optional toolbar, notice, width and vertical section rhythm. Does not own viewport or scrolling. | docs, product pages later | 1     |
| `Section`                                                                       | new             | Titled region: `title`/`description`/`actions`/`footer`/`children`, `plain` or `card` presentation, heading level from context.                                              | docs, product             | 1     |
| `PageHeader`, `Container`, `PageFrame`, `Stack`, `Inline`, `Grid`, `LayoutItem` | existing        | Primitives and frame; `PageFrame` stays for dialogs, app frames and region layouts.                                                                                          | all                       | reuse |
| `AppShell`                                                                      | not a component | The application shell stays host-owned; the product builds its own and component libraries do not normally ship one.                                                         | —                         | —     |

### Group 2 — Navigation

| Component                                                                                                                               | Status   | Purpose                                                                                                                                                                                                                                                                                      | First consumers                | Wave  |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----- |
| `NavList`                                                                                                                               | new      | Data-first navigation: groups of items with `id`, `label`, `href` or action, `icon`, `badge`, `active`, optional description. Renders `aria-current`, anchors for static sites and buttons for actions. The list owns grouping and active state; the host owns routing and search filtering. | docs sidebar, meowbook catalog | 2     |
| `NavItem`, `IconRail`, `RailItem`, `RailSection`, `Breadcrumb`, `Tabs`, `SegmentedControl`, `Menu`, `MenuButton`, `ContextMenu`, `Link` | existing | Navigation controls and app rail. `IconRail` remains the application rail; `NavList` is for content/site navigation.                                                                                                                                                                         | all                            | reuse |
| `Tree`, `CommandPalette`, `Pagination`, `Toc`                                                                                           | deferred | Only if a priority consumer needs them; docs and meowbook can build the first two from `NavList`/`ListGroup` and local search.                                                                                                                                                               | —                              | later |

### Group 3 — Forms and fields

| Component                                     | Status   | Purpose                                                                                                                                                                        | First consumers                                             | Wave  |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ----- |
| `Form`                                        | new      | Form region: values ownership, native validation, submit row, hidden/disabled handling. The state model (internal store versus native `FormData`) is decided in its own spike. | product settings/channel forms; docs only if a form appears | 3     |
| `FormField`                                   | new      | One complete field with the closed kind set; label, description, error, ARIA and value binding.                                                                                | same                                                        | 3     |
| `Field`                                       | enhance  | Live `description`, `error` and `invalid` (signals), keeping static behavior. Prerequisite for server-side errors.                                                             | same                                                        | 3     |
| `FieldGroup`, `Field`, and the input controls | existing | Field composition and controls; `Form`/`FormField` compose them.                                                                                                               | all                                                         | reuse |

The Form family is deliberately scheduled after the docs/workbench wave: the priority consumers do
not need it, and its state model is the open decision.

### Group 4 — Overlays

| Component                                                                                       | Status   | Purpose                                                                                                                                                                                                                                                                                                                      | First consumers                                              | Wave  |
| ----------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----- |
| `Modal`                                                                                         | new      | Complete dialog composition: required `open` signal + `onOpenChange`, `title`/`description`/`actions`/`children`; owns the native dialog, `showModal`/`close`, Escape, backdrop click, focus return, generated label/description ids and panel layout. Composes `Dialog` + `DialogPanel` + `DialogHeader` + `DialogActions`. | docs/meowbook where a modal is needed; product dialogs later | 2     |
| `Dialog`, `DialogPanel`, `DialogHeader`, `DialogActions`                                        | existing | Primitives for custom dialog layouts (the product's settings modal uses `Dialog` + `PageFrame` + `RegionLayout`). `Modal` composes them; custom layouts keep using them.                                                                                                                                                     | product, advanced hosts                                      | reuse |
| `Drawer`, `Popover`, `HoverCard`, `Tooltip`, `Toast`, `Menu`, `ContextMenu`, `RiskConfirmation` | existing | Other overlay patterns; no change.                                                                                                                                                                                                                                                                                           | all                                                          | reuse |

`Modal` is the complete simplified dialog the user asked for. It is not another visual style: it is
one composition over the existing dialog primitives.

### Group 5 — Data display

| Component                                                      | Status   | Purpose                                                                                                                                                                                                                                                | First consumers                 | Wave  |
| -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | ----- |
| `Table`, `ListGroup`, `ListRow`, `DescriptionList`, `Timeline` | existing | Data and record display.                                                                                                                                                                                                                               | docs API tables, records, lists | reuse |
| `RecordSection`, `ContentRegion`                               | deferred | A list region with toolbar/empty/loading, and an async region with loading/empty/error slots. Build only when a real consumer repeats that wiring; the product currently does, but the priority consumers are static or already own their tool chrome. | product later                   | later |
| `Tree`                                                         | deferred | File/outline trees for docs or presses; meowpress currently draws its skill tree locally.                                                                                                                                                              | —                               | later |

### Group 6 — Content and media

| Component                                                                                                                             | Status             | Purpose                                                                                                                                                                         | First consumers            | Wave  |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----- |
| `CodeBlock`                                                                                                                           | enhance            | Optional `title`, `caption` and `actions` around the existing code surface so docs and posts stop hand-building a header/caption. The copy/wrap behavior stays.                 | docs, meowpress if adopted | 1     |
| `CodeBlock`, output blocks, `ImagePreview`, `ImageLightbox`, `JsonBlock`/`JsonTree`, `Avatar`, `Badge`, `Tag`, `Pill`, `Link`, `Icon` | existing           | Content display.                                                                                                                                                                | docs, press, product       | reuse |
| `Prose`, `PreviewFrame`, `ExampleCard`, `InstallLine`, `ApiTable`                                                                     | not in the library | Article typography and docs page parts are consumer-owned (docs app/meowpress theme) or templates. `Prose` is deferred until the docs and press prose styles actually converge. | docs/press local           | —     |

### Group 7 — Feedback and status

| Component                                                                                                       | Status   | Purpose                                                                | First consumers      | Wave  |
| --------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- | -------------------- | ----- |
| `Alert`, `EmptyState`, `Spinner`, `SkeletonBoundary`, `Progress`, `Status`, `StatusDot`, `Toast`, `TextShimmer` | existing | Feedback and state presentation; `Page`/`Section` use them as content. | docs, press, product | reuse |

### Group 8 — Shell and layout primitives

| Component                                                                                                                                                                                             | Status          | Purpose                                                                      | First consumers | Wave  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------- | --------------- | ----- |
| `PageFrame`, `AppBar`, `WindowTitleBar`, `IconRail`, `RailItem`, `RailSection`, `Drawer`, `Toolbar`, `RegionLayout`, `Container`, `Stack`, `Inline`, `Grid`, `LayoutItem`, `Separator`, `AspectRatio` | existing        | Tier C. Shells and tools compose them; `Page`/`Section` do not replace them. | all             | reuse |
| `AppShell`                                                                                                                                                                                            | not a component | See Group 1.                                                                 | —               | —     |

### Group 9 — Templates

Templates are not components. They are stories and docs pages that use the authoring tier only
(no host CSS for layout, no local section helper, no copied implementation) and are accepted with a
visual floor check.

| Template                                                                                                                       | Status                                  | Consumers | Wave  |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | --------- | ----- |
| Docs component page (title, preview, install, examples, API reference)                                                         | new template                            | docs      | 1     |
| Docs package page and home/index page                                                                                          | new template                            | docs      | 1     |
| Docs example page                                                                                                              | new template                            | docs      | 1     |
| Workbench shell (catalog, preview stage, toolbar, observations)                                                                | template; meowbook owns its tool chrome | meowbook  | 2     |
| Site home, list, post, about, skills pages                                                                                     | template; meowpress owns its site theme | meowpress | 2     |
| Product screens: conversation, settings modal, records catalog, services list/detail, extensions/channels, profile, dialog set | template, migration later               | product   | later |

## Adoption order for the priority consumers

| Consumer  | First adoption                                                              | Notes                                                                                                                                                                                  |
| --------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docs      | `Page`, `Section`, `CodeBlock` title/caption, then `NavList` in the sidebar | It already has local `PageTitle`/`Section` helpers and a docs-local `Preview`/`CodeSample`/`ApiTable`/`InstallLine`; those stay local. It is the first visual-floor acceptance target. |
| meowbook  | `NavList` for the catalog; controls already reused                          | The workbench frame is a tool shell with its own dense CSS; no `Page`/`Section` requirement, no library shell.                                                                         |
| meowpress | Site templates first; dependency decision open                              | meowpress currently depends only on meowjsx/meowcss and owns its blog theme. Adding meowtail is a boundary change, not assumed here.                                                   |
| product   | `Page`, `Section`, `Modal`, `Form`/`FormField`                              | Migration comes later and separately; `dynamic-ui` stays product-owned.                                                                                                                |

## Priority and implementation order

1. **P0, wave 1 — docs first.** `Page`, `Section`, the docs component/package/home templates, and
   the `CodeBlock` title/caption enhancement. These let the documentation app drop its local
   `PageTitle`/`Section` helpers and prove the floor against the current site.
2. **P1, wave 2 — navigation and modal.** `NavList` (docs sidebar, meowbook catalog), `Modal`
   (complete dialog, approved), then adopt both in docs/meowbook and add the workbench/site
   templates.
3. **P2, wave 3 — product-driven.** `Form`, `FormField`, `Field` live updates; `ContentRegion` and
   `RecordSection` only if the product migration still needs them after the benchmark.
4. **P3 — deferred.** `Tree`, `Prose`, `Toc`, `Pagination`, `CommandPalette`, and any L3 screen
   schema. Do not start without a named consumer and evidence.

Each new component needs a story (plus a tall/composition scene where relevant), its generated docs
page, unit and type tests, a browser scene, and adoption by at least one priority consumer before
it is called done. The visual floor check compares the adopted page with the page it replaces at
the same viewport and theme, including narrow, dark, empty, loading and error states.

## The `Modal` contract

```ts
export interface ModalProps extends Props {
  /** Required; the host owns the state. */
  open: MaybeSignal<boolean>;
  /** Called on Escape, backdrop click, close button, or an imperative close. */
  onOpenChange: (open: boolean) => void;
  title: Child;
  description?: Child;
  actions?: Child;
  children: Child;
  /** Default true; false removes Escape/backdrop/close-button dismissal, e.g. while saving. */
  dismissible?: boolean;
  /** Accessible label for the default close button; default "Close". */
  closeLabel?: string;
  id?: string;
  className?: string;
}
```

It renders one native `<dialog>` and the existing panel/header/actions parts, generates the
`aria-labelledby`/`aria-describedby` ids, calls `showModal` when `open` turns true and `close` when
it turns false, returns focus to the opener, renders the standard close button when dismissible, and
runs `onOpenChange(false)` for Escape, backdrop and the close button. Actions are a bottom action
row; the host buttons call `onOpenChange(false)` themselves. The dialog width stays the standard
`Dialog`/`DialogPanel` width; a host that needs a different size uses the primitives or a class
override. `Modal` does not own the signal, business actions or custom layouts; a dialog that needs a
custom interior (the product's settings modal) keeps using the primitives.

The name is `Modal`: `Dialog` is the primitive and MyGo uses `Modal` for the same role. A later
rename is a separate, explicit decision.

## What is not on the list

- `AppShell`, business pages, docs-specific page parts, a generic schema-to-form engine, a runtime
  screen DSL, a second card/input/dialog visual language, and a full MyGo-style widget count.
- Value ownership, `bind` and per-component refs: parked until the authoring surface is in use.
- Component removals or renames: migration is separate and later.

## Open decisions

- **`Modal` name and contract details.** Resolved for the first slice: `Modal`, controlled `open`,
  `actions` as the host slot for the bottom row. Uncontrolled `defaultOpen`, a size prop or a default
  confirm action are later additions only with a consumer.
- **`NavList` name and shape.** Resolved: `NavList`, groups first, no nesting in the first slice; the
  host owns filtering. Adopted in the docs sidebar and the meowbook catalog.
- **meowpress dependency.** Resolved: keep meowpress independent. Its published contract is a
  content/site library with `meowjsx` + `meowcss` peers and its own blog theme; adding meowtail as a
  peer would couple a static-site package to the application UI theme and component registry for no
  current consumer. A future adoption needs a named consumer and a deliberate boundary change, not a
  template convenience. Consumer pages that want authoring components can pass them through
  `mdxComponents`; meowpress stays neutral.
- **Page width ownership.** Resolved during docs adoption: the host shell keeps the reading column and
  `Page` uses `width="full"` inside it, so there is no double inset and no fixed library width
  imposed on the consumer.
- **`CodeBlock` enhancement.** Resolved: title/caption/actions are in `CodeBlock`; the docs code
  host suppresses the interactive controls on its static pages and caps the content height locally.
- **Form schedule.** Kept at P2 because the priority consumers do not need it; if product migration
  starts first, move it to P1.

## Recommendation

Approve the catalog as the implementation plan: **five new authoring components** (`Page`,
`Section`, `NavList`, `Modal`, and the `Form`/`FormField` pair as one family), **one enhancement**
(`CodeBlock`), and the template set. Start with `Page`/`Section` in the docs app, then `NavList` and
`Modal`, and keep the library's additions small and grouped. This is closer to what the reference
products do than adding a widget for every need: a short catalog, one theme, and complete authoring
units on top of the components that already exist.
