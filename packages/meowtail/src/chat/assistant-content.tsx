import { h, keyed, type Child, type Context } from "meowjsx";
import { derived, signal, unwrap, type Signal } from "meowjsx/signal";
// Fragment is required by the classic JSX transform for process status content.
// eslint-disable-next-line no-unused-vars
import { Fragment } from "meowjsx";
import { ChatMessage } from "./message";
import { ChatBubble } from "./bubble";
import { ChatAttachments } from "./attachments";
import { ChatToolCall } from "./tool-call";
import { ChatTask } from "./task";
import { ProcessGroup } from "../components/process-group";
import { CodeBlock } from "../components/code-block";
import { Status } from "../components/status";
import { StatusDot } from "../components/status-dot";
import { executionStateLabel, executionStateTone } from "../shared/execution-state";
import { AssistantMarkdown } from "./assistant-markdown";
import { ChatMessageActions } from "./message-actions";
import { IconButton } from "../components/icon-button";
import { Icon, type IconName } from "../icons/icon";
import type {
  AssistantLabels,
  AssistantMessage,
  AssistantMessageAction,
  AssistantMessagePart,
  AssistantProcessStep,
  AssistantViewProps,
} from "./assistant-types";

function AssistantStep(
  { value }: { value: Signal<AssistantProcessStep> },
  context: Context<typeof AssistantStep>,
) {
  const parts = context.parts;
  return (
    <li ref={parts.step}>
      <StatusDot state={derived(() => value.value.tone ?? "unknown")} />
      <div ref={parts.label}>
        <strong>{derived(() => value.value.title)}</strong>
        <p hidden={derived(() => !value.value.description)} ref={parts.description}>
          {derived(() => value.value.description ?? "")}
        </p>
      </div>
      <span ref={parts.status}>{derived(() => value.value.statusText ?? "")}</span>
    </li>
  );
}
AssistantStep.meta = {
  name: "assistant-steps",
  parts: ["root", "step", "label", "description", "status"],
} as const;

export function AssistantSteps(
  { steps }: { steps: Signal<readonly AssistantProcessStep[]> },
  context: Context<typeof AssistantSteps>,
) {
  return (
    <ol ref={context.parts.root}>
      {keyed(
        steps,
        (step) => step.id,
        (value) => (
          <AssistantStep value={value} />
        ),
      )}
    </ol>
  );
}
AssistantSteps.meta = AssistantStep.meta;

export function AssistantPartView(
  {
    value,
    message,
    renderPart,
    onToolAction,
  }: {
    value: Signal<AssistantMessagePart>;
    message: Signal<AssistantMessage>;
    renderPart?: AssistantViewProps["renderPart"];
    onToolAction?: AssistantViewProps["onToolAction"];
  },
  context: Context<typeof AssistantPartView>,
) {
  const initial = value.value;
  const custom = renderPart ? derived(() => renderPart(value.value, message.value)) : undefined;
  let fallback: Child;
  if (initial.kind === "text") {
    const text = <AssistantMarkdown text={derived(() => (value.value as typeof initial).text)} />;
    fallback = message.value.role === "user" ? <ChatBubble>{text}</ChatBubble> : text;
  } else if (initial.kind === "tool") {
    const tool = () => value.value as typeof initial;
    fallback = (
      <ChatToolCall
        icon={initial.icon ? <Icon name={initial.icon} /> : undefined}
        label={derived(() => tool().label)}
        summary={derived(() => tool().summary)}
        state={derived(() => tool().state ?? "unknown")}
        statusLabel={derived(() => tool().statusLabel)}
        input={derived(() => tool().input)}
        output={derived(() => tool().output)}
        outputSummary={derived(() => tool().outputSummary)}
        maxLines={initial.maxLines}
        collapsible
        open={initial.defaultOpen ?? false}
        onRetry={
          onToolAction
            ? () => {
                if (tool().canRetry && !tool().retryDisabled)
                  onToolAction(message.value.id, tool().id, "retry");
              }
            : undefined
        }
        onCancel={
          onToolAction
            ? () => {
                if (tool().canCancel && !tool().cancelDisabled)
                  onToolAction(message.value.id, tool().id, "cancel");
              }
            : undefined
        }
        canRetry={derived(() => tool().canRetry ?? false)}
        canCancel={derived(() => tool().canCancel ?? false)}
        retryDisabled={derived(() => tool().retryDisabled ?? false)}
        cancelDisabled={derived(() => tool().cancelDisabled ?? false)}
      />
    );
  } else if (initial.kind === "task") {
    const task = () => value.value as typeof initial;
    fallback = (
      <ChatTask
        title={derived(() => task().title)}
        state={derived(() => task().state)}
        statusLabel={derived(() => task().statusLabel)}
        description={derived(() => task().description)}
        executionText={derived(() => task().executionText)}
        replyText={derived(() => task().replyText)}
        progress={derived(() => task().progress)}
      >
        <AssistantSteps steps={derived(() => task().steps ?? [])} />
      </ChatTask>
    );
  } else if (initial.kind === "process") {
    const processPart = () => value.value as typeof initial;
    const statusText = derived(() => processPart().statusText);
    const status =
      initial.state === undefined ? (
        statusText
      ) : (
        <>
          <Status
            state={derived(() => executionStateTone(processPart().state ?? "unknown"))}
            label={derived(() => executionStateLabel(processPart().state ?? "unknown"))}
          />
          <span hidden={derived(() => !processPart().statusText)}>{statusText}</span>
        </>
      );
    fallback = (
      <ProcessGroup
        title={derived(() => processPart().title)}
        status={status}
        open={initial.defaultOpen ?? false}
      >
        <AssistantSteps steps={derived(() => processPart().steps)} />
      </ProcessGroup>
    );
  } else if (initial.kind === "code") {
    fallback = (
      <CodeBlock
        code={derived(() => (value.value as typeof initial).code)}
        language={derived(() => (value.value as typeof initial).language)}
      />
    );
  } else
    fallback = <ChatAttachments items={derived(() => (value.value as typeof initial).items)} />;
  return (
    <div data-assistant-part-id={initial.id} data-kind={initial.kind} ref={context.parts.root}>
      {custom ? derived(() => unwrap(custom) ?? fallback) : fallback}
    </div>
  );
}
AssistantPartView.meta = { name: "assistant-part", parts: ["root"] } as const;

function AssistantReplyActions(
  {
    value,
    labels,
    onMessageAction,
  }: {
    value: Signal<AssistantMessage>;
    labels: AssistantLabels;
    onMessageAction?: AssistantViewProps["onMessageAction"];
  },
  context: Context<typeof AssistantReplyActions>,
) {
  const copied = signal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  context.onCleanup(() => clearTimeout(timer));
  const text = () =>
    value.value.parts.flatMap((part) => (part.kind === "text" ? [part.text] : [])).join("\n\n");
  const intent = (action: AssistantMessageAction, icon: IconName, label: string) => (
    <IconButton
      size="small"
      label={label}
      onClick={() => onMessageAction?.(value.value.id, action)}
    >
      <Icon name={icon} />
    </IconButton>
  );
  return (
    <ChatMessageActions>
      <IconButton
        size="small"
        label={derived(() => (copied.value ? labels.copied : labels.copy))}
        hidden={derived(() => !text())}
        onClick={async () => {
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
        }}
        data-copied={derived(() => String(copied.value))}
      >
        <Icon name="copy" className="assistant-copy-idle" />
        <Icon name="check" className="assistant-copy-done" />
      </IconButton>
      {onMessageAction
        ? [
            intent("good", "thumbs-up", labels.good),
            intent("bad", "thumbs-down", labels.bad),
            intent("regenerate", "refresh-cw", labels.regenerate),
          ]
        : null}
    </ChatMessageActions>
  );
}
AssistantReplyActions.meta = { name: "assistant-message", parts: ["root"] } as const;

export function AssistantMessageView(
  {
    value,
    renderPart,
    onToolAction,
    onMessageAction,
    labels,
  }: {
    value: Signal<AssistantMessage>;
    renderPart?: AssistantViewProps["renderPart"];
    onToolAction?: AssistantViewProps["onToolAction"];
    onMessageAction?: AssistantViewProps["onMessageAction"];
    labels?: AssistantLabels;
  },
  context: Context<typeof AssistantMessageView>,
) {
  const parts = derived(() => value.value.parts);
  const reply = value.value.role === "assistant" && labels;
  return (
    <div
      data-assistant-message-id={value.value.id}
      data-assistant-role={value.value.role}
      ref={context.parts.root}
    >
      <ChatMessage
        role={value.value.role}
        author=""
        header={
          <div data-assistant-message-header>
            <strong>{derived(() => value.value.author)}</strong>
            <time>{derived(() => value.value.timestamp ?? "")}</time>
            <span role="status">
              {derived(() =>
                value.value.status && value.value.status !== "complete" ? value.value.status : "",
              )}
            </span>
          </div>
        }
        surface="none"
        actions={
          reply ? (
            <div
              data-assistant-actions
              hidden={derived(() => !!value.value.status && value.value.status !== "complete")}
            >
              <AssistantReplyActions
                value={value}
                labels={reply}
                onMessageAction={onMessageAction}
              />
            </div>
          ) : undefined
        }
      >
        {keyed(
          parts,
          (part) => `${part.id}:${part.kind}`,
          (part) => (
            <AssistantPartView
              value={part}
              message={value}
              renderPart={renderPart}
              onToolAction={onToolAction}
            />
          ),
        )}
      </ChatMessage>
    </div>
  );
}
AssistantMessageView.meta = { name: "assistant-message", parts: ["root"] } as const;
