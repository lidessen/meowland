# Agent display components and composition

Meowtail is a component library, not an Agent execution framework. Tool calls, delegation, messages, permissions, networking, persistence, and real execution facts are provided by the host; components organize these facts into a readable, operable interface. What users call meowface corresponds to `meowtail` in this repository; no separate package name exists.

This round fills two high-frequency joints: extending the existing `ChatToolCall` state, lazy input/output, and resume intent; and adding `ChatTask` to present execution, public reply, and grounded progress separately. Messages, activity, questions, attachments, sources, code, and the composer continue to use existing components. No Agent-specific layout language, OpenUI runtime, streaming protocol, or other design scale was introduced.

## Capability matrix

"Existing" means the current repository already implements it, not that this round reworked it; "Added this round" means new or extended in this round; "Host / later" describes the current finite boundary.

| Lifecycle / reading task                              | Existing capability                                                                                                           | Added this round                                                                                  | Host / later boundary                                                                                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Message role, author, time, streaming text            | `ChatMessage`, `ChatMessageList`, `ChatConversation`, `AssistantView`; stable id updates messages                             | Assistant default parts connect tools and tasks                                                   | The host normalizes events and updates data; it does not parse server streaming protocols                                                   |
| Markdown and code                                     | Assistant `text` is safe Markdown by default, `code` reuses `CodeBlock`; unknown languages stay plain text                    | Tool input/output are displayed separately as raw text                                            | Tool strings are not executed as Markdown or HTML; code is not executed                                                                     |
| Public execution summary                              | `ChatProcess`, `ProcessGroup/ProcessStep`, Assistant process/activity                                                         | `ChatTask` description, executionText                                                             | Display publicly shareable activity facts; do not require or assume disclosure of private model reasoning                                   |
| Tool call state                                       | `ChatToolCall`, `ChatStatus`, `StatusDot`                                                                                     | queued/running/waiting/success/error/cancelled/unknown; complete stays compatible                 | State comes from the host; success/failure is not inferred from output presence, timeouts, or lack of reply                                 |
| Input, output, and long results                       | `ReadBlock`, `TerminalBlock`, `JsonBlock/JsonTree`, etc.; internally reuses OutputBlock                                       | `ChatToolCall` reactive input/output/outputSummary, collapse, and full copy                       | `maxLines` is a display window, not data truncation; merging streaming chunks is the host's responsibility                                  |
| Multimodal tool results                               | `ChatAttachments`, `ImagePreview/ImageLightbox`, media and resource components                                                | Tool children keep an ordinary composition outlet                                                 | The host provides alternative descriptions, sources, and supported resources; arbitrary binary formats are not guessed                      |
| Delegation, nesting, and concurrent tasks             | Assistant activity/work, `WorkCard`, shared layout and process groups                                                         | `ChatTask` and the Assistant task part                                                            | Compose trees with children and `ChatProcess`; there is no task scheduler or general tree protocol                                          |
| Execution completion and reply delivery               | AssistantWork already wires executionText/replyText separately                                                                | `ChatTask` and the task part are equally explicit                                                 | success can simultaneously show "public reply not received" without becoming error                                                          |
| plan / todo / progress                                | native ol/li, `ProcessGroup/ProcessStep`, Assistant steps                                                                     | `ChatTask` labeled native progress                                                                | Values must have a real basis; omit them when unknown, and do not invent percentages or countdowns; the plan editor stays with the host     |
| Waiting for users, options, and authorization display | `ChatQuestion`, `ChoiceGroup`, Assistant questions; `RiskConfirmation` when needed                                            | Composition demos with waiting tasks                                                              | The UI does not define authorization policy; unanswered questions, replies being submitted, and execution failures are modeled separately   |
| error / retry / cancel / interrupt                    | `Button variant="stop"`, feedback, Assistant readState and recovery drafts                                                    | Tool onRetry/onCancel intent and disabled states; Assistant onToolAction                          | Callbacks do not automatically retry or stop tasks; cancel, interrupt, retry eligibility, and concurrency conflicts are decided by the host |
| Cited sources                                         | `ChatSources`, safe Markdown links, `ResourceLink`                                                                            | Composition examples make source and artifact ownership explicit                                  | The host verifies sources; tools and tasks do not search or generate citations automatically                                                |
| Attachments, file artifacts, and code diffs           | `ChatAttachments`, `ResourceLink`, `DiffBlock`, `CodeBlock`                                                                   | Compose with task footer / Assistant local slots                                                  | No upload and no patch application; protected resource addresses and download authorization stay with the host                              |
| Metadata such as timing / usage                       | `DescriptionList/DescriptionItem`, `Inline`, tags                                                                             | Reuse demos without adding another Agent metadata API                                             | Numbers and times come from the host; unknown values are not shown as zero; no billing or usage calculations                                |
| composer, attachments, send, and stop                 | `ChatComposer`, complete Assistant draft/attachments/model/trailing; submission acceptance and draft consumption are separate | Continue reusing them; the tool cancel button is independent of send state                        | A streaming response does not automatically equal send pending; the host places the stop button in trailing and binds an explicit intent    |
| Empty state, initial load, refresh failure            | Assistant readState loading/ready/error, EmptyState                                                                           | Tool empty strings are separate from missing results; Task defaults to unknown                    | refresh error keeps the read body; no data does not imply execution failure                                                                 |
| Connection interruption and stale data                | Assistant readFeedback/work feedback, explicit status text                                                                    | Examples use unknown + last known output                                                          | Keep the last result and make clear "current state unknown"; reconnection and stale-time policies come from the host                        |
| Keyboard, focus, and narrow containers                | native buttons/details, shared layout, Assistant reading anchors and narrow-container activity dialog                         | New compositions preserve expansion, long I/O, 320px local width, and nested tasks across updates | No global shortcuts; reduced motion follows the shared theme; see the receipt for the actual verification scope                             |

## Tool calls: separate data from execution actions

```tsx
import { h, signal } from "meowjsx";
import { ChatToolCall, type ChatExecutionState } from "meowtail/chat";

const state = signal<ChatExecutionState>("queued");
const output = signal<string | undefined>(undefined);

const view = (
  <ChatToolCall
    label="Read file"
    summary="docs/layout.md"
    state={state}
    input={'{"path":"docs/layout.md"}'}
    output={output}
    outputSummary="Short result provided by the host"
    maxLines={8}
    collapsible
    onCancel={() => hostRequestCancel()}
  />
);
```

`label` names the action, `summary` is the short target still visible when collapsed, and `statusLabel` adds the specific progress or the object being waited for. Input/output titles, empty content, and retry/cancel text can be overridden locally through `labels`. When `input/output` is `undefined`, that section is omitted; an empty string explicitly shows empty data. While queued or running, missing output never means an error. `outputSummary` is the expanded body summary supplied by the host and is visible only while the tool body is expanded; content that must remain visible when collapsed goes in `summary`. The component does not trim, reason about, or rewrite tool results.

`maxLines` defaults to the internally shared `OutputBlock` (no new public export); when content exceeds it, the beginning and end are kept, the middle expands through native disclosure, and copying uses the full original payload. Text I/O wraps by default; dedicated structures such as code and terminals continue to use their corresponding components. The tool's overall disclosure and the output's middle-lines disclosure keep their own expansion state separately.

`onRetry` and `onCancel` express user intent only. The component does not turn error into running on its own, does not silently drop existing results, and does not claim the task succeeded because a callback returned. The Assistant part's `canRetry/canCancel` only decide whether entries are shown and grant no execution permission; the host must still check eligibility. The host can prevent duplicate operations with reactive `retryDisabled/cancelDisabled` and must update state explicitly. When `onActivate` chooses a host navigation action, the tool row does not also toggle its internal disclosure; do not wrap the entire row button in another clickable card.

For compatibility with existing calls, using `ChatToolCall` alone and omitting state still follows `complete`; new calls should pass facts explicitly and use `unknown` when they are unknown. The Assistant tool part uses unknown when state is omitted, so a missing fact does not become completion. `complete` and success are both spellings of execution completion and do not mean the public reply was delivered.

## Tasks: execution, progress, and waiting are separately visible

```tsx
import { h } from "meowjsx";
import { ChatTask, ChatToolCall } from "meowtail/chat";
import { Button, Inline } from "meowtail";

const view = (
  <ChatTask
    title="Independent keyboard review"
    state="success"
    statusLabel="Execution succeeded · waiting for public reply"
    executionText="Execution returned; 5 checks completed."
    replyText="Public reply not yet received."
    progress={{ value: 5, max: 5, label: "Checked 5 / 5 items" }}
    footer={
      <Inline>
        <Button variant="outline">View review record</Button>
      </Inline>
    }
  >
    <ChatToolCall label="Check focus order" state="success" summary="5 interaction entry points" />
  </ChatTask>
);
```

`ChatTask` is a semantic section with state and optional content; its default state is unknown, and it is not an execution container or a whole-card button. `title/state/statusLabel/description/executionText/replyText/progress` can all be updated by Signals. `progress` accepts only finite valid numbers, requiring `0 <= value <= max` and `max > 0`, and explicitly throws otherwise; when not provided, no progress bar is shown.

waiting should say "who and what it is waiting for": waiting for a user option, waiting for scheduling, and waiting for an external result are different facts. queued means not yet started; running should have a current activity fact; unknown fits a state that cannot be confirmed after a connection interruption. No result, no new message, and no public reply are not automatic failure conditions.

## Composition rules

- Use `Stack`, `Inline`, `Grid`, and `LayoutItem` in one workspace. Parallel tasks can use `Grid columns="auto" minColumnWidth="wide"` to arrange themselves by host width; a fixed column count keeps that explicit count and does not silently become a mobile template.
- The parent layout allocates gaps between groups; Task owns the internal rhythm of its header/body/footer; tools own their own expanded indentation. By default, the Task body marks content ownership with a single low-contrast start edge and `spaceSection` indentation; child-task footers stay inside that boundary, and the parent-task footer returns to the parent axis, so adjacent actions are not confused. Ordinary tasks do not get an extra Card wrapper, and tool groups do not add another ring of panel padding. Nested tasks collapse low-frequency records through `ChatProcess`, so every level does not expand into a long wall.
- Collapse low-frequency raw results by default and keep actions, targets, states, and short results. Expand only the one or two tools currently worth reading; collapsing must not hide failures, the object being waited for, or the current activity state. The display window for long output and full copy share the same data.
- footer holds ordinary `Button`, `ResourceLink`, and `Inline`; the body does not align actions with spaces or `space-between`. Tool retry/cancel actions live in the expanded body; a footer placed inside collapsible content is also hidden when its ancestor collapses. A global Stop / interrupt that must always be reachable belongs outside the collapsible region in an ordinary action group or the Assistant `headerActions/composerTrailing`; do not hide it in task details. Tasks of different lengths keep their natural height; if the host needs equal-height cards, the host should allocate space explicitly rather than faking content with placeholder text.
- Public plans use native ol/li or process components. A Task can contain child Tasks, but the tree's ids, ordering, parent/child relationships, and permissions are still decided by the host; do not execute a task title as a program path.
- Visible states always have text; the status dot is only decoration. Native details, button, and progress keep their keyboard semantics; updating state does not move user focus on its own. Large output can be read with the keyboard in its own region.
- Tool input/output are lazy strings. Do not hand payloads to `innerHTML`, event attributes, or a script interpreter. The safe Markdown policy for Assistant default text and the tool text policy hold separately; the security of a custom `renderPart` remains the extension author's responsibility.
- Files, URLs, callback names, state enums, and confirmation displays by themselves grant no permissions. Cite sources with `ChatSources` or safe links and artifacts with `ResourceLink` / `ChatAttachments`; download, read, and authorization are handled by the host.

## Complete Assistant and local outlets

Assistant messages add typed parts with `kind: "tool"` and `kind: "task"`. The tool part provides label/summary/state/input/output/outputSummary/maxLines/defaultOpen, action entry visibility, and disabled fields; `onToolAction(messageId, partId, "retry" | "cancel")` is handed to the host. The Task part provides a title, separate execution/reply text, progress, and optional steps. Arrays update immutably by the same stable id; the same id/kind preserves the default component instance and native expansion state, while changing kind rebuilds that part. `defaultOpen` means initially expanded, not a forced control on every message update.

Content beyond the default parts continues to use `renderPart`; do not replace the whole Assistant page for one kind of artifact. The complete Assistant's drafts, attachment acceptance, submission snapshots, activity details, questions, and reading anchors follow the [existing contract](ASSISTANT.md). This round also adds finite tool/task message branches and an `onToolAction` action schema to the existing `AssistantView` JSON catalog, still rendering the same components; it adds no separate `ChatTask/ChatToolCall` JSON entry, recursive task tree, or arbitrary object interpretation capability. See the [JSON contract](JSON.md) for the supported field set; network protocols and actual execution remain the host's responsibility.

Meowbook scenes:

- `agent-workflow`: a four-turn conversation in `AssistantView` carrying concurrent runs, queuing, waiting for the user, successful execution without a received reply, a retryable failure and a cancellation; includes nested tasks, artifacts and diffs, the history column and reply actions.
- `agent-workflow-narrow`: the same conversation placed in a 320px local host inside a wide viewport, checking long text and paths without spaces.
- `agent-workflow-assistant`: default tool/task parts coexist with safe Markdown, activity, unanswered questions, attachments, sources, and the composer; buttons drive local output appends, retries, and cancellations without making external requests.

This page describes capabilities and usage boundaries; actual run, independent review, screenshots, and installed-state results are governed by the verification receipt for that round. Browsers, screen readers, and real backend adapters that were not run are not considered passing just because the capabilities are listed here.
