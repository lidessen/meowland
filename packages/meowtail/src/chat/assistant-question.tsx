import { derived, h, keyed, type Context, type Signal } from "meowjsx";
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
    labels?: Partial<AssistantLabels>;
  },
  context: Context<typeof AssistantQuestionView>,
) {
  const assistantCopy = { ...defaultAssistantCopy, ...labels };
  const answer = context.signal("");
  const sending = context.signal(false);
  const error = context.signal("");
  const disabled = derived(() => sending.value || value.value.state !== "open" || !onAnswer);
  let disposed = false;
  context.onCleanup(() => {
    disposed = true;
  });
  const submit = async (event: Event) => {
    event.preventDefault();
    if (sending.value || disabled.value || !answer.value.trim() || !onAnswer) return;
    sending.value = true;
    error.value = "";
    try {
      await onAnswer(value.value.id, answer.value);
    } catch {
      if (!disposed) error.value = assistantCopy.answerError;
    } finally {
      if (!disposed) sending.value = false;
    }
  };
  const parts = context.parts;
  return (
    <form onSubmit={submit} ref={parts.root}>
      <ChatQuestion
        question={derived(() => value.value.title)}
        label={assistantCopy.questions}
        description={derived(() => value.value.description)}
        feedback={derived(
          () =>
            error.value ||
            value.value.feedback ||
            (value.value.state === "submitting"
              ? assistantCopy.questionSubmitting
              : value.value.state === "answered"
                ? assistantCopy.questionAnswered
                : value.value.state === "unavailable"
                  ? assistantCopy.questionUnavailable
                  : ""),
        )}
        actions={
          <>
            <Button
              type="submit"
              size="small"
              disabled={derived(() => disabled.value || !answer.value.trim())}
            >
              {assistantCopy.answer}
            </Button>
            {onDismiss ? (
              <Button
                type="button"
                variant="quiet"
                size="small"
                disabled={derived(() => sending.value || value.value.state !== "open")}
                onClick={() => onDismiss(value.value.id)}
              >
                {assistantCopy.dismiss}
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
            <option value="">{assistantCopy.answerPlaceholder}</option>
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
          aria-label={derived(() => `${assistantCopy.answer}: ${value.value.title}`)}
          placeholder={assistantCopy.answerPlaceholder}
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
