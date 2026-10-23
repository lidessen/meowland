import {
  defineComponent,
  derived,
  h,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Icon } from "../icons/icon";
import { Button } from "../components/button";
import { OutputBlock } from "../components/output-block";
import {
  executionStateLabel,
  executionStateTone,
  type ChatExecutionState,
} from "../shared/execution-state";
import { StatusDot } from "../components/status-dot";

export const chatToolCallContract = {
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
} as const satisfies ComponentContract;

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
  /**
   * The host's account of the state (who or what is being waited on, why it failed). The badge
   * names the state in one word; this fact reads as a quiet line under the row.
   */
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
  className?: string;
}

/** One tool call in an assistant's work: what ran, on what, and how it ended. */
export const ChatToolCall = defineComponent<
  ChatToolCallProps,
  typeof chatToolCallContract.name,
  (typeof chatToolCallContract.parts)[number]
>(
  chatToolCallContract,
  (
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
      className,
      ...props
    },
    context,
  ) => {
    const copy: ChatToolCallLabels = {
      input: "Input",
      output: "Output",
      emptyInput: "No input content",
      emptyOutput: "Empty output",
      retry: "Retry",
      cancel: "Cancel",
      ...labels,
    };
    // The badge speaks the library's shared state vocabulary, the same words ChatTask uses.
    // An explicitly empty statusLabel blanks the word, as it always has.
    const stateWord = derived(() =>
      unwrap(statusLabel) === "" ? "" : executionStateLabel(unwrap(state)),
    );
    const fact = derived(() => unwrap(statusLabel) ?? "");
    // Preserve the quiet completion default without interpreting missing data as success.
    const quietStatus = derived(() => unwrap(state) === "complete" && !unwrap(statusLabel));
    // One interactive header: activation never also toggles an in-place disclosure.
    const reveals = collapsible && onActivate === undefined;
    const interactive = reveals || onActivate !== undefined;
    const payload = (kind: "input" | "output", text: MaybeSignal<string | undefined> | undefined) =>
      context.part(
        kind,
        "div",
        { hidden: derived(() => unwrap(text) === undefined) },
        h(OutputBlock, {
          title: copy[kind],
          rows: derived(() => {
            const value = unwrap(text);
            return value === undefined || value === "" ? [] : value.split("\n");
          }),
          copyText: derived(() => unwrap(text) ?? ""),
          emptyText: kind === "input" ? copy.emptyInput : copy.emptyOutput,
          maxLines,
          wrap: true,
        }),
      );
    const hasBody =
      children !== undefined ||
      input !== undefined ||
      output !== undefined ||
      outputSummary !== undefined ||
      onRetry !== undefined ||
      onCancel !== undefined;
    return context.part(
      "root",
      reveals ? "details" : "div",
      {
        ...props,
        className,
        "data-tool-state": state,
        "data-tool-default-complete": derived(() => (quietStatus.value ? "true" : undefined)),
        "data-tool-interactive": interactive ? "true" : undefined,
        "data-tool-collapsible": reveals ? "true" : undefined,
      },
      context.part(
        "header",
        onActivate !== undefined ? "button" : reveals ? "summary" : "div",
        onActivate !== undefined ? { type: "button", onClick: onActivate } : null,
        context.part("icon", "span", { "aria-hidden": "true" }, icon ?? <Icon name="box" />),
        context.part("label", "strong", null, label),
        summary !== undefined
          ? context.part(
              "summary",
              "span",
              { title: summary, hidden: derived(() => !unwrap(summary)) },
              summary,
            )
          : null,
        context.part(
          "status",
          "span",
          {
            hidden: derived(() => !stateWord.value),
            "data-tone": derived(() => executionStateTone(unwrap(state))),
          },
          h(StatusDot, { state: derived(() => executionStateTone(unwrap(state))) }),
          stateWord,
        ),
        // Inside the header so a collapsed row still reads its fact.
        context.part("fact", "span", { hidden: derived(() => !fact.value) }, fact),
        interactive
          ? context.part(
              "chevron",
              "span",
              { "aria-hidden": "true" },
              <Icon name="chevron-right" />,
            )
          : null,
      ),
      detail ? context.part("detail", "p", null, detail) : null,
      hasBody
        ? context.part(
            "body",
            "div",
            null,
            input !== undefined ? payload("input", input) : null,
            outputSummary !== undefined
              ? context.part(
                  "outputSummary",
                  "p",
                  { hidden: derived(() => !unwrap(outputSummary)) },
                  outputSummary,
                )
              : null,
            output !== undefined ? payload("output", output) : null,
            children,
            onRetry || onCancel
              ? context.part(
                  "actions",
                  "div",
                  {
                    hidden: derived(
                      () => !(onRetry && unwrap(canRetry)) && !(onCancel && unwrap(canCancel)),
                    ),
                  },
                  onRetry ? (
                    <Button
                      variant="outline"
                      size="small"
                      hidden={derived(() => !unwrap(canRetry))}
                      disabled={derived(() => !unwrap(canRetry) || unwrap(retryDisabled))}
                      onClick={onRetry}
                    >
                      {copy.retry}
                    </Button>
                  ) : null,
                  onCancel ? (
                    <Button
                      variant="quiet"
                      size="small"
                      hidden={derived(() => !unwrap(canCancel))}
                      disabled={derived(() => !unwrap(canCancel) || unwrap(cancelDisabled))}
                      onClick={onCancel}
                    >
                      {copy.cancel}
                    </Button>
                  ) : null,
                )
              : null,
          )
        : null,
    );
  },
);
