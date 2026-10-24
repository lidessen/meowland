import { h, type Child, type Context, type Props } from "meowjsx";
import { actionRowRef } from "../shared/action-row-fit";

export interface ChatQuestionProps extends Props {
  label?: Child;
  question?: Child;
  questionId?: string;
  description?: Child;
  feedback?: Child;
  actions?: Child;
}

/**
 * A question the assistant asks the user, with choices and a written answer. Presentation only:
 * submission, cancellation and question lifetime belong to the host.
 */
export function ChatQuestion(
  {
    label = "Needs your answer",
    question,
    questionId,
    description,
    feedback,
    actions,
    children,
    ref,
    ...props
  }: ChatQuestionProps,
  context: Context<typeof ChatQuestion>,
) {
  const parts = context.parts;
  return (
    <section
      {...props}
      aria-labelledby={questionId ?? props["aria-labelledby"]}
      ref={[parts.root, ref]}
    >
      <div ref={parts.eyebrow}>{label}</div>
      {question ? (
        <p id={questionId} ref={parts.title}>
          {question}
        </p>
      ) : null}
      {description ? <p ref={parts.description}>{description}</p> : null}
      <div ref={parts.content}>{children}</div>
      {feedback ? (
        <div role="status" ref={parts.feedback}>
          {feedback}
        </div>
      ) : null}
      {actions ? <div ref={[parts.actions, actionRowRef()]}>{actions}</div> : null}
    </section>
  );
}

ChatQuestion.meta = {
  name: "chat-question",
  parts: ["root", "eyebrow", "title", "description", "content", "feedback", "actions"],
} as const;
