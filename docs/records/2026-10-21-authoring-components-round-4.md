# Authoring components round 4: meowbook catalog adoption

Status: round 4 accepted. Source state: working tree at `HEAD 0973d8c23184` plus rounds 1–4
uncommitted changes, 2026-10-21. Nothing was committed, pushed, published or versioned; no library
source, package manifest, lockfile, private product repository or unrelated WIP was changed.

This round adopts the accepted `NavList` in the meowbook workbench catalog. The workbench frame,
canvas, measurement, appearance and observations stay meowbook-owned; only the catalog list and its
styles move to the component.

## Adopted component

`NavList` now renders the workbench catalog:

- `#catalog` is a scrolling `div`; the single navigation landmark comes from `NavList`
  (`aria-label="Component samples"`).
- The catalog is rebuilt from the manifest on search, selection and popstate; each state is a new
  `NavList` mount with groups in manifest order, component rows sorted as before, the current
  component as `activeId`, anchors to `?story=<id>&width=<width>`, the same story count and the same
  "No results for …" empty copy.
- A small mount helper in `gallery-shell.tsx` owns a long-lived catalog runtime and renderer,
  disposes the previous tree and renders into the existing container. There is no second shell
  runtime and the shell markup is otherwise unchanged.
- One delegated click handler on `#catalog` preserves the old behavior: a plain click selects the
  story, updates the URL, loads the canvas, closes the mobile catalog and focuses `#title`;
  modified clicks are left to the anchor.

## Files

Modified:

- `packages/meowbook/src/web/gallery-shell.tsx` — catalog runtime/renderer and exported
  `mountCatalog` helper; `#catalog` is now the container div.
- `packages/meowbook/src/web/gallery-entry.ts` — `showCatalog` builds `NavListGroup[]` data and
  calls the helper; delegated click handler; metadata group fallback for fixture stories; the
  pre-existing WIP `./canvas.html`, `./manifest.json` and `href="./"` lines are preserved verbatim.
- `packages/meowbook/src/web/gallery.styles.ts` — removed the hand-built `#catalog h2`/`#catalog a`
  rules (including current/hover/coarse states) and the unused group count; kept the scroll
  container, empty copy and all tool chrome.
- `packages/meowbook/tests/browser/gallery.spec.ts` — asserts the NavList landmark/parts, filtered
  remount with search focus, count, current row, empty state, URL/canvas/mobile-close/title-focus
  click behavior; the appearance test is unchanged.

No `packages/meowtail` source changed. Scope audit on the final tree shows only those four files
newer than the round start, plus the ignored artifacts.

## Checks

Final tree, run by the Lead after the verifier PASS:

| Check                      | Command                                                                                                     | Result                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Meowbook unit/lifecycle    | `bun test packages/meowbook/src/bun packages/meowbook/tests/unit packages/meowbook/tests/lifecycle.test.ts` | 32 pass, 0 fail, 183 expects |
| Meowbook types             | `tsc --noEmit -p packages/meowbook/tsconfig.json`                                                           | exit 0                       |
| Meowbook build             | `bun scripts/build.ts --package meowbook`                                                                   | exit 0                       |
| Meowbook browser specs     | `playwright test --config packages/meowbook/playwright.config.ts`                                           | 18 passed                    |
| Story registry             | `bun packages/meowbook/src/cli.ts check --config packages/meowtail/meowbook.config.ts --json`               | 136 stories                  |
| Format / lint              | `oxfmt --check` / `oxlint --deny-warnings` on the four files                                                | clean / 0 warnings           |
| Meowtail regression        | `cd packages/meowtail && bun test tests/unit`                                                               | 249 pass, 0 fail             |
| Meowtail types             | `tsc --noEmit -p packages/meowtail/tsconfig.json`                                                           | exit 0                       |
| Docs build / gallery check | `bun run --cwd apps/docs build` / `check`                                                                   | 146 site pages, 136 stories  |
| Language                   | Han sweep on the changed files                                                                              | clean                        |

The only invocation artifact: the package's documented `bun test src/bun tests` globs the Playwright
specs and prints non-test errors; the unit/lifecycle subset is green and the browser specs are run
by Playwright.

## Real browser observation and floor comparison

Baseline source and screenshots were captured before the change in
`artifacts/authoring-components/meowbook-adoption/{before-src,before}`. The verifier re-ran a real
gallery walk with the meowtail config (136 stories, 100 component rows, 10 groups) at 1440×900 and
390×844, light and dark.

- Catalog: exactly one labelled nav landmark, 100 anchors, 10 groups in manifest order, count 100;
  no page/console errors and no horizontal overflow at either width.
- Search "Code block" → 2 rows / `2 / 100`, focus stays in the search field after the remount;
  "zzzzzzzz" → 0 rows, exact empty message, `0 / 100`, no NavList root, focus stays; clearing
  restores 100 rows and the single current row. The same holds at 390 with the drawer open.
- Selected story: exactly one `aria-current="page"`; a plain click on a filtered row updates the URL
  (`?story=actions-matrix&width=fluid`), loads the canvas, closes the mobile catalog
  (`aria-expanded=false`, backdrop hidden, stage non-inert) and focuses `#title`. Modified clicks
  are not prevented (synthetic check; headless Chromium does not open real popups).
- Keyboard: Tab from the search field enters the first NavList row; Escape closes the drawer and
  focuses the toggle when open, or clears the search when closed.
- Workbench behavior unchanged: appearance persistence and dark switch, viewport resize,
  measurement values from a canvas click, text placeholders, backdrop close, stage inert, canvas
  load/reset and all 18 Playwright specs pass.
- Floor: rows 12px/18 → 14px/22 with minimum height 32 kept; group titles 11→12px and NavList group
  rhythm; long labels wrap instead of ellipsis (9 rows measure 54–76px; catalog scroll content
  grows ~10% inside its own scroller); current row keeps the primary-soft fill with weight 500 and
  the 2px left indicator removed; hover uses `uiTokens.hover`. Sidebar/header/stage geometry is
  identical to the baseline. The floor verdict is accepted and consistent with the accepted
  NavList design.
- Counterexamples: one-story fixture (1 group/1 row/count 1/one current; no-match → 0/1 + empty),
  real no-match, many groups (10), narrow 390 drawer, long labels; all clean.

## Independent verification

The verifier did not implement this round. Verdict: **PASS** (task-22), after the baseline,
real-config walk, counterexamples and full Playwright suite. Non-blocking notes recorded: the
baseline URL `?story=button` was already an invalid story before adoption (comparable but not a
selected-row state; selected state verified separately), the package test glob artifact, headless
modified-click popup limitation, and the current-row indicator/weight delta.

## Acceptance decision

Meowbook catalog adoption: **accepted**. The catalog is the accepted `NavList`, the workbench keeps
its own shell and behavior, and no library source changed.

Boundaries: the workbench catalog is a tool surface with its own chrome and live manifest; the
row type/rhythm follows the accepted component design, not the old hand-built rows. The dashboard,
report viewer and other meowbook surfaces were not part of this adoption.

## Remaining and next

- **Meowpress** site templates and the meowtail dependency decision remain the next consumer
  decision (the catalog says this is a boundary change, not assumed).
- The **Form family** waits for the product migration trigger; the private product, publishing and
  the parked value/binding work remain out of scope.
- All accepted components and both target consumers (docs, meowbook) are now in place; the goal
  remains active for the meowpress decision and any triggered Form work.
