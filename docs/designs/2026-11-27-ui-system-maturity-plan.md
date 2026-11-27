# UI system maturity plan

Status: proposed, 2026-11-27. Owner: Meowtail. Each phase that changes a public contract still
needs its own bounded challenger review before it starts; this plan sets the direction and the order.

## Why

Meowtail already has strong foundations: one token tree, named parts and style options for every
component, six themes over one rule set, a gallery with a story matrix, per-component docs pages,
a finite JSON catalog, an agent guide and installable skills. What it lacks is the thing that makes
shadcn/ui feel mature: every component answers the same questions the same way, so a reader or an
agent who has learned one component can predict the next.

A scan of the package on 2026-11-27 shows where that breaks:

| Symptom                                            | Evidence                                                                                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The same prop is typed differently per component.  | `disabled` is `MaybeSignal<boolean>` in 13 components and `boolean` in 18; `open` is live in 5 and static in 2.                                                                      |
| State reaches CSS under several names.             | `data-state` (17 places), `data-active` (16), `data-selected` (7), `data-expanded` (6), `data-open` (5).                                                                             |
| Interaction logic is re-implemented per component. | Arrow-key handling lives in 8 components (ChoiceSelect, Menu, Autocomplete, CommandPalette, Toolbar, TreeView, NumberInput, ChatComposer); a listbox with an active descendant in 3. |
| Polymorphism is added one prop at a time.          | `href` was added to Button, then Item, then Stat; `as` exists on others; neither is a rule.                                                                                          |
| The catalog is wide and flat.                      | 141 components; overlapping pairs (StatusDot and StateDot, Item and ListRow and ResourceLink, Badge and Tag and Pill) without a stated retirement path.                              |
| Coverage is uneven.                                | 91 stories for 141 components; about 29 components have no story of their own (Switch, Textarea, Timeline, MetaRow, ListGroup, JsonTree, …).                                         |
| Regressions reach the public site.                 | On 2026-11-27 the docs home action rendered black on black and every preview kept a fixed height; both came from global CSS meeting zero-specificity theme rules.                    |

None of these is a single bug. They come from the absence of a written component contract, a shared
behavior layer and a definition of done that every component is checked against.

## References and what to take from them

### shadcn/ui

What makes it feel mature is convention more than code:

- **One anatomy per component**: a root and named sub-parts (`data-slot`), state as `data-state`,
  variants as one `variants` object, `className` merged last. Readers learn the shape once.
- **Composition over configuration**: sub-components (`Card`, `CardHeader`, …) and `asChild`
  instead of growing prop lists.
- **Docs anatomy**: every page has Installation, Usage, Examples (each a real file), and API.
- **Blocks**: whole page compositions (dashboards, sidebars, auth) as copyable source.
- **Distribution as data**: `registry.json` items (components, blocks, themes, and since 2026 fonts),
  validated by `registry validate`, composed with `include`, served from GitHub, installed by a
  CLI, and exposed to agents through MCP.

What Meowland should not take: copy-pasted source as the way to get primitives. Meowland's rule is
one theme assembly and one render graph per runtime; vendoring a primitive into an app forks token
and part identity. Copyable source fits blocks and app compositions, which only use public exports.

### Vercel UI SDK (beta, November 2026)

The UI SDK is new, so take its ideas, not its packages:

- **Behaviors as a layer.** Keyboard navigation, focus, selection, popups and drag are separate
  helpers (`createRovingFocus`, `createTypeahead`, `createListbox`, `createPopup`,
  `createSelection`, `createFocusRecovery`, `announce`, …) that components combine. One fix to a
  behavior fixes every component that uses it.
- **One way to define a component**: `definePrimitive({ name, options, controlled, state, api,
  slots, agent })`, where slots carry their ARIA, events and data attributes. Bindings for five
  frameworks map slots to parts.
- **Testing as API**: `mount`, `keys`, `type`, `changes`, `announced`, plus `checkPattern(root,
  "listbox")` for ARIA pattern conformance, `checkServer` for SSR purity and `checkDirection` for
  RTL.
- **Agent operability at runtime**: `createAgent()` gives `snapshot()`, `query()` and `act()` over
  the mounted components, with permission hooks, `data-agent-confirm` / `-hidden` / `-secret`, and
  agent-made changes marked `source: "agent"`.

Its fit with Meowland is unusually good. A behavior is a function over state; MeowJSX setup runs
once and binds Signals, so a behavior can own Signals and return bindings without a hook model.
Meowtail parts already play the role of slots.

## Target architecture

Four layers, each depending only on the ones below it:

1. **Runtime and styling**: `meowjsx` and `meowcss`, unchanged.
2. **Behaviors** (new, `meowtail/behaviors`): headless helpers that own one interaction each:
   roving focus, typeahead, listbox with active descendant, popup and dismiss, focus recovery,
   selection, disclosure, keyboard shortcuts and live announcements. A behavior takes Signals and
   options and returns state Signals plus element bindings (attributes, events). It never renders
   and never paints.
3. **Components** (today's L0 elements and L1 patterns): parts, options and theme rules as today,
   with interaction coming from behaviors and every public surface following the component contract
   below.
4. **Compositions and blocks**: today's L2 compositions (Page, Assistant, ComposerPanel) plus a new
   block catalog: whole screens such as a workbench shell, a list-and-detail view or a settings page,
   built only from public exports and installable as source.

## The component contract (v1)

One document, checked by tests, that every exported component follows:

- **Values**: `value` / `defaultValue` / `onValueChange` for the main value; `open` /
  `defaultOpen` / `onOpenChange` for visibility; `checked`, `pressed`, `selected` and `expanded`
  follow the same triple. A passed prop is controlled for the mount; omitted, a local Signal owns
  it (the ownership rule the component model already states).
- **Liveness**: every prop that a host may change (`disabled`, `readOnly`, `open`, `value`, labels)
  is `MaybeSignal`; structural props (`items`, `triggers`, `columns`) are documented as fixed or
  accept a Signal and render with `keyed`.
- **State in the DOM**: one vocabulary on the carrier part: `data-state` (`open` / `closed`,
  `checked` / `unchecked` / `indeterminate`, `active` / `inactive`), plus `data-disabled`,
  `data-highlighted`, `data-selected`, `data-orientation` and `data-side`. Options stay
  `data-option-*`. Old names are removed in the same change that migrates a family.
- **Elements**: one polymorphism rule for actionable components: `href` renders a link, otherwise
  a button; containers take `as` from a fixed list. No other component grows its own `href`.
- **Copy**: user-visible strings come from one `labels` object per component with English
  defaults, ready for `meowjsx/i18n`.
- **Ids and ARIA**: generated ids only where an ARIA reference needs them; accessible names never
  depend on visible-only content.
- **Styling boundary**: theme rules stay zero-specificity, so host CSS must not reach library parts
  with element selectors. The docs and gallery follow a written host-CSS rule and an audit catches
  host selectors that match `[data-meowui-part]`.

A contract test walks `meowUIComponents`, renders each component's stories and checks prop types
(through the generated API data), state attributes and ARIA patterns. Violations become a tracked
list; the list must only shrink.

## Definition of done for a component

A component is **Stable** when it has:

1. A contract-clean API, documented with every prop's liveness.
2. Interaction from shared behaviors, with an ARIA pattern check where a pattern applies.
3. Stories covering its states (default, disabled, invalid, loading, empty, long content, RTL) that
   the story matrix renders in every theme, light and dark, wide and phone.
4. A docs page in a fixed order: Overview, Anatomy (parts), Usage, Examples, Keyboard,
   Accessibility, Theming (options and tokens), API, Agent notes.
5. A machine manifest entry (below) generated from source, never written by hand.

Components that miss any item are **Beta**; new or unproven ones are **Experimental**. The status
shows on the docs page and in the catalog, and the docs home shows the counts.

## Agent readiness

Meowland already writes for agents (agent guide, skills, `llms.txt`). The next steps:

- **Component manifest**: one generated JSON per release: name, status, parts, options, props with
  types and liveness, behaviors used, keyboard table and examples. It replaces hand-maintained
  catalog tables and feeds the docs, the skill and the JSON entry.
- **Docs and registry over MCP**: a small MCP server (or a static endpoint pair) that answers "which
  component does X", "show the API" and "give me block Y", in the spirit of the shadcn MCP.
- **Runtime bridge (experiment)**: a `snapshot` / `query` / `act` bridge over mounted components,
  built on the registry and behaviors, with permission hooks and `source: "agent"` on changes.
  Workcells is the natural first host: an agent operating its task UI.

## Distribution

- **Packages stay the source of truth** for runtime, styling, behaviors, components and themes.
- **Blocks ship as source** through a registry that follows the shadcn `registry.json` item shape
  (so existing tooling and agents can read it) and a `meowland add <block>` command. A block may
  import only public exports; the registry validator enforces that.
- **Theme presets** become registry items too: a token value set plus fonts, like Ottr and Pine.

## Phases

| Phase                  | Scope                                                                                                                                                                                                                                                                                                          | Exit criteria                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 0. Contract and audit  | Write the contract; build the contract test and the host-CSS audit; publish the violation list and component statuses. No behavior change.                                                                                                                                                                     | The test runs in CI; every component has a status; the list is in the docs.                                         |
| 1. Behaviors           | Run the `@ui-sdk/core` validation and record the decision; then extract listbox/active descendant (Autocomplete, ChoiceSelect, CommandPalette, ChatComposer), roving focus (Menu, Toolbar, Tabs, TreeView, SegmentedControl), typeahead and focus recovery; add the test kit with pattern, SSR and RTL checks. | No component keeps its own arrow-key loop; each migrated family passes its pattern check; browser suites unchanged. |
| 2. Contract migration  | Migrate families to the contract (values, liveness, `data-state`, polymorphism, `labels`), one family per change, breaking within alpha with a changelog entry each.                                                                                                                                           | The violation list is empty for Stable candidates.                                                                  |
| 3. Docs and coverage   | Fixed docs anatomy; stories for the ~29 uncovered components; status and coverage on the docs site.                                                                                                                                                                                                            | Every component page has every section; the story matrix covers every exported component.                           |
| 4. Catalog curation    | Decide each overlapping pair (StatusDot/StateDot, Item/ListRow/ResourceLink, Badge/Tag/Pill, AddButton): merge, keep with a stated difference, or retire.                                                                                                                                                      | No two components share a job without a written difference.                                                         |
| 5. Blocks and registry | Registry format, validator, `meowland add`, first blocks taken from real products (the Workcells workbench shell and list-and-detail, the docs shell).                                                                                                                                                         | A fresh app installs a block and passes its checks with only public imports.                                        |
| 6. Agent bridge        | Manifest, MCP endpoint, runtime bridge experiment in Workcells.                                                                                                                                                                                                                                                | An agent completes a scripted Workcells task through the bridge with permission hooks enforced.                     |

Phases 0 and 1 come first because every later phase depends on them: migration needs the contract
to aim at, and docs and blocks are only as consistent as the components under them.

## Validating `@ui-sdk/core`

Before Phase 1 extracts any behavior, a time-boxed validation (about three days) answers one
question: can Meowtail build its behavior layer on `@ui-sdk/core` instead of writing its own?

**Setup.** A throwaway branch adds `@ui-sdk/core` at an exact beta version and rebuilds two
existing components on it, without changing their public API, parts or theme rules:

- **ChoiceSelect** on `createListbox`, `createTypeahead` and `createPopup` (listbox with active
  option, typeahead, popup and dismiss), the densest keyboard model in the package.
- **Toolbar** on `createRovingFocus` (roving tab stop, orientation, Home and End).

**Criteria.** Every one must hold for adoption:

| Criterion            | How it is checked                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| One state model      | Behaviors read and write MeowJSX Signals through a thin adapter; no second store mirrors component state, and setup still runs once per mount.                                                   |
| No framework runtime | `@ui-sdk/core` adds no React, Vue, Svelte or Solid code to the bundle; the added size for the two components is measured and stays under 6 KB gzip.                                              |
| Behavior parity      | The existing unit and browser suites for both components pass unchanged, including the popover-select and toolbar specs, IME and pointer cases.                                                  |
| Pattern checks       | `checkPattern` from `@ui-sdk/core/testing` passes for `listbox` and `toolbar` on the rebuilt components, and the same check runs against today's implementation as a baseline.                   |
| Rendering targets    | Server rendering (`renderToHtml`) stays pure and RTL keyboard direction works (`checkServer`, `checkDirection`).                                                                                 |
| Shadow roots         | Active-descendant wiring keeps working where Meowtail resolves ids inside a shadow root today.                                                                                                   |
| Dependency risk      | License (Apache-2.0) and notices fit `THIRD_PARTY_NOTICES.md`; the beta's breaking changes since its first release are counted from its changelog; versions are pinned exactly while it is beta. |

**Outcomes.**

- **Adopt**: every criterion holds. Meowtail depends on `@ui-sdk/core` for behaviors through one
  internal adapter module, pins the version, and Phase 1 migrates the remaining families on it.
- **Adopt the test kit only**: behaviors fail a criterion but `@ui-sdk/core/testing` pattern,
  server and direction checks run cleanly against Meowtail. Use it as a dev dependency for tests
  and write the behaviors in Meowtail.
- **Write our own**: neither fits. Meowtail writes `meowtail/behaviors`, keeping the UI SDK's
  behavior names and option shapes so the two stay recognizable and a later switch stays cheap.

The validation result (decision, measurements, failing criteria) is recorded as a design record
next to this plan before Phase 1 continues, and the spike branch is discarded.

## Open decisions

- **Use `@ui-sdk/core` or write behaviors in Meowtail?** Decided by the validation below, which
  opens Phase 1; no behavior is extracted before its result is recorded.
- **How breaking can Phase 2 be?** All packages are alpha; the plan assumes breaking changes with
  changelog entries and no compatibility shims, matching the repository's practice.
- **Where blocks live**: in `meowtail` as a registry folder, or a separate `meowland-blocks`
  package. Decide in Phase 5 with the first two real blocks in hand.

## Non-goals

- Adopting React, Radix or Base UI. The references inform the design; MeowJSX stays the runtime.
- Copy-in distribution for primitives (it breaks theme and part identity).
- Visual redesign of the standard theme; this plan is about consistency, not a new look.
