# Grade 8 Volume 1 Unit 5 · Wild animals — Reading: Protecting pandas

An eight-page runnable browser courseware, work identity `protecting-pandas-a5` (a5 is visible in the surrounding page header). Based on the Reading 1 PPT provided by the user and researched teaching material,
it moves from growth information through problems/consequences and protection measures to evidence-based personal action expression. The reading material title is `Xiwang in safe hands`;
the textbook edition or page numbers are not inferred from the file name. See [SOURCES.md](SOURCES.md) for the sources and boundaries of excerpts, images and teaching adaptation.
The original PPT, user material and the other work Sunshine Welcome are not overwritten.

a5 reuses the shared `PresentationImage`, `PresentationList` and numeric two/three columns. Observation photos are shown in full by default;
on the short-film page, the video, forest photo and existing questions are separated into three independent regions; the forest explicitly uses `cover` and notes the cropping, avoiding captions and questions being squeezed into a horizontal strip.
Questions, task states and material sources follow a4, and forest change is not inferred from photo cropping. For generic usage see the [presentation layout guide](../../packages/meowslides/PRESENTATION-LAYOUTS.md).

## Open and edit

In a same-version Meowland repository with Bun and dependencies/package builds ready, run from the repository root:

```sh
bun examples/protecting-pandas/build.ts
bun examples/protecting-pandas/serve.ts
```

Open `http://127.0.0.1:13014/`; press Ctrl-C to stop this service. Verify port conflicts first; `PORT=13024` changes the port.
The new courseware uses its own address; `13012` is still Sunshine Welcome. Rebuild and refresh after source changes; there is no HMR.
Already-open tabs do not load new scripts automatically; after an update press Cmd-R (Ctrl-R on Windows/Linux) to refresh. Refresh starts a new session and clears this page's drafts.
The build output is in the ignored directory `dist/`, needing only local static HTTP; double-clicking file:// is not supported by default, and there are no external fonts, media or APIs.
`PANDA_OUTDIR` can put a candidate build in a dedicated directory, and `PANDA_DIST` can let the acceptance server read that directory; the user preview is updated after verification.

The entry is `index.html` → `main.tsx` → `lesson.tsx`, verified content is in `content.ts`, and the work's visuals are in `lesson.styles.ts`.
All in-canvas options are shown directly, using large text cards, visible check marks and native button semantics; teaching options are not hidden in a select.
These are the work's content and state composition, not a new Meowtail teaching component or grading API. The surrounding player outline follows the existing navigation.

## Teaching and state

| Page id    | Student task                                                                                              | Observable output                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `welcome`  | Understand the reading and expression goals; Next reveals the goals, then changes page                    | Know that evidence is needed and the action must be explained                                                    |
| `observe`  | Compare visible details of two pandas, then return to the text for time information                       | One observation and one open question; First/Then/Later hints can be retracted                                   |
| `growth`   | Choose a growth stage and explain the change from the text                                                | One spoken retelling with a time clue                                                                            |
| `watch`    | Watch the real bamboo-eating clip, raise questions about life needs, then check the text on the next page | Distinguish observation, inference and the original P/A sentence; form a problem-consequence-measure explanation |
| `problems` | Choose a problem and explain possible consequences                                                        | One problem-consequence relationship and its textual evidence                                                    |
| `protect`  | Choose a protection measure and explain which problem it may address                                      | Evidence-based relational explanation, not graded as unique matching                                             |
| `meaning`  | Discuss why protection is still needed                                                                    | Connect the article's message with the earlier problems                                                          |
| `act`      | Propose a concrete personal action with reasons and a first step                                          | Open action expression plus peer checking                                                                        |

Try one key segment first and adjust material volume, scaffolds and time according to actual output; eight pages do not equal a complete lesson plan.
Each person thinks or marks evidence first, then retells to a partner; listeners also check or revise reasons during sharing, not just a few students reporting.

Questions, options and reading excerpts stay visible at all times. The three buttons Hint, Reference and Evidence are independent and can be expanded/collapsed repeatedly;
Evidence highlights the always-visible original text and gives a location explanation, without hiding the necessary text. Button state does not automatically follow timers, media or student choices.
The three support areas uniformly consume the shared `Reveal when`, keeping natural layout slots; hiding, focus and activity permission are handled by the component; toggles do not push buttons or the reading area around.
Content themes land only on the canvas article through `slideClassName` and do not override the surrounding titles; the work does not hand-write hiding/ARIA/focus patches, nor shrink text to hide internal region overflow.
The complete reference can be retracted, leaving only the hint, or all collapsed so students express themselves independently; they may ask for help again.

Each presentation factory creates its own position, choice, support-toggle and draft signals. Going back, changing pages and revisiting keep this session's state;
`Start this task again` clears only the current question's choice/draft and the three support toggles, not other questions; refresh starts a new session.
The starting point of a choice is not auto-filled into the student draft, and nothing auto-reveals, changes pages or grades. Open questions accept different evidence-based expressions.
Showing/hiding is classroom presentation, not permission or anti-cheating; original excerpts and reference content may both be visible in the audience bundle.

## Images and short video

The key visual, the cub/older panda comparison and the reserve forest come from real photos with clear licenses; the bamboo-eating clip is real captive footage of Bao Bao at the Smithsonian National Zoo, 18 seconds, silent. The external animals are not a life record of Xiwang, and photo size cannot imply the text's age/weight; the forest photo is not evidence of bamboo forest shrinkage. The original six-page reading task and progressive scaffolds are retained, observing then returning to the text to explain.

`media.ts` explicitly imports local images, video, poster and English observation captions; see [SOURCES.md](SOURCES.md) for sources, attribution, processing and each learning task, and [NOTICES](assets/NOTICES.md) for third-party licenses. a4 has removed the old PPT photo of unknown origin and does not copy the original HTML's AI growth video.

The video uses the shared `PresentationVideo`, paused by default, and does not auto-loop, reveal or change pages. Play / continue, Pause and Back to start are keyboard-operable; Back to start pauses and returns to the beginning, still waiting for explicit playback. Changing pages stops and releases the media, and revisits start paused at the beginning; drafts, choices and teacher supports of other tasks are kept. Image failure keeps the description; video failure keeps the poster/text alternative and Retry loading. All classroom media are delivered locally and need no third-party site after loading.

## Review and checks

Same-source works are wired through `meowbook.config.ts`, and five fixtures pass `active=false` from the first mount, including observation and video, without copying the courseware implementation.
Run types, format and lint according to the repository's [engineering checks](../../docs/development-checks.md); this work's browser configuration is
`tests/playwright.config.ts`, which exclusively uses `13034` and consumes the official build artifact.

Actual classroom options, assistive-technology visibility of hidden content, keyboard/focus, revisits/redo, long drafts and the all-supports state need operational observation.
The fixed canvas scales as a whole in narrow/short windows and does not secretly become a phone long-form page; the actual-size mode can be used for enlarged reading.
Passing a build or browser operation does not mean classroom learning effectiveness, nor does it mean PPTX/PDF export, deployment or publishing.

## Presentation package wiring

This work's playback, steps, media, layout and presentation theme come from the standalone `meowslides` package;
generic Button/Stack/Inline and so on still come from `meowtail`. The official entry and the Meowbook preview each install the generic UI and presentation registry,
and assemble the complete `presentationTheme`. This migration only adjusts package and theme wiring, keeping the work content, state and chosen colors.
