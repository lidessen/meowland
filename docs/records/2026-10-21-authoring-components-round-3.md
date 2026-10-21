# Authoring components round 3: docs adoption

Status: round 3 accepted. Source state: working tree at `HEAD 0973d8c23184` plus rounds 1–3
uncommitted changes, 2026-10-21. Nothing was committed, pushed, published or versioned; no library
source, package manifest, lockfile, private product repository or unrelated WIP was changed.

The docs app is untracked WIP owned by the docs track; this round edits only the scoped `apps/docs`
files and keeps the site content, build and gallery same.

## Adopted components

The docs site now uses the accepted authoring components instead of local reimplementations:

| Component   | Adoption                                                                                                                                                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Page`      | Every page body is a `Page` with title/description and, on home only, the Meowland eyebrow; width `full` inside the host article so the 1040px/358px reading column stays a host decision with no double inset.                                                                                                                       |
| `Section`   | The local `PageTitle` and `Section` helpers are gone; every page section is the library `Section` with title/description, and heading levels come from Page/Section context.                                                                                                                                                          |
| `NavList`   | The sidebar catalog is one `NavList` landmark labelled "Documentation" with Overview, Packages and the catalog groups; item ids are site paths, `activeId` is the current path, all rows are anchors. The in-page filter now hides NavList groups and the list item around each row; search, count, empty message and shell are kept. |
| `CodeBlock` | The local custom code panel is gone; `CodeSample` is the library `CodeBlock` with the repo-relative file as title, `line N` as caption and the extension as language.                                                                                                                                                                 |

## Files

Modified (docs only):

- `apps/docs/pages.tsx` — Page/Section adoption across home, package, component and example pages.
- `apps/docs/parts.tsx` — removed `PageTitle`, local `Section` and unused `Marks`; `CodeSample` is
  `CodeBlock`; `StoryExample` passes source file/line.
- `apps/docs/document.tsx` — NavList sidebar and filter script against the NavList DOM.
- `apps/docs/theme.ts` — removed the dead helper/nav/code CSS; kept the shell, reading column,
  preview frames, header/breadcrumb, docs-local compositions and docs typography; added the
  static-host CodeBlock containment (actions hidden, content capped at 420px) with a comment.
- `apps/docs/tests/document.test.ts` — current-page assertion moved to NavList; nav landmark/group,
  filter-vs-NavList-DOM, Page/Section/CodeBlock part and home/non-home eyebrow assertions.

No `packages/**` source changed in this round.

## Checks

Run on the final tree by the Lead after the fix and by the verifier independently:

| Check               | Command                                                                   | Result                                                           |
| ------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Docs tests          | `bun test apps/docs/tests`                                                | 27 pass, 0 fail, 85 expects                                      |
| Docs types          | `bun node_modules/typescript/bin/tsc --noEmit -p apps/docs/tsconfig.json` | exit 0                                                           |
| Docs build          | `bun run --cwd apps/docs build`                                           | 146 site pages (130 component, 9 example, 6 package) + galleries |
| Docs gallery check  | `bun run --cwd apps/docs check`                                           | 136 stories                                                      |
| Format / lint       | `oxfmt --check` / `oxlint --deny-warnings` on the five files              | clean / 0 warnings                                               |
| Meowtail regression | `cd packages/meowtail && bun test tests/unit`                             | 249 pass, 0 fail                                                 |
| Meowtail types      | `tsc --noEmit -p packages/meowtail/tsconfig.json`                         | exit 0                                                           |
| Story registry      | Meowbook config check                                                     | 136 stories                                                      |
| Language            | Han sweep on changed files                                                | only the approved test payloads                                  |

Built output: Page/Section/NavList parts appear on all 146 site pages, CodeBlock on 94; the legacy
`docs-eyebrow`, `docs-section*`, `docs-catalog-group*`, `docs-catalog-link`, `docs-code-panel*` and
`docs-code-caption` markers appear in zero pages and zero CSS rules.

## Real browser observation and floor comparison

The verifier captured the pre-adoption build from
`artifacts/authoring-components/docs-adoption/before-dist` and the rebuilt site, 20 full-page
screenshots at 1440/390 light/dark (home, Button, NavList, meowtail package, code-block example),
plus filter states and counterexamples.

- Reading column unchanged: 1040px at 1440 and 358px at 390 with the same offsets.
- Page identity: one h1 per page, no duplicate page header and no skipped heading levels across all
  146 pages. Non-home eyebrow removed after verification; only home keeps "Meowland", so the h1
  position is back to the pre-adoption value.
- Accepted library floor: page rhythm 28→20px, Section title 14→16px, description 12→14px,
  internal gap 12→8px, NavList rows 32px with 12→14px labels and a softened active row. The
  wrapping labels in the rail were judged an improvement over ellipsis.
- Code panel: after the fix the title/caption/language header remains, the content is capped at the
  pre-adoption 420px and scrolls internally (button page content 420px visible / 1932px total), and
  the inert Soft wrap/Copy code row is hidden on the static pages (zero boxes, not in the 40-step
  Tab walk). The only code stop is the keyboard-scrollable code surface. Article heights are back
  to the baseline: Button 3893→3847/4013 full page (unfixed 7069/7235), example 1344→1323/1489
  (unfixed 1825/1991), home 1014→973/1139.
- NavList: "Documentation" landmark, 13 groups, 147 anchors, exactly one `aria-current`; filter
  147 items/13 groups → 3/1 for "button" → 0/0 with the empty message for no match → restored, at
  1440 and 390. Nine wrapped rows at 1440 and two at 390, no clipping.
- No page or console errors and no horizontal document overflow in any capture; dark rendering uses
  the shared theme tokens.

## Independent verification and fixes

The verifier's first verdict was **FAIL**: the docs site is static HTML (one script, the catalog
filter; no runtime), so the adopted CodeBlock's Soft wrap/Copy code controls were inert and created
dead keyboard stops on 94 pages, and non-home eyebrows repeated the breadcrumb/sidebar group. The
implementer fixed this inside the docs host only (no library change): the actions row is hidden and
the content capped at 420px in `apps/docs/theme.ts`, non-home eyebrows removed, wrapping nav
accepted. Re-verification of the rebuilt dist: **PASS**, with the fix confirmed in the built CSS,
the real keyboard walk, page heights, filter states and all 20 captures.

## Acceptance decision

Docs adoption: **accepted**. The first priority consumer now builds its pages, sections, sidebar
and code panels from the accepted components, with the host owning only shell, reading column,
preview framing and docs-local compositions. The pre-adoption baseline and adoption evidence are in
`artifacts/authoring-components/docs-adoption/`.

Boundaries: the docs site is static, so CodeBlock's interactive controls are suppressed there by
the host; the component remains interactive in the story canvases and runtime consumers. This is a
static-host boundary, not a component acceptance change. No library API was added for it in this
round; a future CodeBlock static/controls mode or height axis can remove the host containment only
with a real need.

## Remaining and next

- **Meowbook adoption is next**: its catalog is rebuilt from the manifest on search and selection,
  so `NavList` needs a small mount/remount wrapper around the live catalog; the workbench keeps its
  own tool chrome and CSS.
- **Meowpress** site templates and the meowtail dependency decision remain open; the product
  migration and Form family stay later/tracked separately.
- The docs site keeps its local Preview/InstallLine/StyleAxesTable/PartList/Note/StoryExample
  compositions; those are docs presentation, not reimplementations of the adopted components.
