import { h, keyed, type Context } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal, type Signal } from "meowjsx/signal";
// Fragment is required by the classic JSX transform for question actions.
// eslint-disable-next-line no-unused-vars
import { Fragment } from "meowjsx";
import { ChatQuestion } from "./question";
import { Button } from "../components/button";
import { Select } from "../components/select";
import {
  assistantCopy as defaultAssistantCopy,
  type AssistantLabels,
  type AssistantQuestion,
  type AssistantViewProps,
} from "./assistant-types";

export function AssistantQuestionView(
  {
    value,
    onAnswer,
    onDismiss,
    labels,
  }: {
    value: Signal<AssistantQuestion>;
    onAnswer?: AssistantViewProps["onAnswer"];
    onDismiss?: AssistantViewProps["onDismissQuestion"];
    labels?: MaybeSignal<Partial<AssistantLabels>>;
  },
  context: Context<typeof AssistantQuestionView>,
) {
  const assistantCopy = derived(() => ({ ...defaultAssistantCopy, ...unwrap(labels) }));
  const answer = signal("");
  const sending = signal(false);
  const error = signal(false);
  const disabled = derived(() => sending.value || value.value.state !== "open" || !onAnswer);
  let disposed = false;
  context.onCleanup(() => {
    disposed = true;
  });
  const submit = async (event: Event) => {
    event.preventDefault();
    if (sending.value || disabled.value || !answer.value.trim() || !onAnswer) return;
    sending.value = true;
    error.value = false;
    try {
      await onAnswer(value.value.id, answer.value);
    } catch {
      if (!disposed) error.value = true;
    } finally {
      if (!disposed) sending.value = false;
    }
  };
  const parts = context.parts;
  return (
    <form onSubmit={submit} ref={parts.root}>
      <ChatQuestion
        question={derived(() => value.value.title)}
        label={derived(() => assistantCopy.value.questions)}
        description={derived(() => value.value.description)}
        feedback={derived(
          () =>
            (error.value ? assistantCopy.value.answerError : "") ||
            value.value.feedback ||
            (value.value.state === "submitting"
              ? assistantCopy.value.questionSubmitting
              : value.value.state === "answered"
                ? assistantCopy.value.questionAnswered
                : value.value.state === "unavailable"
                  ? assistantCopy.value.questionUnavailable
                  : ""),
        )}
        actions={
          <>
            <Button
              type="submit"
              size="small"
              disabled={derived(() => disabled.value || !answer.value.trim())}
            >
              {derived(() => assistantCopy.value.answer)}
            </Button>
            {onDismiss ? (
              <Button
                type="button"
                variant="quiet"
                size="small"
                disabled={derived(() => sending.value || value.value.state !== "open")}
                onClick={() => onDismiss(value.value.id)}
              >
                {derived(() => assistantCopy.value.dismiss)}
              </Button>
            ) : null}
          </>
        }
      >
        <div hidden={derived(() => !value.value.options?.length)} ref={parts.options}>
          <Select
            value={answer}
            disabled={disabled}
            aria-label={derived(() => value.value.title)}
            onChange={(event: Event) => {
              answer.value = (event.currentTarget as HTMLSelectElement).value;
            }}
          >
            <option value="">{derived(() => assistantCopy.value.answerPlaceholder)}</option>
            {keyed(
              derived(() => value.value.options ?? []),
              (option) => option.value,
              (option) => (
                <option value={derived(() => option.value.value)}>
                  {derived(() => option.value.label)}
                </option>
              ),
            )}
          </Select>
        </div>
        <textarea
          value={answer}
          rows={2}
          aria-label={derived(() => `${assistantCopy.value.answer}: ${value.value.title}`)}
          placeholder={derived(() => assistantCopy.value.answerPlaceholder)}
          disabled={disabled}
          onInput={(event: Event) => {
            answer.value = (event.currentTarget as HTMLTextAreaElement).value;
          }}
          ref={parts.answer}
        />
      </ChatQuestion>
    </form>
  );
}
AssistantQuestionView.meta = {
  name: "assistant-question",
  parts: ["root", "answer", "options"],
} as const;
