# Meowtail default quality and composition-boundary checks

This round ran under the actual `meowtail` name, with no rename. The starting point was `bc015b4`, and only the unknown untracked `data/` existed at the start; this round did not read or modify that directory, did not modify iOS/Rossovia, separate prototypes, courseware content or overall colors, and there was no push, publish or deployment.

The goal was for authors who correctly integrate the public components to get reliable defaults and composable layouts, rather than hiding shared defects with showcase CSS patches or fixed page templates. Work was divided by theme foundation, mobile conversation, integration/examples and independent challenge, with implementers and reviewers separated.

## Two rounds of end-to-end work

The first round used the public consumption path with correct registration, complete standard CSS, theme root and the same runtime, comparing real components without preview CSS against existing Meowbook scenes. It confirmed broken font continuity between ordinary body text and controls, narrow card titles squeezed by a fixed two-column layout, and the complete Assistant's attachment action outside the mobile input row. The theme baseline, CardHeader and complete Assistant wiring were fixed separately, then the same input screenshots and keyboard operations were revisited.

The second round introduced real composite pages and minimal counterexamples from the iOS read-only audit: an ancestor Frame selector and a host footer both owned margins; under a plain IIFE, assignment to an SVG read-only property silently failed. Regressions that fail on the old version were added, independently rechecked, and then engineering and browser checks ran on the unified final build.

Independent challenge changed the implementation choice: giving CardHeader a size container would cut off its natural width contribution, and the width of a header-only button card could collapse from normal content width to just padding. An intrinsic grid without size containment was adopted instead. Another candidate, "nested Card style specificity failure", was ruled out by computed styles and was not delivered as a defect or fix. The dark transparent root was not guessed to be a white-background problem.

## Shared fixes

| Fix                                 | Original problem and final behavior                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Standard theme body baseline        | When installed correctly and with no preview CSS, an ordinary p was Times 16px, while Button/Input were system font 14px. The outermost theme entry now provides font-family/body font size/line height; nested themes keep the author's font size, and local appearance re-resolves the text color. The rules have low specificity and add no global margin, h/p reset or page background.                                                            |
| CardHeader adapts its own width     | In the original 390px scene a long title was squeezed into six lines. An auto-fit grid reusing the existing column-width tokens places actions after the description in narrow cards and in the narrow sidebar of wide windows; they still sit side by side where wide. There is no new wrapper, API, breakpoint or containment, and compositions without description, with Action first, natural-width cards and nested cards are preserved.          |
| AssistantComposer attachment action | The original complete composition used Button, while the mobile layout matched IconButton, so the attachment took an extra row. It was switched to the existing IconButton, keeping the native button, label, disabled and synchronous file chooser. The current mobile form body in the same story went from 80px to 52px, while desktop stayed at 98px; these are scene measurements, not real iOS device sizes.                                     |
| Frame/Composer single outer edge    | Frame's reading margin now applies only to a direct Composer. A Composer embedded in a footer/Card uses its natural width inside its container and is no longer narrowed again by any ancestor Frame. The external 375px minimal reproduction was originally directly x20/335px and x40/295px after adding a footer; the regression covers the same repeated-inset mechanism. The README states the space ownership of wrapping containers explicitly. |
| Web renderer SVG fallback           | A plain minified IIFE does not throw when assigning to a getter-only `viewBox`, and the old strategy returned early. It now returns only when `Reflect.set` succeeds; both false and throw enter the original attribute fallback. The ref/style/events/null/boolean branches were not expanded, and the SVG graphics themselves were not changed.                                                                                                      |

The README now leads with a complete browser integration and teardown example; ButtonsStory uses the existing Container/Stack/Inline/LayoutItem, and the scene's dependency on workshop layout classes was removed. With zero preview CSS, 1440, 390, 320 and short windows were actually viewed, and the established 36px button scale is unchanged. No density switch, automatic installer or forced DSL was added for this round.

## iOS attribution boundaries

The iOS audit path is `/Users/lidessen/Documents/Codex/2026-10-17/task-2/ios-visual-review/component-integration-audit.md`. Production does use 15 classes of public components and loads the theme correctly, and the body has the system font, color and background added, so the theme baseline gap cannot explain its main visual problems.

The Frame/footer double inset matches the in-library reproduction and is the shared composition boundary handled directly this round. Per-item times, short records using the default 28px turn gap, multiple status bars, header/footer hierarchy, and the choice of plain p rather than safe Markdown still involve both library defaults and host arrangement; this round did not broadly change message density based on candidate screenshots or fabricate a conclusion that the complete Assistant adapts to native ACK/switch/unknown. Composer already has narrow-screen and 16px input adaptation, and it was not claimed that the library has no mobile support.

The SVG defect stands independently, but the original production has no Mark/avatar, so it cannot explain the whole-page appearance. The cause of general WK options/value/disabled updates in the controlled Select has not been proven, and this round did not mix it into the SVG fix. Real WK, software keyboard or scaling acceptance was not rerun, and the currently pinned iOS install package was not upgraded.

## Final checks and actual observation

Production implementation was not changed after the unified build. The final checks used the same source combination: `222c27c`, `64631a9`, `e23ed36`; afterward only existing test ownership and this document were organized.

| Check                           | Result and scope                                                                                                                                                                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run build`                 | Six packages built.                                                                                                                                                                                                                                                     |
| `bun run typecheck`             | All root-defined production, public type and consumer environments passed.                                                                                                                                                                                              |
| `bun run test`                  | 356/356, 2295 assertions, 74 files passed. The first run was limited by sandbox local listen; it passed after allowing localhost, which is not a product failure.                                                                                                       |
| Meowtail Playwright             | All 166/166 passed, including the light/dark wide/narrow story matrix, layout, scrolling, toolbar, forms, popups, keyboard, drafts and new counterexamples.                                                                                                             |
| MeowSlides component Playwright | 29/29 passed. The full UI first found that 5 ArtText items still belonged to Meowtail, and the request migrated the story; only the original cases were moved to the Slides real showcase, all assertions were kept, and both suites passed.                            |
| MeowSlides runtime Playwright   | 33 items passed finally: the full set's 31 passed first, and the other two depended on the 13009 work service described in the docs; after starting that service only the two were rerun, 2/2 passed. The first missing-service run was not recorded as a full success. |
| MeowJSX DOM Playwright          | 3/3, passing real plain IIFE, strict IIFE and ESM; asserts the actual strict state, SVG initial/Signal updates, HTML value/checked, events and ref/unmount cleanup. Old plain IIFE was stably red; the new three formats are green.                                     |
| Real consumers                  | showcase 2/2; Sunshine 11/11; Panda 13/13; image-loading 4/4, all rebuilt against the current library. Courseware content was not changed.                                                                                                                              |
| fmt / lint                      | The final repo-wide supported scope passed, additionally excluding the unknown `data/` without reading it; the project's original ignore scope was kept. Repo-wide format writes were not used to overwrite other content.                                              |

A total of 261 browser items passed, with the two runtime items recorded separately as above. fmt/lint are static checks, and browser assertions and viewing original images in person are different evidence; this round did not do independent install acceptance of new tgz files or an official release, nor run the unrelated full MDX dev/HMR matrix.

Actual original-image review covered Card 1440×1000, 390×844, 390×500 and dark narrow sidebar; Assistant wide screen, 390×844 and 390×500; Buttons without preview at wide/narrow/320/short; Sunshine narrow screen and Panda short window. Short Cards keep natural document scrolling, and a full-page long image was not passed off as all content being simultaneously visible in a short window. The independent reviewer actually operated the narrow sidebar, Tab, resize and original draft DOM retention, and found no new critical blocker.

Detailed repeatable probes, computed facts and unprocessed screenshots are in the ignored directories `artifacts/meowtail-default-quality/`, `artifacts/chat-mobile-review/`, `artifacts/meowtail-adoption-audit/` and `artifacts/svg-property-review/`. This round's self-built services and browsers were all closed, and no existing user service was closed.

## Library screenshots

The following were all saved successfully, and the full IDs can be delivered directly; the Assistant images are the library's real agent-workflow scene, not iOS product images.

| Image                                             | Library ID                                 |
| ------------------------------------------------- | ------------------------------------------ |
| Card before 390                                   | `libfile_8236714ad4c88191a206aaf0d2698d8b` |
| Card after, wide screen 1440                      | `libfile_45148e18ef708191b88b0975c7a60b21` |
| Card after, narrow screen 390                     | `libfile_53f8031ce0a08191aa9b29ab27d5eb5f` |
| Card after, short window 390×500                  | `libfile_6b1065cec9b08191964105f33fca8496` |
| Assistant after, narrow screen 390                | `libfile_4c8989883dac8191a73bdc1d37af05f0` |
| Assistant after, short window 390×500             | `libfile_7988656ecf208191ba5fbed1cd390670` |
| Public button composition without preview CSS 390 | `libfile_14142b34e4188191a77a37568070c715` |

This round converged on the confirmed high-priority shared defects being fixed, two independent review rounds adding no new critical blockers, and the above final verification passing; functional and geometry checks are not treated as approval of all product visuals.
