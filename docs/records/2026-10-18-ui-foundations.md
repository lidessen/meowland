# UI foundations and presentation capability re-verification

This round expanded checks of the current `meowtail` UI library from `190d721`; the user's meowface did not trigger a rename. The existing presentation toolbar contract continued to apply. The user then added presentation animation, common content layouts and modern heading typography; the body text, course state and overall colors of the two existing works were unchanged.

## Two rounds of end-to-end work

The first round inventoried and actually reproduced in four directions: layout model, size and content boundaries, keyboard interaction, documentation and real consumers. Before changing mechanisms, an independent reviewer checked counterexamples and smaller alternatives; implementation was split by file owner.

- A nested Stack / LayoutItem inside 180px height was stretched by automatic minimum height to 2376px, and the reading body got no scroll space of its own. The four layout roots gained `min-height:0`, without adding overflow by default or resetting arbitrary child elements. The numeric `basis={120}` was previously discarded by the browser and is now serialized as px; strings are kept as-is.
- In a 280px local container, the CardHeader action column could squeeze the title to zero width; ResourceCard / ListRow fixed states and actions could overflow the edges; and a continuous long word in Field could stretch the input to about 1103px. The owning components respectively tightened the grid's minimum track, allocated text space and allowed states and actions to wrap naturally; long words wrap through the content part, without host patches hiding the issue.
- After focusing "Remove" in Menu, pressing Tab previously executed that action. It was changed to close the menu chain and leave along the native Tab / Shift+Tab order; no action was activated and no form was submitted. Independent coverage includes controlled owners that synchronously accept and refuse closing, and nested menus.

The second round had a non-implementer recheck content boundaries and composite workspaces: a fixed PageFrame header and Toolbar, nested Grid / Card / Field, dynamically appended paragraphs, body scrolling, Popover, trailing actions, and input drafts and node identity after resizing the window. A naturally unbounded Stack still expands fully, and only a finite height gets scroll space; a fixed region with `shrink={false}` is not treated as clippable content.

The second round also actually found that after the image-caption recipe's image took height by width, the caption and source area overlapped by about 17.5px; the existing Stack / LayoutItem was used to allocate a finite media region, the contained image took the remaining space and the caption kept natural height. The process recipe removed the handwritten numbering duplicated with the native ol. Inside a fixed canvas, dynamically appended content did not trigger the original ResizeObserver, and the issue of diagnostics not updating was traced into Presentation rather than deleting the failing assertion.

The new scenes only mount public components, pass content and drive state; the shared implementation still belongs to the library. The unknown `data/` was not read or modified, and Rossovia was not modified.

## Presentation additions

- Presentation and Reveal share `transition`: none, fade, slide, zoom, with finite presets for direction and speed. A slide change only decorates the new slide's entrance, and the old slide immediately becomes inactive and unmounts; Reveal's hide, focus and activity contracts hold first, and animation does not change narrative position. No second interactive page was kept for push. Independent checks drove the addition of clip recovery after an animation API failure, and of the race where a not-yet-started next frame is canceled after deactivation and not replayed.
- A single `PresentationLayout` provides replaceable header/footer and single/equal/wide-start/wide-end content regions; column ratios are one column, 1:1, 2:1 and 1:2. Heading, image-text, comparison, number, process and quote-summary are only six lightweight recipes, and no six template components or JSON document engine were built. Selection notes are in the package's `PRESENTATION-LAYOUTS.md`, and the authoring skill points to the same contract.
- A single `PresentationText` keeps real DOM text, with plain as the default, adding only the restrained editorial and marker typographic styles. Font size and fonts follow the presentation system, and marker only adds a light bottom mark; there are no rainbow gradients, thick outlines, 3D shadows or font downloads. The light and dark original images were viewed separately by the implementer and coordinator before keeping these two, and the number of effects is not used as acceptance.

## Bounded tradeoffs

When a 280px card holds five icon actions, the title no longer goes to zero width, but long English may still break lines and increase card height. This round kept the simple action-column occupancy cap and did not add a Card DOM contract or implicit container size for the stress case; authors can use the existing Menu to collapse low-frequency actions.

The layout roots' minimum size does not replace content strategy. Arbitrary native wrappers, explicit Grid auto row tracks and fixed-size media still belong to the caller; natural text flow, local scrolling and outer scrolling must each choose an owner. The presentation's logical canvas scales by contain and does not reflow lesson content because of a phone host; action reachability does not mean small-screen body text is suitable for reading.

## Verification and delivery

The complete checks once exposed two existing omissions: three inputs in two stories lacked real label association; and the Assistant's dark photography test, under an explicit light preview, wrongly expected a system media switch to rewrite theme attributes. The first gained `htmlFor/id` (independent ids for light and dark scenes), and the second switched to selecting dark through the real appearance selector while keeping strict attribute assertions. Showcase checks and browser assertions were not loosened.

The isolated installed state also found that under reduced motion, navigating and restoring the preference before the next frame replayed the old entrance. The old candidate was kept as failure evidence; the fix checks the preference at queue time, cancels the pending playback when a reduce event arrives, does not replay on restoration, and does not mix dynamic preferences into work activity permission. The regression checks after two animation frames instead of passing on immediate zero animation; the implementer and independent reviewer separately verified five real switches and the same-frame event window.

The final implementation and test inputs are `e6b1ec1` (including `f04efd6`, `bf11214` and `f228ea6`); later receipt commits do not change runtime code or in-package files. Bun 1.4.2, macOS arm64, Playwright 1.63.0.

| Level                 | Final actual execution                                                                                | Result                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Build                 | `bun run build`; two `examples/*/build.ts`; showcase build                                            | Five packages, two works and the showcase all passed                                                                       |
| Types                 | Root `bun run typecheck`; full Meowtail tsc; two works tests/tsconfig                                 | All passed, including source, stories, public types and browser tests                                                      |
| Format / lint         | Oxfmt repo-wide check with explicit `data/**` exclusion; Oxlint deny-warnings with the same exclusion | 655 format inputs passed, lint zero warnings; the pristine root check that would read unknown directories was not executed |
| Unit tests            | Root `bun run test`                                                                                   | 320 items, 65 files, 1982 assertions passed                                                                                |
| Component browser     | Meowtail standard config, 3 workers                                                                   | 154/154, passing the light/dark 390/1100 full-scene matrix and new compositions                                            |
| Presentation browser  | `bun run test:presentation`, additionally starting this version's official image entry at 13009       | 32/32, including the original contract, toolbar and 10 animation checks                                                    |
| Consumer browser      | showcase, image work and Sunshine each Playwright config                                              | 2/2, 5/5, 11/11, 204 browser items passed in total                                                                         |
| Showcase static check | showcase check                                                                                        | 112 public gallery scenes; final batch zero accessibility notes                                                            |

Final screenshots were taken by the rebuilt Meowbook capture service, and the list is in the ignored directory `artifacts/foundation-review/final/captures.json`; two official browser entry points were also shot.
Original images were actually viewed for wide screen, 390px narrow screen, 330–390px short window, fixed actions and reading body, popups, image-text composition, light/dark typography and long titles.
12 representative images and `transitions-demo.webm` were saved successfully to Library; the full IDs and local path correspondence are in `artifacts/foundation-review/final/library-uploads.json`, and the delivery message provides the IDs directly.
The recording shows the final version's real normal-motion fade/slide/zoom and step-by-step Reveal at 1280×900, 25fps, 8.72 seconds; frames were extracted and viewed.
Independent animation review evidence for rapid page jumps, media unmount, pause/hide, original-size scrolling, dynamic diagnostics and pending-play races is in `artifacts/presentation-review/transitions-20261018/`; static images are not treated as animation verification.

## Local installed state

The final isolated receipt is `artifacts/final-ui-consumer-KduV6o/receipt.json`.
In a brand-new staging directory, the actual three-package dist and package files were packed (without copying source or node_modules); an empty `/tmp` consumer installed the real tgz offline from the local cache with install scripts disabled, without source aliases, adjacent checkouts or escaping symlinks.
The runtime root / presentation subpath identity, public type positive/negative cases, DOM-free JSX/CSS core types, browser build, guides and licenses all passed.
The final new package re-tested five rounds of reduced-motion navigation restoration, normal entrance, cancel, unmount and zero browser exceptions; unchanged layout/typography three-viewport evidence was reused in a bounded way based on byte-identical declarations and actual dist comparison, and the receipt lists it explicitly.

The final Meowtail tarball SHA256 is
`4e58f4ca9cdf752043813e97e27291b132bccfe070ace53d14d44769ec414345`, and the in-package version is still
`0.1.1-presentation.20261017.1`, with no source version change. The old `SvquPl` candidate and the reduced-motion failure record are kept, and the old tarball or existing release assets were not overwritten. This evidence is only local install acceptance, not a registry install or release.

There are no remaining critical defects. Real mobile hardware, Safari/Firefox, manual screen readers and browser UI scaling were not verified; what was verified is Chromium/Chrome, simulated narrow/short viewports, canvas scaling and original-size mode. The full dedicated browser matrix of the unchanged Meowbook tooling was not rerun, and the related tool unit tests and actual capture path were run.
Dynamic diagnostics observe content add/remove, text, asset loading and size changes, and do not promise coverage of arbitrary pure style changes or all region overlaps inside the canvas; the latter is verified by the recipes' actual geometry and original images. The historical external links to the original product design were not successfully obtained, and this round is based on the current library contract, the existing implementation and third-party notices.

Source observation, automated checks, actual browser behavior, local installed state and official release are recorded separately; this round did not push, publish npm or deploy.
