import {
  defineComponent,
  h,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { StatusDot } from "../components/status-dot";
import {
  executionStateLabel,
  executionStateTone,
  type ChatExecutionState,
} from "../shared/execution-state";

export const chatTaskContract = {
  name: "chat-task",
  parts: [
    "root",
    "header",
    "title",
    "status",
    "description",
    "execution",
    "reply",
    "progress",
    "progressLabel",
    "progressBar",
    "body",
    "footer",
  ],
} as const satisfies ComponentContract;

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
  className?: string;
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
export const ChatTask = defineComponent<
  ChatTaskProps,
  typeof chatTaskContract.name,
  (typeof chatTaskContract.parts)[number]
>(
  chatTaskContract,
  (
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
      className,
      ...props
    },
    context,
  ) => {
    const derive = <T,>(read: () => T) => {
      const result = context.signal(read());
      context.effect(() => {
        result.value = read();
      });
      return result;
    };
    const currentProgress = derive(() => checkedProgress(unwrap(progress)));
    const text = (
      part: "description" | "execution" | "reply",
      value: MaybeSignal<string | undefined> | undefined,
    ) =>
      context.part(
        part,
        "p",
        { hidden: derive(() => !unwrap(value)) },
        derive(() => unwrap(value) ?? ""),
      );
    return context.part(
      "root",
      "section",
      {
        ...props,
        className,
        "aria-label": props["aria-label"] ?? title,
        "data-execution-state": state,
      },
      context.part(
        "header",
        "div",
        null,
        context.part("title", "strong", null, title),
        context.part(
          "status",
          "span",
          null,
          h(StatusDot, { state: derive(() => executionStateTone(unwrap(state))) }),
          derive(() => unwrap(statusLabel) ?? executionStateLabel(unwrap(state))),
        ),
      ),
      text("description", description),
      text("execution", executionText),
      text("reply", replyText),
      context.part(
        "progress",
        "div",
        { hidden: derive(() => currentProgress.value === undefined) },
        context.part(
          "progressLabel",
          "span",
          null,
          derive(() => currentProgress.value?.label ?? ""),
        ),
        context.part("progressBar", "progress", {
          value: derive(() => currentProgress.value?.value ?? 0),
          max: derive(() => currentProgress.value?.max ?? 1),
          "aria-label": derive(() => currentProgress.value?.label ?? ""),
        }),
      ),
      context.part("body", "div", null, children),
      context.part("footer", "div", null, footer),
    );
  },
);
