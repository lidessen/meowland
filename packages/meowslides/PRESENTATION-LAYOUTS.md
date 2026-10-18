# Presentation content layout

Decide what the audience needs to read first, divide regions accordingly, then place content.
`PresentationLayout` is the generic page skeleton; titles, text-image, comparison, number, process and
summary continue to compose existing components. The runnable six-page composition is in Meowbook's
`presentation-layouts`, and does not change the existing image presentation or English courseware.
`presentation-foundations` separately uses three real presentation pages to show numeric column counts,
native lists, photo cropping and the complete display of a text diagram.

## Regions and proportions

Import `PresentationLayout` from `meowslides`; the root entry point re-exports the same implementation.
`header` and `footer` accept ordinary Child and keep natural height; `children` enter the body, which
takes the remaining height. Omitting any slot leaves no empty row or extra spacing. The skeleton adds
no extra edges and follows the Presentation canvas inset.

| Relationship                      | `columns`                 | Suitable content                                                          |
| --------------------------------- | ------------------------- | ------------------------------------------------------------------------- |
| Single reading axis               | `single` (default) or `1` | Title, quote, summary, or a further Grid inside                           |
| Equal importance                  | `equal` or `2`            | Two options, before/after comparison, two sets of evidence                |
| Three equal regions               | `3`                       | Three short groups of points, a few steps, or a comparison of three sides |
| Main content at the logical start | `wide-start`              | A number or main image takes 2 parts and the side note 1 part             |
| Main content at the logical end   | `wide-end`                | An explanation takes 1 part and the image or experiment 2 parts           |

Numerical `1 | 2 | 3` means the number of equal-width logical columns, and the existing string usage
stays unchanged. Usually provide as many direct children as columns; more than the column count adds
rows as in an ordinary grid, and the amount of content on the finite canvas still needs checking. More
complex regions continue to compose Grid inside `single`; do not turn every composition into a new
template. `gap` uses none/compact/normal/relaxed, default normal; the theme's
`presentationTokens.spaceGroup`, `spaceSection` and `spacePanel` decide within-group, region and wider
spacing, independent of toolbar control spacing.

```tsx
import { Stack } from "meowtail";
import { PresentationImage, PresentationLayout } from "meowslides";

<PresentationLayout
  columns="wide-end"
  header={<h2>One point, with an image that explains it</h2>}
  footer={<small>Sources, conditions and necessary notes</small>}
>
  <Stack justify="center">
    <p>A short claim and its applicable conditions.</p>
  </Stack>
  <PresentationImage
    src={image}
    alt="Describe what the image expresses"
    ratio="fill"
    caption="Explain the relationship to observe in the image."
  />
</PresentationLayout>;
```

Here the body provides finite height, the image uses the remaining space, and the caption keeps
natural height. After replacing it with a real image, still check the aspect ratio and complete edges.
The skeleton does not download assets, does not crop by default, and does not treat text inside images
as accessible body content.

## Body lists

`PresentationList` accepts `items: readonly Child[]`, each item automatically forms a native li, using
ul by default. When order matters, specify `as="ol"`; native attributes such as `start` and `reversed`
still land on the list element; do not hand-write duplicate numbers.

```tsx
<PresentationLayout columns={3} header={<h2>Three regions use the same reading scale</h2>}>
  <PresentationList items={["Record observations.", "Keep the sources."]} />
  <PresentationList
    as="ol"
    items={["Compare under the same conditions.", "Point out the differences."]}
  />
  <PresentationList
    as="ol"
    start={3}
    reversed
    items={["Converge on the problem.", "Explain the conclusion.", "Propose the next step."]}
  />
</PresentationLayout>
```

Lists follow `presentationTokens.fontBody` (28px by default in the standard theme) and the
presentation line height and group spacing, adding no separate size/density. They do not auto-shrink
type based on content amount; three columns even less so can take unbounded long content. Keep a small
number of explainable points first; when too long, trim, split pages or adjust regions, and still
observe the overflow diagnostic and the actual reading result.

## Body images and captions

`PresentationImage` requires `src` and a meaningful `alt`, and reuses ImagePreview's loading, failure
feedback and events. The optional `caption` is an ordinary Child, rendered as a natural-height
figcaption inside the native figure; it is not decorative text floating over the image. Do not leave
key text inside an image only in pixels; still provide alternative text or a real body explanation.

`ratio` defaults to `16 / 9`, and a positive finite number can also be passed as the box's preferred
ratio; `ratio="fill"` uses the remaining height allocated by a finite parent. fill does not find
screen height on its own: put it directly in the PresentationLayout body, or in an existing finite
Stack's `LayoutItem grow basis={0}` region, then keep the natural height of other text. When the parent
height is uncertain, use a numeric ratio.

```tsx
<PresentationImage
  src={photo}
  alt="Describe the subject and the observable environment"
  ratio="fill"
  fit="cover"
  position="top right"
  caption="A photo that allows cropping still needs the subject checked for completeness."
/>;
<PresentationImage
  src={diagram}
  alt="Use real text to explain the relationships in the image"
  ratio={4 / 3}
  caption="Text diagrams are fully shown by default."
/>;
```

`fit` defaults to contain, keeping the complete image; cover must be chosen explicitly and allows
cropping. When ratios differ, keeping all content and filling the region cannot both hold: text
diagrams, charts and evidence images prefer contain, and blank space is the normal result of a ratio
difference; choose cover for photos only when the edges can be discarded, and actually look at the
subject and the crop. `position` defaults to center, with top/bottom/left/right, top left/top
right/bottom left/bottom right available.

caption, page title and footer all take natural height, and media uses only the remainder. A long
caption reduces the picture space, and fill cannot guarantee that arbitrary content fits; numeric
ratios must also be checked together with the whole-page capacity. Do not let the image fill the body
first and then squeeze the caption into the footer. Complex media compositions can still use Stack +
LayoutItem; AspectRatio suits natural-ratio placeholders and does not replace the finite height budget.

## Choosing a composition

| Purpose                 | Minimal composition                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Title and claim         | single + Stack justify="center"; main title, subtitle and context                                                                      |
| Text-image split        | wide-start/wide-end + PresentationImage; choose primary and secondary by the importance of the evidence                                |
| Side-by-side comparison | equal; use the same heading hierarchy and comparison axis, and avoid greatly different content amounts                                 |
| Key number              | wide-start; number, unit and conditions form one region, explanations and sources go elsewhere, illustrative values are clearly marked |
| Process or timeline     | single + native ol/li inside Grid/Stack; keep order semantics, compose Reveal when necessary                                           |
| Quote or summary        | single + blockquote/Stack; distinguish the quote, the author's conclusion, the source and the next step                                |

Reading font sizes come from the existing
`presentationTokens.fontTitle/fontSubtitle/fontBody/fontCaption`. Headings that truly need emphasis can
use `PresentationText` editorial or marker; body text is plain by default, and not every page needs
artistic treatment. It remains real text that can be selected, wrapped and copied; native
contenteditable is only a seam and does not constitute an editor. Print and forced-colors keep
ordinary text.

## Backgrounds and reading area

Presentation.background sets the deck default, and SlideDefinition.background can fully override per
page. Both accept `SlideBackground` or its Signal; when the page value is undefined it inherits the
deck, and when the deck is undefined it follows the theme. An explicit `"theme"` returns to the theme
background and text and does not inherit the deck's image, overlay or colors. Fields in the object do
not merge with the deck object; when fill is omitted, the theme paper color is used.

```tsx
const slides: readonly SlideDefinition[] = [
  {
    id: "opening",
    title: "Opening",
    background: {
      fill: "#173d36",
      image: { src: coast, fit: "cover", position: "top right" },
      overlay: "linear-gradient(90deg, rgba(12, 34, 31, .9), rgba(12, 34, 31, .15))",
      foreground: "light",
    },
    render: () => (
      <PresentationLayout>
        <h1>Keep the reading area clear</h1>
      </PresentationLayout>
    ),
  },
];
```

fill and overlay use CSS colors or gradients. image.fit defaults to cover, with contain available;
position defaults to center, with top/bottom/left/right, top left/top right/bottom left/bottom right
available. cover allows cropping, while contain keeps the complete ratio and reveals the base color;
check the actual positions of image and text, and do not rely on background details to convey key
facts. foreground's light/dark refers to text color, and omitting it uses the theme text; it does not
detect the image or automatically judge contrast.

The background covers the whole 1280×720 canvas and crops its own decoration independently; the body
still uses the original inset and overflow diagnostic. After an image error, fill, overlay and
foreground are still kept, so actually check readability without the image and do not treat a
successful download as a prerequisite for readability. The background does not enter the accessibility
tree; images that carry content meaning keep body text, alt and explanation, and are not moved into the
decorative layer. A background Signal can update on the same page without remounting the draft, media
or content instance; video still uses the body media components and is not a background input.
Updating the background on the same page only replaces the decorative layer and does not trigger the
page-change entrance animation. The running scene `presentation-backgrounds` lets you observe the deck
gradient, per-page image, contain, theme reset, dark, failure and dynamic updates.

## Canvas and reflow boundaries

Presentation's logical canvas is 1280×720. Narrow or short windows scale as a whole with contain, and
two columns are not silently turned into a top-bottom arrangement; the named ratios of this skeleton
belong to the logical canvas. When a mobile-first reading page is needed, use Container/Stack/Grid
natural layout instead, and do not carry lots of body text through presentation scaling. `RegionLayout`
targets tool areas, named regions and scroll owners, and is not a presentation document schema.

The finite canvas cannot hold arbitrary long text. A long title takes natural height first, and the
body region may therefore be insufficient; by default it does not crop, auto-shrink text or add hidden
scrolling, and keeps Presentation's overflow diagnostic. Prefer trimming, splitting pages or
rearranging regions, then observe the target size; original-size mode cannot replace readability
acceptance. Reveal keeps region geometry while hidden, so progressive appearance does not suddenly push
adjacent content away. To repeatedly show and hide by local state, use `Reveal when={shown}`, one of the
two options with `at`, reusing the same placeholder, focus and activity permission contract. Authors
add a class to the content layer with `slideClassName`, avoiding extending content heading rules from
the Presentation root into the surrounding navigation. Body content that does not fit inside a named
region gets a diagnostic; explicit inner scroll areas are not counted as canvas overflow by all their
scrolled content.

Verify widescreen full pages, narrow screens, short windows, plus real images, the longest titles and
the final step. Meowbook ready and static screenshots do not prove interaction, media or animation
contracts; verify these separately according to the work's actual capabilities.

## Teaching segments and retractable scaffolds

First clarify the student task, observable output, basis and feedback, then choose a composition above.
The task and original material can be visible at the same time, while hints, reference expressions and
the teacher's basis marks appear separately. Do not treat page count, asset amount or animation count
as learning goals, and do not require finishing the lesson plan before previewing; try one segment
first, then adjust the content and state that most affect understanding.

Candidate answers or situations inside the canvas expand directly into clickable text, option blocks or
cards, and do not hide teaching options in a dropdown select. Buttons and writing areas use this
presentation's font, scale, color and shape; native button/input semantics, keyboard, focus and visible
selection feedback still need to be kept. Hint actions and answer areas keep a recognizable
relationship, and do not replace the slide composition with a set of ordinary application forms; the
surrounding player outline remains independent navigation. When supporting areas show and hide
repeatedly, keep natural layout slots and keep the reading area and button positions stable; hiding
still exits the keyboard and accessibility tree. Default, single-open and fully-open all need actual
viewing; do not judge usability only by whether the maximally expanded state overflows. Fixed reference
examples should clearly correspond to the segment and not pretend to be automatic scoring of the
current choice.

The running case is the user-specified "Grade 8, Volume 1, Unit 5 Wild animals — Reading: Protecting
pandas". The following activities, questions and sentence frames are all teaching adaptations, not
textbook quotations, and not a complete courseware or directly runnable story; do not infer edition or
page numbers from them. Following the organizational thread of the studied real 16-page PPT and seven
teaching materials, first try a key segment of about eight minutes, entering from one clue among the
verified growth information into the problem and protection, without requiring all of the Reading to be
covered in eight minutes. Specific original textbook sentences, growth points and problem details are
checked item by item before formal production; unverified places stay marked as pending verification,
and generated text is not used to fill in as textbook content. This case and Grade 8 Volume 2 Sunshine
for all / Welcome are different works; the latter's name, content and entry point are unchanged.

| Reading progression      | Student task and observable output                                                                                                   | Basis and feedback                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Growth information       | Find one growth change in the verified materials and form a short chronological record                                               | Fill in age, food or survival conditions only with verified information; do not give protection conclusions in advance      |
| Problem and consequences | Explain one problem and its corresponding consequence in your own words, and mark the original sentences that support the expression | Locate the problem and the consequence separately; do not fill in textbook facts from images or common sense                |
| Conservation measures    | Connect one measure to the problem it responds to and explain the basis                                                              | If the original text does not prove the measure's effect, do not treat a successful matching as an effectiveness assessment |
| Personal action          | Each person proposes one action and explains how it relates to the problem; a partner checks the reason                              | Accept different reasonable expressions; distinguish textbook measures from actions proposed by students                    |

Each person first independently marks one basis, each pair organizes one "problem, consequence,
measure" relationship, then each forms a personal action expression with reasons. The growth record
serves understanding the problem; do not let timeline organization take up the whole sharing time.
Feedback looks at whether it points back to the original text, whether the relationship holds, and
whether the action reason responds to the problem; student suggestions are not original textbook
sentences and cannot pretend to be verified conservation results.

Use one reading axis with `single` for the selected material, or `equal` to place the original text and
the student's relationship record side by side; for the first round try only one composition. Keep the
original sentences; do not replace the original text with the annotated result. Necessary keywords,
highlights or relationship lines point to the corresponding text and have textual relationship
explanations, indicating growth order, problem/consequence or measure response separately; do not draw
decorative lines as data trends. Reference expressions use ordinary body text and do not convey
evidence through background images.

| Revisit state        | What students see and do                                                                                                         | Teacher feedback and scaffolding                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| First reading        | Original text, questions, blank record; find the basis independently first                                                       | Do not show keywords, conclusion-style headings or reference sentences                                        |
| Request a hint       | The original text is unchanged; add the locating words for growth / problem / action as needed                                   | Only help locate; do not classify the original sentences for the students directly                            |
| Compare explanations | First hear or view the student's expression, then place the original sentences for problem, consequence and measure side by side | Give a complete example when needed, then withdraw to keywords or sentence frames; no need to show everything |
| Withdraw scaffolding | Keep the original text and the student's draft available, hide examples and sentence frames, and rewrite independently           | Students can still request hints again; asking for help does not clear the draft                              |
| Revisit or redo      | Going back to revisit keeps the draft; only an explicit "answer again" clears this question's record                             | When switching to new material, explicitly reset this question's hints; do not silently clear other tasks     |

When a complete example is needed, first form one example from the verified original-text basis and
classroom expression, then withdraw to growth / problem / result / action, or provide teaching-adapted
sentence frames such as "The text describes __. The suggested action is __." and "I could __ because
__.". Fill the blanks with verified reading information or student suggestions, and do not pre-fill
unverified textbook facts. The order and number of layers are decided by student needs; the final
expression need not reproduce the example word for word; after withdrawing scaffolding, locating words
or sentence frames can still be restored. "What could you do, and why?" is also a teaching-adapted
question; discuss different suggestions by the relationship between action and basis, without a
single-option score.

Time can initially be tried as one minute of independent reading, two minutes of partner expression,
two minutes of whole-class comparison, two minutes of independent rewriting and one minute of
feedback; adjust according to actual output. When sharing, listeners also need to check the basis or
revise one sentence, rather than only letting a few fluent speakers report repeatedly. The time budget
is used to preserve learning opportunities and does not drive automatic answer reveal; when materials
are too full, trim or split first.

### Wiring and acceptance boundaries

`Reveal at={n}` only appears cumulatively when `step >= n`, and hides after going back before the
threshold; it keeps geometry, and hidden content exits the keyboard and accessibility tree. Use it for
necessary sequencing; stable sentence frames for repetition can be presented statically and do not
need animation for every sentence. `transition` only decorates entrances, and background only decorates
the canvas; neither defines teaching feedback.

In the example above, the local hint toggle, scaffolding levels and draft are different work states,
held by the work's ordinary signals. The hint area is wired to `Reveal when={shown}` to keep the layout
slot; `at` and `when` are alternatives, and increasing the step does not automatically withdraw old
`at` content. Withdrawing scaffolding can also mean the next task no longer provides example
sentences, without turning every teaching choice into a button or runtime state. Do not hand-write
another visibility / inert / aria-hidden / focus fallback in the work to replace the shared Reveal.
Drafts persist across pages in the work session, while page DOM and media still unmount according to
the existing lifecycle, and re-entering does not autoplay sound. Showing and hiding belong to classroom
presentation, not permissions or anti-cheating; reference answers may still be inspectable after they
enter the audience bundle.

There is currently no dedicated word-selection cloze authoring tool, repeated show/hide-per-blank
component, evidence highlight-line editor, scaffolding level component or scoring engine. These are
needs to keep validating against real authoring difficulties; do not derive a new API from this example
or implement all capabilities at once. Ordinary signals can carry state, but that does not mean the
library already provides the structure, default visuals or accessibility guarantees for these teaching
interactions.

Preview coverage of all key states in the tables, especially the title/caption when no hint is shown,
whether the answer is still leaked after withdrawal, requesting help again, going back and redoing; the
longest student draft, the target projection size and narrow short windows also need actual viewing.
Keyboard operation needs readable names, visible focus and clear state; hidden answers should not
remain readable by assistive technology, and feedback cannot rely only on color or connecting lines. A
static fully-expanded screenshot cannot prove these behaviors, and without real classroom observation,
operational checks cannot be reported as learning outcomes.
