# Back to latest: history reading and normal-flow layout

This round continued from `c495707` to address the shared default occlusion issue. Only Meowtail's conversation composition, theme, documentation and regression scene were changed; iOS/Rossovia, the unknown `data/`, courseware and dependency versions were not changed, and there was no push, publish or deployment.

## Reproduction and choice

The iOS thread provided a plain-browser minimal reproduction: `/Users/lidessen/Documents/Codex/2026-10-17/task-2/ios-visual-review/evidence/component-audit/latest/README.md`. This round only read that evidence and did not run builds or write files in its working tree.

The issue was reproduced again on this library's current public exports: at both 375px and 900px widths, the public `ChatConversationLatest` fragment and the complete `ChatConversation` both occluded history body text. Independent review also confirmed the same-cause issue in the real `assistant-complete` scene, so the complete Assistant's default composition was fixed as well. All six regressions on the old dist failed on the real text-line intersection assertions.

Measurement used text nodes' `Range.getClientRects()`, clipped text lines to the actual viewport, and then checked intersection with the button; it did not infer occlusion from a whole paragraph's outer box or from text outside the viewport. Before the change, the 375px public fragment and the complete Conversation each had two intersections, and the Assistant sample had four; after the change they were zero. Before and after used the same content and sizes, and the original images and geometry JSON are kept in `artifacts/chat-latest-review/`.

Independent review agreed on the minimal approach: let the back action participate in normal layout, take natural height when shown, and return the space when hidden. Content-end padding cannot protect arbitrary history positions, and no iOS offset, second scroll controller or new layout DSL was added.

## Implementation and contract

- `ChatConversationLatest` is a normal-flow button by default and keeps the native button, hidden, events and children contracts; long copy is allowed to wrap naturally.
- The complete `ChatConversation` uses a column layout, with the single viewport taking the remaining space; the viewport's inline `height:100%` and the old 40px content-end compensation were removed. The root, viewport, content and latest parts are all kept, and the original append-only controller is unchanged.
- The complete `AssistantView` message area also changed to a column layout; the latest wrapper takes natural height, and the original `latestHidden` controls whether the whole row is shown. The original button's styles and actions are kept, and the long-copy constraint applies only to this one local Button, not the global Button.
- The README gives the public fragment composition of Stack/LayoutItem/Latest: finite height, a single scroll viewport and a sibling action row. The host's existing controller remains responsible for showing/hiding, following, preserving position, returning to the end and focus; the fragment does not automatically fill in arbitrary host height or positioning layout. The complete component's default behavior does not need the caller to take over scrolling.
- The existing Conversation story uses the same shared implementation and demonstrates that the back action sits after the body viewport; story-only CSS was not used in place of a component fix.

## Actual verification

Production code was not changed after the unified build, and the execution and results are as follows:

| Check                                        | Result                                                                                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `bun run build`                              | Six packages built.                                                                                                                |
| `bun run typecheck`                          | All type environments covered by the root command passed; the full Meowtail package tsc also passed.                               |
| `bun test packages/meowtail/tests/unit/chat` | 43/43, 289 assertions, passing the existing controller, SSR and conversation contracts.                                            |
| New `conversation-latest-layout.spec.ts`     | 8/8, including 375/900 history reading and keyboard return for the three public compositions, and long copy.                       |
| Existing related Playwright                  | 14/14: Conversation, Assistant, Agent Assistant, Composer layout, RegionLayout and workspace composition.                          |
| Meowtail fmt / lint                          | The full supported package scope passed; this document separately ran format and diff checks and did not scan the unknown `data/`. |

The new browser regressions verified that Enter/Space returns to the end, the viewport gains focus and the action hides; that the complete composition preserves position when history is appended and the viewport shrinks, and keeps following after returning to the bottom; that show/hide is stable for 12 consecutive frames on both sides of the 24px threshold; and that there is no text intersection in short windows. The Assistant keeps the draft value and input focus when appending in the background and when resizing from 844→500px, and does not actively steal focus due to content or size changes.

The independent re-verification used the current dist: from 375×600→375×500, the Assistant's history `scrollTop=140` was preserved after appending and shrinking; the button top always stayed after the message viewport bottom, and Enter returned with a distance of zero to the end and gave focus back. An independent layout probe for long Chinese/English and no-space copy found no horizontal overflow or text overlap; the probe changed visible text directly and only proves layout, and is not passed off as a props lifecycle test.

The author, coordinator and independent reviewer actually opened the before/after original images, covering narrow screens, wide screens and the 375×500 short window. The short-window screenshots are the actual viewport and are not passed off as full-page long images. The complete Assistant gallery also has an example control area, a header and a multi-line draft, so the reading area is smaller at 500px; that host budget is not claimed as a new library defect or a final full-screen visual. The long action further shrinking the reading area at natural height is a result of finite space allocation, and this round did not turn it into an overlay covering the body text to hide it.

This is acceptance in Chromium/Chrome with reduced available space, not acceptance of the real iOS/WK software keyboard, visual viewport or system scaling. This round did not rerun unrelated Slides/courseware, repo-wide unit tests or a new tgz install matrix, and did not upgrade the currently consumed iOS package. Self-built services and browsers were all closed, and the user's existing services were not touched.

## Library original images

| Image                         | Full Library ID                            |
| ----------------------------- | ------------------------------------------ |
| Conversation before 375       | `libfile_a2e03d2590cc8191a4c6aecc95321955` |
| Conversation after 375        | `libfile_ac33c657fb848191b1f443aeb9a81e06` |
| Conversation after 900        | `libfile_8953c90235508191b7ce50ed0cc173a8` |
| Conversation after 375×500    | `libfile_070e0a29543c8191bc80ac2712402130` |
| Latest fragment after 375×500 | `libfile_879a5bcc40a8819180b2e0bbd05891ad` |
| Assistant before 375          | `libfile_439e42fe38a481919a298537343e1b88` |
| Assistant after 375           | `libfile_252cae2b23608191ad2caa47f1125c56` |

The images are all local library fixtures and cannot be treated as iOS product screenshots. The confirmed occlusion in the default composition, independent review and the above targeted regressions are closed; the effect of host-custom absolute positioning or an extra controller still needs to be verified by that host.
