import { defineComponent, derived, h, keyed, unwrap, type Child, type Signal } from "meowjsx";
import { ChatMessage } from "./message";
import { ChatAttachments } from "./attachments";
import { ChatToolCall } from "./tool-call";
import { ChatTask } from "./task";
import { ProcessGroup } from "../components/process-group";
import { CodeBlock } from "../components/code-block";
import { StatusDot } from "../components/status-dot";
import { AssistantMarkdown } from "./assistant-markdown";
import type {
  AssistantMessage,
  AssistantMessagePart,
  AssistantProcessStep,
  AssistantViewProps,
} from "./assistant-types";

export const assistantStepsContract = {
  name: "assistant-steps",
  parts: ["root", "step", "label", "description", "status"],
} as const;
const AssistantStep = defineComponent<
  { value: Signal<AssistantProcessStep> },
  "assistant-steps",
  (typeof assistantStepsContract.parts)[number]
>(assistantStepsContract, ({ value }, context) =>
  context.part(
    "step",
    "li",
    null,
    h(StatusDot, { state: derived(() => value.value.tone ?? "unknown") }),
    context.part(
      "label",
      "div",
      null,
      h(
        "strong",
        null,
        derived(() => value.value.title),
      ),
      context.part(
        "description",
        "p",
        { hidden: derived(() => !value.value.description) },
        derived(() => value.value.description ?? ""),
      ),
    ),
    context.part(
      "status",
      "span",
      null,
      derived(() => value.value.statusText ?? ""),
    ),
  ),
);
export const AssistantSteps = defineComponent<
  { steps: Signal<readonly AssistantProcessStep[]> },
  "assistant-steps",
  (typeof assistantStepsContract.parts)[number]
>(assistantStepsContract, ({ steps }, context) =>
  context.part(
    "root",
    "ol",
    null,
    keyed(
      steps,
      (step) => step.id,
      (value) => h(AssistantStep, { value }),
    ),
  ),
);

export const AssistantPartView = defineComponent<
  {
    value: Signal<AssistantMessagePart>;
    message: Signal<AssistantMessage>;
    renderPart?: AssistantViewProps["renderPart"];
    onToolAction?: AssistantViewProps["onToolAction"];
  },
  "assistant-part",
  "root"
>(
  { name: "assistant-part", parts: ["root"] },
  ({ value, message, renderPart, onToolAction }, context) => {
    // The keyed identity includes kind, so this component's structural variant is stable.
    const initial = value.value;
    // Host slots may return a node. Component fallbacks stay mounted and take signals instead.
    const custom = renderPart ? derived(() => renderPart(value.value, message.value)) : undefined;
    let fallback: Child;
    if (initial.kind === "text") {
      fallback = h(AssistantMarkdown, {
        text: derived(() => (value.value as typeof initial).text),
      });
    } else if (initial.kind === "tool") {
      const tool = () => value.value as typeof initial;
      fallback = h(ChatToolCall, {
        label: derived(() => tool().label),
        summary: derived(() => tool().summary),
        state: derived(() => tool().state ?? "unknown"),
        statusLabel: derived(() => tool().statusLabel),
        input: derived(() => tool().input),
        output: derived(() => tool().output),
        outputSummary: derived(() => tool().outputSummary),
        maxLines: initial.maxLines,
        collapsible: true,
        open: initial.defaultOpen ?? false,
        onRetry: onToolAction
          ? () => {
              if (tool().canRetry && !tool().retryDisabled)
                onToolAction(message.value.id, tool().id, "retry");
            }
          : undefined,
        onCancel: onToolAction
          ? () => {
              if (tool().canCancel && !tool().cancelDisabled)
                onToolAction(message.value.id, tool().id, "cancel");
            }
          : undefined,
        canRetry: derived(() => tool().canRetry ?? false),
        canCancel: derived(() => tool().canCancel ?? false),
        retryDisabled: derived(() => tool().retryDisabled ?? false),
        cancelDisabled: derived(() => tool().cancelDisabled ?? false),
      });
    } else if (initial.kind === "task") {
      const task = () => value.value as typeof initial;
      fallback = h(ChatTask, {
        title: derived(() => task().title),
        state: derived(() => task().state),
        statusLabel: derived(() => task().statusLabel),
        description: derived(() => task().description),
        executionText: derived(() => task().executionText),
        replyText: derived(() => task().replyText),
        progress: derived(() => task().progress),
        children: h(AssistantSteps, {
          steps: derived(() => task().steps ?? []),
        }),
      });
    } else if (initial.kind === "process") {
      fallback = h(ProcessGroup, {
        title: derived(() => (value.value as typeof initial).title),
        status: derived(() => (value.value as typeof initial).statusText),
        open: initial.defaultOpen ?? false,
        children: h(AssistantSteps, {
          steps: derived(() => (value.value as typeof initial).steps),
        }),
      });
    } else if (initial.kind === "code") {
      fallback = h(CodeBlock, {
        code: derived(() => (value.value as typeof initial).code),
        language: derived(() => (value.value as typeof initial).language),
      });
    } else {
      fallback = h(ChatAttachments, {
        items: derived(() => (value.value as typeof initial).items),
      });
    }
    const content = custom ? derived(() => unwrap(custom) ?? fallback) : fallback;
    return context.part(
      "root",
      "div",
      { "data-assistant-part-id": initial.id, "data-kind": initial.kind },
      content,
    );
  },
);

export const AssistantMessageView = defineComponent<
  {
    value: Signal<AssistantMessage>;
    renderPart?: AssistantViewProps["renderPart"];
    onToolAction?: AssistantViewProps["onToolAction"];
  },
  "assistant-message",
  "root"
>(
  { name: "assistant-message", parts: ["root"] },
  ({ value, renderPart, onToolAction }, context) => {
    const parts = derived(() => value.value.parts);
    return context.part(
      "root",
      "div",
      { "data-assistant-message-id": value.value.id },
      h(ChatMessage, {
        role: value.value.role,
        author: "",
        header: h(
          "div",
          { "data-assistant-message-header": true },
          h(
            "strong",
            null,
            derived(() => value.value.author),
          ),
          h(
            "time",
            null,
            derived(() => value.value.timestamp ?? ""),
          ),
          h(
            "span",
            { role: "status" },
            derived(() =>
              value.value.status && value.value.status !== "complete" ? value.value.status : "",
            ),
          ),
        ),
        surface: "none",
        children: keyed(
          parts,
          (part) => `${part.id}:${part.kind}`,
          (part) => h(AssistantPartView, { value: part, message: value, renderPart, onToolAction }),
        ),
      }),
    );
  },
);
