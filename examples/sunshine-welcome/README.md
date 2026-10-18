# 8B Unit 6 · Sunshine for all · Welcome to the unit

A nine-page browser courseware, current work identity `sunshine-welcome-a3`. It targets the Yilin Grade 8 Volume 2 English "Welcome" lead-in lesson, covering only six key words and the topic of helping, without expanding into Reading, Comic strip or the whole Unit. The narrative and all exercises are teacher adaptation; see [SOURCES.md](SOURCES.md) for the verification boundary of the textbook edition and public material.

Student goals: understand and use the six words, offer help that respects the other person's wishes, and explain the choice with simple reasons. The courseware keeps English task sentences, and teachers may add Chinese orally according to students' level. It is a classroom discussion and presentation tool, not a per-student account, automatic grading or answer-persistence platform.

## Running and continuing to edit

In a same-version Meowland repository with Bun 1.4.2 and dependencies/package builds ready, run from the repository root:

```sh
bun examples/sunshine-welcome/build.ts
bun examples/sunshine-welcome/serve.ts
```

Open `http://127.0.0.1:13012/`. This round's new APIs are not officially published, so installing from old stable npm packages does not give an equivalent environment; handle missing dependencies or package builds according to the root README first. Press Ctrl-C to stop this service. Set `PORT=13022` to change the port. Rebuild and refresh after source changes; there is no HMR, no whole-repository cleanup and no extra publishing.

To safely regression-test shared components, set `SUNSHINE_OUTDIR` to build into a dedicated `artifacts/` subdirectory, then use `SUNSHINE_DIST` so independent tests serve that candidate; the default entry and work content stay unchanged, and the `13012` artifact the user is viewing does not need to be overwritten.

The entry is `index.html` → `main.tsx` → `lesson.tsx`; vocabulary facts are in `vocabulary.ts`, and work styles are in `lesson.styles.ts`. The work's forms use only content classes such as `.lesson-field` and do not override the presentation chrome's outline, control or container structure. The logical canvas is 1280×720 with fixed off-white/dark blue/sunshine yellow; the system dark preference does not change the chosen work colors.

## Classroom pacing and teacher advancement

About 40 minutes, compressible according to classroom discussion; it is not an automatic timer. In the regular player, Next first advances this page's step, then changes page; Previous goes back without erasing student input. There is no arbitrary full-stage click-to-advance and no timed automatic reveal.

| Stable page id | Suggested time | Purpose and advancement                                                                                                                       |
| -------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `welcome`      | 2 minutes      | Lesson name and context; step 1 presents the goals                                                                                            |
| `notice`       | 3 minutes      | Observe first, then ask; step 1 thinks about clues, step 2 asks first/listens                                                                 |
| `words-people` | 4 minutes      | blind/deaf/disabled; step 1 definitions, step 2 natural character expressions                                                                 |
| `words-life`   | 4 minutes      | elderly/homeless/poor; same steps, never judging people by appearance or words                                                                |
| `match`        | 5 minutes      | Six text-clue matching pairs; step 1 hint, step 2 this work's reference pairs; no-input hint compares orally, filled items checked separately |
| `read-talk`    | 6 minutes      | Read the original Part B topic-adapted dialogue, multiple-choice comprehension; step 1 hint, step 2 reference expressions                     |
| `choose`       | 5 minutes      | Choose and give reasons; 0 think, 1 hint, 2 reference B and explanation, 3 possible reasons                                                   |
| `pair-talk`    | 8 minutes      | Pairs choose a situation, write advice and reasons, then ask/advise/explain/respond orally; step 1 gives one example                          |
| `take-action`  | 3 minutes      | One word + one action to offer; step 1 self-checks goals and can revisit earlier choices                                                      |

Open-question references are not the only answers. Students may use real or imagined situations, are not required to disclose their own or their family's circumstances, and are not judged by how many helping experiences they have.

## Input, revisits and explicit redo

Each presentation creates ordinary signals once through `createSunshineLesson`. Word matching, multiple choice, situation choice, reasons, oral drafts and the exit question persist across pages; revisits only change narrative position. Two instances do not leak values, refresh starts a new session, and nothing suggests saving to the cloud.

- `Redo matching` clears only the matching and returns to that question's step 0.
- `Redo this task` clears only the choice and reasons, and returns to `choose` step 0 with hints/answers collapsed.
- `Redo exit ticket` clears only the exit question and collapses its self-check.
- `Revisit the idea`, `Revisit the words` and `Revisit my choice` only navigate and do not clear input.

Student buttons are keyboard-selectable, and matching/text input use native controls. Choices do not automatically reveal or change pages; the teacher decides feedback through steps. Student input and teacher references are held separately, and going back does not undo answers. Direct fixtures include, for example, `http://127.0.0.1:13012/?slide=choose&step=0` and `?slide=choose&step=3`.

## Meowbook preview

Same-source works create sessions separately at each entry. Run from the repository root:

```sh
bun packages/meowbook/src/cli.ts check --config examples/sunshine-welcome/meowbook.config.ts
bun packages/meowbook/src/cli.ts serve --config examples/sunshine-welcome/meowbook.config.ts --port 13013 --capture
```

The review fixtures `sunshine-welcome-cover/question/feedback/words` pass `active=false` from the first mount. `sunshine-welcome-interactive` defaults to false as well; permission opens only after an explicit click on Activate in the foreground canvas, and host permission cannot be inferred from document.visibility alone. The current work has no audio/video or continuous animation, and no media is forced in just to cover capability. readiness waits for real image decoding and local fonts.

## Delivery and verification

The build output is in the ignored directory `dist/`, containing the JS/all SVG needed to run, source statements, the build manifest, plus an editable courseware source in `source/` and the root manifest/bun.lock reference. Source snapshots must be put back into a same-version Meowland checkout to continue editing; this snapshot is not passed off as a standalone stable npm package project. The artifact can be served by ordinary static HTTP with no external runtime resources; double-clicking file:// is not supported by default.

It has grown from a three-page rough draft into nine pages, keeping the opening blue-yellow direction; the selection button ARIA strings and content form selector scope were fixed locally. Actual images, interaction and cold-start tests are recorded separately, and a successful screenshot is not treated as classroom acceptance or complete behavior acceptance. Independent tests are in `tests/`, maintained by a separate owner, and final execution results follow the parent task's receipt.

## Presentation package wiring

This work's playback, steps, media, layout and presentation theme come from the standalone `meowslides` package;
generic Button/Stack/Inline and so on still come from `meowtail`. The official entry and the Meowbook preview each install the generic UI and presentation registry,
and assemble the complete `presentationTheme`. This migration only adjusts package and theme wiring, keeping the work content, state and chosen colors.
