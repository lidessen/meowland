# JSX derived signals and Tail component alpha release

Status: published under `alpha`; runner, local, and public bytes match, and isolated exact registry consumption passed.

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

The existing manual Actions OIDC workflow published only this explicit two-package selection.
The exact published source is `5b4661479035178a4e0aaa39ee39b4b691387842`.
Its [normal build/lint CI](https://github.com/lidessen/meowland/actions/runs/39260788949) passed;
the single [OIDC publication run](https://github.com/lidessen/meowland/actions/runs/39260904218)
completed successfully, including prepare checks, isolated tarball consumption, and publish.

| Package  | Published alpha | Public tarball SHA256                                            | Latest before and after |
| -------- | --------------- | ---------------------------------------------------------------- | ----------------------- |
| meowjsx  | 0.1.1-alpha.1   | 18ca5053a088f8f50f62f3422dec78f3068d44aa10048b7f60420054811d8733 | 0.1.0                   |
| meowtail | 0.2.0-alpha.2   | 3e0a118d39098ff2812f172d0cb32980623bc8e32c23950fb4d64d75464d033b | 0.1.0                   |

The original runner manifest and both tarballs match the accepted local batch exactly. The publish
job downloaded that prepare artifact without repacking; its retained manifest and tarballs also
match. Public tarball downloads match both SHA256 and registry SHA512 integrity. All five existing
`latest` tags retain their initial values: JSX/CSS/Tail/Press `0.1.0`, Book `0.1.1`. Unselected alpha
tags are unchanged: CSS `0.1.1-alpha.0`, Book `0.1.2-alpha.1`, Press `0.1.1-alpha.1`.

The workflow used existing Trusted Publishing with Node 24.21.0 and npm 11.21.0. Each selected package
had exactly one publish invocation with HTTP 202. The workflow then used public visibility reads,
verifying JSX after three reads and Tail after four, without retrying uploads or repairing tags.
Public SLSA provenance subject SHA512, source commit, workflow path/repository, and invocation run
all match. This is a public metadata/provenance-field comparison, not an independent Sigstore
signature-verification session.

## Exact registry consumption and final scope

A fresh empty-cache consumer installed exact official registry versions into
`/var/folders/tp/_xjgy2tx3zd6phhhd2mb63hc0000gn/T/meowland-registry-derived-l7zlf2vi`:
JSX `0.1.1-alpha.1`, CSS `0.1.1-alpha.0`, Tail `0.2.0-alpha.2`, Book `0.1.2-alpha.1`, and Press
`0.1.1-alpha.1`. Both initial and frozen installs passed with lifecycle scripts disabled and no
file dependency, override, workspace alias, adjacent checkout, or parent node_modules.

Native Node and Bun public imports, cross-entry Signal/Context/component/theme identity, and strict
core/DOM/tool declarations under Bundler and NodeNext all passed. Actual `derived` updates and all
nine new public component exports passed under both runtimes. Each shared package has exactly one
installed copy; all official package files equal the verified registry archives: JSX 52, CSS 21,
Tail 491, Book 66, and Press 21. The earlier mixed consumer separately exercised the unchanged
official Book/Press bytes with the new byte-identical JSX/Tail archives, including real Book CLI
list/check and Press CLI builds with Geist/OFL and custom-theme identity.

Browser evidence is reused only because the final official package bytes match the locally accepted
archives. This does not claim a fresh browser matrix from the registry directory, actual Rossovia
adoption, a real provider request, installed-App changes, iOS testing, or a full accessibility audit.
All owned temporary story servers exited normally. Slides bootstrap, npm login/trust/security
changes, Git tags, GitHub Releases, and deployments were not performed.

Evidence is preserved under `artifacts/releases/20261019-jsx-tail-alpha-oidc-39260904218/`: original
runner/publication artifacts and log, final run status, runner-versus-local byte proof, official
registry metadata and provenance, `registry-verification.json`, and `registry-consumer.json` with
the exact dependency declaration, lock, command results, and installed-file audit. This receipt
and root README status are a documentation-only follow-up; they do not replace the published
source SHA or repack its artifacts.
