# Authoring components implementation plan

Status: authoring components and docs/meowbook adoption accepted in
[rounds 1–4](../records/2026-10-21-authoring-components-round-4.md). The Form family remains
deferred until the product migration trigger. The meowpress dependency decision is resolved:
meowpress keeps its existing independent boundary, as recorded in the
[original authoring catalog](2026-10-21-authoring-component-catalog.md#open-decisions).

The [component catalog](../../packages/meowtail/COMPONENTS.md) owns the current component list,
grouping and status. This plan retains the implementation slices and acceptance method for the
original authoring additions and any remaining work; the original sequence is recorded in the
[authoring component catalog](2026-10-21-authoring-component-catalog.md).

## Goal

Implement the catalog's authoring components in meowtail, accept each one independently, then adopt
the accepted components in the priority consumers (docs, meowbook; meowpress only after its
dependency decision). The private product migration, release publishing and the parked value/bind
work are out of scope.

## Definition of done for one component

A component is accepted only when all of these hold:

1. **Contract**: props, parts, slots and accessibility match the catalog/design; static props say so
   in JSDoc; no host CSS is required for the default look.
2. **Implementation**: component file plus theme file use the existing contracts, tokens and
   primitives; no second visual language; no inline theme values.
3. **Integration**: exported from `src/components/index.ts`, registered in
   `src/registry/index.ts` (`meowUIComponents`, `MeowUIComponent`, the `ComponentRegistryMap`
   declaration) and included in `src/theme/index.ts`.
4. **Story**: a canonical story (and a second state story when relevant) exists and renders real
   content at desktop and narrow widths, in light and dark.
5. **Tests**: targeted unit tests and type cases pass; behavior covers slots, heading semantics,
   static/live props and any interaction the component owns.
6. **Browser observation**: the story is opened in the real Meowbook canvas (not just HTML output) at
   1440 and 390, light and dark; the observer records what was seen, including long content and
   focus/order where relevant.
7. **Independent acceptance**: a verifier who did not implement the component reviews the contract
   and code, runs the checks, tries counterexamples and writes a verdict. The Lead then records the
   acceptance. No self-approval.

A failing item reopens the component; "mostly done" is not accepted.

## Work model

- **Lead**: plan, shared-file integration in rounds where implementers do not own it, docs
  adoption, final acceptance records, cross-component consistency.
- **Implementers**: one component family per owner; write only the files in their task scope.
- **Verifier**: independent, read-only for source; may write evidence under
  `artifacts/authoring-components/`. Verifies one component at a time and reports pass/fail with
  commands and observations.
- **Shared files** (`src/components/index.ts`, `src/registry/index.ts`, `src/theme/index.ts`) have
  one writer per round. In round 1 the Page/Section implementer owns them; the CodeBlock
  implementer does not need them. Later rounds assign them explicitly.
- Do not touch unrelated WIP, `apps/showcase`, examples, package manifests, lockfiles or versions.
  Do not commit, push or publish as part of this plan.

## Rounds

| Round | Work                                                           | Concurrency                                            | Acceptance                                       |
| ----- | -------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| 1     | `Page`, `Section`, `CodeBlock` title/caption/actions           | Page+Section in one owner, CodeBlock in a second owner | verifier per component, then Lead record         |
| 2     | `NavList`, `Modal`                                             | two implementers, Lead integrates shared files         | verifier per component, then Lead record         |
| 3     | `Form`, `FormField`, `Field` live messages                     | one owner family                                       | verifier per component/family, product-triggered |
| 4     | docs/meowbook adoption, then meowpress site templates decision | Lead + implementer                                     | browser observation and consumer tests           |

Each round starts only after the previous round's components are accepted or explicitly deferred.

## Round 1 slices

### Page

Files:

- `packages/meowtail/src/components/page.tsx` (new)
- `packages/meowtail/src/theme/components/page.styles.ts` (new)
- `packages/meowtail/src/components/index.ts` (export)
- `packages/meowtail/src/registry/index.ts` (contract import, `meowUIComponents`, `MeowUIComponent`,
  registry map declaration)
- `packages/meowtail/src/theme/index.ts` (fragment import and `standardThemeStyles`)
- `packages/meowtail/stories/page.stories.tsx` (new)
- `packages/meowtail/tests/unit/components/page.test.tsx` (new)
- `packages/meowtail/tests/types/page.types.tsx` (new)

Contract:

- Name `page`; parts `root`, `header`, `eyebrow`, `toolbar`, `notice`, `content`.
- Props: `title: Child`, `description?: Child`, `eyebrow?: Child`, `actions?: Child`,
  `header?: Child` (escape: replaces the identity block), `toolbar?: Child`, `notice?: Child`,
  `width?: "narrow" | "content" | "wide" | "full"` (default `content`), `children: Child`,
  `className?: string`.
- Renders a content page inside an existing host shell: `root` > `Container width` > `header`
  (`eyebrow` + `PageHeader`), `toolbar`, `notice`, `content`. It does not create a viewport, own
  scrolling or render `PageFrame`.
- Provides the section-level context with value `1`; `PageHeader` renders the h1.
- The theme owns page content rhythm (`spaceSection` between sections), header spacing, eyebrow
  typography, toolbar/notice spacing and the content width relationship. No host CSS.

### Section

Files:

- `packages/meowtail/src/components/section.tsx` (new)
- `packages/meowtail/src/theme/components/section.styles.ts` (new)
- the same five integration files as `Page` (export, registry, theme index)
- `packages/meowtail/stories/section.stories.tsx` (new)
- `packages/meowtail/tests/unit/components/section.test.tsx` (new)
- `packages/meowtail/tests/types/section.types.tsx` (new)

Contract:

- Name `section`; parts `root`, `header`, `title`, `description`, `actions`, `content`, `footer`.
- Props: `title?: Child`, `description?: Child`, `actions?: Child`, `footer?: Child`,
  `variant?: "plain" | "card"` (default `plain`), `children: Child`, `className?: string`.
- Heading level from context: a direct `Section` under `Page` renders h2, a nested `Section` h3, a
  standalone `Section` starts at h2. `Page` provides 1; each `Section` provides its own level + 1.
- The header is rendered when title, description or actions exist; `title` is optional only for a
  grouping wrapper. The title element carries the heading level; description is supporting text,
  actions sit on the heading row and wrap.
- `card` variant is the plain section wrapped in the existing `Card variant="surface"`; the
  section root keeps a `data-variant="card"` marker so the theme can add the surface padding. This
  keeps one card visual owner (the Card component) and one card-style token set.
- The theme owns internal content gap (`spaceGroup`), header action wrapping, footer typography and
  the card padding. No host CSS.

### CodeBlock enhancement

Files:

- `packages/meowtail/src/components/code-block.tsx` (edit)
- `packages/meowtail/src/theme/components/code-block.styles.ts` (edit)
- `packages/meowtail/stories/code-block.stories.tsx` (edit/add scenario)
- `packages/meowtail/tests/unit/components/code-block.test.tsx` (extend)
- `packages/meowtail/tests/types/code-block.types.tsx` (new)

Contract additions, all optional and backward compatible:

- `title?: MaybeSignal<Child>` — the code surface's name (file name, example title).
- `caption?: MaybeSignal<Child>` — a quiet supporting line (path, note).
- `actions?: MaybeSignal<Child>` — host actions placed before the built-in wrap/copy actions.
- New contract parts `title` and `caption` in the header; the language label, wrap and copy behavior
  stay. The header renders title/caption only when provided; the existing story remains unchanged.

## Round 2 slices

Round 2 starts after round 1 is accepted. The two components are independent and run in parallel;
the Lead owns the shared barrel integration so the two implementers never edit the same files.

### NavList

Files (implementer):

- `packages/meowtail/src/components/nav-list.tsx` (new)
- `packages/meowtail/src/theme/components/nav-list.styles.ts` (new)
- `packages/meowtail/stories/nav-list.stories.tsx` (new)
- `packages/meowtail/tests/unit/components/nav-list.test.tsx` (new)
- `packages/meowtail/tests/types/nav-list.types.tsx` (new)

Contract:

- Name `nav-list`; parts `root`, `group`, `groupTitle`, `list`, `item`, `icon`, `label`,
  `badge`, `meta`, `description`.
- `NavListItem`: `id`, `label: Child`, `href?: string`, `icon?: Child`, `badge?: Child`,
  `meta?: Child`, `description?: Child`, `disabled?: boolean`.
- `NavListGroup`: `id?: string`, `label?: Child`, `items: readonly NavListItem[]`.
- `NavListProps`: `label: string` (the navigation landmark name), `groups: readonly NavListGroup[]`
  (fixed for the mount), `activeId?: MaybeSignal<string>`, `onSelect?: (item: NavListItem) => void`,
  `className?: string`.
- Root is `<nav aria-label={label}>`; each group is a section with an optional group title and a
  list. An item with `href` renders an anchor; an item without `href` renders a button and calls
  `onSelect`. `activeId` sets `aria-current="page"`. Disabled anchors are removed from the tab
  order and ignore activation; disabled buttons use the native `disabled` attribute. The component
  owns grouping, active state and link/button semantics; routing and search filtering stay with the
  host.
- The theme owns the sidebar rhythm, group heading, row height/hover/focus/active, icon sizing,
  badge/meta alignment, description wrapping and disabled state, using tokens only.

Story: docs-like navigation (groups, links, icons, badges, active item) plus a long-label/wrapping
state. Tests: groups and items render, anchor vs button, `onSelect`, `aria-current`, disabled
anchor/button, long labels in static HTML; type fixture for groups/items/`activeId`/`onSelect`.

### Modal

Files (implementer):

- `packages/meowtail/src/components/modal.tsx` (new)
- `packages/meowtail/src/theme/components/modal.styles.ts` (new; root `display: contents` only,
  no second dialog look)
- `packages/meowtail/stories/modal.stories.tsx` (new)
- `packages/meowtail/tests/unit/components/modal.test.tsx` (new)
- `packages/meowtail/tests/types/modal.types.tsx` (new)

Contract:

- Name `modal`; parts `root`.
- `ModalProps`: `open: MaybeSignal<boolean>` required, `onOpenChange: (open: boolean) => void`
  required, `title: Child`, `description?: Child`, `actions?: Child` (bottom action row),
  `dismissible?: boolean` default true, `closeLabel?: string` default "Close", `id?: string`,
  `className?: string`, `children: Child`.
- Renders one wrapper root and one native `<dialog>` through the existing `Dialog` primitive, with
  `DialogPanel`, `DialogHeader` and, when actions are given, `DialogActions`. The `Modal` generates
  `${baseId}-title`/`${baseId}-description` ids and wires `aria-labelledby`/`aria-describedby`.
- Owns the native mechanics: `showModal` when `open` becomes true, `close` when it becomes false,
  `close`/`cancel` events, Escape (when dismissible), backdrop click (when dismissible), focus
  return to the opener, the default close button in the header, and calling
  `onOpenChange(false)` for those dismissals. It does not own the open signal, business actions or
  custom interiors; the `Dialog` primitives remain for those.
- The theme only makes the wrapper transparent to layout (`display: contents`); the dialog look is
  the existing Dialog/DialogPanel/Header/Actions theme. No size prop in the first slice; a host that
  needs another width uses the primitives or a class override.

Story: interactive trigger button + Modal with title, description, body and two actions; a second
story with long body content for scrolling. Tests: static structure (dialog, label ids, header,
description, actions, close button, children, dismissible false hides the close entry), live `open`
signal rendering and type fixture; the native open/close/focus behavior is covered by the real
browser verification because the static renderer cannot exercise `showModal`.

### Integration and verification

- The Lead owns the shared integration for both components in
  `src/components/index.ts`, `src/registry/index.ts` and `src/theme/index.ts`, then rebuilds
  `packages/meowtail/dist` so stories resolve the new exports.
- Implementers run direct unit tests (`import` from the component file) and package tsc while their
  components are not yet exported; after the Lead announces integration, they run the story check
  and their browser smoke test.
- Verification tasks: NavList and Modal each get an independent verifier pass. For NavList the
  verifier checks long labels, anchor/button semantics, disabled, active state, keyboard order and
  real captures; for Modal it opens the real canvas, checks showModal/close, Escape, backdrop,
  close button, focus return, body scrolling, narrow width, dark theme and the dismissible=false
  path.
- The round-2 receipt follows the round-1 pattern: files, commands, captures, fixes, verdicts and
  boundaries, then the progress table updates.

## Round 3 slices

Round 3 is consumer adoption. The accepted components replace the docs app's local composition
helpers and hand-built catalog navigation; the docs app is untracked WIP, so edits stay inside
`apps/docs` and preserve the existing site content and build.

### Docs adoption

Files (implementer, in `apps/docs`):

- `pages.tsx`: wrap every page body in `Page` with its title/description/eyebrow, and replace the
  local section helper calls with the library `Section` (`title`/`description`).
- `parts.tsx`: remove `PageTitle` and the local `Section`; keep `Preview`, `InstallLine`,
  `StyleAxesTable`, `PartList`, `Note`, `StoryExample` as docs-local compositions; reimplement
  `CodeSample` on the library `CodeBlock` with the file/location as title/caption.
- `document.tsx`: replace the hand-built catalog `<nav>` and `.docs-catalog-group` markup with one
  `NavList` (label "Documentation", groups Overview/Packages/catalog groups, active id from the
  current path); adapt the in-page catalog filter script to the `NavList` DOM; keep the search
  field, count, empty state and brand.
- `theme.ts`: remove the CSS that implemented the replaced helpers and nav rows
  (`docs-eyebrow`, `docs-section`, `docs-section-title`, `docs-catalog-group*`,
  `docs-code-panel`/`docs-code-head`/`docs-code`/`docs-code-caption`), while keeping the docs
  shell layout, sidebar width, header, reading-column width, preview frames and component
  descriptions that are genuinely host concerns. Record what remains and why.
- `tests/document.test.ts` and any docs tests affected by the new DOM.
- Update `apps/docs/README.md` or the adoption note only if the existing text describes the removed
  helpers; do not rewrite unrelated docs.

Constraints: `Page` is content-only inside the existing `<article>`; choose a width that keeps the
current reading column (the article max width stays a host decision). The docs app owns routing,
search filtering and content; no library source changes in this round. Baseline evidence is the
pre-adoption build copied to `artifacts/authoring-components/docs-adoption/before-dist`; after the
build, compare the home, component, package and example pages at 1440/390 light/dark and report the
floor differences (type, spacing, nav rhythm, code panel) with screenshots.
Run `bun test apps/docs/tests`, `bun run --cwd apps/docs build`, `bun run --cwd apps/docs check` and
the format/lint checks on changed files.

### Meowbook adoption (round 4)

The catalog is rebuilt from manifest data on search and active changes, so `NavList` needs a small
mount/remount wrapper around the live catalog rather than a static JSX subtree. Planned scope:

- `packages/meowbook/src/web/gallery-shell.tsx`: export a catalog mount helper that owns a
  MeowJSX runtime/renderer for the catalog and renders `NavList` into the existing `#catalog`
  container; keep the workbench frame, controls and CSS ownership unchanged.
- `packages/meowbook/src/web/gallery-entry.ts`: on manifest load, search input and active story
  changes, rebuild the catalog data (group order, component entries, current story) and mount or
  remount the `NavList`; preserve the `./manifest.json`/`./canvas.html` path WIP in the file, the
  current-story behavior, keyboard focus handling and the catalog close flow.
- `packages/meowbook/src/web/styles` (or the gallery stylesheet): remove the hand-built `#catalog`
  row/group rules that `NavList` now owns; keep the sidebar rail, search, label, scroll container,
  backdrop and responsive rules as tool chrome.
- Tests/checks: Meowbook gallery/unit tests, the gallery build, `bun packages/meowbook/src/cli.ts
  check --config packages/meowtail/meowbook.config.ts`, and a real browser walk (search filters the
  catalog, current story marked, keyboard navigation, narrow sidebar, no page errors).
- Verification: independent verifier compares the workbench before/after at 1440/390 light/dark,
  confirms no regression in canvas/measurement/toolbar behavior, and records pass/fail under
  `artifacts/authoring-components/meowbook-adoption/`.

Do not change the Meowtail library source in this round; if the live catalog needs a component
change, report it before proceeding.

## Check commands

Use the repository's own tools:

- Unit: `bun test packages/meowtail/tests/unit/components/<name>.test.tsx`
- Types: `bun node_modules/typescript/bin/tsc --noEmit -p packages/meowtail/tsconfig.json`
- Format: `bun node_modules/oxfmt/bin/oxfmt --write <changed paths>` then `--check <changed paths>`
- Lint: `bun node_modules/oxlint/bin/oxlint --deny-warnings <changed paths>`
- Story registry/build: the docs build (`bun run --cwd apps/docs build`) after Page/Section
  integration, or the Meowbook config check where available.
- Browser: Meowbook Playwright config in `packages/meowtail/playwright.config.ts`; for a single
  scene, run the server and capture the canvas with a short Playwright script. Record viewport,
  scheme and states.

A full `bun run check` and a build are run by the Lead at the end of a round, not by every
implementer for every save.

## Evidence and records

- Implementation reports: message from the implementer with files, commands and observed results.
- Verification: `artifacts/authoring-components/<component>/report.md` plus screenshots or command
  logs; artifacts are ignored by Git.
- Acceptance: after a component passes, add a short row to the progress table below and, at the end
  of a round, write a receipt under `docs/records/2026-10-21-authoring-components-round-1.md` with
  the exact source state, checks and acceptance boundaries.

## Progress

| Component               | Implementation                        | Independent verification                        | Acceptance                                                                                                            |
| ----------------------- | ------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Page                    | done                                  | PASS (task-4 + task-10 re-verification)         | accepted in [round 1 receipt](../records/2026-10-21-authoring-components-round-1.md)                                  |
| Section                 | done                                  | PASS (task-5 + task-10 re-verification)         | accepted in [round 1 receipt](../records/2026-10-21-authoring-components-round-1.md)                                  |
| CodeBlock title/caption | done (including narrow fix)           | PASS (task-3 fail → task-9 re-verification)     | accepted in [round 1 receipt](../records/2026-10-21-authoring-components-round-1.md)                                  |
| NavList                 | done                                  | PASS (task-14)                                  | accepted in [round 2 receipt](../records/2026-10-21-authoring-components-round-2.md)                                  |
| Modal                   | done                                  | PASS (task-15)                                  | accepted in [round 2 receipt](../records/2026-10-21-authoring-components-round-2.md)                                  |
| Docs adoption           | done (Page/Section/NavList/CodeBlock) | PASS after fix (task-18 fail → re-verification) | accepted in [round 3 receipt](../records/2026-10-21-authoring-components-round-3.md)                                  |
| Meowbook adoption       | done (NavList catalog)                | PASS (task-22)                                  | accepted in [round 4 receipt](../records/2026-10-21-authoring-components-round-4.md)                                  |
| Meowpress decision      | done (stay independent)               | boundary decision; no mechanism change          | accepted Lead decision, [catalog open decisions](../designs/2026-10-21-authoring-component-catalog.md#open-decisions) |
| Form family             | pending (later)                       | pending                                         | pending                                                                                                               |

Round 1 closed on 2026-10-21 at `HEAD 0973d8c23184` plus the uncommitted round changes. Round 2
closed on the same base after the shared integration; the
[round 2 receipt](../records/2026-10-21-authoring-components-round-2.md) records NavList and Modal,
their checks, browser observations and boundaries. Round 3 closed the docs adoption; the
[round 3 receipt](../records/2026-10-21-authoring-components-round-3.md) records the static-host
CodeBlock containment, the eyebrow/floor fixes and the before/after evidence. Round 4 closed the
meowbook catalog adoption; the
[round 4 receipt](../records/2026-10-21-authoring-components-round-4.md) records the NavList
catalog, the preserved workbench behavior and the before/after floor evidence. Round 5 closed the
meowpress boundary decision: meowpress stays independent of meowtail; a future adoption needs a
named consumer and a deliberate theme/registry decision. The Form family remains the only pending
catalog item and waits for the product migration trigger; no component is accepted without its own
independent verdict and Lead gate.

## Risks and boundaries

- The docs app is untracked WIP; adoption must be a separate, scoped edit after the components are
  accepted, and must not rewrite unrelated docs work.
- `Section` card variant must not become a second card surface; if wrapping `Card` makes the DOM or
  theme unworkable, stop and return to the design rather than inventing a parallel card style.
- Page width and the host shell must not double-inset; the docs adoption chooses the width that
  matches the existing article column.
- The browser observation is required; passing unit tests is not acceptance.
- No package version, lockfile, release, product repository or parked value/binding change is part
  of this plan.
