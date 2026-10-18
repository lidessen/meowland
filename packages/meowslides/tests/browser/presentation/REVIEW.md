# 2026-10-18 Package split and MDX author entry re-verification

This round's browser tests move from Meowtail to MeowSlides; the 2026-10-17 and toolbar receipts below
are kept as historical records, and the old package paths are no longer the current execution entry.

## Inputs and results this round

The public `meowslides` and `meowslides/theme` entry points are actually consumed, the runtime installs
both the generic MeowUI and the presentation plugin, and the theme loads only the complete
`presentationTheme`. The old complex image work is rebuilt with the current package by
`examples/image-loading/build.ts`; the new author entry directly consumes `examples/presentation/slides.mdx`
and its real QuickCheck component.

- Standalone player contract 33 / 33 passed (32.7 s): cross-page signals, multiple instances, steps,
  keyboard, hiding and focus, activity permission, native media, late playback, cleanup, reordering,
  narrow/short-window frame controls.
- Meowbook component composition 22 / 22 passed (6.0 s): backgrounds, finite regions, dynamic
  diagnostics, two/three columns, long lists, complete image display and explicit cropping, controlled
  Reveal, native media.
- MDX author entry 8 / 8 passed (7.7 s): the title appears only once, native lists, two columns, real
  local images, reveal AX/inert, session selection persisting across pages, redo, media pause on
  leaving the page, the pagehide cache event contract, real source-file editing and error recovery,
  and three viewports.
- Targeted format, lint and `tests/browser/tsconfig.json` typecheck of the test code passed.

The final MDX fix only affects the author content flow and the generated host; the runtime/normal theme
used by the 33 player and 22 component tests is unchanged, so the unrelated matrix was not repeated for
these two local fixes.

Currently run from the repository root:

```sh
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config packages/meowslides/tests/browser/presentation/playwright.config.ts
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config packages/meowslides/playwright.config.ts
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config packages/meowslides/tests/browser/authoring/playwright.config.ts
bun node_modules/typescript/bin/tsc --noEmit -p packages/meowslides/tests/browser/tsconfig.json
```

The lab service occupies 13009; the standalone contract service 13019, the component gallery 13027, the
real MDX author service 13039, and the temporary revision service 13040. The current standalone
contract config builds and starts the lab itself and also manages 13019; the other configs start their
respective services themselves. All services listen only on loopback, do not reuse an existing
process, and exit after the tests finish. At the time of this round's historical acceptance, the lab
had been started by the operator first; the 2026-10-18 release-readiness review fixed this manual
prerequisite, avoiding connection failures of the two frame cases in a clean environment.

## Two composition defects actually found

The first round of component tests passed 21 and failed 1. The theme after the package split ordered
presentation label styles after generic component styles, so the canvas h2 overrode CardTitle by
default, making expanded content overflow and trigger whole-page scaling. After the implementation
owner restored the original style precedence, keeping the original geometry/focus/input identity
assertions, all 22 passed again; no assertion was relaxed to hide the problem.

The first real MDX test found that a single Markdown image plus a paragraph of ordinary explanation
exceeded the body area, so two tests failed. The actual original image showed the explanation squeezed
against the canvas bottom edge. The implementation owner kept the natural height of ordinary body text
in the shared MDX flow and let direct images/videos take the finite remaining shrink; images still
contained, without changing the script, the global image default, fonts or Panda. The final image and
the whole regression both passed. Another first watch failure was that the test title locator hit both
the frame and the picture; the test then explicitly limited to article, and it was not counted as an
implementation defect.

The independent design review separately raised the BFcache event risk of the generated host. After the
fix, a `persisted: true` pagehide event verification was added: the selection is kept and Check still
works; only the final non-cached pagehide clears the mount. This is real PageTransitionEvent contract
verification and is not equivalent to acceptance of real BFcache navigation in all browsers.

## Actual visuals and development loop

The final original images are in `artifacts/meowslides-review/mdx-authoring/`: five states opening,
compare, image, steps and check, each at 1440×900, 390×844 and 844×390, 15 in total; `geometry.json`
records the seven-page canvas of three viewports. I actually opened the compare/image/check widescreen,
the check narrow window and the image/steps short-window originals: columns aligned, classroom buttons
coordinated with the canvas body, images complete with space left for the explanation, and the control
band reachable. Narrow and short windows are scaled overviews of the fixed logical canvas; sufficient
mobile body readability is not claimed.

The real development loop used its own temporary MDX and TSX files: the count after clicking is 1, the
browser automatically reloads after changing the title and the session returns to 0; after unclosed JSX
triggers an error, the old page is still operable; the work recovers automatically after the fix;
changing the imported TSX component also triggers a reload. Manual refresh and revision API return
values were not used in place of browser facts.

Verification browsers are limited to local Chrome/Chromium; physical touch, manual screen readers,
physical audio, other browsers and deployment were not verified. The full engineering suite,
out-of-package installation, Library upload and commit are recorded by the parent task receipt. This
record does not mean released.

---

# Independent behavior review of presentation capabilities

Date: 2026-10-17. The test author is separate from the production and work authors; this record covers
only this round's browser implementation and does not mean release or acceptance on all platforms.

## Findings and fixes this round

- The inner `visibility: visible` of a nested Reveal overrode the outer hidden state and could leak
  unadvanced content. The production author changed it to inherit reveal; the independent browser case
  verifies visual hiding, AX, focus return and ancestor activity permission at the same time.
- A page Signal assigned before first entering the page delivered after subscription, causing the first
  page to mount repeatedly. The production author built the Signal from the initial CurrentSlide;
  independent browser cases protect the entry count, no rebuild on step switches and no rebuild on host
  activity switches.
- The late-playback test only simulates rejected playback and the async race; real browser native media
  was verified separately, and mocks were not used to prove video encoding, position restoration or
  audio playback.
- The parent task's actual visual check found that normal media still showed Retry loading: Button's
  display overrode the UA hidden style. The production author fixed only the hidden rule of the shared
  media actions. The new actual-visibility regression first failed stably against the old dist, then
  verified on the fixed version that normal ready hides, a real HTTP 404 shows, retry loading is
  hidden, and it hides after real WAV recovery; this is not merely asserting the hidden attribute.
- The parent task directly watched the recording and found the picture showed 0 bytes even though the
  outer metadata was correct. The work author fixed the recording script and re-recorded. The
  independent review extracted 2, 5 and 10-second frames from the new WebM and watched them: PNG showed
  557,056 → 1,933,312 → 3,634,345 bytes, JPEG showed 68,426 bytes / decoded 0.3 s, the final PNG
  decoded 8.1 s; the progress bar matched the two images' completed state. This check cannot be
  replaced by successful decoding or JSON metadata.

## Actual results on frozen input

The early checkpoint `9caeff43` and the first round's 11 + 5 passing items are not used as final
acceptance. After the parent task completed the full-package build and the formal work build, the
independent tests used that public `meowtail/presentation` entry and the frozen `image-waiting-b3`
assets to rerun 13 + 5 browser checks. Actual commands:

```sh
bun test packages/meowtail/tests/unit/presentation
bun node_modules/typescript/bin/tsc --noEmit -p packages/meowtail/tsconfig.types.json
bun node_modules/typescript/bin/tsc --noEmit -p examples/presentation/tests/tsconfig.json
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config packages/meowtail/tests/browser/presentation/playwright.config.ts
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config examples/presentation/tests/playwright.config.ts
```

Results: unit tests 3 items / 16 assertions passed; typecheck passed; final component/integration
browser 13 items passed (7.3 s); final formal work browser 5 items passed (3.7 s). Test servers listen
only on loopback and the browser is local Chrome. Targeted lint and format checks covered this round's
test files. The new tests' real HTTP errors and recovery do not use resource mocks; only rejected
playback and the late-promise race use isolated simulation.

The component tests include position Signal, cross-page input and multi-instance isolation, direct
steps and linear navigation, slider keys, nested Reveal, focus and AX, the activity gate, unmounting
timer cleanup, real native ref/media events, video position restoration and ended not turning the page,
real audio stop, late playback, rejected-playback retry, Retry loading normal/failed/recovered
visibility, inert background iframe, and the actual horizontal scroll range after 390px contain /
original-size switching.

The real reordering fixture calls the work's `createImageTalk` directly, reusing all its original page
render functions, the same position Signal and the experiment signals, and only moves the experiment
page to the front of the array. After reordering it actually checks direct navigation to step 3 by
stable id, 71 Mbit/s input, summary reading, returning to the experiment and opening page positioning;
no work content was copied and no production option was added for the test.

The formal work tests use a local real 12-second VP8 WebM, English VTT and standalone 6-second WAV,
verifying Q&A return, parameters syncing to the summary, native video frame/position/continue/replay,
music persisting across pages, no automatic resume after user pause, and direct steps in normal and
reduced motion. Cold start uses a new browser context, serving from the formal build directory through
a standalone port, and blocks all external requests; external requests and unexpected resource
failures were both zero. The local request actively cancelled when decoded video leaves the page
belongs to expected cleanup and is not counted as a missing asset.

The new assets this round are PNG 3,634,345 bytes, JPEG 68,426 bytes and WebM 498,896 bytes.
Independent ffprobe confirms VP8 / 960 × 600 / 12.000 seconds; the WebM SHA-256 is
`0ed55b10cb794a63b2e1ac0f8dd00a67a906da40f7681a8fd805c837a41271f5`. Temporary frame evidence is in
`/tmp/meowland-presentation-final-review/recording-02.png`, `recording-05.png` and `recording-10.png`,
and is not a deliverable asset the audience needs to rely on.

## Scope limits

- The authoring iteration of "keep B typography, only locally change the conclusion and images" and the
  full-deck original visual review are carried by the actual records of the parent task and the work
  author; the page reordering has been provided with a same-source browser fixture. Source code words
  were not used to replace authoring acceptance.
- Offline evidence is a cold browser, external request blocking and formal directory serving;
  availability on a double-clicked `file://`, arbitrary deployment subdirectories or a machine without
  the runtime installed is not claimed.
- The sample uses system fonts; bundled Web fonts were not verified. Media verification includes real
  decoding, time advancement and pause facts, and does not include physical audio output measurement.
- Full root project checks, installed state, actual visuals and release are recorded separately by the
  parent task; passing tests does not mean released.

## Presentation frame theme review

This round only changed the frame theme; work source files were unchanged. The independent review found
two real wiring problems: the flex basis of the desktop outline caused tools to wrap unnecessarily; the
zero specificity of `partSelector` let later Button base rules override the chrome's 44px target, font
size and color. The production author limited desktop wrapping and raised selector specificity only for
real buttons inside chrome. The new touch target regression first failed on the old build (actually
36px high) and passed on the version the parent task rebuilt; it also compared the computed style of
`Open evidence` inside the stage with an external Button of the same variant, avoiding frame rules
polluting work buttons.

On the same final build, all 19 component browser tests (original 13 + new chrome 6, 11.1 s) and the 5
formal work tests (3.6 s) were rerun, all passing. The new coverage includes real light/dark theme
binding, keyboard reach and operation, 390px / 844×390 touch operation, control reachability while
scrolling in original-size mode, the 44px target, controls not covering the stage, and the native host
Fullscreen API. Targeted lint and package TypeScript checks passed. Screenshot equality or color pixel
constants were not written as aesthetic tests.

The last change only reduced frame padding/gap at the existing short-window breakpoint; after the parent
task rebuilt, all 6 chrome items were rerun (4.1 s) and passed, and all `final-*` originals and JSON were
regenerated. That change did not touch the work, navigation or media state, so the previous round's
13 + 5 items were not repeated.

Actual computed: navigation button 44×44px, 13px font; at 390px tools are 44px high with 12px font and
8px horizontal padding, and the two tools are 93.02 / 77.36px wide on the same row in a 198.89px
container. The formal 390px footer dropped from 137px to 107px; the 844×390 fixture footer dropped from
106px to 58px, and the stage recovered from about 238×134px to the final 384×216px. Light header text
against the composited background is about 4.78:1, dark about 8.95:1; footer secondary text about
5.27:1 / 7.35:1, with no stacked opacity.

The evidence directory is `artifacts/presentation-review/chrome-20261017/`; `final-*` was regenerated
after the last unified rebuild and `baseline-*` is the previous version. I personally opened and watched
the formal opening widescreen/390px, short window, dark wide/narrow, dark keyboard focus, work content
on a dark host, and native fullscreen originals: controls fully reachable, no stage coverage, focus ring
discernible. Delivery priority: `final-formal-opening-wide-light.png`,
`final-formal-opening-narrow-light.png`; diagnostic raw values are in `final-computed.json`.

The Fullscreen result only means that local headless Chrome allows the host to call the native API on a
real container and keep controls; it does not mean a new player fullscreen feature or completed
physical-display acceptance. The formal work always uses the light scheme; the dark test actually binds
the theme to the fixture, verifying the frame's independent palette and the author-specified paper
color/title, and does not claim that all author content controls look visually constant across themes.
No remaining behavior blockers were found this round.

## 2026-10-18 toolbar local optimization review

This round changed to fixed navigation, a collapsible native outline and an always-visible options
trigger button; low-frequency pause/size toggles go into the existing Popover, using a non-modal dialog
with readable names and native Button, without extending the public Menu. Early independent experiments
confirmed that Tab in the existing Menu selects the current item, which did not match this round's
toggle scenario; after the plan changed, the temporary probe was removed, and no unrelated failing gate
was kept and no Menu change was made.

The authorized test fixture only adds long Chinese-English titles, an unbroken long outline title and a
390px host to the real Presentation props; it does not copy the toolbar. The tests use public exports.
Verification covers 320/390/479/480/481/513/514/515/700/701px windows, 844×390 short windows, 390×320
extra-short windows, and a 390px narrow host inside a 1280px wide window. The outline moves to a second
row when the actual container content width is 479/480px and returns to the same row at 481px, and all
samples have zero horizontal overflow; the full option name and the selected item's title are kept, and
the outline jumps to step 0.

The parent task found one real regression in the original 13-item contract tests: after setting root
min-height to 0, the stage of the two-instance host with no explicit height collapsed, making the
slider/Reveal invisible, with 2 failures that stopped that round. The production author restored the
default `min-height:min(480px,100dvh)` and short-window `min-height:min(320px,100dvh)`, and the parent
task reran the 13 items and passed (8.1 s). This finding belongs to the parent task and is not recorded
as an independent test author finding. Another generic Popover style override found by the parent task's
actual photos was fixed by a chrome-local selector; the independent test compared the computed
background of the options popover and the control band for consistency, verifying public style wiring
without fixing specific colors.

After the last unified rebuild described above, `chrome.spec.ts` was run independently with all 9 items
passing (12.3 s); targeted lint, test types and format checks passed. The new tests verify: Enter/Space
opens and focuses the first item; Tab/Shift+Tab does not trigger the toggle and leaving the popover
closes it; only Space/Enter changes the corresponding aria-pressed; Escape returns to the trigger; an
outside click keeps the actual outside target focused. In original-size mode, options remain reachable
after real horizontal scrolling occurs, and an open popover repositions after the window shrinks. The
two instances have unique aria-controls, toggle states do not cross, and exit removes the open
top-layer. Visibility checks both viewport geometry and actual center hit, and touch targets are
measured after the entrance animation completes, avoiding treating the mid-animation 43.34px as a final
44px layout defect.

I personally opened the final formal wide/narrow images, the long-title narrow screen, the narrow host
in a wide window, the short-window popover, the popover after window shrink and the dark focus
originals; no remaining occlusion or behavior blocker was found. The short-window fixture stage is about
366.22×206px, the desktop control band 720×62px, the narrow-screen control band about 374×123px, and
the options trigger button 44×44px. The popover temporarily covering part of the stage or outline while
open is established overlay behavior that can be closed with Escape/an outside click; simultaneous
visibility of the overlay and all underlying content is not promised.

This round's evidence is kept independently in `artifacts/presentation-review/toolbar-20261018/` as
`final-*`; key originals are `final-formal-opening-wide-light.png`,
`final-formal-opening-narrow-light.png`, `final-options-844x390.png`, `final-options-resized-open.png`
and `final-options-keyboard-dark.png`, with raw geometry values in `final-container-boundaries.json` /
`final-computed.json`. The old 2026-10-17 numbers and passing results describe only the previous round
and cannot replace this round. Physical touch, manual screen readers and complete fullscreen popover
interaction were not separately accepted; the native fullscreen check still covers only host enter/exit
and keeping the main controls.
