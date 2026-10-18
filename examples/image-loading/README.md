# Image loading: why the same image takes longer

This is a complete interactive explainer of about 3–5 minutes, not a collection of component snippets. Compare PNG/JPEG encodings of the same original illustration, adjust the transfer speed, then watch a real recording of a controlled local load, and finally discuss the relationship between file size, acceptable detail and actual measurement.

To write a script from minimal code, start with the [MDX authoring example](../presentation/README.md). The complete English courseware pieces are [Protecting pandas](../protecting-pandas/README.md) and [Sunshine Welcome](../sunshine-welcome/README.md); they are kept independently and are not copied here.

## View the work

Once same-version package builds and dependencies are ready, run from the repository root:

```sh
bun examples/image-loading/build.ts
bun examples/image-loading/serve.ts
```

Open `http://127.0.0.1:13009/`; press Ctrl-C to stop. `PORT=13049` selects another port; verify it is free first. Rebuild and refresh after source changes; this is a JSX custom interactive work and does not promise HMR. The fixed light paper surface and 16:9 logical canvas follow the original composition, and the whole canvas scales on narrow hosts.

| Page id    | Explanation and interaction                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| opening    | Raises the question of "same image, different waits"                                                            |
| compare    | Compares sizes, measured bytes and detail loss of the two encodings                                             |
| experiment | Adjusts network speed and progressively shows the formula and transfer-estimate animation                       |
| evidence   | Plays the real controlled loading recording and shows what the formula omits; returning keeps parameters        |
| summary    | Summarizes the choice and measurement principles at the current speed and can return to the experiment to check |

Direct link example: `/?slide=experiment&step=3&speed=71`. The slider's arrow keys only adjust network speed; the outline, previous/next page and in-page buttons share one position Signal. Speed and video time persist across pages, and only Reset experiment resets speed; a full page refresh starts a new session and media revisits stay paused.

## Where to learn the code

```text
image-loading/
├── deck.tsx                   # Five pages, session state, page jumps and video-time restoration
├── transfer-estimate.tsx      # Animation specific to this work; responds to activity permission and reduced motion
├── assets.ts + styles.ts      # Measured image facts/estimate functions, plus this work's visuals
├── index.html + main.tsx      # Official browser host
├── build.ts + serve.ts        # Audience artifact build and local HTTP
├── assets/                    # Two encodings, silent recording, captions, sources and actual recording conditions
├── scripts/                   # Generate illustrations, re-record evidence, explicitly export source
├── tests/                     # Four work delivery regressions and preview/ same-source review fixtures
└── records/                   # Historical iterations and checkpoint hashes; not the current file layout
```

Start with the five-page order and single-session data in deck.tsx, then read the activity permission and RAF cleanup in transfer-estimate.tsx. The player, Reveal and media lifecycle come from `meowslides`; generic UI comes from `meowtail`, and there is no second player. The dedicated transfer animation is not promoted to a generic component.

The generic "one audio track across two pages" demo now belongs to the [PresentationAudio story](../../packages/meowslides/stories/presentation-audio.stories.tsx) and is viewed in the presentation showcase. It is not part of the image-loading narrative, and the official work no longer contains a music branch or audio assets.

## Review and regression

The four same-source previews review only this work and live in tests/preview; static fixtures start with `active=false`, and interactive fixtures may run animations or media only after explicitly choosing Activate preview:

```sh
bun node_modules/.bin/meowbook check --config examples/image-loading/tests/preview/meowbook.config.ts
bun node_modules/.bin/meowbook serve --config examples/image-loading/tests/preview/meowbook.config.ts --port 13010 --capture
bun node_modules/@playwright/test/cli.js test --config examples/image-loading/tests/playwright.config.ts
```

The four delivery regressions cover speed/conclusion persistence across pages, slider keyboard use, video position restoration with no page change on end, cold start without external network, all images/videos/captions, and direct entry in normal/reduced motion. The component's generic audio-track contract belongs to in-package browser tests and is not mixed into work regressions.

## Assets and factual boundaries

Sources and authorization are in [assets/NOTICES.md](assets/NOTICES.md); actual recording conditions are in [assets/recording.json](assets/recording.json). Both images are 2200×1400; PNG is 3,634,345 bytes and JPEG is 68,426 bytes; lossy detail differs, and this ratio is not generalized to all images.

The estimate `seconds = bytes × 8 ÷ (Mbit/s × 1,000,000)` uses decimal units and represents only uncached, fixed-throughput pure transfer time, ignoring latency, decoding, the server and variation. The 12-second silent VP8 recording comes from a real local browser request; the server sends 32 KiB every 70ms, which is a controlled illustration, not a public-network performance baseline. English captions and the always-visible description are retained. The font uses system sans-serif and downloads no external font.

```sh
bun examples/image-loading/scripts/generate-images.ts
bun examples/image-loading/scripts/record-transfer.ts
```

Generating/re-recording are maintenance tools and do not run on the audience side; recording requires an existing Playwright Chromium and FFmpeg. After changing assets you must re-measure bytes and update the facts; do not pass old records off as new measurements. records/iteration.md and revision.json are bound to the original checkpoint and old paths, so their hashes are preserved as-is; the current structure follows this README.

## Audience artifact and editable source are separate

A regular build only outputs browser assets, manifest, sources and launch instructions in dist/, and no longer copies the whole source, test fixtures and workspace lock files. A static HTTP server can serve that directory; opening the file URL by double-click has not been verified.

To deliver an editable snapshot separately, run explicitly:

```sh
bun examples/image-loading/scripts/export-source.ts
```

The tool outputs to the ignored directory artifacts/image-loading-source/ according to an explicit source list, keeping valuable asset-production and test tooling and skipping dist, test results and earlier exports. workspace-reference only records the same-version root package.json/bun.lock; the snapshot must be put back into a same-version checkout and is not passed off as a standalone npm project.
