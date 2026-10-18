import {
  defineComponent,
  h,
  keyed,
  unwrap,
  type Child,
  type LifecycleScope,
  type Signal,
} from "meowjsx";
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

/** All derived values live in their owning component lifecycle. */
export function assistantDerived<T>(
  context: Pick<LifecycleScope, "signal" | "effect">,
  read: () => T,
) {
  const value = context.signal(read());
  context.effect(() => {
    value.value = read();
  });
  return value;
}

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
    h(StatusDot, { state: assistantDerived(context, () => value.value.tone ?? "unknown") }),
    context.part(
      "label",
      "div",
      null,
      h(
        "strong",
        null,
        assistantDerived(context, () => value.value.title),
      ),
      context.part(
        "description",
        "p",
        { hidden: assistantDerived(context, () => !value.value.description) },
        assistantDerived(context, () => value.value.description ?? ""),
      ),
    ),
    context.part(
      "status",
      "span",
      null,
      assistantDerived(context, () => value.value.statusText ?? ""),
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
    const custom = renderPart
      ? assistantDerived(context, () => renderPart(value.value, message.value))
      : undefined;
    let fallback: Child;
    if (initial.kind === "text") {
      fallback = h(AssistantMarkdown, {
        text: assistantDerived(context, () => (value.value as typeof initial).text),
      });
    } else if (initial.kind === "tool") {
      const tool = () => value.value as typeof initial;
      fallback = h(ChatToolCall, {
        label: assistantDerived(context, () => tool().label),
        summary: assistantDerived(context, () => tool().summary),
        state: assistantDerived(context, () => tool().state ?? "unknown"),
        statusLabel: assistantDerived(context, () => tool().statusLabel),
        input: assistantDerived(context, () => tool().input),
        output: assistantDerived(context, () => tool().output),
        outputSummary: assistantDerived(context, () => tool().outputSummary),
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
        canRetry: assistantDerived(context, () => tool().canRetry ?? false),
        canCancel: assistantDerived(context, () => tool().canCancel ?? false),
        retryDisabled: assistantDerived(context, () => tool().retryDisabled ?? false),
        cancelDisabled: assistantDerived(context, () => tool().cancelDisabled ?? false),
      });
    } else if (initial.kind === "task") {
      const task = () => value.value as typeof initial;
      fallback = h(ChatTask, {
        title: assistantDerived(context, () => task().title),
        state: assistantDerived(context, () => task().state),
        statusLabel: assistantDerived(context, () => task().statusLabel),
        description: assistantDerived(context, () => task().description),
        executionText: assistantDerived(context, () => task().executionText),
        replyText: assistantDerived(context, () => task().replyText),
        progress: assistantDerived(context, () => task().progress),
        children: h(AssistantSteps, {
          steps: assistantDerived(context, () => task().steps ?? []),
        }),
      });
    } else if (initial.kind === "process") {
      fallback = h(ProcessGroup, {
        title: assistantDerived(context, () => (value.value as typeof initial).title),
        status: assistantDerived(context, () => (value.value as typeof initial).statusText),
        open: initial.defaultOpen ?? false,
        children: h(AssistantSteps, {
          steps: assistantDerived(context, () => (value.value as typeof initial).steps),
        }),
      });
    } else if (initial.kind === "code") {
      // CodeBlock owns its copy/wrap/highlight lifecycle. Replace only this block on code changes.
      fallback = assistantDerived(context, () => {
        const part = value.value as typeof initial;
        return h(CodeBlock, { code: part.code, language: part.language });
      });
    } else {
      fallback = assistantDerived(context, () =>
        h(ChatAttachments, { items: (value.value as typeof initial).items }),
      );
    }
    const content = custom ? assistantDerived(context, () => unwrap(custom) ?? fallback) : fallback;
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
    const parts = assistantDerived(context, () => value.value.parts);
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
            assistantDerived(context, () => value.value.author),
          ),
          h(
            "time",
            null,
            assistantDerived(context, () => value.value.timestamp ?? ""),
          ),
          h(
            "span",
            { role: "status" },
            assistantDerived(context, () =>
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
