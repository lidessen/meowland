# Authoring components round 2: NavList and Modal

Status: round 2 accepted. Source state: working tree at `HEAD 0973d8c23184` plus round 1 and round 2
uncommitted changes, 2026-10-21. Nothing was committed, pushed, published or versioned; no package
manifest, lockfile, private product repository or unrelated WIP was changed.

This receipt follows the [round 1 receipt](2026-10-21-authoring-components-round-1.md) and the
[authoring components implementation plan](../designs/2026-10-21-authoring-implementation-plan.md).
The component list is in the [component catalog](../designs/2026-10-21-authoring-component-catalog.md).

## Accepted components

| Component | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Evidence                                                                                                                                      | Verdict  |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `NavList` | Data-first site navigation: `label` nav landmark, mount-fixed groups, live `activeId` → `aria-current="page"`, items with `href` render anchors and items without render buttons calling `onSelect`, disabled anchors leave the tab order and activation, disabled buttons use native disabled. Parts root/group/groupTitle/list/item/icon/label/badge/meta/description; theme owns sidebar rhythm, group heading, hover/active/focus/disabled, icon/badge/meta and wrapping. | `artifacts/authoring-components/navlist/report.md`; 8 captures at 1440/390 light/dark plus interactive checks and probes.                     | accepted |
| `Modal`   | Complete native modal over the Dialog primitives: required `open` and `onOpenChange`, `title`, `description`, `actions` bottom row, `dismissible` default true, `closeLabel` default "Close", `id`/`className`/children. Owns `showModal`/`close` sync, Escape and backdrop dismissal, focus return, generated title/description ids and the default header close entry; the host owns the open signal and business actions. Theme is root `display: contents` only.          | `artifacts/authoring-components/modal/report.md`; 12 CLI captures (3 stories × 1440/390 light/dark) plus interactive browser runs and probes. | accepted |

## Implementation files

New:

- `packages/meowtail/src/components/nav-list.tsx`, `modal.tsx`
- `packages/meowtail/src/theme/components/nav-list.styles.ts`, `modal.styles.ts`
- `packages/meowtail/stories/nav-list.stories.tsx`, `modal.stories.tsx`
- `packages/meowtail/tests/unit/components/nav-list.test.tsx`, `modal.test.tsx`
- `packages/meowtail/tests/types/nav-list.types.tsx`, `modal.types.tsx`

Modified (Lead-owned shared integration, additive only):

- `packages/meowtail/src/components/index.ts`
- `packages/meowtail/src/registry/index.ts` (contract imports, `MeowUIComponent`, `meowUIComponents`,
  `ComponentRegistryMap`)
- `packages/meowtail/src/theme/index.ts` (fragment imports and `standardThemeStyles`)

The pre-existing worktree WIP (`.agents/README.md`, workflows, lockfiles, manifests,
meowbook/meowpress changes, `stories/preview.ts`, untracked `apps/docs` and meowpress pages) is other
owners' work and was not changed by this round.

## Checks

Final tree, run by the Lead after integration and after both implementers switched their story/type
imports to the public barrels:

| Check            | Command                                                                                       | Result                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Unit suite       | `cd packages/meowtail && bun test tests/unit`                                                 | 249 pass, 0 fail, 60 files, 1576 expects                                                           |
| Types            | `bun node_modules/typescript/bin/tsc --noEmit -p packages/meowtail/tsconfig.json`             | exit 0                                                                                             |
| Build            | `bun scripts/build.ts --package meowtail`                                                     | exit 0                                                                                             |
| Format           | `oxfmt --check` on the 13 round-2 files                                                       | all formatted                                                                                      |
| Lint             | `oxlint --deny-warnings` on the 13 files                                                      | 0 warnings, 0 errors                                                                               |
| Story registry   | `bun packages/meowbook/src/cli.ts check --config packages/meowtail/meowbook.config.ts --json` | 136 stories checked                                                                                |
| Docs integration | `bun run --cwd apps/docs build`                                                               | 146 site pages, 130 component pages (NavList and Modal included), 9 example pages, 6 package pages |

Component tests cover NavList grouping, links vs actions, live active state, disabled behavior and
long labels; Modal structure, generated ids, actions row, close entry, dismissible=false and
dismissal routing. The verifier added real-browser checks for the behavior the static renderer
cannot exercise.

## Real browser observation

Conditions: Chromium through the Meowbook canvas, 1440 and 390 widths, light and dark.

- **NavList** (`nav-list`, `nav-list-long-labels`): 8/8 scenes complete with no page/console errors
  and no horizontal overflow. Canonical story has 4 groups (section + optional id) with h2 group
  titles and ul/li items, 8 anchors and 2 action buttons, exactly one active row with
  `aria-current="page"` (live signal moved the active id without rebuilding rows), disabled anchor
  with `aria-disabled`/`tabindex="-1"`/activation prevented and disabled button native. `onSelect`
  fires on click and Enter for action rows; anchors navigate. Tab order is DOM order and skips
  disabled rows; the 2px focus ring is visible. A 76-character label wraps to five lines in a 220px
  sidebar, a 60-character unbroken identifier wraps, rows are 44px under coarse pointer, and the
  active/disabled colors come from tokens (light active `rgb(235,238,242)`, dark active
  `rgb(67,69,74)`). Icon centering over two-part rows was judged coherent against the row design.
- **Modal** (`modal`, `modal-long-body`, `modal-non-dismissible`): 12 CLI captures complete, no page
  errors; open states were exercised interactively. Wrapper `display: contents` plus one native
  `dialog:modal`; generated `aria-labelledby`/`aria-describedby` resolve to the visible heading and
  description; a header "Close" entry and bottom action row render; dialog is 380×263 at 1440 and
  342×263 at 390, centered over the token backdrop. Escape, backdrop click, header close and the
  host action all close the dialog and return focus to the trigger; focus starts in the dialog and
  stays trapped. The long-body story scrolls the panel body with a fixed header and reachable
  actions. `dismissible=false` removes the close entry and ignores Escape/backdrop; a host that
  ignores `onOpenChange` keeps the dialog open until it force-closes; mount-time `open` and a very
  long title also pass.

## Independent verification and fixes

Both components were verified by the verifier that did not implement them, on the integrated tree,
with real captures and interactive checks. NavList: **PASS**; Modal: **PASS**. There were no
blocking findings this round. The round-1 verifier caught a real narrow-width defect in CodeBlock;
round 2's verification instead surfaced non-blocking design notes, recorded below.

## Acceptance decisions

- `NavList`: **accepted** for the catalog scope. The data-first navigation contract, live active
  state, link/action semantics and the docs-sidebar-like states pass.
- `Modal`: **accepted** for the catalog scope. The complete dialog composition owns the native
  mechanics while the host owns the open signal and actions, and the real canvas behavior passes.
- Acceptance boundaries: this repository's source, Meowbook and docs build only; not a published
  package, installed-state consumer or the private product.

## Non-blocking observations and follow-ups

- NavList mixed icon/no-icon items do not share the label column (a sidebar with some icon rows and
  some plain rows has a ragged left edge). Group titles are always h2, which matters for a host page
  outline; the docs sidebar already uses h2 groups. Badges/metas center on multi-line label blocks.
  A 176px extreme long-label row centers the icon over the block rather than the first line. These
  are recorded for the docs/meowbook adoption, not acceptance blockers.
- NavList unit test still carries a stale "Lead-owned registry" comment from the pre-integration
  phase; harmless and worth cleaning in the adoption pass.
- Modal header close target stays 36×36 under coarse pointer because the existing 44px rule lives in
  the Dialog theme and targets action-row children; the fix, if wanted, belongs to the Dialog theme,
  not to Modal. The action row scrolls with a long body (per the plan/story wording); a fixed footer
  would be a separate design decision. Generated ids are mount-order based; the `id` prop names the
  transparent wrapper, as contracted.
- The docs/meowbook adoption is still pending: Page/Section/NavList/CodeBlock should replace the
  local page/section helpers and hand-built catalog navigation, with a floor comparison against the
  current pages. The Form family remains a later, product-triggered track.

## Next

Round 3 is the consumer adoption in the priority apps (docs first, then meowbook), followed by the
Form family when the product migration makes it the next real consumer. The private product
migration, package publishing and the parked value/binding work remain out of scope.
