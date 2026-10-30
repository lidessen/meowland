import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, ChatQuestion, ChoiceGroup, Textarea } from "meowtail";
import { Note } from "./specimen";

export const ChatQuestionStory = defineStory({
  id: "chat-question",
  title: "Chat Question · Choices and a written answer",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "ChatQuestion",
  variant: "Interactive question",
  description:
    "The question comes first and options are visible. Selecting does not send; a local receipt only appears after you confirm and submit. Switching input modes keeps the draft.",
  covers: [
    "ChoiceGroup native radio",
    "required",
    "keyboard",
    "free text",
    "long content",
    "cancel",
  ],
  render: () => (
    <form data-question-form>
      <ChatQuestion
        question="Before you chose to retry, had the Meowland host already been rebuilt or restarted?"
        questionId="restart-question"
        description="The Cell retry still did not succeed, so the current host state needs confirmation."
        actions={[
          <Button type="submit">Submit answer</Button>,
          <Button variant="quiet" size="small" data-question-mode>
            Answer in writing
          </Button>,
          <Button variant="quiet" size="small" data-question-cancel>
            Cancel question
          </Button>,
        ]}
      >
        <div data-question-choices>
          <ChoiceGroup
            id="restart-choice"
            name="answer"
            label="Choose an answer"
            hideLabel
            required
            options={[
              {
                value: "restarted",
                label: "Already restarted",
                description: "The host was rebuilt and restarted; investigation can continue.",
              },
              {
                value: "not-yet",
                label: "Not restarted yet",
                description: "Preserve the current state first and explain what to do next.",
              },
              {
                value: "unsure",
                label: "Not sure",
                description: "Help me confirm which version is currently running.",
              },
            ]}
          />
        </div>
        <div data-question-text hidden>
          <Textarea
            aria-label="Your answer"
            name="freeAnswer"
            rows={3}
            placeholder="Describe the current situation…"
            disabled
          />
        </div>
        <Note data-question-feedback role="status" hidden />
      </ChatQuestion>
    </form>
  ),
  setup({ root, onCleanup, report }) {
    const form = root.querySelector<HTMLFormElement>("[data-question-form]")!;
    const choices = root.querySelector<HTMLElement>("[data-question-choices]")!;
    const text = root.querySelector<HTMLElement>("[data-question-text]")!;
    const textarea = text.querySelector<HTMLTextAreaElement>("textarea")!;
    const mode = root.querySelector<HTMLButtonElement>("[data-question-mode]")!;
    const feedback = root.querySelector<HTMLElement>("[data-question-feedback]")!;
    const show = (message: string) => {
      feedback.hidden = false;
      feedback.textContent = message;
      report(message);
    };
    const changeMode = () => {
      choices.hidden = !choices.hidden;
      text.hidden = !choices.hidden;
      choices.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
        input.disabled = Boolean(choices.hidden);
      });
      textarea.disabled = Boolean(text.hidden);
      textarea.required = !text.hidden;
      mode.textContent = text.hidden ? "Answer in writing" : "Back to choices";
      if (!text.hidden) textarea.focus();
    };
    const submit = (event: Event) => {
      event.preventDefault();
      const data = new FormData(form);
      show(
        `Submitted the local example: ${data.get(text.hidden ? "answer" : "freeAnswer")}. Nothing was sent to an Agent.`,
      );
    };
    const cancel = () =>
      show("Canceled the local example question; the entered content is kept for review.");
    const cancelButton = root.querySelector<HTMLButtonElement>("[data-question-cancel]")!;
    mode.addEventListener("click", changeMode);
    form.addEventListener("submit", submit);
    cancelButton.addEventListener("click", cancel);
    onCleanup(() => {
      mode.removeEventListener("click", changeMode);
      form.removeEventListener("submit", submit);
      cancelButton.removeEventListener("click", cancel);
    });
  },
});

export const ChatQuestionConflictStory = defineStory({
  id: "chat-question-conflict",
  title: "Chat Question · Long content and conflict feedback",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "ChatQuestion",
  variant: "Static conflict feedback",
  description:
    "A static composition showing a long question, long options and conflict feedback; the buttons are not wired to business actions, and async submission or input retention is not verified.",
  covers: ["long question", "long options", "static conflict feedback"],
  render: () => (
    <ChatQuestion
      question="The service still returns 503. If the host cannot be restarted for now, do you want to preserve the current state and keep investigating, or look at the component source and verification notes that are already done?"
      questionId="conflict-question"
      feedback="The question was updated and this answer has not been submitted. The content is kept; you can copy it and then read the new question."
      actions={[
        <Button>View new question</Button>,
        <Button variant="quiet" size="small">
          Copy answer
        </Button>,
      ]}
    >
      <ChoiceGroup
        id="long-answer"
        name="longAnswer"
        label="Your answer"
        hideLabel
        defaultValue="keep"
        options={[
          {
            value: "keep",
            label:
              "Keep the service's current state and logs, keep investigating why activation failed, and do not restart the running host for now",
          },
          {
            value: "source",
            label:
              "Look at the component source and test notes first; handle the service runtime problem later",
          },
        ]}
      />
    </ChatQuestion>
  ),
});

export const ChoiceGroupStory = defineStory({
  id: "choice-group",
  title: "Choice Group · Compare options directly",
  group: "Forms and selection",
  groupOrder: 40,
  component: "ChoiceGroup",
  description:
    "For a small set of options that need direct comparison. Native radios keep arrow keys, Tab, form reset and required validation.",
  render: () => (
    <form className="workshop-stack workshop-constrained">
      <ChoiceGroup
        id="startup-choice"
        name="startup"
        label="What should open at startup?"
        defaultValue="last"
        options={[
          {
            value: "last",
            label: "The last work",
            description: "Return to where you left off and continue unfinished content.",
          },
          {
            value: "new",
            label: "Blank page",
            description: "Start from a new workspace.",
          },
          {
            value: "team",
            label: "Team overview",
            description: "The current workspace is not connected to a team.",
            disabled: true,
          },
        ]}
      />
      <Button type="reset" variant="outline">
        Reset selection
      </Button>
    </form>
  ),
});
