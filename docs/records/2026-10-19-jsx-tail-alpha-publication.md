# JSX derived signals and Tail component alpha release

Status: release preparation verified locally; OIDC publication and independent registry consumption are pending.

## Scope and source

The user authorized checking the latest Meowland updates, publishing affected existing packages under
`alpha`, and a separate task updating Rossovia. This task does not change Rossovia, installed apps,
npm trust, account settings, Git tags, GitHub Releases, or deployments.

Remote main advanced from `a9072950c97421579274267b7f4c9b937d71bcc0` to
`3dcdfb1` through four upstream commits. The clean local checkout was fast-forwarded without a reset,
stash, conflict, or rewritten history. The incoming work adds the public `derived` signal primitive,
live Tail component bindings, and the first batch of common components: Accordion, Avatar,
ContextMenu, Link, MenuButton, NumberInput, Progress, Slider, and Table. It also changes Composer
bindings after the earlier surface correction.

The explicit release selection is:

| Package  | Before        | Target        | Reason                                                                     |
| -------- | ------------- | ------------- | -------------------------------------------------------------------------- |
| meowjsx  | 0.1.1-alpha.0 | 0.1.1-alpha.1 | Public derived signals and their reactive implementation                   |
| meowtail | 0.2.0-alpha.1 | 0.2.0-alpha.2 | Common components, live props, and corrected Composer surface/actions/hint |

Tail now requires `meowjsx@^0.1.1-alpha.1`. Older stable and alpha JSX builds lack its required
`derived` export. The CSS peer range remains unchanged. The lockfile also reconciles the incoming
root's exact `happy-dom@21.0.3` declaration; the resolved dependency version does not change.

Current builds of CSS, Book, and Press were compared file by file with their official alpha tarballs.
Their executable files and declarations are unchanged. Differences are existing README translations
or release-status text and Bun's expansion of workspace development versions. These alone do not
justify another runtime release, so CSS, Book, and Press remain unselected. Slides' first-package
bootstrap is excluded. Root and showcase are private.

Neither the rejected `86f56f36927f62cd363f85669e930c5256cadd663470445a5c675a959ba52676`
archive nor the later `561f01701cb1899a72aa0301a80069f436cb5868706d709af4b8e2d7ac119947`
local candidate is this release input. Latest upstream code requires fresh archives. Historical
acceptance remains evidence only for its original exact input.

## Local verification

Evidence is retained under `artifacts/releases/20261019-latest-alpha-audit/`.

- Frozen installation with scripts disabled and all six package builds: passed.
- A clean source snapshot's full `bun run check`: passed, 415 tests, zero failures,
  2,602 assertions across 92 files; format, lint, root types, and unit checks passed.
- Full Tail project types: passed.
- JSX real-browser property/lifecycle checks: 3 passed.
- Final full Tail browser suite: 190 passed, zero skipped, flaky, or unexpected results.
- Fourteen actual public-story views were captured, including all nine new component stories,
  narrow Table and NumberInput, wide/narrow ComposerPanel, and a long draft at 1000 by 420.
  Controlled slider keyboard, number stepping, table sorting, single-open Accordion, and
  Shift+F10/Escape menu operations passed. Capture-mode Composer images preserve external help
  and internal bottom actions. These are bounded library observations, not product adoption.

The first root full check found 415 passing official tests plus four import errors from old frozen
test copies inside ignored artifacts. That red log is retained as `check.log`. A clean snapshot
without historical artifacts passed; old evidence was not removed and test discovery was not
weakened. The first Tail browser pass had 189 successes and one obsolete probe: it measured
`firstChild`, now a reactive comment anchor, rather than the visible option label. The probe now
asserts exact text and measures the complete label contents, retaining the one-line requirement.
Both its targeted check and the final full suite pass. No source layout threshold was relaxed.

The first screenshot set included the workshop toolbar. It is retained separately as
`images-interactive-toolbar/`; final images use Meowbook's public `serve --capture` option. The narrow
Table image after sorting shows its native horizontal scroller at the focused rightmost column,
not a promise that every column fits without scrolling. Long draft screenshots show an editing
viewport, not all text simultaneously. Temporary local hosts are stopped after use.

## Publication boundary

Only the existing manual Actions OIDC workflow may publish this explicit two-package selection.
It must check, build, pack, and consume one pinned source SHA, then publish those exact workflow
artifacts. Registry bytes and provenance must be checked against the workflow artifacts afterward,
and an independent directory must consume exact registry versions. All five existing `latest`
tags must remain at their initial values. Actual source, artifact identities, run links, and final
registry consumption will be appended after execution; preparation is not publication.
