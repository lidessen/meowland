import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const chatQuestionContract = {
  name: "chat-question",
  parts: ["root", "eyebrow", "title", "description", "content", "feedback", "actions"],
} as const satisfies ComponentContract;

export interface ChatQuestionProps extends Props {
  label?: Child;
  question?: Child;
  questionId?: string;
  description?: Child;
  feedback?: Child;
  actions?: Child;
}

/** Presentation only: submission, cancellation and question lifetime belong to the host. */
export const ChatQuestion = defineComponent<
  ChatQuestionProps,
  "chat-question",
  (typeof chatQuestionContract.parts)[number]
>(
  chatQuestionContract,
  (
    {
      label = "Needs your answer",
      question,
      questionId,
      description,
      feedback,
      actions,
      children,
      ...props
    },
    context,
  ) =>
    context.part(
      "root",
      "section",
      { ...props, "aria-labelledby": questionId ?? props["aria-labelledby"] },
      context.part("eyebrow", "div", null, label),
      question ? context.part("title", "p", { id: questionId }, question) : null,
      description ? context.part("description", "p", null, description) : null,
      context.part("content", "div", null, children),
      feedback ? context.part("feedback", "div", { role: "status" }, feedback) : null,
      actions ? context.part("actions", "div", null, actions) : null,
    ),
);
