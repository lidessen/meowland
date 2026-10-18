# Meowslides package split and MDX authoring receipt

Source commit: `7f277580d093f8c3178099f737504e19a0ca5eaa`. Local candidates are `meowslides@0.1.0-slides.20261018.1` (private) and `meowtail@0.2.0-slides.20261018.1`. There was no push, npm publish or deployment, and no npm name availability is promised.

## Final changes

- The new package owns the presentation player, step/activity Context, Reveal, media, dedicated content layouts and themes. Meowtail keeps generic UI, layout and standard app themes; the old root presentation exports and `meowtail/presentation` were removed, and there is no reverse re-export of the new package.
- Generic tokens/fragments/options keep the same identity; presentation registration is separate, and the host installs both the generic UI and the presentation plugin. Browser runtime/theme/mdx are separate from the Bun compiler/build/CLI.
- The default authoring entry is `slides.mdx`: top-level AST pagination, the title written once, optional static slide metadata, explicit column grouping, Markdown images, Reveal and imported MeowJSX interactions. It compiles to a single ESM module, slides render lazily, and an explicit session factory runs once per performance.
- The CLI uniformly generates the host, registration, theme, assets and cleanup, and provides dev/build. dev rebuilds automatically and reloads the whole page, keeps the last valid page on errors and recovers after a fix; it is not passed off as HMR.
- `examples/presentation` provides a nine-line two-slide starter and a seven-slide capability example; the original complex work stays complete in `examples/presentation-lab`. Sunshine, Panda and the stories consume the new package, with body text, existing composition and overall colors kept; Showcase adds a separate presentation showcase.

Usage and the supported set are in the [new package README](../../packages/meowslides/README.md); the playback lifecycle and layout contract are in [PRESENTATION](../../packages/meowslides/PRESENTATION.md) and [PRESENTATION-LAYOUTS](../../packages/meowslides/PRESENTATION-LAYOUTS.md) respectively. The starter document does not require authors to maintain main, build, serve, registry, theme or media declarations.

## Two rounds of substantive end-to-end work and independent review

The first round started from authoring burden and the official MDX compilation target and verified `jsxImportSource: "meowjsx"`, then independently reviewed the package split, pagination, state and trust boundary. After the real migration it reproduced a theme cascade regression: the presentation heading styles overrode ordinary CardTitle and made expanded content overflow. After restoring the original cascade order, all geometry/focus/identity assertions were kept, and the component regressions passed again.

The second round accepted with a real seven-slide MDX work and the original composite works. Found and fixed:

- Duplicate slide declarations, dynamic titles parsed incorrectly, referenced images missing from the asset graph, and a real draft with imports failing to compile.
- The virtual module could not resolve extensionless TSX imports; it was fixed to real module resolution, and external TSX is also compiled to MeowJSX rather than React.
- An image with ordinary captions exceeded the body budget; the shared MDX flow keeps text at natural height and only lets direct media shrink, still contained, without changing courseware font sizes or patching pixels per slide.
- The ordinary Button was too small inside the MDX canvas; a canvas-scoped default from the shared theme was used, inheriting body scale and em spacing, without affecting peripheral controls and generic UI.
- The generated host needs to actually use the Web renderer with the installed plugin; error diagnostics need to include the source file name and line/column.
- Unconditional pagehide cleanup made a real BFcache restore blank. The final implementation protects persisted pages and cleans up only on a final leave. Independent Chrome navigation observed `pageshow.persisted=true`; a negative control that removed the protection only in a temporary response did reproduce the blank page, and no official file was changed.

Independent review covered runtime/theme/registry, compiler/build/CLI, the bridge, consumers and new tests, and no new P0/P1 was added after convergence. Routine implementation and the independent challenger were separate; real failures were not handled by deleting assertions or narrowing test expectations.

## Verification results and scope

| Category                      | Actual result                                                                                                                                               | Coverage/limits                                                                                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build                         | Six-package `bun run build` passed; Meowslides was rebuilt only after the final compiler fix; the authoring README build succeeded with seven slides        | Public artifacts; no TS source alias is used to pass off an install                                                                                            |
| Types                         | `bun run typecheck` passed; the full new-package check, strict public type positive/negative cases, and browser and five consumer/app configurations passed | Does not equal full TS props checking inside MDX                                                                                                               |
| Unit tests                    | `bun run test`: 356 passed, 0 failed, 2295 assertions, 74 files                                                                                             | Includes 11 MDX/compiler/build items and 19 new-package runtime items; browser items listed separately                                                         |
| lint/fmt                      | Tracked files and this round's new source/docs passed the full targeted scope, and `git diff --check` passed                                                | Explicitly skips the unknown data/ and unrelated prototypes; does not run a root command over unknown directories                                              |
| Lock file                     | `bun install --frozen-lockfile --offline --ignore-scripts` passed                                                                                           | Existing cache only; no network download and no install scripts executed                                                                                       |
| Player browser                | 33/33 passed                                                                                                                                                | Multiple instances, keyboard, signals, steps, hide/focus, activity, real media and cleanup                                                                     |
| Component composition browser | 22/22 passed                                                                                                                                                | Backgrounds, dynamic diagnostics, two/three columns, long lists, images, controlled Reveal and media                                                           |
| MDX authoring browser         | 8/8 passed                                                                                                                                                  | Simple slides, two columns, images, reveal/AX, classroom choice/redo/cross-slide state, media pause on leaving, cache events, real revision and error recovery |
| Existing consumer browser     | lab full set 5/5; Sunshine targeted 3/3; Panda targeted 5/5                                                                                                 | Sunshine/Panda are not the full matrix; see the facts file for the exact grep                                                                                  |
| Meowbook                      | Separate presentation showcase check with 8 scenes and build passed                                                                                         | Ordinary MDX authors do not need to use Meowbook first                                                                                                         |
| Packing/install               | Six-package local pack completed; the new package and related peers also underwent out-of-repository install acceptance                                     | See the exact inputs and install notes below; does not equal a release                                                                                         |

Tool logs are in `artifacts/meowslides-verification/`; browser details are in the [REVIEW](../../packages/meowslides/tests/browser/presentation/REVIEW.md). The consumers' final facts and limited scenarios are in `artifacts/meowslides-consumer-regression/facts.json`.

### Exact local artifacts

| File                                   | SHA256                                                             |
| -------------------------------------- | ------------------------------------------------------------------ |
| meowslides-0.1.0-slides.20261018.1.tgz | `3ae238b1d7f788f2be208c179b13f075d3f644e07734e72bf7f35bbb5ff02633` |
| meowtail-0.2.0-slides.20261018.1.tgz   | `1da3056d9188f178063906822734f868fb625b9c039aff5ddb574b5b23b959d9` |
| meowjsx-0.1.0.tgz                      | `f7364f05333d2bee25095b3e0b21b95a93389b24972863f179f7fb017c1e7628` |
| meowcss-0.1.0.tgz                      | `b67fabcab43ddeb6defc729c3a363ab7a1b74794959ae5be97723472f967179e` |

Install acceptance used a clean directory outside the repository, exact local tgz files and the existing cache; there was no repository source alias, escaping symlink or network fallback. An independent acceptance owner checked the runtime entry points and types, single JSX/CSS resolution, shared theme originals, rejection of old entry points, and building and browsing external MDX/TSX/SVG/WAV from a non-root cwd. The final pure error-location and README updates did not change the runtime bytes of valid scripts, and reuse was checked against the actual dist bytes.

The final package was installed offline in a third brand-new consumer directory, and 161 dependencies used only the existing cache. Installed files matched the tgz item by item: JSX 52, CSS 21, Tail 435 and Slides 61 files; all packed dist/README files matched the frozen source, and the manifest's workspace-to-candidate version conversion was checked separately. Bun's registry metadata query notice for the local file prerelease peer was not used as matching evidence; the actual installed versions and the single resolution graph were verified directly, with no network fallback.

The official CLI/API build of an external three-slide draft passed; the public compile API and CLI of a defective draft both output the original invalid.mdx file name, duplicate id and `(5:1)`, and the CLI returned non-zero. An out-of-package browser at 1440×900, 390×700 and 1280×460 dark checked generic Button/Signal cross-package use, Reveal, cross-slide sessions, SVG, audio ready/play and cache events, and saw no pageerror, 404 or horizontal overflow. The previous candidate it used differs from the final tgz exactly only in README and build/compiler.js, with identical runtime/theme/mdx/generated-host bytes, so that browser evidence was reused; the final compiler's CLI/API was rebuilt and passed separately. Complete out-of-package evidence is in `artifacts/meowslides-package-acceptance/`, and the 13088 temporary service was closed.

## Actual visuals and Library

The new authoring draft checked seven-slide geometry at three viewports, 1440×900, 390×844 and 844×390, and saved fifteen representative state images. The main coordinator actually opened five original images: wide-screen two-column/image/Q&A, narrow-screen Q&A and short-window image; the independent author and reviewer viewed related images separately, without claiming that each person viewed all images.

On wide screens the body text and classroom buttons are proportionate, and the two columns share an axis; images are complete with ordinary captions inside the body, and the control band is reachable in narrow short windows. Narrow screens remain a scaled overview of the fixed logical canvas, and it cannot be said that phone body text is sufficiently readable. The original courseware also had wide/narrow/short screenshot reviews, and its overall colors were not changed.

The following five images were uploaded to Library, all succeeded, with no external connector access; the version attributes were written back to the local screenshots. Full Library IDs:

| Image                | Library ID                                 |
| -------------------- | ------------------------------------------ |
| compare-1440x900.png | `libfile_327319cbefc4819193706416372c7b08` |
| image-1440x900.png   | `libfile_37e7dd63930c8191b1bf098bc22d8500` |
| check-1440x900.png   | `libfile_d25b6c5437a08191af35834677a73c81` |
| check-390x844.png    | `libfile_4dfd2dbac0248191ad8fad0d18e91776` |
| image-844x390.png    | `libfile_4db3c6f1b8548191bbfbe5792a0bed14` |

Original images and upload responses are in `artifacts/meowslides-review/mdx-authoring/` and `artifacts/meowslides-verification/library.json`.

## Remaining limitations and stopping scope

MDX is trusted local executable code; model-generated/uploaded text or JSON must not be executed by default; this round did not build a sandbox. State is managed by an explicit session factory or component lifecycle, and automatic isolation of arbitrary module variables was not implemented.

The first phase only does single-file multi-slide; there is no YAML deck configuration, theme plugin protocol, multi-file pagination, state-preserving HMR, full source maps or full TS props checking inside MDX. Compiler dependencies do not enter the browser module graph but are still tool installation dependencies. Meowbook's MDX adapter adds no automatic discovery protocol.

Verification was limited to local Chrome/Chromium; Safari/Firefox, real touch, manual screen readers, physical audio or deployment acceptance were not done. Out-of-package users need to explicitly migrate the old Meowtail presentation entry points; Rossovia/iOS outside the repository were not changed. The unknown data/ and other B+C temporary prototypes were not read or modified. Self-built test and review services were closed, and the existing 13012/13014 user previews were not touched.
