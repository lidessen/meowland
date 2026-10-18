# Image-loading work reorganization

The former `examples/presentation-lab` was reorganized by real topic into [examples/image-loading](../../examples/image-loading/README.md): a five-slide, roughly 3–5 minute interactive explanation of image loading, not a miscellaneous set of generic components. The MDX starter is still in examples/presentation, the complete Panda courseware is still in examples/protecting-pandas, and Sunshine is also kept separately; no teaching content was copied or modified.

## Ownership and rationale

| Former mixed responsibility                             | Current location                                                                           | Rationale                                                                                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Five-slide narrative/conversation in talk.tsx           | image-loading/deck.tsx                                                                     | Encoding comparison, network speed tuning, screen-recording basis and summary form a complete work; slide ids, content and state rules are kept |
| Dedicated RAF transfer bar                              | image-loading/transfer-estimate.tsx                                                        | It is this work's estimate visualization, independently readable but not promoted to a generic component                                        |
| Work and host styles mixed in talk.styles               | styles.ts / index.html / tests/preview/preview.ts                                          | Content visuals, browser root styles and review gating styles each go to their actual host; composition and colors were not redone              |
| Opening/Experiment/Evidence/Interactive                 | image-loading/tests/preview/                                                               | The four scenes only review the same work; they are not another player or generic component library                                             |
| Separate two-slide music work, WAV and music regression | meowslides/stories/presentation-audio.stories.tsx, stories/assets, in-package browser spec | It demonstrates generic root-audio cross-slide capability, unrelated to the image-loading topic; licenses, bytes and valuable behavior are kept |
| build copying all source and root lock files by default | scripts/export-source.ts explicit command                                                  | Regular build delivers only viewer artifacts; the export tool uses a manifest to keep editable source and exclude dist/test results/old exports |
| Asset generation/recording/delivery verification        | original scripts, tests                                                                    | Tooling is kept and not placed in the viewer entry point; recording conditions moved next to it in assets/recording.json                        |
| Historical iteration/hash                               | records/                                                                                   | Old paths and hashes bound to the then checkpoints are kept as-is, and the README explains they are not the current directory listing           |

The official main no longer has the `?demo=music` branch, and assets.ts no longer imports test audio; the generic Reveal media fixture was also changed to use an in-package WAV and does not depend on a specific work. The official host reuses the verified persisted pagehide protection to avoid a blank page after the browser restores from cache.

The current README first covers the work goal, the five-slide thread and the order for reading the source, then lists review/asset/export tooling. Root navigation, engineering checks, the authoring skill, source links and the real reflow fixture all point to the new entry point, and the historical design/receipts keep the evidence of their time. The examples index and the MDX authoring README explicitly give the Panda link, build/serve commands and the 13014 address.

## Actual verification

- An independent structural review settled ownership before implementation and checked the five-slide factory afterward: after normalized identifier renaming and formatting it matched the old body. PNG/JPEG/WebM/VTT were byte for byte identical, and the removed WAV also kept its bytes.
- The new work built successfully, and the seven output assets did not include the WAV; the absence of dist/source was confirmed. Explicit source export succeeded and included the deck, dedicated animation and review source, and excluded dist or test results.
- Meowbook check at the new location: four scenes passed; an actual capture was taken and the experiment original image was opened, and the original composition and stopped-state animation hold.
- The work's four complete browser delivery regressions passed: parameter cross-slide/conclusion, slider keyboard, video time restore/ending without paging, real local assets/subtitles and cold start without external network, and direct state under normal/reduced motion.
- The 33 player browser contracts passed after migrating references, including real work reflow and wide/narrow/short windows.
- The separate audio story gained two real playback regressions, plus the original Reveal media asset case, three items passed in total; they cover cross-slide element identity/continuous playback, user and host pause, and no automatic resume after restoration.
- `bun run typecheck`, the relevant typechecks for the work/tests/package stories, scoped lint/fmt on changed files and `git diff --check` passed. Unrelated full unit tests, the MDX authoring browser or install/release matrices were not rerun because of the directory reorganization; there were no public runtime/theme API changes.

The main coordinator actually viewed the new official opening, the relocated experiment review and the separate audio story, three images; screenshots are in artifacts/meowslides-review and in capture reports in the work's ignored directory. Verification was limited to local Chrome/Chromium, and screenshots, synthetic events or the directory reorganization are not treated as acceptance in all engines.

The 13009 service and the test automation services built this time were closed; the existing Panda/Sunshine previews were not touched. The unknown data/, other temporary prototypes and Rossovia/iOS were not read or modified. Only local commits were made, with no push, publish or deployment.
