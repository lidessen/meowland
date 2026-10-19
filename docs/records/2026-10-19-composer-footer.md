# Stacked Composer footer allocation

**Superseded and rejected:** the user rejected this candidate's visual hierarchy after inspecting the delivered screenshots. Its hint remains inside the rounded writing surface, and geometric/interaction checks do not establish visual approval. Do not publish source `35631999042c4ff626f45910aee3f794c4d67c06`'s frozen tarball `86f56f36927f62cd363f85669e930c5256cadd663470445a5c675a959ba52676`. The original results below remain historical evidence; follow the [writing-surface correction](2026-10-19-composer-surface.md) for current status.

This fixes a confirmed regression in `meowtail@0.2.0-alpha.1`. The next local candidate is **meowtail 0.2.0-alpha.2**; no other package version or peer floor changes. This task authorizes a local commit and isolated consumer acceptance only, with no push, npm publication, Slides bootstrap, credential changes or installed application replacement.

## Reproduction and ownership

The independent Rossovia diagnosis used the same real ChatPanel/ComposerModel source `ac4549558699926b1a35f6d0088697366a653e36`, official Tail alpha.0/alpha.1 packages, identical JSX/CSS alpha.0 peers and a 1000×720 Chromium viewport. With an empty draft and unconfigured model, alpha.0 had no hint/model intersection; alpha.1 overlapped **110.265625×18px**, both before and after focus. The consumer legally supplied `hint` and `trailing`. The diagnosis is `/tmp/rossovia-composer-overlap-ac454955/report.md`, SHA256 `0198a4cdd06d80831ac18db003be9e8ccce68c1212b03dc135aeb390920c2b63`.

Alpha.1 moved trailing model state next to send but retained an absolutely positioned hint in the same bottom-right rectangle. The defect belongs to the shared stacked theme, not a consumer-specific model controller or ActionRail. The remote user's screenshot independently motivated this reproduction; its installed application SHA remains unknown.

## Bounded fix and independent review

The stacked hint now owns a normal-flow, full-width grid row after the actions. Visible attachments retain their existing higher-specificity row allocation. On narrow screens the writing row, model row and hint row remain separate; hint content wraps and is not hidden. Hint links remain pointer- and keyboard-operable. ComposerPanel inherits the same layout without a second implementation.

A new pressure case also caught mobile trailing inheriting the desktop `margin-left:auto`: a long real ChoiceSelect trigger reached 553px while its Composer ended at 359px. Resetting that margin only in the existing narrow stacked rule restores grid stretching and the selector's own ellipsis behavior. Desktop model/send alignment is preserved.

The independent challenger approved the normal-flow solution over moving models back left or reserving another fixed pixel overlay. Review confirmed that attachments, hidden mount points, hint Child interactions and narrow grid allocation remain coherent. Public props, DOM parts, event ownership, draft behavior and the inline/hero contracts are unchanged. Newly added fixture hints describe native textarea Enter behavior honestly; the library does not acquire an Enter-to-send shortcut.

## Regression and checks

A new public-component story combines disconnected status, long status, an unbroken model name, keyboard help, attachments and send without story layout CSS. The old 1000px shared style fails the new actual-rectangle overlap assertion. The final regression checks real ChatStatus/ChoiceSelect controls, input, attach, hint and submit, rather than just measuring wrapper boxes.

The matrix covers widths 375, 720, 1000 and 1440, including a 420px short window; empty/long drafts; focus/blur; long model/status text; hidden and visible attachments; long unbroken hints; real Tab/Enter/click activation; native textarea newline behavior; retained drafts; and light/dark presentation. ComposerPanel, inline and complete Assistant neighbors are covered separately.

All executable checks ran in `/tmp/meowland-composer-footer-cidc8td0` with Bun 1.4.2 and a dedicated owned port 14371. Root dist, unknown `data/`, main application dependencies, the installed App and coding instances were not modified.

| Validation                           | Result                                                                                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Frozen install with scripts disabled | Passed; only the local Tail workspace version changed.                                                                                          |
| Complete package build               | All six ESM/declaration/resource builds passed.                                                                                                 |
| Complete `bun run check`             | Format/lint/platform/public types and **382 tests, 2,442 assertions, 83 files** passed.                                                         |
| Owning Tail project types            | Passed, including story/prototype/type fixtures.                                                                                                |
| Complete Tail browser suite          | **188/188 passed** on the final production styles.                                                                                              |
| Final targeted browser suite         | **8/8 passed** after a fixture-only fragment syntax cleanup; no production style changed after the full suite.                                  |
| Independent review                   | Shared CSS and regression scope approved; the reviewer's fixture-copy concern was corrected without adding keyboard behavior.                   |
| Actual image review                  | Old failing 1000px screenshot and final focused desktop, narrow long-model/long-draft, and short dark long-hint originals opened and inspected. |

Local evidence is under `artifacts/composer-footer-20261019/`: the old failing result and image, full/targeted browser outputs and screenshots, build/check/types/install logs, exact changed source inputs and frozen candidate. No full courseware/media matrix, native application session, real iOS keyboard or assistive-technology acceptance is claimed.

## Frozen candidate and consumer boundary

The candidate is `artifacts/composer-footer-20261019/meowtail-0.2.0-alpha.2.tgz`, SHA256 **86f56f36927f62cd363f85669e930c5256cadd663470445a5c675a959ba52676**. Its source input is based on `4bbe29eea8fc5df8668c9ea93cd4999bb93934e7` plus the exact package fix, version/lock, docs and regression files saved in `source-change-input.json`. Registry alpha.2 was verified absent before preparation. The candidate is local only, not a replacement for the already-published alpha.1 bytes.

The unchanged required peers remain `meowjsx` and `meowcss`, each `^0.1.0 || ^0.1.1-alpha.0`; the real-product acceptance keeps registry JSX/CSS `0.1.1-alpha.0` and Book `0.1.2-alpha.1`. Only the exact Tail candidate is installed into an isolated product archive. The Rossovia task owns that acceptance and preserves main dependencies, the installed App and coding instances.

The Rossovia package-boundary reviewer verified all 457 package files: only package.json, README and the packed composer stylesheet differ from official alpha.1; component JavaScript, declarations, exports and peer contracts are unchanged. The original product intentionally hides its shortcut hint at compact/coarse-pointer sizes via its own stylesheet. Narrow-product hidden-hint geometry is not counted as readable-hint acceptance; a separately labelled temporary CSSOM diagnostic may remove only that display declaration to examine the candidate theme. No such override becomes the product fix.

## Isolated Rossovia result

The exact frozen candidate passed bounded real-ChatPanel consumption against Rossovia source `ac4549558699926b1a35f6d0088697366a653e36`, with independent input and result review. The original final report is preserved at `artifacts/composer-footer-20261019/consumer/report.md`, SHA256 **ff5701f53d7957e8db134cc2dfda263de870fcee3a30e895fe41f27f42bf5cfb**; the package audit is `consumer/package-audit.json`, SHA256 **bef68991ef3bdf220f04462059b31a263a55f8a33c928949700700aff728d673**.

- At 1000×720, empty/unconfigured before and after focus, the full hint, model, plus and send occupy separate rectangles. Normal desktop labels and long narrow model labels also do not intersect. The original 110.265625×18px overlap is absent.
- At 390px, the unchanged product intentionally hides the hint. This is not a visible-hint pass. Exactly one separately labelled CSSOM diagnostic removed only that existing display declaration; the shared hint then remained fully visible and separate from the controls. No product source override was made.
- At 1000×420 with a long draft, public Book capture without the Workshop toolbar shows input, hint, model, plus and send inside the viewport, with real center hit tests. Ordinary typing and `send.click()` produced a local fixture echo and cleared the draft, with window and region scroll positions remaining zero. No forced click, explicit scroll or model request was used.
- The two existing consumer regressions passed, including keyboard model selection and focus clearance at 900×600 and 390×330. No product test threshold changed. The final isolated dependency graph resolves 13 public/peer paths to one Tail, JSX and CSS instance; normalized install and frozen repeat both passed, and installed theme bytes match the packed candidate.

The original aggregate `acceptance.log` remains exit 1: an extra temporary probe required the entire short-window wrapper box to fit, while its last 3.812px of empty padding extended below the viewport. Actual content, form outline and controls fit. The separate short-window interaction run passed with the geometry and ordinary click evidence above; independent review closed the visible/control reachability concern. The initial relative-file fixture's duplicate Tail paths are also retained in its failure log; normalization to one absolute locator fixed that isolated fixture. Neither failure is relabelled as a successful aggregate run.

The coordinator opened and inspected the original wide focused image and both short-window before/after images. Screenshots, geometry and unmodified logs are preserved under `consumer/evidence/`. Owned servers exited normally. Rossovia main remains clean at its original SHA; its main dependencies, installed App and coding instances are unchanged. This proves local candidate consumption, not registry publication, installed-version acceptance, a real provider receipt or an all-application visual pass.

The original product screenshots were also uploaded to Library, with the full receipt in `artifacts/composer-footer-20261019/library-uploads.json`:

| Original screenshot                                   | Library ID                                 |
| ----------------------------------------------------- | ------------------------------------------ |
| Wide, empty/unconfigured, focused                     | `libfile_05a9e52dd57081919106ed3121c205cc` |
| Narrow, long model label, existing hidden-hint policy | `libfile_8c594c8f65f0819183c2467b3de83e58` |
| Short window, long draft before send                  | `libfile_80591a2cff788191b0cb237290472c6c` |
| Short window, local echo after send                   | `libfile_7e4c5223cc2881918293d80c838e1a75` |
