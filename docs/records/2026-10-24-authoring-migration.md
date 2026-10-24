# Component and utility authoring migration

Status: implementation and bounded local acceptance completed on 2026-10-24. The candidate is an
uncommitted working tree based on `e3ee49a2076721e999f1e9901c1bf971b883270a`, not a released commit.
This task created no branch, commit, push, npm publication, release dispatch or deployment.

The implemented contracts are the [component parts and refs design](../designs/2026-10-24-component-parts-ref-bindings.md)
and [utility values design](../designs/2026-10-24-utility-styles.md). Published versions retain their
previous APIs until a separately authorized release.

## Resulting authoring surface

Components are ordinary functions with static `meta`. `Context<typeof Component>` supplies finite
part names and mount lifecycle; the optional second type parameter supplies exact `context.props`
types. Native JSX composes a part, caller refs and local callbacks through `ref={[...]}`. Components
explicitly forward refs to their intended native host. The old component definers, part-construction
methods, component contracts and public contract values are removed without aliases.

MeowCSS exports `cx` and generic class values. Meowtail exports the ordinary typed `ui` catalog from
`meowtail/theme`. Values work in recursive JSX class lists and expand to declarations in `css`.
JavaScript supplies conditions. The implementation adds no scanning, condition language, class
conflict merging or per-render style registration. The same utility fragment is last and once in
standard, extended and presentation assemblies.

Themes type-import component implementations and share runtime options from implementation-free
modules. `createMeowUI({ components })` registers the functions explicitly; `meowUIComponents` is an
explicit full-catalog choice. Public Button-only and theme bundles exclude Shiki and Pele from every
output. JSON, Meowbook, MeowPress, MeowSlides, docs and example consumers use the new public surface.
Tool `metadata` remains separate from authoring `meta`.

Core JSX and CSS remain DOM-free. Core owns composed-ref normalization, invocation and cleanup; Web
adds native node inference and host operations. Classic and automatic JSX share part, runtime,
Context and Signal identity. Ref callbacks keep their existing property-mount timing, before child
mounting and host insertion; static HTML never invokes them.

## Corrections found during acceptance

- Render hooks could add a ref array after VNode construction and leave its callbacks unmounted.
  The shared render-hook result now uses the same host normalization as the factories. A reproduced
  failing regression now covers static output, mounting and cleanup.
- Serialized part selectors retained whitespace before adjacent native-state suffixes. Trimming the
  selector restores Select sizing and invalid/focus/native-state selector relationships. The unit
  regression and actual mixed-control geometry checks pass.
- Drawer refs run before insertion. Initial modal synchronization is queued until insertion, and a
  real initially-open Drawer scenario verifies the native modal layer, Escape, reopening, selection
  and focus return.
- Assistant scroll restoration ran inside ResizeObserver delivery and could produce a visible
  scenario error after appending results. Resize-triggered restoration now coalesces into the next
  animation frame and cancels on disposal. The browser regression checks scenario readiness and
  page errors after layout settles. The resulting screenshots were opened and show no error banner.
- The presentation browser fixture needed its classic `h` import. Its final overflow case also
  allocated a 24px Reveal to a native button whose default chrome exceeded that allocation. The
  fixture now fits its declared box, retaining the player allocation and overflow assertions.

## Static and behavior checks

Checks below used the migrated working tree and rebuilt public exports. Logs and local captures
are under the ignored `artifacts/authoring-migration/` directory; the file paths are evidence from
this workspace, not published assets.

| Check                                             | Result and scope                                                                                                                                                                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run build`                                   | All six packages emitted successfully in dependency order.                                                                                                                                                                        |
| `bun run typecheck`                               | Exit 0; package sources, core/renderer/Web environments, CSS/Tail/Slides public types, scripts, docs, showcase and example consumers.                                                                                             |
| Automatic Web JSX types                           | `tsc -p packages/meowjsx/tsconfig.web-automatic.json`, exit 0; classic Web checks also passed.                                                                                                                                    |
| Full Meowtail sources/tests/prototypes            | `tsc -p packages/meowtail/tsconfig.json`, exit 0.                                                                                                                                                                                 |
| `bun run test`                                    | 579 passed, 0 failed, 3,423 assertions across 121 files. Release-related unit tests use mocks; their printed dispatch/publish facts are not external actions.                                                                     |
| Repository format and lint                        | `oxfmt --check .` and `bun run lint`, exit 0.                                                                                                                                                                                     |
| Changed test-command negative probe               | An isolated intentional assertion caused both root and Book test selections to return 1. Playwright browser specs were excluded from Bun discovery.                                                                               |
| MeowJSX actual browser bundles                    | 3 passed: plain IIFE, strict IIFE and ESM, including class updates and native cleanup.                                                                                                                                            |
| Final Assistant/dialog/Drawer/utility browser set | 11 passed. Includes initial modal open, keyboard dismissal, focus return, native form behavior, live drafts, reading anchors and utility state rules.                                                                             |
| Final geometry/parameterized theme set            | 7 passed after the selector correction. Includes mixed native controls and regional theme/option binding.                                                                                                                         |
| Other component browser coverage                  | The earlier bounded set had 45 passing cases for menus, popovers, choices, toggles, observation and layouts. Its one utility failure was corrected and superseded by the passing final utility check.                             |
| Chat composition coverage                         | Earlier bounded Assistant/agent/composer/attachment set: 15 passed. The screenshot-discovered resize error was subsequently fixed and rechecked by the final Assistant set; the focused regression also passed six repeated runs. |
| Meowbook browsers                                 | 18 passed: canvas, gallery, measurements, runtime, report, viewport persistence and cleanup.                                                                                                                                      |
| MeowSlides browsers                               | Player contract: 33 passed. Trusted MDX authoring: 8 passed separately.                                                                                                                                                           |
| Language sweep                                    | Only the two approved deliberate Unicode test files matched: `presentation-text.test.tsx` and `compiler.test.ts`.                                                                                                                 |
| Diff whitespace                                   | `git diff --check`, exit 0.                                                                                                                                                                                                       |

The final control screenshots were captured and opened at 375px and 1100px in light and dark;
controls remain aligned, text and native affordances are visible, and every capture reported no page
errors or horizontal document overflow. The wide Assistant process disclosure and narrow dark
Assistant screenshots were also opened after the observer fix. Browser evidence uses Chromium and
the checked scenarios; it does not claim a complete browser/device matrix or a real product backend.

## Exact local artifacts and installed consumption

The acceptance source inventory is `artifacts/authoring-migration/source-state.json`, with working-tree
SHA256 `e63b512bc14bf41a2fcc48a28a08a85ffc27661a1f7e5001fad020225bd03cc6`.
It hashes tracked and non-ignored new files and records deletions. The base Git commit alone does
not identify this candidate. This receipt and the final design/root status updates were written
after that acceptance snapshot; those documentation changes do not change the accepted package bytes.

These rebuilt and freshly packed local tarballs supersede the earlier checkpoint that preceded the
selector and observer fixes:

| Package    | Version       | SHA256                                                             |
| ---------- | ------------- | ------------------------------------------------------------------ |
| meowjsx    | 0.2.0-alpha.0 | `8fb5644b55fbfc0da1264f4a188a326b527355f7462f78937cc72bd16890c5cf` |
| meowcss    | 0.2.0-alpha.0 | `45b5f667360f09162bcd69391ff476aa3d8bceceed7a080eaae2ef76cdaaa750` |
| meowtail   | 0.3.0-alpha.0 | `bb04969daed565468d492026da62c9b61b024d93d8f9dddc3ea0ec12e47ae70a` |
| meowslides | 0.1.0-alpha.1 | `083ac6ec37857e150ecc1d88f473b6b492c35f299e7e45fcabed590ea89bf99a` |
| meowbook   | 0.2.0-alpha.0 | `21f67070e1d7d1ee0e4fad36fc484ee7a239bba55460b651e10f3d249903f9f1` |
| meowpress  | 0.2.0-alpha.0 | `3f1f784281970b0be00eba87c921cac12266f8b587b805cf0d0bcfe82f7bfaa8` |

`bun scripts/release-consumer.ts --manifest artifacts/authoring-migration/local-consumer-input.json
--packages meowjsx,meowcss,meowtail,meowslides,meowbook,meowpress
--out artifacts/authoring-migration/consumer-receipt.json` completed with exit 0 in an empty directory
outside the repository. The environment was Bun 1.4.2, native Node v26.12.0, Darwin arm64, with
lifecycle scripts disabled. Offline installation was unavailable because the public Pele manifest
was not cached; public dependency resolution was online, while the six candidate inputs were the
exact local tarballs above.

The receipt verifies one installed candidate copy per package, no parent `node_modules` or escaping
symlinks, all applicable public exports, native Node runtime imports, shared Signal/Context/token/
fragment identity, and strict core/DOM/tool declarations under both Bundler and NodeNext. It also
runs installed Book list/check, installed Slides MDX/custom TSX/session/Reveal/SVG builds, and
installed Press from a nested directory, including Markdown/MDX/assets, draft exclusion, custom-theme
identity, bundled font bytes and the font license.

A separate Chromium probe bundled only public exports from that isolated installation. It verified
classic/automatic JSX identity, finite parts, nested and repeated caller refs, render-hook-added
refs, reverse cleanup, static HTML omitting and never invoking refs, painted built-in utility
classes, reactive class replacement and subscription release after unmount. It reported no page
errors; its result is `artifacts/authoring-migration/installed-browser.log`. This supplements the
consumer receipt, whose own boundary correctly excludes browser behavior.

## Delivery boundary

The result stops at local source and exact-tarball acceptance. No registry installation of these new
versions, npm Trusted Publishing workflow, official Release, deployment or consuming product switch
was performed. The broader repository contains pre-existing WIP; this task preserved it and did not
restore files from HEAD. A real release still needs a separately authorized committed source,
accepted artifacts and the [manual release contract](../releasing.md).
