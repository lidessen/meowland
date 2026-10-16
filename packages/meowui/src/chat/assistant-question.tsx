import { defineComponent, h, type Signal } from "meowjsx";
import { ChatQuestion } from "./question";
import { Button } from "../components/button";
import { Select } from "../components/select";
import { assistantDerived } from "./assistant-content";
import { assistantCopy as defaultAssistantCopy, type AssistantLabels, type AssistantQuestion, type AssistantViewProps } from "./assistant-types";

export const assistantQuestionContract = { name: "assistant-question", parts: ["root", "answer", "options"] } as const;
export const AssistantQuestionView = defineComponent<{
  value: Signal<AssistantQuestion>;
  onAnswer?: AssistantViewProps["onAnswer"];
  onDismiss?: AssistantViewProps["onDismissQuestion"];
  labels?: Partial<AssistantLabels>;
}, "assistant-question", "root" | "answer" | "options">(
  assistantQuestionContract,
  ({ value, onAnswer, onDismiss, labels }, context) => {
    const assistantCopy = { ...defaultAssistantCopy, ...labels };
    const answer = context.signal("");
    const sending = context.signal(false);
    const error = context.signal("");
    const disabled = assistantDerived(context, () => sending.value || value.value.state !== "open" || !onAnswer);
    let disposed = false;
    context.onCleanup(() => { disposed = true; });
    const submit = async (event: Event) => {
      event.preventDefault();
      if (sending.value || disabled.value || !answer.value.trim() || !onAnswer) return;
      sending.value = true;
      error.value = "";
      try { await onAnswer(value.value.id, answer.value); }
      catch { if (!disposed) error.value = assistantCopy.answerError; }
      finally { if (!disposed) sending.value = false; }
      // Question state and answer acceptance remain facts supplied by the host.
    };
    return context.part("root", "form", { onSubmit: submit },
      h(ChatQuestion, {
        question: assistantDerived(context, () => value.value.title),
        label: assistantCopy.questions,
        description: assistantDerived(context, () => value.value.description),
        feedback: assistantDerived(context, () => error.value || value.value.feedback || (
          value.value.state === "submitting" ? assistantCopy.questionSubmitting :
          value.value.state === "answered" ? assistantCopy.questionAnswered :
          value.value.state === "unavailable" ? assistantCopy.questionUnavailable : ""
        )),
        children: [
          context.part("options", "div", { hidden: assistantDerived(context, () => !value.value.options?.length) },
            h(Select, { value: answer, disabled, "aria-label": value.value.title,
              onChange: (event: Event) => { answer.value = (event.currentTarget as HTMLSelectElement).value; },
              children: assistantDerived(context, () => [h("option", { value: "" }, assistantCopy.answerPlaceholder),
                ...(value.value.options ?? []).map((option) => h("option", { value: option.value }, option.label))]),
            }),
          ),
          context.part("answer", "textarea", {
            value: answer, rows: 2, "aria-label": `${assistantCopy.answer}: ${value.value.title}`,
            placeholder: assistantCopy.answerPlaceholder, disabled,
            onInput: (event: Event) => { answer.value = (event.currentTarget as HTMLTextAreaElement).value; },
          }),
        ],
        actions: [
          h(Button, { type: "submit", size: "small", disabled: assistantDerived(context, () => disabled.value || !answer.value.trim()), children: assistantCopy.answer }),
          onDismiss ? h(Button, { variant: "quiet", size: "small", disabled: assistantDerived(context, () => sending.value || value.value.state !== "open"), onClick: () => onDismiss(value.value.id), children: assistantCopy.dismiss }) : null,
        ],
      }),
    );
  },
);
