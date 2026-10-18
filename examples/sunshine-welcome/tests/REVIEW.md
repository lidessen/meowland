# Sunshine Welcome independent browser review

2026-10-17, final input `sunshine-welcome-a3` after the parent task's uniform rebuild, with a production manifest of 10 build assets. The test author is separate from the courseware body/style author; only tests in this directory were changed, not the runtime, body text or assets, and the main artifact was not cleaned or rebuilt, nor were commits or releases performed.

## Actual problems: failure first, then fix

- The native selection buttons wrote boolean `aria-pressed` as an empty string, breaking both the selected highlight and the accessible state. Real browser assertions after pressing keyboard Space and after revisiting across pages both failed first; they passed only after the courseware author explicitly wrote the state as `"true"` / `"false"`, without changing the generic runtime.
- The author's `.sunshine-lesson select` form rule affected the player outline and overrode its dedicated chrome. A same-page computed comparison was added: only the author rule was temporarily removed through CSSOM, keeping the public theme as reference; the old build's outline was white-backed, 20px, 1px border and did not match the public reference, failing stably. After the author switched to `.lesson-field`, the outline matched the public reference while the body textarea kept the author's styles. The assertion does not fix aesthetic color/font-size constants.
- First read found the invalid shorthand `font:600 23px/1.3 inherit`, and the author split it into properties; the problem that Redo cleared input but kept reference answers was converged before the first interaction round into clearing this question and returning to step 0. Later, selected state, question redo and hint/answer retraction were actually checked, without claiming that these two items had old-build failure screenshots.

## Final execution and results

```sh
bun test examples/sunshine-welcome/tests/session.test.ts
bun node_modules/typescript/bin/tsc --noEmit -p examples/sunshine-welcome/tests/tsconfig.json
bun node_modules/oxlint/bin/oxlint --deny-warnings examples/sunshine-welcome/tests
bun node_modules/oxfmt/bin/oxfmt --check examples/sunshine-welcome/tests
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config examples/sunshine-welcome/tests/playwright.config.ts
```

Actual results: all 10 browser checks passed (5.7 s), same-module dual-factory isolation 1 item / 11 assertions passed, and test typecheck, lint and format checks passed. Local Chrome and an independent loopback server on 13032 consumed the official `dist/`; Meowbook/the development server was not treated as delivery.

Finally the parent task only darkened small text, formatted HTML and rebuilt, without changing layout/content/state. That final input was supplemented with cold start, CSS isolation and the new comparison diagnostic, 3 items, all passing (2.0 s); the unrelated classroom-logic matrix was not repeated, and it is not claimed that the original 10 items were fully re-run after the color adjustment. The diagnostic read 42 visible small-text samples across the nine pages' final steps and computed against actual foreground and ancestor-composited backgrounds: minimum about 4.52:1, with kicker minimum 5.57, source-tag 4.93, speaker 4.93, word meanings 5.47, character phrases 4.60, and sample opacity all 1. The check uses readability ratio as the threshold and does not fix colors or pixels.

Browser coverage:

- Choices and input do not advance teacher steps; hints, reference expressions and reasons appear step by step. Answers not revealed are absent from the accessible snapshot; going back retracts hints/answers but keeps responses.
- Choices and reasons persist across pages; Redo this task clears this question and returns to step 0.
- Six-pair matching keeps wrong input, and hints do not reveal the reference key early; when one of two inputs is correct it shows 1 of 2 rather than marking the empty one wrong. Redo clears all matches; revealing with empty input shows No selections entered.
- Native checkbox Space operation and cross-page selection persistence; dialogue hints and reference feedback are separate.
- Pair options and writing, exit word choice and writing persist across pages; the exit summary reads earlier choices; Redo exit ticket does not clear earlier choices/reasons.
- Button Space, textarea arrow keys and select arrow keys are not stolen by page navigation. Native select verification confirms keyboard events are not cancelled and page/teacher steps do not advance; value selection is separately verified through native selectOption, without claiming that scripted manual keyboard acceptance of the operating-system popup menu is complete.
- Hints and direct steps in normal / reduced motion, plus control reachability, input and feedback at 1440×960 / 390×844.
- A new browser context blocks all requests from non-delivery origins and decodes every actual image page by page; external requests, request failures, HTTP errors and page exceptions are all zero. Refresh returns to a new-session home page.
- Visible text, images and form boundaries of all nine pages at the final teacher step are inside the stage; screenshots are not used as pixel goldens.

The same-module factory test creates two courseware instances separately, changes all classroom signals and position in the first, and confirms the second remains a blank home page; modifying the second in reverse does not pollute the first. This is a same-module state-isolation check, not a claim of complete browser acceptance with two DOMs on one screen.

## Original images and scope

A complete browser run generates wide nine-page originals in `test-results/lesson-all-classroom-scene-eeb0c-at-their-final-teacher-step/`; the wide/narrow images for choice B + input Ask first + step-2 feedback are in `test-results/lesson-wide-and-narrow-hos-6abcd-d-player-controls-reachable/choose-feedback-{1440,390}.png`. Later targeted Playwright runs reset that temporary directory; this round finally kept `test-results/contrast-small-authored-te-05771--actual-composed-background/contrast-diagnostics.json`. These are all regenerable ignored artifacts, not delivery runtime dependencies. The nine-page rough-draft originals were actually viewed, and a3 re-checked the two changed word pages, matching, pair work and wide/narrow selected feedback with priority; selected highlight and outline styles are restored, with no remaining behavior or cropping blockers. The parent task additionally kept `artifacts/courseware-review/sunshine/final-a3-*.png` after the final color adjustment as delivery visual evidence.

Textbook edition, teaching facts and citation boundaries are carried by the independent content review and `../SOURCES.md`; this record does not claim that browser checks prove textbook accuracy. There was no manual screen-reader testing, physical phone touch, real classroom projection or learning-outcome evaluation; narrow screens use fixed-canvas scaling, and operable controls do not mean the scaled-down body text suits phone reading. Cold-start evidence is limited to local HTTP and external-request blocking, and makes no claim about `file://`, arbitrary deploy subpaths, persistence, multi-user answers or publication.
