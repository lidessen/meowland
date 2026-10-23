import { defineComponent, derived, h, keyed, unwrap, type Child, type Signal } from "meowjsx";
import { ChatMessage } from "./message";
import { ChatBubble } from "./bubble";
import { ChatAttachments } from "./attachments";
import { ChatToolCall } from "./tool-call";
import { ChatTask } from "./task";
import { ProcessGroup } from "../components/process-group";
import { CodeBlock } from "../components/code-block";
import { StatusDot } from "../components/status-dot";
import { AssistantMarkdown } from "./assistant-markdown";
import { ChatMessageActions } from "./message-actions";
import { IconButton } from "../components/icon-button";
import { Icon, type IconName } from "../icons/icon";
import { assistantStepsContract } from "./assistant-steps.contract";
import type {
  AssistantLabels,
  AssistantMessage,
  AssistantMessageAction,
  AssistantMessagePart,
  AssistantProcessStep,
  AssistantViewProps,
} from "./assistant-types";
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
      const text = h(AssistantMarkdown, {
        text: derived(() => (value.value as typeof initial).text),
      });
      // The message renders without a surface so parts can stack; a user's
      // words still need the bubble that tells them apart from the reply.
      fallback = message.value.role === "user" ? h(ChatBubble, { children: text }) : text;
    } else if (initial.kind === "tool") {
      const tool = () => value.value as typeof initial;
      fallback = h(ChatToolCall, {
        icon: initial.icon ? h(Icon, { name: initial.icon }) : undefined,
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

/** Copy, then the host's feedback intents, under a finished reply. */
const AssistantReplyActions = defineComponent<
  {
    value: Signal<AssistantMessage>;
    labels: AssistantLabels;
    onMessageAction?: AssistantViewProps["onMessageAction"];
  },
  "assistant-message",
  "root"
>({ name: "assistant-message", parts: ["root"] }, ({ value, labels, onMessageAction }, context) => {
  const copied = context.signal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  context.onCleanup(() => clearTimeout(timer));
  const text = () =>
    value.value.parts.flatMap((part) => (part.kind === "text" ? [part.text] : [])).join("\n\n");
  const intent = (action: AssistantMessageAction, icon: IconName, label: string) =>
    h(IconButton, {
      size: "small",
      label,
      onClick: () => onMessageAction?.(value.value.id, action),
      children: h(Icon, { name: icon }),
    });
  return h(ChatMessageActions, {
    children: [
      h(IconButton, {
        size: "small",
        label: derived(() => (copied.value ? labels.copied : labels.copy)),
        hidden: derived(() => !text()),
        onClick: async () => {
          try {
            await navigator.clipboard?.writeText(text());
          } catch {
            return;
          }
          copied.value = true;
          clearTimeout(timer);
          timer = setTimeout(() => {
            copied.value = false;
          }, 1600);
        },
        children: [
          h(Icon, { name: "copy", className: "assistant-copy-idle" }),
          h(Icon, { name: "check", className: "assistant-copy-done" }),
        ],
        "data-copied": derived(() => String(copied.value)),
      }),
      onMessageAction
        ? [
            intent("good", "thumbs-up", labels.good),
            intent("bad", "thumbs-down", labels.bad),
            intent("regenerate", "refresh-cw", labels.regenerate),
          ]
        : null,
    ],
  });
});

export const AssistantMessageView = defineComponent<
  {
    value: Signal<AssistantMessage>;
    renderPart?: AssistantViewProps["renderPart"];
    onToolAction?: AssistantViewProps["onToolAction"];
    onMessageAction?: AssistantViewProps["onMessageAction"];
    labels?: AssistantLabels;
  },
  "assistant-message",
  "root"
>(
  { name: "assistant-message", parts: ["root"] },
  ({ value, renderPart, onToolAction, onMessageAction, labels }, context) => {
    const parts = derived(() => value.value.parts);
    // A message keeps its role for its keyed lifetime.
    const reply = value.value.role === "assistant" && labels;
    return context.part(
      "root",
      "div",
      { "data-assistant-message-id": value.value.id, "data-assistant-role": value.value.role },
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
        actions: reply
          ? h(
              "div",
              {
                "data-assistant-actions": true,
                hidden: derived(() => !!value.value.status && value.value.status !== "complete"),
              },
              h(AssistantReplyActions, { value, labels: reply, onMessageAction }),
            )
          : undefined,
        children: keyed(
          parts,
          (part) => `${part.id}:${part.kind}`,
          (part) => h(AssistantPartView, { value: part, message: value, renderPart, onToolAction }),
        ),
      }),
    );
  },
);
