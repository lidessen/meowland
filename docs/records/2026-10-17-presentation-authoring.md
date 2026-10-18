# First-phase browser interactive presentation implementation receipt

Date: 2026-10-17. The user authorized implementation after the design converged; the scope was a browser presentation, an authoring skill and one complete sample. This round only did local commits, builds and acceptance; there was no push, npm publish, deployment, PPT/PDF export or Rossovia change. The starting point was `main@1cf4011`, and the rough-draft checkpoint was `9caeff43c0a5594a54a8144cfe283123c1fc2036`. The untracked `data/` was not read, formatted, modified or added to a commit.

## Minimal end-to-end loop implemented

- [Authoring skill](../../.agents/skills/presentation-authoring/SKILL.md): rough content together with fonts/colors/layout forms a runnable draft; the script, assets and interactions are revised around a preview, stable slide ids, input and step feedback are kept, and explicit placeholders and local patches are allowed.
- [Meowtail public contract](../../packages/meowtail/README.md): `meowtail/presentation` provides `Presentation`, `Reveal`, `PresentationVideo`, `PresentationAudio`, `usePresentationActivity` and public types; the root entry point re-exports the same implementation, and `meowtail/theme` provides theme tokens. There is no new package, core extension, generic store, asset service, editor or JSON DSL.
- There is only one writable `{slideId, step}` Signal for position; each performance creates its own cross-slide experiment signals. A step is directly presentable state, changing slides cleans up DOM/media/timers, and going back does not undo experiments. Host, visibility, user pause and ancestor Reveal jointly decide the permission for collaborative side effects, and the media clock is independent.
- [Complete work](../../examples/presentation/README.md): a five-slide, roughly 3–5 minute image-transmission presentation with a shared network speed input, a simplified formula, two original encodings, real local loading screen recording/subtitles and a replayable interactive animation; music is a separate optional scene. The official entry point and Meowbook review consume the same work source and each create their own session.
- The official `dist/` contains HTML, runtime scripts, actual media, notices, the manifest and an editable work source snapshot. The source snapshot explicitly requires putting it back into the same-version Meowland checkout; it is not disguised as a project that can independently install unpublished APIs.

## Actual authoring and independent challenge

The design stage converged through independent roles for package boundaries, authoring flow and media/interaction plus review by a senior model; implementation was split among three owners for components, the work and the skill, with an independent test author. The final content/visual review was also independent of the work author.

After the rough-draft checkpoint, one local revision was actually performed: the left-right layout, all slide ids, steps and experiment state were kept; only the original image shoreline was fixed, the PNG/JPEG was replaced at the same path, the summary title and one conclusion were changed, and then bytes were re-measured and the basis was re-recorded. The before and after SHA-256 and the locations of the original-image evidence are in the [revision record](../../examples/presentation/records/iteration.md) and [revision.json](../../examples/presentation/records/revision.json). No b1, no history of the user having chosen B, and no reviewable earlier image-placeholder history were invented; the image placeholder replacement flow is defined by the skill, but this work has no retained early placeholder version for acceptance.

Real checks found and fixed: nested Reveal leakage, duplicate mounting of the first slide, insufficient work contrast under the system dark preference, a retry button still shown for normal media, and the screen-recording frame incorrectly showing 0 bytes. The last two show that browser assertions and metadata cannot replace looking at the actual visuals; the old rough draft's 11 + 5 passing items are not final acceptance.

The current work version is `image-waiting-b3`, with PNG **3,634,345 bytes** and JPEG **68,426 bytes**; both are 2200×1400 encodings of the same original programmatic illustration, and the JPEG is lossy. The new WebM is VP8 / 960×600 / 12 seconds / muted, with actual loopback conditions of one 32KiB chunk every 70ms and no cache; the PNG took about 8.08s and the JPEG about 0.30s, which are not public-network benchmarks. The main author and the independent reviewer actually watched the final and intermediate frames, and the counts, progress, images and files agreed.

## Same-version engineering and browser results

After the final functional source was frozen, a five-package build ran, then the b3 official work was built. Afterward only the screen-recording JSON was formatted and the receipt/review documentation updated; the final official directory regenerated the source snapshot without changing viewer code or media.

| Check                         | Actual results and boundaries                                                                                                                                                                                                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run build`               | Passed; five-package ESM/declarations and resources; does not mean a release                                                                                                                                                                                                                                                    |
| `bun run typecheck`           | Passed; includes the new work project and the existing platform isolation/public types                                                                                                                                                                                                                                          |
| `bun run test`                | 318 passed, 0 failed, 1,968 assertions, 64 files                                                                                                                                                                                                                                                                                |
| Format                        | Explicit paths passed to the Git-tracked/this-round added support text files, excluding `data/`; all passed                                                                                                                                                                                                                     |
| lint                          | `bun node_modules/oxlint/bin/oxlint --deny-warnings --ignore-pattern 'data/**' .` passed                                                                                                                                                                                                                                        |
| Negative check command        | A copy outside the repository injected a type error in the new work directory; the actual `bun run typecheck` returned 1 and precisely reported that file as TS2322; the negative case did not enter product source                                                                                                             |
| Component/same-source browser | **13/13** passed, including real work reflow and visibility of the real HTTP 404 → loading → ready retry                                                                                                                                                                                                                        |
| Official directory browser    | **5/5** passed; the new context cold started and blocked external requests, and external requests and unexpected missing assets were both 0                                                                                                                                                                                     |
| Native media and animation    | Real video decode/time/continue/replay, subtitle assets, WAV play/pause/cross-slide, background and inactive cleanup; refusal to play and late promise races were isolated with necessary simulation                                                                                                                            |
| Visual                        | The main author and independent reviewer viewed the b3 opening/summary and the original screen-recording images; the work owner viewed five slides without overflow, and the work kept the selected light color under the dark system preference. Also 390px contain/original-size scrolling and reduced motion behavior checks |

The complete commands, observations and scope of the independent tests are in the [review record](../../packages/meowtail/tests/browser/presentation/REVIEW.md). The official browser spec commands are:

```sh
PLAYWRIGHT_CHANNEL=chrome bun run test:presentation
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config examples/presentation/tests/playwright.config.ts
```

## Out-of-package installed state

A candidate tarball was generated only for the Meowtail affected this round; the already published JSX/CSS 0.1.0 tgz files were only read and copied as peers, not repacked or overwritten. The candidate `meowtail@0.1.1-presentation.20261017.1` is in the locally ignored directory `artifacts/presentation-review/packages/b3/`, SHA-256:

```text
eb9e26a113f248a55eb98411bd4020ba418a66bfba1fd6a68c576b2330e6f2f5
```

The tarball has 444 entries, includes the new JS/types subpaths and LICENSE/notices, and excludes tests, workspace source fallback and node_modules. In the empty directory `/tmp/meowland-presentation-consumer-vCU88y` outside the repository, `bun install --offline --ignore-scripts` installed the candidate and the frozen JSX/CSS 0.1.0 peers, and 52 packages succeeded; third-party dependencies used the local Bun cache with no network download. Dependency realpaths all stayed in that directory's node_modules, with no source alias, parent-workspace dependency or escaping symlink.

The consumer's independent typecheck with `skipLibCheck=false` passed, then it built a browser app from its local dependencies. Local Chrome 155.0.8059.85 actually checked equal root/subpath component identity, cross-entry Signal/Context, registered theme and a 1280×720 stage, Reveal, slider keyboard, cross-slide parameters, real PCM audio, timers stopping while paused and unmount cleanup; page errors and external requests were both 0. Machine-readable results and screenshots were kept in the same artifacts subdirectory; the acceptance code was also kept as `installed-consumer.tsx`. The temporary test first corrected the fixture's expectation for boolean data attributes; this did not involve a product patch.

## Running and uncovered boundaries

From the repository root in an environment with the locked dependencies installed:

```sh
bun run build
bun examples/presentation/build.ts
bun examples/presentation/serve.ts
```

Open `http://127.0.0.1:13009/`; the real experiment location is `/?slide=experiment&step=3&speed=71`, and optional music is `/?demo=music`. Rebuild and refresh after changes; there is no HMR. Startup, asset sources, Meowbook review and how to restore the editable source are in the work README.

The full existing showcase browser matrix, Firefox/Safari, the multi-device/OS font matrix, physical speaker measurement, double-click `file://` and acceptance of arbitrary deployment subdirectories were not run. The current support target is local static HTTP in desktop Chrome; narrow-screen observation does not mean a complete mobile authoring product. PPTX/PDF, visual editing, persistence and publishing were not implemented. Browser running and the editable TSX source were verified; there is no promise that dynamic capabilities can later map losslessly to editable PPTX. User visual acceptance and later product decisions still depend on user feedback.
