# Finite JSON UI catalog

`createMeowUICatalog()` from `meowtail/json` registers the existing `AssistantView`, `Button`, `Input`, and `Stack`, and builds the same MeowJSX VNodes through `meowjsx/json`. It does not copy the renderer, theme, component implementations, or business stores, and does not reflect arbitrary properties from TypeScript's open Props.

```ts
import { createJsonView, parseJsonView } from "meowjsx/json";
import { signal, type ReadableSignal } from "meowjsx";
import type { AssistantDraft, AssistantMessage } from "meowtail/chat";
import { createMeowUICatalog } from "meowtail/json";

const catalog = createMeowUICatalog();
const messages = signal<readonly AssistantMessage[]>([]);
const draft = signal<AssistantDraft>({ text: "", attachments: [] });
const view = parseJsonView(
  {
    component: "AssistantView",
    props: {
      messages: { $binding: "messages" },
      draft: { $binding: "draft" },
      onDraftChange: { $action: "draft.change" },
      onSubmit: { $action: "submit" },
    },
  },
  catalog,
);
const child = createJsonView(view, {
  catalog,
  bindings: new Map<string, ReadableSignal<unknown>>([
    ["messages", messages],
    ["draft", draft],
  ]),
  actions: new Map<string, (...args: any[]) => unknown>([
    [
      "draft.change",
      (next: AssistantDraft) => {
        draft.value = next;
      },
    ],
    ["submit", (snapshot: AssistantDraft) => ({ accepted: snapshot.text.trim().length > 0 })],
  ]),
});
```

`messages` is required. Messages support six explicit branches: text/code/process/attachments/tool/task; process steps, activity, background work, questions, model options, read state, drafts, and submission snapshots use finite schemas. `assistantJsonSchemas` and the catalog reuse the same definitions, so validation, descriptions, and type associations are not maintained in separate copies. A controlled draft must be wired to `onDraftChange` or set to read-only; whether a submission is accepted is still decided by the host explicitly returning `{accepted:true}`.

The tool branch accepts label/summary/state/statusLabel, lazy input/output/outputSummary, maxLines/defaultOpen,
and canRetry/canCancel plus retryDisabled/cancelDisabled. outputSummary is visible only in the expanded body; the collapsed summary uses summary.
canRetry/canCancel only control action visibility and grant no permission; the `onToolAction` action passes only the validated messageId, partId, and
`"retry" | "cancel"`; execution eligibility and result updates are the host's responsibility. The task branch accepts title, state, description, separate executionText/replyText,
labeled progress, and finite steps, and renders the same `ChatTask`. This is not a separate ChatTask/ChatToolCall JSON entry,
and it provides no recursive task tree, children/footer slots, or arbitrary object interpretation.

This slice supports serialized attachment metadata (id/name/url/mediaType/sizeBytes) and does not support File, local file upload, attachment callbacks, renderPart/renderWorkDetail, or headerActions/composerTrailing slots. Use the full `meowtail/chat` JSX API when these capabilities are needed. JSON provides no `onAttach` and turns off the local file selection entry with the finite default `allowAttachments: false`; an explicit true is rejected. Text editing, sending, and displaying/removing existing attachments still work. Networking, permissions, persistence, data protocols, and uploads always belong to the host.

Button click actions pass no native event; the Input input action passes only the validated current string value. Only the listed properties are available; open JSX native props, HTML tag names, ref/raw HTML, arbitrary event objects, arbitrary code, path expressions, and dynamic import are not in the catalog. Other MeowUI components do not yet provide JSON metadata; this slice does not claim automatic serialization of every UI property.
