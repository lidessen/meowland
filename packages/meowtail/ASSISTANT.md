# Complete Assistant composition

Status: the new composition is implemented, and the author's local behavior regression plus independent source/page acceptance are in progress; the first-stage five-package tarball does not contain the capabilities on this page, so its installed-state pass cannot stand in for acceptance of this composition. Nothing is officially released yet, and Rossovia's consumption has not been switched.

`AssistantView` from `meowtail/chat` provides messages, safe Markdown, code, processes, inputs, attachments, model and thinking options, current activity, background work details, and unanswered questions. The default structure and visuals live in the library; the `assistant-complete` scene in Meowbook only supplies local data and actions.

```tsx
import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { AssistantView, type AssistantDraft, type AssistantMessage } from "meowtail/chat";

const messages = signal<readonly AssistantMessage[]>([]);
const draft = signal<AssistantDraft>({ text: "", attachments: [] });

const view = (
  <AssistantView
    messages={messages}
    draft={draft}
    onDraftChange={(next) => {
      draft.value = next;
    }}
    onSubmit={async (snapshot) => {
      const accepted = await hostSend(snapshot);
      return { accepted };
    }}
  />
);
```

The component takes a constrained height from its parent container; standard installation still needs `createMeowUI` and `standardTheme.cssText`, and does not depend on Rossovia's CSS or controller. Messages and the composer share one reading column, and the return-to-latest action anchors only to the message region. Activity appears beside the container when wide and becomes a single native modal dialog when narrow, without re-mounting messages and drafts.
The return-to-latest action uses normal layout flow below the message viewport; while shown it claims its natural height, and when hidden it returns that space. Historical body text is never covered by the button, and the composer still has its own region.

A turn reads as the reader's question in a fill bubble and the reply as plain text, with no visible names or times; those stay in the message header for assistive technology. The composer is one rounded bar (attach, draft, trailing choices, send). Its history button gathers every question the reader asked into one column over the blurred transcript; choosing one closes the column and brings that turn to the top of the reading area without moving the host page, and Escape returns focus to the button. `history={false}` removes the button and column. A host `id` names the column for `aria-controls`.

A finished reply carries a quiet action row: Copy (built in; it copies the reply's text parts) and, when the host passes `onMessageAction`, Good response, Bad response and Regenerate. Those are intents only: `onMessageAction(messageId, "good" | "bad" | "regenerate")` records nothing and regenerates nothing by itself. Streaming and pending replies hide the row until they complete.

## Ownership of data and actions

- When `draft` is passed, the host is the only owner and must provide `onDraftChange` or an explicit `readOnly`. The component does not write to the passed Signal directly; when `draft` is not passed, `defaultDraft` initializes the component's own temporary draft. The host owns persistence.
- `onSubmit` must explicitly return `{accepted: true}` to consume the submitted snapshot. Editing can continue while waiting; text with no new edits can be cleared, attachments from the original snapshot are consumed separately, and attachments added or replaced later are kept. Rejection and exceptions keep the draft and show feedback. That acceptance only means the host accepted the message; it does not mean the Agent has processed it or that the task is complete.
- The default file selection only keeps a `File` and preview URL locally; it does not upload, execute, or persist. When the host provides `onAttach`, it can return normalized attachments; it can also update a controlled draft directly and return null. Do not both append to the draft and return the same attachment in one callback. Preview URLs are released when the component unmounts; persisted message attachments should be replaced by the host with its own resource addresses.
- Hosts that only support existing serialized attachments can set `allowAttachments={false}` to remove the local file selection entry; existing attachments can still be displayed, removed, and submitted with the message. The first slice of the JSON catalog uses this explicit boundary and does not mix File into JSON drafts.
- `messages`, `activity`, `work`, `questions`, model and thinking options support `MaybeSignal`. Drive the view with immutable array updates. A stable `id` for the same message and part preserves its node; changing a part's `kind` rebuilds that part.
- Work's `statusText`, `executionText`, and `replyText` are all provided by the host; the UI does not interpret pending as running, does not treat returned as goal completion, and does not infer from execution results that a public reply has been published. The status dot only supports the corresponding text.
- Question state is determined by the host's `open/submitting/answered/unavailable` facts. A return from `onAnswer` does not automatically mark the question answered; exceptions keep local answers. `onDismissQuestion` only notifies the host; there is no implicit business close or retry.
- `readState="error"` keeps the messages already given and shows the failure; `loading`, truly empty messages, and refresh failure render separately. Work details keep the body on `error` and hide the body on `unavailable`. Authorization and data withdrawal remain the host's responsibility.

## Content and local customization

Message `parts` include `text`, `code`, `process`, `attachments`, `tool`, and `task`. `text` is safe Markdown by default: raw HTML and images are shown as text, and only explicit HTTP, HTTPS, and mailto links navigate; code parts use the shared `CodeBlock`. Processes use native disclosure, and process steps take only normalized titles, descriptions, status text, and visual tone. A process may also carry `state` (the same execution states as tool and task parts): its header then shows the shared state badge after the title, with `statusText` as a quiet fact beside it. Whether the badge exists is fixed by the part's first value; later states update its tone and word in place. Without `state` the header shows the title and `statusText` alone.

`renderPart` can replace just one part, and returning `undefined` uses the default implementation; `renderWorkDetail` replaces only the detail body. `composerTrailing` and `headerActions` hold local controls without replacing the whole page. Custom components still consume ancestor Context in the original render tree and do not create another renderer root.

New default copy is centralized in `assistantCopy`; hosts can override local text with `labels={{ latest: "Back to latest", send: "Send" }}` without installing a separate internationalization runtime. Titles, statuses, and descriptions in the data are still provided by the host.

When the host passes historical messages, prepend them to `messages` directly, and the component keeps the visible message anchor; appending and streaming updates do not force a jump to the bottom while reading upward. `onLoadOlder` only asks the host to load; the UI does not own pagination, networking, or record permissions. The list uses the same keyed mechanism as MeowJSX; removed items release their component lifecycles.

Model selection, files, paths, URLs, callback names, and UI state grant no backend permissions. Connection, upload, execution, stop, publish, authorization, and recovery are wired in by the application adapter; there is no Agent execution framework here.

## Standard Agent content

The `tool` part reuses `ChatToolCall` by default: action and target, explicit execution state, lazy input/output, outputSummary,
long-result window, and default expansion. outputSummary appears only in the expanded body; the collapsed summary uses summary.
`canRetry/canCancel` only decide whether the corresponding entry exists and grant no execution permission.
`retryDisabled/cancelDisabled` only disable entries; `onToolAction(messageId, partId, action)`
notifies the host of a retry or cancel intent; it does not execute the tool or switch state on its own. Actions are hidden when the tool body collapses;
global stop/interrupt should be placed by the host outside the collapsible region in headerActions, composerTrailing, or an ordinary action group. A missing tool state uses unknown,
and neither missing output nor an unanswered public reply is automatically treated as failure.

The `task` part reuses `ChatTask`; execution state, executionText, replyText, and labeled progress are each provided by the host,
and existing process steps can be attached. Execution success and "public reply not yet received" can coexist.
Stable ids and kinds for the same message/part preserve the component instance, native expansion, and focus; immutable data updates are enough,
and the whole conversation does not need to be recreated. defaultOpen only means initially expanded; later output updates do not force it to collapse again.

See [Agent components](AGENT-COMPONENTS.md) for the standard composition and the full capability matrix. This round also extends typed JSX/Assistant parts and the finite tool/task schema and onToolAction action of the existing AssistantView JSON catalog.
JSON still provides no separate ChatTask/ChatToolCall entry, recursive task tree, arbitrary object interpretation, execution protocol, or requirement to disclose private reasoning;
see the [JSON contract](JSON.md) for the exact fields.
