# Meowtail UI floor audit

This round reviewed the whole Meowtail story catalog instead of one component. The work did not change product APIs or add a second theme; it raised defaults that were below the project's own readability and touch contracts.

## Scope and method

- 130 stories, each opened through the current Meowbook source server at 900×800 and 390×844; 260 scene runs in total, with the narrow run using a coarse pointer.
- Mechanical evidence collected from the rendered DOM: document overflow, clipped text, unnamed controls, duplicate IDs, images without alt text, placeholder contrast, single-line field padding/borders, button text center, metadata/status contrast, and 44px page-action checks.
- The mechanical pass was followed by opening whole-page scenes: app shell, agent workflow wide/narrow, process group, composer panel, page structure, workspace composition, basic quality, Assistant and the icon inventory.
- This was a library-default review; story host controls (for example the appearance select and demo-only state buttons) were not counted as product controls.

## Findings and fixes

| Finding                                                                                                                                         | Fix                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 57 stories had metadata, hint, time or status text below 4.5:1 on white; warning, success and info text were also too light.                    | `subtleForeground` and `captionForeground` became scheme pairs with light `#656a71` and dark `#9aa0a7`; `layerTokens.faint` uses the same pair. `warning`/`success`/`info`/`danger` became readable scheme pairs, and the Tag warning uses the readable warning background with `onPrimary` ink. |
| Light code syntax colors were 3.2–4.4:1 on the code surface.                                                                                    | The light syntax tokens were darkened (constant, string, comment, keyword, parameter, string expression); dark syntax colors were left as the existing high-contrast set.                                                                                                                        |
| Page-level actions in the new compositions and several existing page components were 28–36px under a coarse pointer.                            | AppBar, Alert bar, ComposerPanel, ActionRail, PageHeader, ResourceCard, Toolbar, DialogActions, OutputBlock and CodeBlock actions get a 44px coarse-pointer target; the ComposerPanel input also gets a 44px target. The toolbar/button visual scale is unchanged for fine pointers.             |
| The expanded ListRow panel had no content inset, so host text touched the card edge.                                                            | The expanded panel now uses the same 12/16 content inset as the list row.                                                                                                                                                                                                                        |
| The public icon inventory lacked mic, shield, gauge, timer, database and history, so the composer reference had to substitute unrelated glyphs. | The optimized Lucide-backed frame is unchanged; six semantic names were added to the finite set. The reference composer now uses the correct mic, shield-check, gauge, timer and database icons.                                                                                                 |

The existing `Alert layout="bar"` notice is retained; this round did not reintroduce a page-shell or device variant.

## Verification

- Broad audit after fixes: 260/260 scene runs completed with no page errors; horizontal overflow, low-contrast text, placeholder contrast failures, unnamed controls, duplicate IDs and missing image alt text are all 0. Remaining clipped text is deliberate ellipsis in tool summaries, file names, process labels, select values, tabs and path tags.
- `bun run build --package meowtail`, `tsc -p packages/meowtail/tsconfig.json`, format and lint pass.
- Unit tests: 190/190.
- Meowtail browser suite: 183/183, including the new `app-shell-touch`, `page-actions-touch` and `readability-floor` regressions.
- Reference scene `check.ts`: `PASS: author pages use public components only; composition invariants hold`.
- English-only sweep still reports only the two approved Unicode fixture files.

## Remaining boundaries

- Clipped summaries and path tags were kept as deliberate truncation; making their full text available on hover or expand is a separate content/contract decision, not a silent style patch.
- Story host buttons such as the agent-workflow demo actions remain compact; they are not library page actions.
- Real iOS WebKit, software keyboard, screen readers and user acceptance were not rerun.
- No commit, push, publish or release was performed.
