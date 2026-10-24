import {
  derived,
  h,
  unwrap,
  type Child,
  type Context,
  type MaybeSignal,
  type Props,
} from "meowjsx";
// Fragment is required by the classic JSX transform for tool header content.
// eslint-disable-next-line no-unused-vars
import { Fragment } from "meowjsx";
import { Icon } from "../icons/icon";
import { Button } from "../components/button";
import { OutputBlock } from "../components/output-block";
import {
  executionStateLabel,
  executionStateTone,
  type ChatExecutionState,
} from "../shared/execution-state";
import { StatusDot } from "../components/status-dot";

/** The complete spelling remains supported for existing tool consumers. */
export type ChatToolCallState = ChatExecutionState;

export interface ChatToolCallLabels {
  input: string;
  output: string;
  emptyInput: string;
  emptyOutput: string;
  retry: string;
  cancel: string;
}

export interface ChatToolCallProps extends Props {
  label: MaybeSignal<string>;
  /** Short target or action summary, visible while collapsed. */
  summary?: MaybeSignal<string | undefined>;
  state?: MaybeSignal<ChatToolCallState>;
  /** The host's account of the state (who or what is being waited on, why it failed). */
  statusLabel?: MaybeSignal<string | undefined>;
  detail?: Child;
  icon?: Child;
  /** Tool payloads are inert text. Undefined omits a region; an empty string is explicit empty data. */
  input?: MaybeSignal<string | undefined>;
  output?: MaybeSignal<string | undefined>;
  outputSummary?: MaybeSignal<string | undefined>;
  maxLines?: number;
  /** Reveals this row's own body in place. */
  collapsible?: boolean;
  /** Runs the host's own action instead of revealing a body; the row keeps the row chrome. */
  onActivate?: () => void;
  /** Intent only. The host owns execution, pending state, permissions and the resulting status. */
  onRetry?: () => void;
  onCancel?: () => void;
  /** Whether the host currently offers this intent; unlike disabled, false hides it. */
  canRetry?: MaybeSignal<boolean>;
  canCancel?: MaybeSignal<boolean>;
  retryDisabled?: MaybeSignal<boolean>;
  cancelDisabled?: MaybeSignal<boolean>;
  labels?: Partial<ChatToolCallLabels>;
}

/** One tool call in an assistant's work: what ran, on what, and how it ended. */
export function ChatToolCall(
  {
    children,
    label,
    summary,
    state = "complete",
    statusLabel,
    detail,
    icon,
    input,
    output,
    outputSummary,
    maxLines,
    collapsible = false,
    onActivate,
    onRetry,
    onCancel,
    canRetry = true,
    canCancel = true,
    retryDisabled = false,
    cancelDisabled = false,
    labels,
    ref,
    ...props
  }: ChatToolCallProps,
  context: Context<typeof ChatToolCall>,
) {
  const copy: ChatToolCallLabels = {
    input: "Input",
    output: "Output",
    emptyInput: "No input content",
    emptyOutput: "Empty output",
    retry: "Retry",
    cancel: "Cancel",
    ...labels,
  };
  const parts = context.parts;
  const stateWord = derived(() =>
    unwrap(statusLabel) === "" ? "" : executionStateLabel(unwrap(state)),
  );
  const fact = derived(() => unwrap(statusLabel) ?? "");
  const quietStatus = derived(() => unwrap(state) === "complete" && !unwrap(statusLabel));
  const reveals = collapsible && onActivate === undefined;
  const interactive = reveals || onActivate !== undefined;
  const payload = (kind: "input" | "output", text: MaybeSignal<string | undefined> | undefined) => (
    <div hidden={derived(() => unwrap(text) === undefined)} ref={parts[kind]}>
      <OutputBlock
        title={copy[kind]}
        rows={derived(() => {
          const value = unwrap(text);
          return value === undefined || value === "" ? [] : value.split("\n");
        })}
        copyText={derived(() => unwrap(text) ?? "")}
        emptyText={kind === "input" ? copy.emptyInput : copy.emptyOutput}
        maxLines={maxLines}
        wrap
      />
    </div>
  );
  const hasBody =
    children !== undefined ||
    input !== undefined ||
    output !== undefined ||
    outputSummary !== undefined ||
    onRetry !== undefined ||
    onCancel !== undefined;
  const headerProps = onActivate !== undefined ? { type: "button", onClick: onActivate } : null;
  return h(
    reveals ? "details" : "div",
    {
      ...props,
      className: props.className,
      "data-tool-state": state,
      "data-tool-default-complete": derived(() => (quietStatus.value ? "true" : undefined)),
      "data-tool-interactive": interactive ? "true" : undefined,
      "data-tool-collapsible": reveals ? "true" : undefined,
      ref: [parts.root, ref],
    },
    <>
      {h(
        onActivate !== undefined ? "button" : reveals ? "summary" : "div",
        { ...headerProps, ref: parts.header },
        <>
          <span aria-hidden="true" ref={parts.icon}>
            {icon ?? <Icon name="box" />}
          </span>
          <strong ref={parts.label}>{label}</strong>
          {summary !== undefined ? (
            <span title={summary} hidden={derived(() => !unwrap(summary))} ref={parts.summary}>
              {summary}
            </span>
          ) : null}
          <span
            hidden={derived(() => !stateWord.value)}
            data-tone={derived(() => executionStateTone(unwrap(state)))}
            ref={parts.status}
          >
            <StatusDot state={derived(() => executionStateTone(unwrap(state)))} />
            {stateWord}
          </span>
          <span hidden={derived(() => !fact.value)} ref={parts.fact}>
            {fact}
          </span>
          {interactive ? (
            <span aria-hidden="true" ref={parts.chevron}>
              <Icon name="chevron-right" />
            </span>
          ) : null}
        </>,
      )}
      {detail ? <p ref={parts.detail}>{detail}</p> : null}
      {hasBody ? (
        <div ref={parts.body}>
          {input !== undefined ? payload("input", input) : null}
          {outputSummary !== undefined ? (
            <p hidden={derived(() => !unwrap(outputSummary))} ref={parts.outputSummary}>
              {outputSummary}
            </p>
          ) : null}
          {output !== undefined ? payload("output", output) : null}
          {children}
          {onRetry || onCancel ? (
            <div
              hidden={derived(
                () => !(onRetry && unwrap(canRetry)) && !(onCancel && unwrap(canCancel)),
              )}
              ref={parts.actions}
            >
              {onRetry ? (
                <Button
                  variant="outline"
                  size="small"
                  hidden={derived(() => !unwrap(canRetry))}
                  disabled={derived(() => !unwrap(canRetry) || unwrap(retryDisabled))}
                  onClick={onRetry}
                >
                  {copy.retry}
                </Button>
              ) : null}
              {onCancel ? (
                <Button
                  variant="quiet"
                  size="small"
                  hidden={derived(() => !unwrap(canCancel))}
                  disabled={derived(() => !unwrap(canCancel) || unwrap(cancelDisabled))}
                  onClick={onCancel}
                >
                  {copy.cancel}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </>,
  );
}

ChatToolCall.meta = {
  name: "chat-tool-call",
  parts: [
    "root",
    "header",
    "icon",
    "label",
    "summary",
    "status",
    "fact",
    "chevron",
    "detail",
    "body",
    "input",
    "output",
    "outputSummary",
    "actions",
  ],
} as const;
