# From teaching research to presentation authoring

Date: 2026-10-18. The scope is method and design follow-through, not implementation authorization for new teaching components.
This page records the method phase; the actual browser courseware later authorized separately by the user is covered in the [Protecting pandas implementation receipt](../records/2026-10-18-protecting-pandas.md), and this page's historical scope does not replace later delivery.
The entry point has been updated to the courseware section of the [presentation-authoring skill](../../.agents/skills/presentation-authoring/SKILL.md);
methods that can be borrowed directly and the single running case are in [Teaching segments and retractable scaffolds](../../packages/meowslides/PRESENTATION-LAYOUTS.md#teaching-segments-and-retractable-scaffolds).
It does not change existing courseware, user materials, or the runtime API.

As explicitly specified by the user, the running case is uniformly "Grade 8, Volume 1, Unit 5 Wild animals — Reading: Protecting pandas";
the title does not imply an approved textbook edition or page numbers. Activities, questions, and sentence frames are marked as teaching adaptations, and unverified original textbook sentences are not invented.
"Sunshine for all / Welcome" for Grade 8, Volume 2 remains a separate runnable work; it is not renamed or replaced.

## Basis and limits of applicability

This basis is the complete segmented-reading conclusions of the handed-over research task `01a14d3a-5234-733b-896f-d318a67fe024` plus the research summary provided by the user;
the seven articles, the original PPT, and the HTML were not reopened, and the denied WeChat URL was not accessed. The mapping below goes from research to authoring decisions;
it is not a receipt for running these materials first-hand this round, and individual case reflections are not treated as proven universal teaching principles.

| Clue in the material                                                                                                                                             | Decision that changed later authoring                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zhu Lin: growth timeline, survival conditions, and the judgment about life in captivity                                                                          | Let students form evidence from the material first; titles, prompts, and teacher conclusions must not preempt students' judgment                                                        |
| Yuan Lulu: photography-exhibition animal extension reading and problem positioning                                                                               | Choose materials based on this lesson's student output; extension volume cannot replace clear objectives                                                                                |
| Xu Chengwei: plight, helpers, and relations among measures plus opening/closing echo; over-full reflection, overly hard spoken language, and reliance on prompts | Relations must be traceable in the source text; reduce density and test real spoken output; scaffolding must be retractable, not just more prompts                                      |
| Feng Ruiqi: prior knowledge, AI, and textbook recording notes turned into expression; early discussion crowding out sharing                                      | Keep sources separate and turn records into student expression; budget time for sharing and feedback, and do not let the opening consume all the time                                   |
| Xu Yamei: judgment plus original-sentence evidence, Problems / Results; static fully expanded overload                                                           | Separate student judgment, evidence, and reference explanation; audit information load at key states, not only the final page                                                           |
| Wang Mengyun: from main measures to personal action, with opening and closing sentences juxtaposed                                                               | Lines and juxtaposition express relations; decorative curves are not data. Correct matching does not equal effective understanding, and open actions allow different reasonable answers |
| Shen Qian: timeline and problem measures through retelling and letter writing; stronger students report a lot and listeners are many                             | Turn material organization into observable output per student; during sharing, listeners also get checking or revision tasks                                                            |

The research on a real 16-page PPT distinguished image-matching lines, stepwise answers, highlight-then-extract-and-classify from the source text, stable retelling sentence frames, separation of questions from prompts/reference explanations, and open expression.
Its 69 entrance effects use only two styles, which shows that what is worth keeping is the order of appearance; the number of effects does not imply a need for more transitions.
QuickLook static rendering has font clipping and animation-simultaneity limitations; these material clues cannot stand in for actual playback or completed interaction acceptance.

The HTML panda-growth material was studied only as static source: four stages synchronize text, image, and video with sentence-frame practice; eight blanks can be shown and hidden individually or all together, repeatedly; changing stages resets.
It has no student-input scoring or word-choice authoring UI; it has not been actually run, and keyboard and assistive-technology gaps have not been reproduced in a browser.
Chinese titles or sentence frames may leak answers, and AI video cannot serve as factual evidence of a real individual. Future borrowing requires testing each item in practice;
"a toggle exists in the source" is not written up as "students can accessibly complete the exercise".

## How to use it while authoring

Each segment constrains content and state through student tasks, output, evidence, and feedback; there is no requirement to first submit a complete lesson plan, get an outline approved, or fill four columns for every page.
Run one key segment together with its visuals, assets, and interactions first, then trim, change questions, or adjust scaffolding based on preview feedback; handle the most important few problems each round.
Keep the already-chosen style and structure; research is not a reason to redo the whole presentation.

Choose the appearance timing separately for questions, location prompts, reference expressions, and evidence markers; the original reading material should be consultable.
Complete expressions, keywords, sentence frames, and independent expression are optional support levels that can be withdrawn and requested again; they are not a fixed teaching pipeline.
Advancing steps does not mean scaffolding must increase, and going back does not mean erasing student input; only switching materials and an explicit redo reset the corresponding state according to authoring intent.
Keep an adjustable per-segment time budget that preserves independent output, peer expression, listener tasks, and feedback opportunities; automatic timing is not used as permission to reveal.

The Protecting pandas case moves along growth information, problems/consequences, and protection measures to evidence-based personal action expression:
from organizing material to explaining relations and proposing actions, without closing out all suggestions with a completed matching exercise or a single teacher answer.
Questions, prompts, reference answers, and original-text evidence markers are controlled separately; complete examples, keywords, and sentence frames can be withdrawn and restored step by step.
Growth nodes and specific questions still need to be checked against the source text; studying material organization is not the same as verifying the textbook sentence by sentence or actually running the original PPT.
It is maintained in only one usage guide, not added to the gallery or existing courses; there is no need to create a new product component just to digest the method.

## Implemented capabilities and candidate needs

Current capabilities are defined by the [package README](../../packages/meowtail/README.md), public exports, and source contracts.

| Status                             | Capability and boundary                                                                                                                                                                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Implemented                        | Single slide/step position, cumulative Reveal, media activity permission and cleanup; layout, typography, backgrounds, entrance transitions; plain-work signals holding input and local state                                                                                        |
| Usage of existing capabilities     | Reveal controls order and keeps geometry; static sentence frames can stay unanimated; backgrounds do not carry evidence; transitions do not carry teaching state; these capabilities do not automatically handle scaffolding withdrawal, answering, or assessment                    |
| Candidates to validate first       | Word choice and fill-in-the-blank with individual/all reversible show-hide: first separate author editing from student answering, and specify accessible names, focus, answer hiding, repeated toggling, and per-stage reset; do not presuppose a scoring system                     |
| Validate against real difficulties | Evidence highlighting and relation lines: keep source-text positioning, text-equivalence relations, and keyboard paths, and distinguish matching from effectiveness assessment; relations must not dangle after source text changes or reordering                                    |
| Cross-cutting design constraint    | Scaffolding levels: each level can be reproduced directly and can be withdrawn/restored without erasing drafts or accidentally leaking answers when re-entering a slide; express it through work state first, and consider shared structures only after repeated difficulties appear |

The priorities come from authoring needs that recur in the current materials; they are not a plan to implement three kinds of new API in this round.
If implementation starts, first pick one real segment and reproduce the specific shortcomings of the current composition, compare small compositions with shared components,
and add the minimal capability only after an independent review clarifies owner, state, and accessibility boundaries; no courseware DSL, automatic scoring, or teaching platform is introduced.

## Review and exit

Key states include at least the unhinted, hinted, reference-explanation, evidence-marker, scaffolding-withdrawn/restored, back, and explicit-redo states actually used by the segment.
First check whether initial titles, captions, and sentence frames leak answers, then look at long drafts, the target size, and narrow/short windows;
operational verification also checks keyboard, focus, assistive-technology visibility of hidden content, media permission, and state retention, and a fully expanded screenshot cannot substitute for it.
Classroom participation and time budget remain to be adjusted after real use; learning outcomes are not inferred from browser tests.

This round's delivery boundary is the skill's action guidance plus the teaching-adaptation case and design constraints in the guide; there is no new code, screenshot, or classroom experiment.
Facts from the old materials, research limitations, and the current API are kept separate; later real authoring feedback will converge them, without endlessly expanding rules or feature lists.

The independent review at `584650d` clarified oral output, scaffolding withdrawal without requiring a technical toggle, hiding not being permission, and the boundary of causal judgment,
and a non-author also trial-ran an eight-minute reading-segment plan; that trial used the case from before the switch and does not pass as acceptance of this Protecting pandas deliverable.
This time the guiding case was switched as specified by the user, the method boundaries above were retained, and the case name, links, format, and skill were checked;
only Markdown changed, and no typecheck, build, unit test, or browser matrix was rerun, nor was complete courseware developed or classroom learning outcome verified.
