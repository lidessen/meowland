# Presentation shared component fixes and courseware re-verification

The user pointed out that shared issues cannot be fixed by adjusting a single PPT, so Protecting pandas was used to reproduce and accept them, and they were handled uniformly in Meowtail's public component layer. The repository's official package name is still `meowtail`, with no rename. User material, the unknown `data/`, Rossovia and Sunshine's classroom content were kept; this round only made local commits, with no push, publish or deployment.

## Two rounds of substantive end-to-end work

The first round reproduced in actual courseware a heading style affecting the player chrome, layout jumping when the support panel was hidden, and an omission where body content passed through the footer but the article's scrollHeight was still 720. Independent review separated these from ordinary content design: selection, draft and redo state belong to the host; removing duplicate text, semantic column widths and compact spacing belong to normal composition; hide/focus/activity permission, where content classes apply, and region overflow diagnostics belong to the shared component contract.

The second round re-verified in generic Meowbook stress scenes, the two actual courseware pieces and an independent install directory. Installed-state work further found mixed new/old geometry during scaling and false reports of tight-line-height text ranges, and those fixes also returned to the component layer. Verification separately records automated assertions, actual screenshot observation and installed-state consumption, and these cannot replace one another.

## Public contract and consumers

- `Reveal` supports mutually exclusive `at` or controlled `when`. Both modes share the same path for preserved geometry, hidden AX/focus, activity pause and animation cancel; the same node and input draft are kept, and restoring activity does not replay media or entrance animation. No second display-state component was introduced.
- `Presentation.slideClassName` puts the work class on the current slide article, while the original `className` still applies to the player root. It defines the mount point for content styles and does not promise sandbox isolation for arbitrary CSS.
- Overflow diagnostics check the canvas and the nearest `PresentationLayout` header/body/footer allocated regions, supporting text lines, dynamic content and show/hide changes. Owners that explicitly scroll or clip are responsible for inner content, while their own out-of-bounds is still diagnosed; background decoration and the top layer are not miscounted as body capacity. Diagnostics only warn and do not automatically clip, shrink text or expand the canvas.

Panda a3 replaced the work's own show/hide wiring with `Reveal when`, so the shared component uniformly handles visibility/inert/aria-hidden, focus and activity permission; it uses `slideClassName` and removed per-heading class patches. Selection, support toggles and drafts are still held by the work factory, and classroom text and asset sources are unchanged. Sunshine only switched the content class mount point, and its build/serve gained a candidate output directory to avoid overwriting the still-running old preview. Generic stories reuse the real components, covering long tokens, nested min-size, input, activity and media.

## Verification boundaries

After the final unified build, root typecheck, full Meowtail package tsc and root unit tests passed: 325 items, 67 files, 2019 assertions.
The related component browser runs passed 15/15 (diagnostics 6, controlled Reveal 4, existing layout 2, backgrounds 3), and the full existing Presentation contract passed 32/32.
The full Panda suite passed 8/8 (14.8 seconds), and Sunshine targeted 3/3 (4.9 seconds); the latter covers teacher step-by-step reveal, cross-slide state/explicit redo, hints and reduced motion, and is not passed off as Sunshine's full acceptance.
The repo-wide format check explicitly excluded `data/**`, and lint excluded it the same way with deny-warnings; the skill validation passed. Existence checks of 26 relative file links across eight related documents passed; this round's check does not cover anchors.

The independent challenger read the actual diff and verified 16 shared contract points and 8 scaling points in a real browser; the final font revision added another 8/8, covering direct text, inline span, real multi-line overflow past the footer, horizontal long tokens, removal of clearing, and narrow/short scaling.
The independent reviewer opened all 37/37 original images of live a3 at the normal window 1100×760, one by one: two cover states (initial/final), and seven states for each of the five questions — default, selected, Hint only, Reference only, Evidence only, all open, and revisit. There was no new overlap, clipping or support panel jumping; pageerror and visible diagnostics were both zero. The per-image index is `artifacts/protecting-pandas-review/live-normal/a3/REVIEW.md` and `index.json`.
Another independent reviewer took the same 37 states on the same live version at 1440×1000 and 1280×500, and actually opened all 74/74 original images one by one. Selection, long drafts, highlighting, single-open/all-open and revisit were all complete; the support panel position stayed the same across the seven states of each question, body 259/scrollHeight 259, and the body and footer kept 16 logical px. The original images, the 74-row per-image index `VISUAL-INDEX.md` and `facts.json` are archived in `artifacts/protecting-pandas-review/live-visual/a3/`. The root also actually viewed wide-screen all-support for the questions, normal-window growth default and short-window all-support for the action page. A total of 111 live images were reviewed one by one, excluding the 18 automated images shot separately below.
The same-version full-expansion automation separately shot six slides × 1440×900, 390×844 and 1280×330, 18 images in total, archived in `artifacts/protecting-pandas-review/a3/automated-scenes/`; the root actually viewed the narrow-window growth slide and the extremely short-window long-draft action slide, and does not claim that all 18 images were viewed manually.
The historical a1 screenshots and the private a2 candidate are kept as process evidence and are not counted into a3's complete per-image results.

Installed state used three brand-new tgz files, installed offline for real in `/tmp/meowland-component-consumer-BkHwcQ` outside the repository, with no source alias, escaping link or parent dependency. Current dist, the packed copy and installed files matched SHA file by file; strict public type positive cases/negative cases (five), DOM-free core, root/subpath identity and actual browser consumption passed.
The original `48px / 1.1` heading counterexample and pure inline wrapping were re-verified as-is; real multi-line, nowrap and inline-block out-of-bounds are still diagnosed. Nine screenshots across four viewports were actually viewed, and pageerror was zero.
The receipt is `artifacts/presentation-components-final-consumer-p66ucuuu/receipt.json`; the Meowtail tgz SHA256
`55d755f1b404aca8cdb79f22ab308c871b4404bb5361a960b5e9beafb8dee433`. This is local installed-state acceptance, not a registry publish.

The final Web script is `chunk-zrg09fpk.js`, and the build-manifest SHA256 is
`d881cd0d2275c91d3c2b420e5894fcaf644b1dfb325feb2fd5ab51d0e3739f4e`.
After checking the seven candidate files byte for byte against live, the index was updated atomically, returning HTTP 200; old hash assets and the `13014` process were kept, and the user's live site was not restarted.
The work's peripheral title contains `a3`, so old tabs need a refresh; refreshing clears this session's draft. The old Sunshine `13012` was kept, and regressions use a separate candidate directory and test service.

The representative image uses the actual live wide-screen original of "Questions and consequences" with all support open; after both the root and the independent reviewer actually viewed it, the existing Library file was replaced at version 1:
`libfile_95916a411e8c8191a2ee5da6a478b07c`.
The local copy and complete upload receipt are in `artifacts/protecting-pandas-review/a3/`, keeping the a1 history and not creating another Library file with the same name.

This round's root tests, component browser and Presentation browser were each run completely; the full unrelated component browser matrix was not run. Types, static checks, behavior assertions, visual observation and installed state are recorded separately; build, pack and local commits do not equal an official release.

One content boundary is kept: the Reference on the questions page is a generic forests example, and the protection page also shows a generic related hint, not generated dynamically from the current selection. This round kept the classroom original text as the user requested and does not disguise this interpretation-related issue as a shared component failure.

Implementation and related specifications were committed locally as `bf5208d`; the source hash used for verification matches the independent install receipt, and there was no production source change before or after the commit.
The root's own official-image test service `13009`, component review `13058` and the temporary test/installed-state services all exited; the user previews `13014` and the old work `13012` were kept.

Firefox, manual screen readers, physical phones, real classroom projection and learning-outcome observation were not done. Narrow/short windows use whole-canvas scaling; control reachability does not mean phone body text is suitable for reading. Diagnostics are visual warnings for a finite presentation canvas, not a generic CSS validator. Courseware source facts, unrelated overall colors and backend persistence responsibilities were not changed.
