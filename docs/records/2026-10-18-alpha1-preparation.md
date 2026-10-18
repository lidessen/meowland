# English UI and composition alpha preparation

This update integrates the existing English migration and public-composition work, reviews it independently, fixes confirmed defects, and prepares source for a normal main push. It does not publish npm packages, create tags/Releases, deploy, or perform the pending Slides bootstrap.

## Scope and versions

| Package   | Prepared version | Reason                                                                                                                                                                                                                                |
| --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| meowtail  | 0.2.0-alpha.1    | Public ComposerPanel, AppBar, ActionRail and MetaRow; PageFrame notice/footer slots; the shared Lucide icon frame and explicit pass-through; readable placeholder/status/metadata ink, coarse-pointer targets and composer alignment. |
| meowbook  | 0.1.2-alpha.1    | English gallery/canvas defaults and document language; readable canvas error diagnostics.                                                                                                                                             |
| meowpress | 0.1.1-alpha.1    | English generated site/CLI defaults, including document language and the explicit en-US date locale with the existing Asia/Shanghai timezone.                                                                                         |

JSX and CSS remain `0.1.1-alpha.0`; Slides remains unpublished `0.1.0-alpha.0`. Their changes are documentation or fixture/story copy, without production-runtime changes. Existing peers already admit the selected alphas, and Book does not require new Tail APIs, so peer lower bounds remain unchanged. Workspace version entries in `bun.lock` were regenerated; the existing exact Lucide 1.59.0 dependency is retained.

The previous alpha.0 versions of JSX, CSS, Tail, Book and Press are published and registry-accepted. Current READMEs now distinguish those facts from these unpublished alpha.1 candidates.

## Preservation and independent review

The checkout began at `0e8aed77fef882ef380ca95dd8782dfeb1ce7576` with 353 changed/new file contents. A complete WIP archive, patch and per-file hashes were saved before fast-forwarding to remote `048ec577f6b66987383adb0afba16a0dc108780e`. The only overlap was the English release guide: its translation was reconciled with the upstream safe npm diagnostics and bounded registry-scanning wait. The other 352 initial file contents were verified unchanged immediately after the merge.

Separate reviewers examined the new composition contracts and scroll ownership; public exports, icon types, dependency identity and tarball boundaries; and English migration, historical evidence, anchors and Book/Press control flow. ComposerPanel reuses ChatComposer; PageFrame adds no second scroll owner. Book/Press language edits were structurally compared without treating translated strings as control-flow changes.

The explicit English-migration exception in root AGENTS covers exactly 15 existing human-readable `data-*` feedback payloads in the Tail card, chat-message, chat and foundation stories. Their names and machine identifiers stay unchanged; the values only become displayed feedback. This is a reviewed exception, not general permission to translate machine values. Ambiguous translations of inert tool data, coarse pointers and shared source/components were corrected without changing historical counts, evidence IDs or claims.

## Confirmed defects and closure

- A 280px ActionRail could clip or overlap an interactive long-label button while leaving it focusable. The old implementation fails the new real-button geometry regression. Flexible groups now wrap, ordinary text buttons can break long words, and both groups retain min-content floors for fixed IconButtons. Actual rectangles, hit targets, non-overlap, Tab order, Enter and pointer activation pass for long trailing labels, unbroken words and long leading labels. Submit keeps its fixed space; impossible combinations of many fixed-width controls in arbitrarily small hosts are not promised.
- MetaRow omits NaN and infinite progress instead of emitting invalid ARIA/CSS values. Finite values still round and clamp to 0–100; fact text and separators remain correct.
- Book's generated canvas lacked `lang="en"`. It now matches the English gallery shell.
- Book's small error text had measured light-scheme contrast 4.427 against its tinted background. Only error ink now mixes CanvasText with the existing danger tone; the background and 4.5 test threshold remain unchanged. Both themed and theme-free diagnostics pass in light/dark, including a live scheme switch.
- Book's fixture used the root implicit TypeScript file scan, mixing unrelated type samples and source/dist identities. It now uses the existing complete Book project config. Tail browser navigation uses the configured base URL, allowing an isolated test port instead of hardcoded access to a user's preview.

## Validation

All builds and executable checks ran in a separate source snapshot with Bun 1.4.2; unknown `data/`, root dist and active preview instances were not consumed or changed. Browser configs used dedicated ports 14171–14175 and did not reuse existing services.

| Check                         | Result and boundary                                                                                                                                                                                                                                                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frozen install                | Passed with lifecycle scripts disabled.                                                                                                                                                                                                                                                                              |
| Complete build                | All six ESM/declaration/resource packages passed. This is not publication.                                                                                                                                                                                                                                           |
| `bun run check`               | Format, lint, production/platform/public types and **382 unit/build tests, 2,442 assertions, 83 files** passed on the final runtime/manifests/lock. Later README/notice/receipt-only edits were checked separately.                                                                                                  |
| Complete owning-package types | Tail and Book full project configs passed, including new prototype/type cases.                                                                                                                                                                                                                                       |
| Tail browser                  | **184/184** passed, including all-story light/dark wide/narrow coverage, new composition/touch/readability tests and the ActionRail regression.                                                                                                                                                                      |
| Book browser                  | **17/17** passed. Themed tests drive the real auto theme; separate bare-document tests request the actual emitted hashed stylesheet and prove theme tokens are absent. Capture/guides/focus suites are outside this package config.                                                                                  |
| Slides component browser      | **29/29** passed. This does not claim a fresh complete presentation runtime/media matrix.                                                                                                                                                                                                                            |
| Showcase browser              | **2/2** passed.                                                                                                                                                                                                                                                                                                      |
| Public no-style reference     | Author-page scan found no hand-written layout/style; composer, 375×667 mobile and 375×420 short-window composition checks passed.                                                                                                                                                                                    |
| Example builds                | Browser, presentation MDX, image-loading, Sunshine Welcome and Protecting pandas all passed. Courseware content was not changed beyond the existing English copy migration. Their full media/browser suites were not rerun.                                                                                          |
| Visual review                 | Actual final wide 1440×900, narrow 390×844 and short 375×420 app shell screenshots, a dynamic long draft, the dark composer and narrow action rails were opened and inspected. Theme transitions were settled before screenshots. This is Chrome evidence, not real iOS keyboard or assistive-technology acceptance. |
| Language sweep                | Excluding unknown data and ignored artifacts, six Han matches remain only in the two explicitly approved Unicode fixture files. No new Unicode payload exception was introduced.                                                                                                                                     |
| Diff hygiene                  | `git diff --check` passed; verbatim Lucide license content was retained.                                                                                                                                                                                                                                             |

## Frozen local artifacts

The final batch is stored separately under `artifacts/version-update-20261018T224338Z/accepted/tarballs/`; earlier exploratory bytes are not release inputs.

| Tarball                     | SHA256                                                           |
| --------------------------- | ---------------------------------------------------------------- |
| meowtail-0.2.0-alpha.1.tgz  | 46e4a0598f0cb584aa14aaa7ebffe7367d02982ddf46288b6d5465f8926e9e42 |
| meowbook-0.1.2-alpha.1.tgz  | 97ce9164542951179407563e780e4ce79a2faeb5dd529a5c45c9566dfa316264 |
| meowpress-0.1.1-alpha.1.tgz | ca37b8e71d3c7ddaad02ee6068d49f7d57b073b8da85822c694102b8a2fcca5c |

Independent installed-state acceptance passed in `/tmp/meowland-alpha1-frozen-five-e82eebzx` using the frozen three tarballs and registry JSX/CSS alpha.0 peers, without overrides, source aliases or workspace links. Native Node/Bun imports, strict core/DOM/tool types with both supported resolution modes, public composition/IconSource/Lucide types and SSR, Book CLI list/check and public build, and Press build from a nested cwd passed. The new icons keep the SVG namespace; Lucide and Geist/OFL notices are present, and shared CSS identity holds.

Installed Chromium checks confirmed canvas/gallery `lang="en"`, narrow/wide composition, draft preservation through resize, and Press document language. Book error contrast measured **15.7413496 in light** and **13.3855156 in dark**, both above 4.5. A separate Press-only consumer in `/tmp/meowland-alpha1-frozen-press-only-2p_arcxe` also passed with automatically selected stable JSX/CSS 0.1.0 and no Tail, Book or Slides.

Package preparation does not establish new npm publication authorization; alpha.1 publication and the distinct Slides bootstrap remain unexecuted.
