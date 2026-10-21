# Authoring components round 1: Page, Section and the CodeBlock enhancement

Status: round 1 accepted. Source state: working tree at `HEAD 0973d8c23184` plus this round's
uncommitted changes, 2026-10-21. Nothing was committed, pushed, published or versioned; no package
manifest, lockfile, private product repository or unrelated WIP was changed.

This receipt records the first round of the
[authoring components implementation plan](../designs/2026-10-21-authoring-implementation-plan.md)
and the [component catalog](../designs/2026-10-21-authoring-component-catalog.md). The component
design rationale is in the [authoring-surface design](../designs/2026-10-20-authoring-surface.md).

## Accepted components

| Component                         | Contract                                                                                                                                                                                                                                                                                                                                                                                     | Evidence                                                                                                                                                                                 | Verdict  |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `Page`                            | Content-page composition; parts `root/header/eyebrow/toolbar/notice/content`; optional `title` (required unless `header`), `description`, `eyebrow`, `actions`, `header` escape, `toolbar`, `notice`, `width` (default `content`), children. Composes `Container` + `PageHeader`; no `PageFrame`, viewport or scroll ownership; provides section level 1.                                    | `artifacts/authoring-components/page/report.md`; 4 story captures at 1440/390 light/dark plus long content, edge and width probes.                                                       | accepted |
| `Section`                         | Titled region; parts `root/header/title/description/actions/content/footer`; `title`, `description`, `actions`, `footer`, `variant` plain/card. Heading level from context: h2 under Page, h3 nested, h6 clamp, standalone h2; a title-less wrapper passes the level through without skipping. Card variant wraps the existing `Card variant="surface"` as the single surface/padding owner. | `artifacts/authoring-components/section/report.md`; 8 story captures at 1440/390 light/dark plus long content, heading, edge and coarse-pointer probes.                                  | accepted |
| `CodeBlock` title/caption/actions | Optional `title`, `caption` and `actions` (`MaybeSignal<Child>`); new contract parts `title`/`caption` in the header; host actions before the built-in wrap/copy controls; existing language, wrap, copy, feedback, focus and coarse-pointer behavior unchanged.                                                                                                                             | `artifacts/authoring-components/codeblock/report.md`; 1440/390/320 light/dark captures, legacy-story byte comparison, host-action overflow probe, live-signal and coarse-pointer checks. | accepted |

## Implementation files

New:

- `packages/meowtail/src/components/page.tsx`, `section.tsx`
- `packages/meowtail/src/theme/components/page.styles.ts`, `section.styles.ts`
- `packages/meowtail/stories/page.stories.tsx`, `section.stories.tsx`
- `packages/meowtail/tests/unit/components/page.test.tsx`, `section.test.tsx`
- `packages/meowtail/tests/types/page.types.tsx`, `section.types.tsx`
- `packages/meowtail/tests/types/code-block.types.tsx`

Modified:

- `packages/meowtail/src/components/code-block.tsx`
- `packages/meowtail/src/theme/components/code-block.styles.ts`
- `packages/meowtail/stories/code-block.stories.tsx`
- `packages/meowtail/tests/unit/components/code-block.test.tsx`
- shared integration in `packages/meowtail/src/components/index.ts`,
  `packages/meowtail/src/registry/index.ts` and `packages/meowtail/src/theme/index.ts` (additive only)

The pre-existing modified files in the worktree (`.agents/README.md`, workflows, lockfiles, package
manifests, meowbook/meowpress changes, `stories/preview.ts`, untracked `apps/docs` and meowpress
pages) are other owners' WIP and were not changed by this round.

## Checks

Final tree, run by the Lead after the last polish:

| Check            | Command                                                                                       | Result                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Unit suite       | `cd packages/meowtail && bun test tests/unit`                                                 | 235 pass, 0 fail, 58 files, 1494 expects                                                          |
| Types            | `bun node_modules/typescript/bin/tsc --noEmit -p packages/meowtail/tsconfig.json`             | exit 0                                                                                            |
| Build            | `bun scripts/build.ts --package meowtail`                                                     | exit 0                                                                                            |
| Format           | `oxfmt --check` on the 18 changed/added files                                                 | all formatted                                                                                     |
| Lint             | `oxlint --deny-warnings` on the 18 files                                                      | 0 warnings, 0 errors                                                                              |
| Story registry   | `bun packages/meowbook/src/cli.ts check --config packages/meowtail/meowbook.config.ts --json` | 131 stories checked                                                                               |
| Docs integration | `bun run --cwd apps/docs build`                                                               | 144 site pages, 128 component pages (Page and Section included), 9 example pages, 6 package pages |

Component tests cover the contract, slots, heading levels, width, escapes, card single-surface,
CodeBlock conditional parts, actions order, live Signals, static/live JSDoc and theme token usage.
The verifier also ran the related contract/theme checks and five related browser specs.

## Real browser observation

The verifier opened the Meowbook canvas and captured the stories; the Lead re-opened representative
captures. Conditions: Chromium, 1440 and 390 widths, light and dark, full page where relevant.

- **Page:** eyebrow → h1 → description → page actions, then toolbar, notice and content. One h1;
  direct Sections h2, nested h3. Region gaps 20px; eyebrow-to-header 8px. Widths: content 720,
  narrow 480, wide 1120, full = host width. Content-only and header-escape variants behave as
  contracted. Long unbroken eyebrow token no longer widens the document (was 594px scroll width at
  390, now 390). No overflow/clipping or page errors.
- **Section:** standalone h2, h2 under Page, nested h3, h6 clamp with no h7; grouping wrapper now
  passes the level through (Page h1 → grouped child h2, previously h3). Title/description/actions
  render in the intended rows; actions wrap inside the column at 390 and under coarse pointer are
  44px targets. Card variant has one Card surface, 24px card padding and section root padding 0;
  header/content/footer gaps 8px. Long unbroken tokens in footer/actions wrap inside the section
  (scroll width 390, previously 404). No overflow/clipping in the 8 story captures.
- **CodeBlock:** title/caption/language/host actions header at 1440, wrapping at 390/320 with all
  buttons inside and Copy code fully visible after the narrow fix; two host actions exercise the
  previous counterexample. Legacy story is byte-identical to before the change at 1440 and 390.
  Wrap toggle, copy feedback, clipboard content, keyboard Enter copy and focus order all pass.

## Independent verification and fixes

A verifier who did not implement the components reviewed each one, ran the checks, and opened the
real canvas. The CodeBlock first verdict was **FAIL** on a narrow-width counterexample: the actions
row kept `flex-shrink: 0`, so two host actions overflowed at 390 and clipped Copy code. The fix
(`flex-shrink: 1; min-width: 0; justify-content: flex-end`) was re-verified at 390/320/1440 and the
legacy story is byte-identical: **PASS**.

Page and Section first passed with non-blocking notes. The Lead required the shared polish before
acceptance: title-less grouping wrappers no longer consume a heading level; long unbroken tokens in
Page eyebrow and Section footer/actions no longer widen the document; Section actions gained the
44px coarse-pointer rule; Page `width` is documented as fixed for the mount. The verifier re-ran the
affected probes and confirmed both verdicts on the final tree; a fresh 16-frame capture run is
byte-identical to the pre-polish captures for normal content.

## Acceptance decisions

- `Page`: **accepted** for the catalog scope. It is content-only inside a host shell, uses the
  existing Container/PageHeader, owns no viewport/scroll, and passed contract, browser and
  independent verification.
- `Section`: **accepted** for the catalog scope. Heading order, both presentations and the Card
  single-surface rule pass; the title-less grouping behavior is documented and tested.
- `CodeBlock` title/caption/actions: **accepted** as a backward-compatible enhancement after the
  narrow-width fix.

Acceptance boundaries: accepted for this repository's source and Meowbook/docs build, not for a
published package, installed-state consumer, release or the private product's pages.

## Non-blocking notes and follow-ups

- The CodeBlock header wraps to three rows at 390 when title, caption, language and multiple host
  actions are all present (measured ~143px tall). It is usable and nothing clips; keep it as the
  documented narrow presentation.
- At widths below ~345px the legacy CodeBlock action row now right-aligns when wrapped where it
  previously left-aligned; cosmetic, measured.
- The README `CodeBlock` paragraph does not yet mention the new title/caption/actions props; update
  it together with the docs adoption wave. `Page` and `Section` are not yet listed in the package
  README "Current components" section.
- The docs app can now generate `Page` and `Section` pages from the registry and stories, but it has
  not yet adopted the components in its own page source; that is the next wave, with the same floor
  comparison.
- PageHeader's inherited action wrapping under a multi-line description and Alert's narrow bar
  behavior are pre-existing behaviors, not changed by this round.
- The dist rebuilt during this round is gitignored; the verifier's ignored evidence directories and
  the `bun.lock`/manifest WIP remain untouched by this round.

## Next

Round 2 of the plan: `NavList` and the complete `Modal`, each with its own contract, story, tests,
independent verification and acceptance; then the docs/meowbook adoption of the accepted components.
The private product migration, package publishing and the parked value/binding work remain out of
scope.
