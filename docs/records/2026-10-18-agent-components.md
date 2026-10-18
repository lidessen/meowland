# Agent components: local implementation and acceptance receipt

The user's meowface this round corresponds to the actual package `meowtail`; it was not renamed. The implementation extends the existing `ChatToolCall`, adds `ChatTask`, and wires into the complete `AssistantView` tool/task parts and the finite JSON catalog. The full matrix of existing, filled-in and host/follow-up capabilities is in the [Agent components guide](../../packages/meowtail/AGENT-COMPONENTS.md).

**The activity display is not yet approved by the user.** The user's latest feedback is still dissatisfied with the existing Assistant's "in-progress activity"; the parent thread will separately arrange independent research and multiple prototypes. This round did not add `AgentActivity`, did not change the design of the existing activity/work/questions, and does not lock the current activity UI as the approved solution. The screenshots in this document only record accepted component behavior and the current composition.

## Scope of this round

- Tool call display covers queued/running/waiting/success/error/cancelled/unknown and keeps the old complete spelling; input, output and result summary are separate, and a missing result is distinct from an empty string. Long results reuse the internal `OutputBlock`'s native collapse and full copy, and tool data is always inert text.
- `ChatTask` separately shows the goal, execution state, public-reply facts and evidence-based native progress; nested body and footer action ownership are clear. An execution that succeeded but has not yet received a public reply does not become a failure.
- The Assistant reuses the same shared components, and `onToolAction(messageId, partId, "retry" | "cancel")` only notifies the host. The finite JSON accepts only declared data and action parameters and introduces no arbitrary execution capability, task scheduler, OpenUI runtime or streaming protocol.
- It continues to reuse messages, Markdown/code, process, questions, attachments, sources, resource links, diff, composer and public layout; dozens of separate components were not created for completeness.

Shared implementation, independent design challenge and source references follow this repository's development conventions. The OpenUI reference is pinned at commit `8d9c4c3b108a7b5352192a6a9d7327bdf7ea19b5`: read the concrete implementations of [DefaultToolCard](https://github.com/thesysdev/openui/blob/8d9c4c3b108a7b5352192a6a9d7327bdf7ea19b5/packages/react-ui/src/components/ToolCall/DefaultToolCard.tsx), [CompositeCardBlock](https://github.com/thesysdev/openui/blob/8d9c4c3b108a7b5352192a6a9d7327bdf7ea19b5/packages/react-ui/src/components/CompositeCardBlock/CompositeCardBlock.tsx), shared [CardBlockLayout](https://github.com/thesysdev/openui/blob/8d9c4c3b108a7b5352192a6a9d7327bdf7ea19b5/packages/react-ui/src/components/_shared/cards/CardBlockLayout.tsx) and [Stack](https://github.com/thesysdev/openui/blob/8d9c4c3b108a7b5352192a6a9d7327bdf7ea19b5/packages/react-ui/src/genui-lib/Stack/index.tsx), drawing on semantic zoning, reading axis, footer baseline and padding ownership; no DSL/parser was integrated and no code was copied. Independent review evidence is kept in `artifacts/agent-independent-review/review.md`.

## Two rounds of substantive end-to-end work

The first round's inventory covered components/API, interaction and accessibility, real composition, Assistant/JSON integration and documentation in parallel. Stress scenarios reproduced text squeezed into a thin column in a narrow tool row, hidden summaries participating in display, unclear footer ownership in nested tasks, and large blank areas from implicit rows stretched in an equal-height Grid for Task; after fixing, these were rechecked with actual stories, nested actions and state switches.

The second round re-verified in the official Meowbook scene and an actual out-of-package tgz consumer. An extremely long path in an about 936px tool row still squeezed the short label and the "Canceled" state; the summary was changed to `flex-basis: 0` so it truncates itself first, and the final label and state each occupy one line. The old coarse-pointer test treated the whole center of a multi-line header as the icon center; it now uses the first line's line box while keeping the action height, precise icon/arrow alignment and no-overlap checks for following text; independent review confirmed that tolerances were not loosened. The `files` allowlist was also fixed to ensure that the publicly linked `AGENT-COMPONENTS.md` actually enters the tgz.

## Same-version verification

After the fifth and final unified build, production source was frozen, and then the following checks ran:

| Check                    | Results and scope                                                                                                                                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engineering              | Five-package build, root typecheck, full Meowtail tsc, fmt, lint and diff checks passed; fmt/lint exclude the unknown `data/`                                                                                                                                                                     |
| Unit tests               | Meowtail 342 passed, 71 files, 2136 assertions; log `artifacts/agent-components-final/unit.log`                                                                                                                                                                                                   |
| Browser                  | Final related chat, content views and read highlight totaled 42 passed, 15.9s; log `artifacts/agent-components-final/browser-final.log`                                                                                                                                                           |
| Meowbook                 | 118 stories checks passed; real composition covers wide, narrow and short windows, light and dark themes, concurrency and nested tasks                                                                                                                                                            |
| Installed state          | The three new tgz files installed offline in an empty `/tmp` directory outside the repository; no source alias, parent node_modules or escaping symlink; strict positive/negative types and DOM-free JSX/CSS core passed                                                                          |
| Installed-state behavior | Root/chat export identity, JSX/JSON host-intent consistency, dynamic output, missing/empty results, expand and focus retention, copying the latest complete data, native progress, and success-but-pending-reply all passed; 1280×960, 390×844 and 900×480 original images were actually reviewed |

Final installed-state receipt: `artifacts/agent-components-final-consumer-a25q6rfl/receipt.json`; consumer `/tmp/meowland-agent-consumer-ydiBzV`. All-file SHA256 was identical across current dist, staging dist and installed dist for the three packages, and was checked again after the browser checks. The `meowtail` tgz SHA256 is `3a45177bb74ca5682817f4eebd0c886c0df19cce2aaecd7a22bbb5ca30924023`; the identities of the other two packages and the complete commands are in the receipt. The previous version's counterexample tgz and screenshots are kept in `artifacts/agent-components-consumer-3xtqvyn3`, and the old package was not overwritten.

## Screenshots and follow-up prototype entry points

| Screenshot                                                         | Full Library ID                            |
| ------------------------------------------------------------------ | ------------------------------------------ |
| Wide-screen concurrent workflow                                    | `libfile_314e151029c48191aef4bcabed95cc80` |
| Assistant current composition overview (not the approved solution) | `libfile_9b25d9b1d6bc8191adc7702ee2573c87` |
| Narrow-screen workflow                                             | `libfile_9b7418e0f7d48191a10fc9e9bacd3463` |

The original images are in `artifacts/agent-components-final/`: `agent-workflow-1440x1000-light.png`, `assistant-overview-light.png` and `agent-workflow-narrow-390x844-light.png`; the upload receipt is the adjacent `library-upload.json`, and file identity xattrs were written.

Follow-up activity prototypes can reuse `ChatToolCall`, `ChatTask`, `ChatExecutionState`, and `agentWorkflowDemo` and `agentAssistantDemo` exported from `packages/meowtail/stories/agent-workflow.stories.tsx`. The current story ids are `agent-workflow`, `agent-workflow-narrow` and `agent-workflow-assistant`; these are runnable composition references and do not mean the user accepts the existing activity design.

## Verification boundaries

The browsers were Chrome/Chromium; there was no real assistive technology or screen reader session, and Firefox/WebKit were not verified. Installed-state clipboard and host actions were partially simulated; the source browser separately tested native copy. There was no acceptance of a real backend, tool execution, network, permission policy, upload or persistence. Rossovia, Panda, the unknown `data/`, dependencies, lock files and versions were not modified; only local commits were made, with no push, npm publish or deployment. Self-built services were all closed, and this round did not operate the original user preview ports `13012` and `13014`; the last read-only lsof found no listeners on those ports or this round's temporary ports, and this is not used to claim the user previews are still running.
