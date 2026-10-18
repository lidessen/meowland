# Presentation author experience: separating the script from the component experiment ground

This round is review and design, not new API implementation. `examples/presentation`, public components, dependencies, and lockfiles were not modified, and nothing was pushed or published; the unknown `data/` and the separate B+C prototype were neither read nor modified.

## Conclusion

The user's feedback holds: the current entry makes authors deal with the host, lifecycle, and acceptance engineering before they start writing pages. `examples/presentation` should remain as an experiment ground for complex interactive works and component acceptance, and can no longer represent "the lowest cost of writing a PPT".

Recommend two steps: first give a single script entry, default theme, mounting, asset building, and dev refresh to the tool; then use a thin author adapter layer to standardize a plain slide's `title + content` into the existing title/layout/render. The player, theme, and lifecycle still use the existing implementation. Do not first copy Slidev's whole Markdown/Vue/UnoCSS/Vite compilation stack.

Simply moving code into more files, adding a `defineDeck` that returns the same object, or hiding all the implementation in a scaffold that every work still has to maintain does not solve the problem.

## The real responsibilities of the current 451 lines and surrounding code

The baseline is this round's starting point, `769f489`. The numbers below are physical lines of tracked text, including blank lines/comments; binary assets are not counted by newlines.

| Ownership                                       | Files and line counts                                                                                 | Total | Should an ordinary author rewrite it?                                      |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----: | -------------------------------------------------------------------------- |
| Content, work-specific interactions, and styles | talk.tsx 451, talk.styles.ts 45, assets.ts 19                                                         |   515 | Content/model should be written; default typography should not be repeated |
| Browser and review host                         | main.tsx 38, preview.ts 21, talk.stories.tsx 89                                                       |   148 | Should be carried by a shared host or generator                            |
| Build, startup, config                          | build.ts 48, serve.ts 18, HTML 13, Book config 7, tsconfig 10, media declarations 20, package.json 15 |   131 | Generated/maintained by tooling                                            |
| Acceptance                                      | delivery.spec.ts 173, Playwright config 22, test tsconfig 4                                           |   199 | Targeted acceptance by maintainers and complex works                       |
| Work-specific asset production                  | generate-images.ts 70, record-transfer.ts 121                                                         |   191 | Only this work needs it                                                    |
| Docs, sources, and iteration history            | README 69, NOTICES 13, three records 126                                                              |   208 | Keep sources; do not force every script to keep an equivalent ledger       |
| Subtitles                                       | local-transfer.vtt                                                                                    |    13 | Asset content                                                              |
| **Total**                                       | Tracked text                                                                                          |  1405 | **It is not true that every author must write 1405 lines**                 |

The mutually exclusive segments of `talk.tsx`:

| Lines   | Line count | Responsibility                                                                                                   |
| ------- | ---------: | ---------------------------------------------------------------------------------------------------------------- |
| 1–28    |         28 | imports, versions, host options                                                                                  |
| 29–105  |         77 | Work-specific transfer animation, RAF, reduced motion, cleanup, and Replay                                       |
| 106–120 |         15 | Per-session speed, video time, derived formula, and slide jumps                                                  |
| 121–393 |        273 | Five slides of JSX mixing copy, typography, and interactions; 15 of these lines are optional video-resume wiring |
| 394–405 |         12 | Player composition and returning session state to the fixture                                                    |
| 406–451 |         46 | Another two slides of music-lifecycle experiments                                                                |

Animation formulas, live jump-back, and video-time resume are not minimum requirements for an ordinary PPT, and they must not be pretend-deleted into the same work just to reduce the line count. The real problem is that they appear in the starter example, and the low-level style has fallen behind existing capabilities:

- Column ratios are still hand-written with Grid/CSS instead of using `PresentationLayout`'s 1/2/3, wide-start/wide-end, and header/footer.
- Plain images still compose ImagePreview, figure, captions, and frame height by hand instead of using `PresentationImage`.
- Bullet points still use list CSS instead of `PresentationList`.
- Default font sizes and spacing for headings/body already have theme support, yet the work defines another set of base rules.
- `position` could be omitted; ordinary works do not need hand-written navigation state, knownSlides, or experiment deep-link parsing.
- main/preview separately repeat theme/runtime/cleanup; build/serve/media declarations should not be author startup tasks.

See `artifacts/presentation-authoring-audit/burden.md` for per-file evidence.

## Slidev's actual authoring path

The official docs were read this time and show v53.0.0; the source is pinned at [`30a0a54c8739b4b395d9b336a6304cc8ebcc3947`](https://github.com/slidevjs/slidev/commit/30a0a54c8739b4b395d9b336a6304cc8ebcc3947). Slidev was not installed or run, and reading source is not described as runtime acceptance.

The [official getting started](https://sli.dev/guide/) provides a project-creation command and generated dev/build scripts. Authors usually edit `slides.md` and run `npm run dev`; the entry, navigation, and default styles are not hand-written every time by the author.

| Scenario                 | Slidev authoring style                                                   | Carried by infrastructure                                                                                   |
| ------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Simple text              | Markdown headings/paragraphs, `---` pagination                           | Compilation, page recognition, typography                                                                   |
| Two columns              | two-cols/two-cols-header in frontmatter, named areas such as `::right::` | Full-width title and area layout                                                                            |
| Images                   | Image reference or the image-right layout, with contain when needed      | Image areas and layout                                                                                      |
| Progressive reveal       | v-click / v-clicks                                                       | Step registration, navigation, and visibility                                                               |
| Classroom interaction    | Reference your own Vue components                                        | Automatic component discovery; question state and feedback still need implementation                        |
| Theme                    | Pick a theme once in headmatter                                          | Default font sizes, margins, common page styles                                                             |
| Media                    | SlidevVideo/native audio, subtitles/captions                             | Page/click activity wiring for video; ordinary audio does not thereby gain an equivalent lifecycle contract |
| Development and delivery | dev/build commands                                                       | Vite/HMR and static SPA builds                                                                              |

Main references: [syntax](https://sli.dev/guide/syntax), [layouts](https://sli.dev/builtin/layouts), [reveals](https://sli.dev/guide/animations), [components](https://sli.dev/guide/component), [themes](https://sli.dev/guide/theme-addon), [CLI](https://sli.dev/builtin/cli).
Source was checked for the [scaffold](https://github.com/slidevjs/slidev/blob/30a0a54c8739b4b395d9b336a6304cc8ebcc3947/packages/create-app/template/package.json), [base typography](https://github.com/slidevjs/slidev/blob/30a0a54c8739b4b395d9b336a6304cc8ebcc3947/packages/client/styles/layouts-base.css), [two-cols-header](https://github.com/slidevjs/slidev/blob/30a0a54c8739b4b395d9b336a6304cc8ebcc3947/packages/client/layouts/two-cols-header.vue), [SlidevVideo](https://github.com/slidevjs/slidev/blob/30a0a54c8739b4b395d9b336a6304cc8ebcc3947/packages/client/builtin/SlidevVideo.vue), and [VClicks](https://github.com/slidevjs/slidev/blob/30a0a54c8739b4b395d9b336a6304cc8ebcc3947/packages/client/builtin/VClicks.ts).

Points not to copy directly: image-right's default cover is unsuitable for textbook text screenshots, and the two-column implementation does not automatically solve arbitrary long text/nested overflow. Slidev's trusted local Vue authoring capability must not spread into a finite JSON execution entry. Its starter also shows many capabilities, and the starter's total line count is not the minimum authoring volume either.

## The two comparison samples that were written

Both samples cover seven kinds of pages: text, two columns, images, progressive reveal, Q&A, audio/video, and summary. Their body copy, questions, media, and state strategies are not identical, and their formats differ too; **reduction percentages, development-efficiency multiples, or equivalent performance cannot be computed from them**.

| Sample                     | Author source                                                                          | Host/config                                                                                          | Actual validation                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Existing Meowtail API      | slides.tsx 170 lines/169 non-empty, 6015 bytes                                         | main 28, HTML 21, build 10, tsconfig 4, media declarations 16, 79 lines total; sources 10 more lines | Existing dist typecheck, local Bun build, Chrome seven-slide switching/reveals/Q&A/cross-slide state |
| Slidev hand-written script | slides.md 74 lines + QuickCheck.vue 45 lines, 119 lines total/97 non-empty, 1972 bytes | Dependencies/config genuinely exist, carried by the official scaffold                                | Official docs and pinned source checked; not installed or run                                        |

Files:

- `artifacts/presentation-authoring-comparison/meowtail/slides.tsx`: uses current public exports, with no work CSS and no new helper/API.
- main/index/build/types are kept separately in the same directory; it cannot be claimed that "single-file zero-wiring startup is currently supported".
- `artifacts/presentation-authoring-comparison/slidev/slides.md`, `components/QuickCheck.vue`, SOURCES, and counts.

The existing-API version creates signals per session in a `createDeck(): PresentationProps` factory, avoiding module singletons; the default theme supports text, lists, layouts, and images. It uses no external network assets, and the seven slides showed no diagnostic/runtime errors; the choice is retained after returning from the Q&A. The root actually opened four original images (cover, two columns, Q&A, and media) and does not claim that all seven images passed human aesthetic review.

Looking at the actual images also shows that "no CSS" does not mean the author experience is complete: an ordinary Button is 14px/36px, clearly smaller than 28px body text; a Check becomes a long bar in a Stack. Follow-up work should study shared presentation-content control defaults/compositions instead of making every courseware write font-size and width patches. This round did not change components for this prototype.

## Recommended minimal capabilities and authoring style

### P0: one author host and dev entry

Goal: authors maintain only `slides.tsx`, assets, and necessary interactive components; after one scaffold, a single dev command opens preview and a single build command delivers. Command names are not yet implemented or finalized, and the current Bun scripts are not packaged as an existing CLI.

The unified host carries: media-type environment, asset graph, HTML/viewport, registry, the same runtime, default theme, mount/unmount, page positioning, and preview permission. The factory is called once per session in the browser; JSX is not pre-executed on the server just to read configuration. The host's inactive permission must not be overridden by the author's props spread; when the author provides position, it remains the sole owner.

Start with automatic rebuild and reload after changes. Reload rebuilds the session, so it cannot be called interaction-state-preserving HMR; true HMR identity/state restoration is designed separately.

The current data factory usable as input has been proven with existing types:

```tsx
export default function createDeck(): PresentationProps {
  const choice = signal("");
  return { title: "Read a habitat", slides: [/* existing SlideDefinition values */] };
}
```

It is still not a light enough final authoring experience, because every slide still writes id/title/render, Layout/header, and a repeated title.

### P1: a thin author adapter that actually does something

The following is a **proposed authoring style, not yet implemented and not the current public API**. defineDeck must actually perform default title/layout standardization, not just be an identity helper:

```tsx
export default function createDeck() {
  const answer = signal("Choose first.");
  const points = ["Describe what changed.", "Point to evidence."];
  return defineDeck({
    title: "Read a habitat",
    slides: [
      { id: "intro", title: "Read a habitat", content: <p>Observe, compare, explain.</p> },
      {
        id: "compare",
        title: "Look for evidence",
        columns: 2,
        content: [
          <PresentationList items={points} />,
          <PresentationImage src={forest} alt="Forest in Wolong" ratio="fill" />,
        ],
      },
      {
        id: "steps",
        title: "Build an explanation",
        steps: points.length,
        content: (
          <Stack>
            {points.map((text, i) => (
              <Reveal at={i + 1}>
                <p>{text}</p>
              </Reveal>
            ))}
          </Stack>
        ),
      },
      { id: "check", title: "Quick check", content: <QuickCheck answer={answer} /> },
    ],
  });
}
```

Recommend a separate author type/adapter layer that standardizes into the existing `SlideDefinition` and `PresentationProps`, keeping the low-level interface and avoiding turning the existing interface into a union that breaks external inheritance directly. There is no second player.

Boundaries confirmed by the independent review:

- content and render are mutually exclusive; columns/footer belong only to the shorthand branch. A simple slide's title is used for both the outline and the default h2; special covers, different on-screen titles, or custom headers continue to use the existing render.
- Only build the render closure; do not pre-execute components, traverse the DOM, or pre-render the whole slide; Reveal/Video/interactions still mount under the CurrentSlide Context in the end.
- Distinguish content by property presence and do not swallow the number 0 or valid empty content; common readonly arrays need explicit support in the author layer, without casually changing the core Child.
- Local state of in-slide components still unmounts when leaving the slide; state that must survive across slides is held by the session factory. One-shot content such as AsyncIterable is not promised to replay automatically on return.
- steps keeps an explicit contract for now; list content can be de-duplicated via length/map of the same points array. Do not execute render twice just to save a number or automatically scan arbitrary nested Reveal.
- Plain layouts/images/lists already exist, so no synonymous components are needed; common classroom choices/prompts need evidence from several real segments, either changing shared defaults or making small compositions—arbitrary business questions must not become an automatic scoring platform.

Markdown/MDX can be a candidate authoring entry later, but this round should not first establish a whole new protocol for pagination/frontmatter/component scope/state/assets/error positions. Although the repository's MeowPress already has MDX compilation, it is currently a static `renderToHtml` path, and the presence of the dependency does not mean an interactive slide authoring host already exists.

## Observable results of later implementation

1. The starter entry shows only the script, assets, and a small optional interaction that an ordinary author maintains; the complex transfer work is labeled separately as an experiment ground.
2. Plain text slides write no CSS, render closure, or repeated on-screen title; two columns/images only declare semantic areas.
3. Authors are not required to maintain main/build/serve/registry/theme/cleanup; dev refresh and delivery commands genuinely work.
4. Reveal, courseware state, media stopping, and finite-canvas diagnostics continue to go through existing components; reducing source code does not break lifecycle or default reliability.
5. Use the same script to validate the number of operations and error feedback after the author changes a title, adds a slide, swaps an image, adds a step, or adds an interaction; compressing code into one line does not prove a better experience.

This round only adds this design record and the comparison drafts/evidence in ignored directories; it does not implement the new public capabilities above, nor does it run repository-wide tests or official release acceptance. The reduced example's local typecheck/build/limited browser observations cannot be extrapolated to a passing verdict for the Slidev comparison draft or the full courseware set.
