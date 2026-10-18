# Presentation chrome optimization receipt

Date: 2026-10-17. The previous round's first browser phase was completed at `65425df`; after viewing screenshots, the user asked for a presentation-specific theme, mainly so that peripheral controls do not copy the app toolbar. In context, "the main image" was interpreted as "a theme"; no background image was generated and the package name was not changed.

## Design tradeoffs and ownership

An independent visual designer actually viewed the b3 original images and compared two directions:

- **Dark screening room**: a neutral deep-ink surround, paper stage and dark control float, with strong contrast, but it adds a second strong visual color block to the existing cream work.
- **Art-book footer (adopted)**: a low-contrast warm gray surround, a small masthead and a centered natural-width control band; paging and page order come first, the outline and tools recede to secondary, and the visuals continue the paper work.

This time only Meowtail's own presentation structure and theme were adjusted. Work content, paper color, fonts, slide ids, steps, assets and narrative were kept, as were the same position Signal, activity permission, media lifecycle and fit algorithm. Generic Button, Icon and native select still carry the underlying behavior and semantics; the scoped rules are limited to presentation chrome and do not affect buttons on the stage or in other components.

The existing features are Previous/Next (step first, then slide), outline, page/step status, paused side effects, and original size/fit window; there is no fullscreen button. This round did not add fullscreen, a menu state machine or auto-hide because of a feature list. The control layer stays visible, aggregates on wide screens and wraps on narrow screens, and touch and keyboard can still find the key controls; the stage and controls get separate space, with no overlay covering the work.

Visual design, production implementation and independent review were handled by different owners; the main author took on the contract build, delivery and local commit.

## What the actual walkthrough changed

The first round of real screenshots found that an outline with a short title made the wide-screen control band wrap unnecessarily and, in short windows, take an extra line of stage height. Only the desktop control band was changed to no-wrap so that the outline absorbs content shrinking; narrow screens still reflow by grouped grid.

Real computed styles further found that although the scoped CSS declared a 44px action height, it was actually still the generic Button's 36px, and narrow-screen font size and padding had not taken effect either. The cause was that the typed part selector used the low-priority `:where`, which the later-loaded Button base rules overrode. The fix only added a real `button` type qualifier to the control band's typed part selector; it did not change the generic theme order, use `!important` or add a visual class. The new regression clearly failed on the old dist with 36 < 44; the stage buttons were also checked to match the reference Button outside the control band, preventing the scoped rules from leaking.

## Final checks and delivery

Engineering ran the five-package build, the official work build, root typecheck, lint, format check and 318 unit tests. After the local CSS fix, the affected Meowtail and the official work were rebuilt, and root typecheck plus 6 theme CSS parse/presentation contract items with 29 assertions passed. The engineering check scripts were not changed and no unrelated negative case was injected again.

The 19 independent browser checks (the original 13 + 6 new chrome items) and the 5 official work items all passed. Finally, peripheral padding/gap was reduced only at the existing short-window breakpoint; after rebuilding and rerunning the affected 6 chrome items, they passed, and all renderings and computed diagnostics were regenerated; the unaffected 13 + 5 items were not repeated. Complete commands, old-version failure evidence and execution scope are in the [independent review record](../../packages/meowtail/tests/browser/presentation/REVIEW.md).

The main author and the independent visual/behavior review separately actually opened the final original images: the official work at 1440×960 and 390×844, real light/dark themes, keyboard focus, a 844×390 short window and a native host fullscreen container. Peripheral controls do not cover the stage, and the outline/buttons are visible and reachable. The navigation buttons measured 44×44; narrow-screen tool buttons are 44 high with font size 12, two tools on the same row, and the control band dropped from 137px to 107px. The short-window control band dropped from 106px to 58px, and the stage recovered from 238×134 in the first round to 384×216 finally. Composite contrast of auxiliary text: light masthead 4.78:1 and footer 5.27:1; dark 8.95:1 / 7.35:1.

Local evidence is in the ignored directory `artifacts/presentation-review/chrome-20261017/`, with before/after images as `baseline-*` / `final-*`; the final diagnostics are `final-computed.json`, and the viewer build output identity is `viewer-output-hashes.json`. Representative wide/narrow images of the official work were handed over to Library separately; no test fixtures or private material were uploaded. The final viewer JS is `chunk-g86j615g.js`, SHA-256:

```text
25006debf69f53a6c3ba5f397bb726151026088df72dd3305afef87a79e6da88
```

The new chrome ships along the existing `Presentation` entry point and theme graph, with no dependency/exports/runtime resource changes. This round did not republish or overwrite the previous round's frozen b3 tarball; the previous round's installed-state results only represent the artifacts of that time and cannot stand in for installed verification of the new styles.

To rebuild and preview from the repository root:

```sh
bun run build
bun examples/presentation/build.ts
bun examples/presentation/serve.ts
```

The local entry point is still `http://127.0.0.1:13009/`. The current work content version is still `image-waiting-b3`; the new peripheral version is distinguished by this round's Git commit and build file identity, and chrome cannot be judged by content version alone. There was no HMR, push, publish or deployment, and `data/` was not read or changed.

No player fullscreen feature was added; what was verified is that local headless Chrome entered and exited the native Fullscreen API on a real container through a host button, which is not physical-screen acceptance. Narrow screens only prove that the fixed-ratio stage and peripheral operations are usable; the work was not changed to mobile typography. The full existing showcase, other browser/OS or screen reader matrices were not rerun, and this round's screenshots are not equated with the user's final visual acceptance.
