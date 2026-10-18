# Presentation layout foundations: columns, lists and images

## Goal and boundaries

Within the existing Meowtail presentation system, fill in common two/three-column layouts, native body lists and a reliable image/caption composition.
This round prioritized the a4 image whitespace the user specified; the fill-in-the-blank exercise only completed gap research and was not implemented, and Reveal was not described as a fill-in-the-blank component.
Lesson questions, task state, media sources and colors were kept; Rossovia, versions, dependencies, lock files and release tooling were not modified.
The unknown `data/` was not read or modified. There was no push, publish or deployment.

## Round one: verification and counterexamples

- The existing `PresentationLayout` already had single/equal/wide-start/wide-end, where equal means two columns; the generic Grid can do three columns, but the presentation layout lacked direct three columns.
- ListGroup is for app row lists and Timeline is for event streams; neither can stand in for projected body ul/ol.
- The specified screenshot Library `libfile_7ebd8cfd772c8191be98d1e6e14a6080` was verified for identity and its original image was opened. The forest source is 5184×3456, 3:2, and the original image has no embedded border.
- The actual a4 slot is about 568×156.84; a contained image occupies only 41.42% of the width, leaving about 166px on each side. Forcing cover in the same slot would crop about 59% of the height, which is not a reliable generic default.

Layout/list and images were implemented by separate independent owners; the independent challenger first verified finite height, native semantics, clipping/full display and a simple API before implementation was written.

## Implementation

- `PresentationLayout columns={1 | 2 | 3}`: 1/2 reuse the existing single/equal allocation, and 3 uses the same body grid; old strings remain compatible. Logical columns do not reflow automatically because of a physically narrow window.
- `PresentationList items={...} as="ul" | "ol"`: real ul/ol/li and browser markers, supporting native start/reversed; it reuses presentation body tokens, inherits font size when nested, and wraps long words. Static null/undefined/boolean are omitted, while the number 0 is kept.
- `PresentationImage`: a thin figure/frame/caption adapter over a real ImagePreview. Default ratio=16/9, contain, center; explicit cover and nine-point position; ratio="fill" consumes the finite parent's remaining height, and the caption takes natural height.
- Loading/failure and events reuse the original component without copying the state machine; the global ImagePreview defaults are unchanged, and no Lightbox, automatic clipping or automatic text shrinking was added.
- The root and presentation subpaths share component/contract identity, and theme and registry are wired at the same time. The real three-slide Meowbook gallery and the authoring guide were both updated.

## Round two: composition findings and convergence

The actual browser and screenshots together found two problems that could not be hidden behind "no overflow":

1. The new image theme came before the base ImagePreview styles, so the base's zero-specificity part rules overrode it, and the actual img was still 180px/contain and covered the caption. The adapter styles were ordered after the base styles, and regressions were added for the actual img sharing the frame boundary and for computed fit/position; selector specificity was not escalated.
2. A two-column version that only changed cover cropped the forest into a 568×122 thin strip, and the caption took another 84px. Independent re-review rejected that composition. Finally Panda watch used the shared three columns to separate the video, the forest and the original three questions, with the forest about 373×316; the private 22px list CSS was replaced with the default body PresentationList.

Numeric ratios could also be stretched under the grid's default stretch, so self-alignment and no-grow were used to keep the preferred ratio; only fill takes the remaining space.
Finally the new image's status text was scoped to the presentation caption token, so the app's 12px failure hint would not be too thin when projected.
The original two-photo observation slide keeps contain; the forest is an environment image with explicitly labeled cropping and cannot serve as factual evidence of forest change.

## Frozen-version verification

Same final source/dist:

- Root build, root typecheck, full Meowtail tsc (including public positive/negative types) and Panda tests tsc passed.
- Full unit tests 331/331, 69 files, 2063 assertions.
- New layout/list/image real Chrome browser 7/7; covering numeric/old aliases, long words/over-capacity diagnostics, native reversed/nesting, numeric ratios, four corners of three source image types, explicit clipping, load→failure and natural captions.
- Existing Presentation browser 33/33; full Panda 13/13; Sunshine targeted 3/3. The latter only covers teacher reveal, cross-slide state and hints, and does not claim the full Sunshine or repo-wide browser matrix.
- Meowbook check: Panda 5 stories, Meowtail 115 stories. The new gallery only composes public components, with no second component implementation.
- The official gallery was entered from the Meowbook contents, and all nine images (three slides × wide/narrow/short) were actually opened by an independent owner, with no diagnostics or runtime errors. The short-window peripheral document height 344 exceeds 330, but the player outline is fully reachable at y283–327 and the logical canvas is not clipped; this is not claimed as completely without page scrolling.
- Repository fmt, lint and diff checks passed, and fmt/lint explicitly excluded `data/**`.
- The three new tgz files were installed offline for real in the empty out-of-repository `/tmp/meowland-component-consumer-a558Ij`: root/subpath component and contract identity, seven strict type negative cases, DOM-free core and four-viewport image/list/column layout browser checks passed; no source alias, parent node_modules or escaping symlink.
- Current dist, packed staging and installed files matched SHA file by file. Meowtail tgz SHA256: `c701aede4a8bf110d5259ab53295a9aab3f37c65cadd122e8f37ca127ff12a27`. This new batch is only for this round's acceptance and does not replace the old tgz agreed for the other-repository migration.

Install receipt: `artifacts/presentation-foundations-consumer-vuyqp0di/receipt.json`;
component owner receipt: `artifacts/panda-a4-independent-visual/IMAGE-REVIEW.md`;
independent composition observation: `artifacts/interaction-media-review/` (the final watch uses `watch-final-three-*`; the old two-column images are not delivered).

## Actual delivery and screenshots

The current local preview is `http://127.0.0.1:13014/`, a5 `chunk-03jpht82.js`; the existing service was not stopped, and old hash assets are kept for cached pages.
After checking the 12 candidate files byte for byte, the entry was updated atomically; manifest SHA256:
`6f7b79c2f06367d9d92b62afe3083bae995efa08020830c6a778ef573a71e518`.
The final live cold start shot 11 images with no runtime errors; the root actually opened wide-screen playback, narrow/short watch and wide-screen two-photo, and an independent owner actually opened two slides at three sizes plus failure/keyboard images.

Full Library IDs (all uploaded successfully with local version attributes recorded):

| Purpose                                           | Library ID                                 |
| ------------------------------------------------- | ------------------------------------------ |
| a4 user-specified image before the change         | `libfile_7ebd8cfd772c8191be98d1e6e14a6080` |
| a5 wide-screen playback 1440×900 after the change | `libfile_4e2fecad674481919b6b86da6e0bb8f9` |
| a5 narrow window 390×844                          | `libfile_af13ceca8f1c8191a0b1bd1377b7ce5b` |
| a5 short window 1280×330                          | `libfile_a885800e1aec819198b62b4f2d424346` |

Screenshots and measurements are in `artifacts/presentation-foundations-a5/live/`, and the upload receipt is in the adjacent directory.
Official gallery evidence is in `artifacts/presentation-foundations-gallery-final/`.
Only Chrome/Chromium had actual acceptance; Safari, real screen readers and touch devices were not tested; narrow/short are fixed logical canvas overviews, and it cannot be claimed that body text is readable without zooming.
fill still needs a finite parent, and cover still crops content; when over capacity, authors should change the composition, simplify or split slides, not rely on image adaptation to hold unlimited text.

The shared implementation, public contract, tests and authoring guide were committed as `aa11989`; the Panda consumption and this record were committed separately.
