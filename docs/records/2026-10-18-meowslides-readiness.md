# MeowSlides first alpha release readiness review

Date: 2026-10-18. Scope was public entry points, trusted local MDX dev/build, static delivery, player/layout/theme/media/interaction composition and actual tgz consumption. There was no publish, public placeholder, npm trust change, push or deployment; the unknown data was not read, and courseware content and Rossovia were not modified.

## Conclusion and minimum pre-release steps

The functional implementation and the installed-state artifacts after the fix can serve as the first alpha candidate, but the current manifest and release wiring cannot publish directly. The first version is recommended as `meowslides@0.1.0-alpha.0` with dist-tag `alpha`, without moving `latest`; before actually executing, re-verify the target version and public status read-only and confirm the trust configuration. OIDC publish permission can only be confirmed by the corresponding authorized operation, and cannot be proven by a read-only check.

1. The new release commit must include the shared ESM emission fix from `b583369`. The current `0.1.0-slides.20261018.1` is only a private local version, not the version to publish.
2. Set a canonical alpha version for Slides explicitly, remove `private: true`, add repository metadata pointing at the same repository, confirm the peer range of the corrected Meowtail alpha, and sync the private-candidate status in the README. Do not add features to the alpha that have no concrete need yet.
3. Add Slides to the release package allowlist, explicit selection validation and isolated consumption acceptance; cover the five public subpaths, CLI/types/assets, MDX and TSX, shared identity and native Node theme imports. Continue using only the manual release flow and do not add push/tag automatic publishing.
4. build/pack from a brand-new commit containing the above changes, generate new exact SHA/hash release inputs, and complete the corresponding installed-state acceptance and dry-run. Publish only after obtaining execution authorization for this new input; this receipt is not a publish authorization.

### Difference between frozen 857 and this round's fix

The original four-package release input is still `857c0fbb095846fd18defeab0821ebfade20eda3`, and the manifest and four tgz files in `artifacts/npm-oidc-release-20261018/` are unchanged. That input does not include the ESM fix or Slides; **publishing this old input is not recommended, and it must not be triggered because this round's new candidate passed**. The old Tail theme actually failed to load under native Node, and Book has an emission path that also needs correcting.

This round's new directory `artifacts/meowslides-esm-repair-audit-20261018T152320Z/` is explicitly a non-release candidate. Old version strings were kept for byte comparison, and the original candidate was not replaced nor new publish authorization generated. The JSX/CSS tgz files are the same as the old input; Tail/Book/Slides have only 3/1/8 files respectively adding `.js` to relative imports, and manifests, docs and assets are unchanged. Whether to reuse version numbers that have not been published must be decided in a new release plan after verifying npm status; even if version numbers are reused, it must be a new commit with new hash inputs.

The earlier workflow_dispatch for the four packages was blocked by the automated approval review and is still not executed; this round did not retry or bypass it. The existing npm trust status is also unchanged.

## Two rounds of actual end-to-end work

The first round independently checked the dependency direction of runtime/registry/theme/mdx/build, public types, theme token/fragment identity, per-slide lazy rendering and session, media activity permission and the trusted-code boundary; another owner actually packed and installed the tgz in a brand-new `/tmp` consumer. Bun, types and the browser build were fine, but native Node loading `/theme` alone got `ERR_MODULE_NOT_FOUND`: the shared build treated `.styles`/`.tokens` as already-complete extensions and did not add `.js`. The other four Slides entries imported successfully on their own, so the theme failure cannot be broadened into a failure of all entries.

The fix was bounded by the independent challenger first defining the resolution order, then landed in the shared builder: an explicit `.js` is no longer appended; real output files win, otherwise `.js` or `/index.js` is added only when the actual target exists. No patch was added in Slides source and no second theme/runtime was inlined. A new real tsc small project was then loaded by native Node, covering cross dotted modules, re-exports, dynamic/side-effect/directory imports and the same export identity; CSS/JSON/MJS and explicit JS paths are also protected.

The first round's complete player browser check also had 2 connection failures: the test hard-accessed the real work at 13009, while the configuration only managed 13019 automatically. It now builds→serves the official work and starts the contract service as part of the configuration, with explicit ports and no reuse of existing services, and exits automatically at the end; work content was not changed and assertions were not weakened.

The second round rechecked with brand-new five-package tgz files and a brand-new consumer; all five Node entries loaded, and strict types passed for Bundler and NodeNext. The unified build was rerun after the final explicit `.js` guard tightening, and all six packages' emitted file paths and bytes were unchanged, so the accepted tgz files were kept. Actual installed-state runs covered dev/static of the shortest two-slide MDX, a TSX runtime host, and a three-slide MDX with a self-made SVG, imported TSX, Reveal and cross-slide session; actual keyboard, back/forward navigation, focus return and image decoding all passed.

## This round's verification results and boundaries

- Final full source unit tests: 359 items, 2247 assertions and 78 files passed; among them 2 new ESM regressions. Slides targeted unit/build was 30 items and 267 assertions.
- The six-package unified build, root typecheck, lint and format checks passed; there was also a browser test project typecheck.
- This round actually reran Chrome browser checks: player 33/33, Meowbook components 29/29 and MDX authoring 8/8. The first player run had 31 passed and 2 failed due to missing services; after the configuration fix the full 33 passed, and 13009/13019 both exited automatically.
- New tgz installed state: 26 Bun public entries, five Node Slides entries, cross-package Signal/Context/automatic JSX/theme identity, Bundler and NodeNext core/browser/build strict types, the installed CLI dev/build and an independent TSX build all passed. Node `/build` only proves it can be imported; actual build execution still requires Bun.
- The five-package file allowlist, exports/types/bin targets, MIT and asset checks passed; Slides has 61 entries and carries no courseware, assets, fixtures, screenshots or known credential literal patterns. This pattern check does not claim to exhaust all secrets.
- This round's new candidate passed 12 browser scenes: four consumer entry points each at 1440×900, 390×844 and 844×390. Of the 15 original images, 9 were actually opened across three viewports for the final static MDX, TSX and composite images; images are complete on all four sides with captions, and peripheral controls are reachable. Narrow windows scale the fixed logical canvas, with no promise of automatic reflow or fully readable phone body text.
- The first unit test run failed without a privileged environment for the loopback server; after authorizing a local loopback service, the same 30 items passed and it is not counted as an implementation defect.

This round did not re-count the historical courseware full acceptance as a new result; the official image work was only rebuilt by the player suite and ran the corresponding frame scenarios. The full dedicated suites of the two English courseware pieces, the complete Showcase, real touch/screen reader/projected audio, Safari/Firefox or a real BFcache navigation matrix were not rerun. MDX does not provide an untrusted-code sandbox, PPT export, full MDX TS/source-map or state-preserving HMR; these are the currently declared boundaries and are not a reason to expand features for the release.

## Exact evidence

- First-round failure receipt: `artifacts/meowslides-package-audit-20261018T151630Z/receipt.json`, with `node-entry-matrix.json` and `native-node-esm-failure.json`.
- Post-fix install receipt: `artifacts/meowslides-esm-repair-audit-20261018T152320Z/receipt.json`, with `candidate-byte-diff.json`, `final-guard-rebuild-identity.json`, five-package hashes and the old857 unchanged proof.
- Post-fix Slides tgz SHA256: `ff5ec035c7a78e0a51915bacb350effcc24af644e34425e471f08cc15fce81a2`; the original failing Slides tgz was `37b072f759be3811bd0d286ecf9921ce0ccbd9d1ebf3f7689119e20216b87e98`.
- Installed-state browser scripts, geometry/interaction results and 15 PNGs: `artifacts/meowslides-readiness-20261018/`.
- The screenshot package was saved to Library: `libfile_52ee7d4b1ccc8191b77620b9f91f7e80`, file name `meowslides-readiness-screenshots-20261018.zip`.

Code fix commit `b583369`; the test service fix and this receipt were separate local commits. Not pushed.

At wrap-up, another task was found concurrently modifying `packages/meowtail/src/theme/chat/composer.styles.ts` and adding `packages/meowtail/tests/browser/chat/composer-inline-layout.spec.ts`. They were kept; their content was not read and they were not included in this round's commit. The artifact identity in this receipt is based on the review batch, dist hashes and fix commit, and the later WIP is not counted into the accepted artifacts.
