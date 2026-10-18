# Agent eval: current components vs pattern layer

Status: 2026-10-19. **Pilot produced code only; screenshots and interaction acceptance are not done.** The two independent agent arms wrote `artifacts/agent-eval/current/composer-page.tsx` + `.css` and `artifacts/agent-eval/pattern/composer-page.tsx`. The goal is not to prove the prototype looks good; it is to compare the default output of the two authoring modes.

## Task

Use the same reference image ([artifacts/agent-eval/reference.webp](../../../../artifacts/agent-eval/reference.webp)) to build a 720px-wide dark composer page: editor, action rail (+ attach, Auto review, model, voice, send), and a meta row below. Approximate the content and layout relationships; pixel-level matching is not required.

Two independent arms in fresh agent contexts, without seeing each other:

- **A: current library.** Only public `meowtail` components plus `Stack`/`Inline`/`Grid`/`LayoutItem`; host CSS is allowed; output to `artifacts/agent-eval/current/`.
- **B: pattern layer.** Use the local patterns and intent leaves in the pre-publication prototype; `ActionRail`, `MetaRow`, `ComposerPanel`, `PageFrame`, `AppBar`, and `Alert` are public now. The author page must not contain `style`, `className`, CSS imports or raw layout elements; output to `artifacts/agent-eval/pattern/`.

Neither arm may modify `packages/meowtail/src` or the product repository, and neither may read the other arm's output.

## Record

For each arm record:

1. author page line count;
2. style-related author lines (`style` / `className` / CSS blocks / raw px);
3. components/patterns used and missing (a missing pattern is a publicization candidate);
4. rendered screenshot at 900×500 dark;
5. overflow, invisible controls, composer wider than 720, meta not below the surface;
6. differences from the reference (surface, rail grouping, meta, type/spacing; human review, no pixel score).

## Pilot results (code level)

| Metric                          |                                                                         A: current library |                    B: pattern layer |
| ------------------------------- | -----------------------------------------------------------------------------------------: | ----------------------------------: |
| Author page lines               |                                                                                        140 |                                  54 |
| Hand-written CSS lines          |                                                                                        336 |                                   0 |
| Total style/className/CSS lines |                                                                                        356 |                                   0 |
| `className` usages              |                                                                                         20 |                                   0 |
| `style` usages                  |                                                                                          0 |                                   0 |
| Hand-built visual parts         | surface/rail, model cluster, shield/mic/history/database icons, meta groups, progress ring | none (patterns/leaves provide them) |

- A used `ChatComposer layout="stacked"` but overrode its surface, input, actions, rail, model and meta parts with 336 lines of CSS. The current default composition is far from the target, so the agent had to patch it from the host.
- B's author page is 54 lines and uses `ComposerPanel`, `MetaRow` and intent leaves, with zero styles. It used public `Inline` to group three `MetaRow`s horizontally, which suggests a candidate `MetaRow` group variant or a `MetaGroup` pattern; it is not a style patch.
- A also reported that at 720px the theme's ≤768px phone composer layout would reflow, so it needed higher-specificity desktop rules to keep the surface at 688×101 and the action rail at 34px. It hand-built the page shell, meta row, model-selector cluster, microphone placement, shield/mic/history/database icons and the progress ring; the public `ChatComposer` only exposes a generic `trailing` slot.
- B also reported these missing capabilities: centered/grouped meta facts; a progress group without a separator and with a neutral ring; a tint slot for the `1017` badge in `ModelChoice`; an icon slot for `ModeButton`; gauge/timer and database icons; a density prop for the flatter reference. These are publicization/ingredient candidates, not reasons to add author CSS.
- The Chinese draft in both arm files is the intentional reference payload; those outputs are gitignored eval evidence, not repository content.
- Post-publication resolution: `ActionRail`, `MetaRow`, and `ComposerPanel` are public; `PageFrame` gained `notice`/`footer`, and `AppBar` replaces the local header pattern. `MetaRow` now has `align`/`progressTone` and omits a separator on progress-only rows. The five intent leaves were retired in favor of public primitives and ChatComposer slots; the missing gauge/timer/database icons remain a standalone icon-subset gap, not a composition blocker. The reference scene now contains no local pattern implementation.
- Both arms produced code only; visual closeness, interaction and real WebKit remain unassessed. The CSS delta is the pilot evidence and does not replace a rendered comparison.

## Verdict

- Arm B must have zero author style/className/CSS and pass the composition invariants; otherwise record what the pattern layer still needs.
- Arm A's style count and missing pieces are evidence of the current floor, not a score.
- Do not replace judgment with an aesthetic score. The conclusion only answers: does the pattern layer let an agent get materially closer **without writing styles**, and what patterns/leaves are still missing?
- Keep failures and overflow in the raw output; do not overwrite them.

## Run

```sh
cd packages/meowtail/prototypes/pattern-layer
bun build src/main.tsx --target browser --outdir dist
bun check.ts
```

The reference image is in `artifacts/agent-eval/reference.webp`; each arm writes to its own gitignored directory. The pilot is about authoring mode; the final reference scene uses the public exports listed above.
