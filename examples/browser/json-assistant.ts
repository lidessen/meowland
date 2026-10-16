import { signal, type ReadableSignal } from "meowjsx";
import { createJsonView, parseJsonView } from "meowjsx/json";
import { render } from "meowjsx/web";
import { installMeowUI } from "meowui";
import type { AssistantDraft, AssistantMessage } from "meowui/chat";
import { createMeowUICatalog } from "meowui/json";
import { standardTheme } from "meowui/theme";
import { applyTheme, mountStyles } from "meowcss/web";

const root = document.querySelector("#app");
if (!root) throw new Error("Example mount point is missing");
const messages = signal<readonly AssistantMessage[]>([
  {
    id: "welcome",
    role: "assistant",
    author: "Local example",
    parts: [
      {
        id: "welcome-text",
        kind: "text",
        text: "This complete Assistant is built from **JSON metadata**. Its data, draft and actions belong to this page. No server or model is contacted.",
      },
      {
        id: "welcome-process",
        kind: "process",
        title: "Example setup",
        steps: [{ id: "loaded", title: "Public packages loaded", tone: "success" }],
      },
    ],
  },
]);
const draft = signal<AssistantDraft>({ text: "", attachments: [] });
const catalog = createMeowUICatalog();
const description = parseJsonView(
  {
    component: "AssistantView",
    props: {
      title: "JSON Assistant example",
      description: "Local host bindings and explicit actions",
      messages: { $binding: "messages" },
      draft: { $binding: "draft" },
      onDraftChange: { $action: "draft.change" },
      onSubmit: { $action: "submit" },
      models: [{ value: "local", label: "Local example" }],
      model: "local",
    },
  },
  catalog,
);
let nextId = 0;
const child = createJsonView(description, {
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
    [
      "submit",
      (snapshot: AssistantDraft) => {
        messages.value = [
          ...messages.value,
          {
            id: `message-${++nextId}`,
            role: "user",
            author: "You",
            parts: [{ id: "text", kind: "text", text: snapshot.text }],
          },
        ];
        return { accepted: true };
      },
    ],
  ]),
});
const uninstall = installMeowUI();
const restoreTheme = applyTheme(document.documentElement, standardTheme);
const removeStyles = mountStyles(document, standardTheme.cssText);
const mounted = render(child, root);
window.addEventListener(
  "pagehide",
  () => {
    mounted.unmount();
    removeStyles();
    restoreTheme();
    uninstall();
  },
  { once: true },
);
