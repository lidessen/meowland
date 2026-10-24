import { h, type Child, type Context, type Props } from "meowjsx";
import { derived, unwrap, type MaybeSignal } from "meowjsx/signal";
import { Progress } from "../components/progress";
import { StatusDot } from "../components/status-dot";
import {
  executionStateLabel,
  executionStateTone,
  type ChatExecutionState,
} from "../shared/execution-state";

export interface ChatTaskProgress {
  value: number;
  max: number;
  /** A meaningful fact, for example "Reviewed 2 of 5 files". */
  label: string;
}

export interface ChatTaskProps extends Props {
  title: MaybeSignal<string>;
  state?: MaybeSignal<ChatExecutionState>;
  /** Explain the current state, including who or what a waiting task needs. */
  statusLabel?: MaybeSignal<string | undefined>;
  description?: MaybeSignal<string | undefined>;
  /** Execution and a public reply are separate host facts. Neither infers the other. */
  executionText?: MaybeSignal<string | undefined>;
  replyText?: MaybeSignal<string | undefined>;
  /** Explicit host progress only. Missing progress does not imply zero progress. */
  progress?: MaybeSignal<ChatTaskProgress | undefined>;
  /** Compose ordinary buttons and resource links outside the task's content. */
  footer?: Child;
}

function checkedProgress(value: ChatTaskProgress | undefined) {
  if (
    value !== undefined &&
    (!Number.isFinite(value.value) ||
      !Number.isFinite(value.max) ||
      value.max <= 0 ||
      value.value < 0 ||
      value.value > value.max)
  ) {
    throw new RangeError(
      "ChatTask progress requires finite values with 0 <= value <= max and max > 0.",
    );
  }
  return value;
}

/** A task record, not an executable task or a whole-card control. */
export function ChatTask(
  {
    title,
    state = "unknown",
    statusLabel,
    description,
    executionText,
    replyText,
    progress,
    footer,
    children,
    ref,
    ...props
  }: ChatTaskProps,
  context: Context<typeof ChatTask>,
) {
  const currentProgress = derived(() => checkedProgress(unwrap(progress)));
  const parts = context.parts;
  const text = (
    part: "description" | "execution" | "reply",
    value: MaybeSignal<string | undefined> | undefined,
  ) => {
    const content = derived(() => unwrap(value) ?? "");
    const hidden = derived(() => !unwrap(value));
    if (part === "description")
      return (
        <p hidden={hidden} ref={parts.description}>
          {content}
        </p>
      );
    if (part === "execution")
      return (
        <p hidden={hidden} ref={parts.execution}>
          {content}
        </p>
      );
    return (
      <p hidden={hidden} ref={parts.reply}>
        {content}
      </p>
    );
  };
  const stateTone = derived(() => executionStateTone(unwrap(state)));
  return (
    <section
      {...props}
      aria-label={props["aria-label"] ?? title}
      data-execution-state={state}
      ref={[parts.root, ref]}
    >
      <div ref={parts.header}>
        <strong ref={parts.title}>{title}</strong>
        <span data-tone={stateTone} ref={parts.status}>
          <StatusDot state={stateTone} />
          {derived(() => executionStateLabel(unwrap(state)))}
        </span>
        <span hidden={derived(() => !unwrap(statusLabel))} ref={parts.fact}>
          {derived(() => unwrap(statusLabel) ?? "")}
        </span>
      </div>
      {text("description", description)}
      {text("execution", executionText)}
      {text("reply", replyText)}
      <div hidden={derived(() => currentProgress.value === undefined)} ref={parts.progress}>
        <span ref={parts.progressLabel}>{derived(() => currentProgress.value?.label ?? "")}</span>
        <div ref={parts.progressBar}>
          <Progress
            value={derived(() => currentProgress.value?.value ?? 0)}
            max={derived(() => currentProgress.value?.max ?? 1)}
            label={derived(() => currentProgress.value?.label ?? "")}
          />
        </div>
      </div>
      <div ref={parts.body}>{children}</div>
      <div ref={parts.footer}>{footer}</div>
    </section>
  );
}

ChatTask.meta = {
  name: "chat-task",
  parts: [
    "root",
    "header",
    "title",
    "status",
    "fact",
    "description",
    "execution",
    "reply",
    "progress",
    "progressLabel",
    "progressBar",
    "body",
    "footer",
  ],
} as const;
