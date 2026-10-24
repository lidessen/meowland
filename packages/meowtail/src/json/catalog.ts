import type { MaybeSignal } from "meowjsx/signal";
import {
  defineJsonComponent,
  jsonSchema as s,
  type JsonComponentDefinition,
  type JsonSchema,
} from "meowjsx/json";
import { AssistantView } from "../chat/assistant";
import type {
  AssistantViewProps,
  AssistantDraft,
  AssistantMessagePart,
} from "../chat/assistant-types";
import { Button, type ButtonProps } from "../components/button";
import { Input, type InputProps } from "../components/input";
import { Stack } from "../components/stack";

const optional = s.optional;
const tone = s.enum("processing", "success", "returned", "warning", "danger", "unknown", "idle");
const attachment = s.object({
  id: s.string(),
  name: s.string(),
  url: s.string(),
  mediaType: s.string(),
  sizeBytes: optional(s.number()),
});
const step = s.object({
  id: s.string(),
  title: s.string(),
  description: optional(s.string()),
  statusText: optional(s.string()),
  tone: optional(tone),
});
const steps = s.array(step);
const executionState = s.enum(
  "queued",
  "running",
  "waiting",
  "success",
  "error",
  "cancelled",
  "unknown",
  "complete",
);
const taskProgress = s.object({ value: s.number(), max: s.number(), label: s.string() });
const part = s.union(
  s.object({ id: s.string(), kind: s.enum("text"), text: s.string() }),
  s.object({
    id: s.string(),
    kind: s.enum("code"),
    code: s.string(),
    language: optional(s.string()),
  }),
  s.object({
    id: s.string(),
    kind: s.enum("process"),
    title: s.string(),
    state: optional(executionState),
    statusText: optional(s.string()),
    steps,
    defaultOpen: optional(s.boolean()),
  }),
  s.object({ id: s.string(), kind: s.enum("attachments"), items: s.array(attachment) }),
  s.object({
    id: s.string(),
    kind: s.enum("tool"),
    label: s.string(),
    summary: optional(s.string()),
    state: optional(executionState),
    statusLabel: optional(s.string()),
    input: optional(s.string()),
    output: optional(s.string()),
    outputSummary: optional(s.string()),
    maxLines: optional(s.number()),
    defaultOpen: optional(s.boolean()),
    canRetry: optional(s.boolean()),
    canCancel: optional(s.boolean()),
    retryDisabled: optional(s.boolean()),
    cancelDisabled: optional(s.boolean()),
  }),
  s.object({
    id: s.string(),
    kind: s.enum("task"),
    title: s.string(),
    state: executionState,
    statusLabel: optional(s.string()),
    description: optional(s.string()),
    executionText: optional(s.string()),
    replyText: optional(s.string()),
    progress: optional(taskProgress),
    steps: optional(steps),
  }),
) satisfies JsonSchema<AssistantMessagePart>;
const message = s.object({
  id: s.string(),
  role: s.enum("user", "assistant", "system", "tool"),
  author: s.string(),
  timestamp: optional(s.string()),
  status: optional(s.enum("complete", "streaming", "error", "pending")),
  parts: s.array(part),
});
const draft = s.object({
  text: s.string(),
  attachments: s.array(attachment),
}) satisfies JsonSchema<AssistantDraft>;
const activity = s.object({
  title: s.string(),
  statusText: s.string(),
  tone: optional(tone),
  description: optional(s.string()),
  steps: optional(steps),
});
const work = s.object({
  id: s.string(),
  title: s.string(),
  summary: optional(s.string()),
  statusText: s.string(),
  tone: optional(tone),
  executionText: optional(s.string()),
  replyText: optional(s.string()),
  detail: optional(s.string()),
  readState: optional(s.enum("ready", "loading", "error", "unavailable")),
  feedback: optional(s.string()),
  steps: optional(steps),
});
const question = s.object({
  id: s.string(),
  title: s.string(),
  description: optional(s.string()),
  options: optional(s.array(s.object({ value: s.string(), label: s.string() }))),
  state: s.enum("open", "submitting", "answered", "unavailable"),
  feedback: optional(s.string()),
});
const choice = s.object({ value: s.string(), label: s.string(), disabled: optional(s.boolean()) });

/** Serializable data only. Local File objects and attachment callbacks stay in the JSX host API. */
export const assistantJsonSchemas = Object.freeze({
  attachment,
  step,
  part,
  message,
  draft,
  activity,
  work,
  question,
  choice,
  executionState,
  taskProgress,
});
const value = <T>(schema: JsonSchema<T>) => ({ kind: "value" as const, schema });
const binding = <T>(schema: JsonSchema<T>) => ({
  kind: "value" as const,
  schema,
  bindable: true as const,
});
const action = <const S extends readonly JsonSchema<unknown>[]>(...args: S) => ({
  kind: "action" as const,
  args,
});

const assistant = defineJsonComponent<AssistantViewProps>(AssistantView, {
  title: value(s.string()),
  description: value(s.string()),
  messages: { ...binding(s.array(message)), required: true },
  readState: binding(s.enum("ready", "loading", "error")),
  readFeedback: binding(s.string()),
  activity: binding(optional(activity)),
  work: binding(s.array(work)),
  questions: binding(s.array(question)),
  draft: binding(draft),
  defaultDraft: value(draft),
  readOnly: value(s.boolean()),
  allowAttachments: { kind: "value", schema: s.enum(false), default: false },
  onDraftChange: action(draft),
  onSubmit: action(draft),
  disabled: binding(s.boolean()),
  disabledReason: binding(s.string()),
  models: binding(s.array(choice)),
  model: binding(s.string()),
  onModelChange: action(s.string()),
  reasoningOptions: binding(s.array(choice)),
  reasoning: binding(s.string()),
  onReasoningChange: action(s.string()),
  onAnswer: action(s.string(), s.string()),
  onDismissQuestion: action(s.string()),
  onToolAction: action(s.string(), s.string(), s.enum("retry", "cancel")),
  onRefreshWork: action(s.string()),
  onLoadOlder: action(),
  loadingOlder: binding(s.boolean()),
  className: value(s.string()),
});

// Native attributes are intentionally finite here even though the JSX components accept open Props.
interface JsonButtonProps extends ButtonProps {
  disabled?: MaybeSignal<boolean>;
  onClick?: (event: MouseEvent) => void;
}
interface JsonInputProps extends InputProps {
  value?: MaybeSignal<string>;
  placeholder?: string;
  disabled?: MaybeSignal<boolean>;
  onInput?: (event: Event) => void;
}
const button = defineJsonComponent<JsonButtonProps>(Button, {
  variant: value(s.enum("primary", "quiet", "danger", "outline", "accent", "stop")),
  size: value(s.enum("small", "default", "large")),
  className: value(s.string()),
  disabled: binding(s.boolean()),
  onClick: { kind: "action", args: [], mapArgs: () => [] },
});
const input = defineJsonComponent<JsonInputProps>(Input, {
  type: value(s.string()),
  className: value(s.string()),
  value: binding(s.string()),
  placeholder: value(s.string()),
  disabled: binding(s.boolean()),
  onInput: {
    kind: "action",
    args: [s.string()],
    mapArgs: (event: Event) => [(event.currentTarget as HTMLInputElement | null)?.value],
  },
});
const stack = defineJsonComponent(Stack, {
  gap: value(s.enum("none", "compact", "normal", "relaxed")),
  rowGap: value(s.enum("auto", "none", "compact", "normal", "relaxed")),
  columnGap: value(s.enum("auto", "none", "compact", "normal", "relaxed")),
  align: value(s.enum("start", "center", "end", "stretch", "baseline")),
  justify: value(s.enum("start", "center", "end", "between")),
  className: value(s.string()),
});

/** A finite catalog of the original public components, not an alternate UI implementation. */
export function createMeowUICatalog(): ReadonlyMap<string, JsonComponentDefinition> {
  return new Map<string, JsonComponentDefinition>([
    ["AssistantView", assistant],
    ["Button", button],
    ["Input", input],
    ["Stack", stack],
  ]);
}
