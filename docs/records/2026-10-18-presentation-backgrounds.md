# Presentation background contract and re-verification

This round added the per-slide background capability that the user explicitly requested on top of the UI foundation check at `f466c38`, with code commit `a946924`. It kept the official package name Meowtail, without renaming, changing existing courseware body text or overall colors, and did not read or modify the unknown `data/` or Rossovia.

## Public contract

`Presentation.background` sets the deck-wide default background, and `SlideDefinition.background` sets a single slide's background; both accept a signal of the whole value. A slide-level `undefined` inherits the deck-wide default; when the deck-wide value is also `undefined`, the theme is used. An explicit `"theme"` restores the current theme's paper, body and secondary text.

The object supports a CSS color or gradient `fill`, an image `image`, a color or gradient `overlay`, and a text color preset `foreground: "light" | "dark"`. Images provide `cover` / `contain` and nine finite positions; the default is cover, center. A slide object replaces the deck-wide object as a whole and does not merge field by field; omitting fill uses the theme paper. foreground means text color and only overrides the presentation-local ink / muted, without switching the complete theme of nested controls.

The background fills the canvas, and the existing content safe margins are unchanged. A separate background layer clips the image and does not obscure body overflow diagnostics. The background is inert, aria-hidden decoration; images have an empty alt and do not participate in focus navigation. A load failure only hides the failed image and keeps fill, overlay and foreground; authors should keep the base color, scrim and text readable without the image, and no automatic image contrast inference is performed.

A background change only replaces the decoration layer and does not remount same-slide content or start a slide transition. On a slide change, background and content enter together inside the same article, and the old slide still unmounts immediately and ends its media lifecycle. No background video, asset manager, preload system or arbitrary JSON execution contract was added.

The guide is in `packages/meowtail/PRESENTATION-LAYOUTS.md`, and the real seven-slide scene is `presentation-backgrounds`; the stories only drive public components and state and did not copy implementations or add consumer CSS patches.

## Independent review and two rounds of verification

Before implementation, the independent challenger confirmed the boundaries of inheritance, explicit theme restoration, object replacement, failure fallback, local text tokens and the media lifecycle. The first round completed the implementation loop through unit tests, type positive/negative cases and real browser stress scenarios. In the second round, a non-implementer re-verified composite pages, dynamic input, actual media playback, rapid slide changes and installed state on the final build, and found no new critical defects.

- Actual screenshots at wide screen, 390px narrow screen and short window were all opened and checked, covering cover, contain, deck-wide gradients, theme restoration, a dark host and deliberately failing images. The geometry difference between background and canvas edges was zero, and background clipping did not falsely report content overflow.
- Consecutive background updates on the same slide kept the input node, focus, draft and content mount count; the separate audio scenario actually played and time kept advancing. After a slide change, the old audio paused, left the document and had its src cleared. A late-arriving old image error only affected the already-unmounted old node, and the new background stayed visible.
- A same-slide background update had no article animation after two frames; a normal slide change had only one entrance of the shared article, with only the new slide's content and background. After five rounds of rapid switching there was still exactly one active content and background; browser pageerror was zero.
- Independent evidence is in `artifacts/presentation-review/backgrounds-20261018/independent-background-results.json` and `independent-background-transition-results.json`. The installed state only claims media node continuity; actual playback evidence comes from the separate audio check above.

## Final same-version checks

All source checks targeted the same implementation in `a946924`, and product source was not modified after the build completed.

| Layer                | Check                                                                                                 | Result                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Build                | Root build five packages; two presentation examples; showcase build                                   | All passed                                                           |
| Types                | Root typecheck; full Meowtail tsc                                                                     | All passed, including public background type positive/negative cases |
| Format and lint      | Oxfmt repo-wide check with explicit `data/**` exclusion; Oxlint deny-warnings with the same exclusion | 659 format inputs passed, lint zero warnings                         |
| Unit tests           | Root `bun run test`                                                                                   | 323 items, 66 files, 1999 assertions passed                          |
| Component browser    | Meowtail standard config, 3 workers                                                                   | 157/157                                                              |
| Presentation browser | `bun run test:presentation`                                                                           | 32/32                                                                |
| Consumer browser     | showcase, image example, Sunshine                                                                     | 2/2, 5/5, 11/11; 207 browser tests passed in total                   |
| Showcase             | showcase check                                                                                        | 113 stories passed                                                   |

The pristine root check that would scan unknown directories was not executed; equivalent explicit-exclusion commands from the table above were used. The full dedicated browser matrix of the unchanged Meowbook tooling was not rerun, and the actual capture path was used.

## Local installed state and delivery boundaries

The new batch receipt is `artifacts/presentation-backgrounds/consumer-Odgs12/receipt.json`. Three real tgz files were packed from the final dist and installed offline in a brand-new `/tmp` consumer with install scripts disabled, without source aliases or package-root symlinks; current, packed and installed dist bytes were checked to be identical. Root and presentation subpath identity, background public type positive/negative cases, DOM-free core types, browser bundling, actual composition and unmount at wide/narrow viewports all passed.

The Meowtail tarball SHA256 is `9bcdb4833e89fdf3d263eeae4d15972eecf5d3d401a09377275301086d1ff4a3`; the version is still `0.1.1-presentation.20261017.1`, with no version bump or overwrite of historical release assets. This is local install acceptance, not a registry install or release.

The four final representative images are kept in `artifacts/presentation-background-review/`: `final-cover-wide.png`, `final-deck-wide.png`, `final-fallback-wide.png` and `final-cover-narrow.png`, taken from the final build and actually viewed. Library saving did not succeed: after restoring a separate temporary runtime environment, the current Library upload flow still reported that execution environment unavailable; nothing was written and there is no deliverable Library ID. The required save flow was not bypassed; the local screenshots are the remaining deliverable.

There are currently no remaining critical code defects. Safari/Firefox, real mobile hardware, manual screen readers or browser UI scaling were not verified; Chromium/Chrome, simulated narrow/short windows, the existing canvas scaling and background composition were verified. The background itself provides no automatic contrast, video, export or preload guarantee. This round did not push, publish npm or deploy.
