import { createContext, h, useContext, type Child } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import {
  AssistantView,
  type AssistantMessage,
  type AssistantDraft,
  type AssistantWork,
  type AssistantQuestion,
} from "meowtail/chat";
import { Button, Inline, Stack } from "meowtail";

const DemoContext = createContext("Missing ancestor context");
function ContextNote() {
  const value = useContext(DemoContext);
  return h("p", { "data-assistant-context": value }, value);
}

/** Only fixture data and host actions. The full surface is the public AssistantView. */
export function assistantDemo(): Child {
  let next = 20;
  const messages = signal<readonly AssistantMessage[]>(
    Array.from({ length: 10 }, (_, index) => ({
      id: `message-${index}`,
      role: index % 2 ? "assistant" : "user",
      author: index % 2 ? "Assistant" : "You",
      timestamp: `10:${String(index).padStart(2, "0")}`,
      parts: [
        {
          id: "text",
          kind: "text",
          text:
            index % 2
              ? "The default Assistant keeps **messages, process and actions** on one reading axis.\n\nYou can read earlier messages while new results arrive. This example uses local view models, with no product API or execution runtime."
              : "Review the shared Assistant layout and preserve my reading position.",
        },
        ...(index === 9
          ? [
              {
                id: "check",
                kind: "text" as const,
                text: "Run the same checks before handing it over:\n\n```sh\nbun run check\n```",
              },
            ]
          : []),
        ...(index === 7
          ? [
              {
                id: "process",
                kind: "process",
                title: "Review process",
                state: "success",
                statusText: "3 steps",
                steps: [
                  {
                    id: "read",
                    title: "Read the layout",
                    description: "Checked the shared component contract and the reading region.",
                    statusText: "Reviewed",
                    tone: "success",
                  },
                  {
                    id: "check",
                    title: "Check interaction",
                    description: "Keep draft and focus while opening activity details.",
                    statusText: "Returned",
                    tone: "returned",
                  },
                  {
                    id: "decide",
                    title: "Wait for a decision",
                    description: "A returned execution does not imply the goal is complete.",
                    statusText: "Needs your answer",
                    tone: "warning",
                  },
                ],
              } as const,
            ]
          : []),
        ...(index === 9
          ? [
              {
                id: "context-note",
                kind: "text",
                text: "A local part override uses the same render tree.",
              } as const,
            ]
          : []),
      ],
    })),
  );
  const draft = signal<AssistantDraft>({
    text: "Keep this draft while reviewing the activity panel.",
    attachments: [],
  });
  const model = signal("balanced");
  const readState = signal<"ready" | "loading" | "error">("ready");
  const disabled = signal(false);
  const disabledReason = signal("");
  const work = signal<readonly AssistantWork[]>([
    {
      id: "review",
      title: "Review the reading experience",
      statusText: "Waiting for review",
      tone: "returned",
      executionText: "Execution returned",
      replyText: "Public reply not yet posted",
      detail:
        "## Review notes\n\nThe execution returned its findings. The goal is still open and the host has not published the final answer.",
      steps: [
        {
          id: "note",
          title: "Preserve accurate status",
          description: "No execution state is inferred by the UI.",
          statusText: "Returned",
          tone: "returned",
        },
      ],
    },
    {
      id: "queued",
      title: "Check attachment previews",
      statusText: "Requested; waiting for execution",
      tone: "idle",
      executionText: "Pending",
      summary: "This item is pending, with no evidence that it is running.",
    },
    {
      id: "running",
      title: "Prepare an independent example",
      statusText: "Rendering the public component",
      tone: "processing",
      executionText: "Running",
      summary: "The host explicitly reports an active execution.",
    },
  ]);
  const questions = signal<readonly AssistantQuestion[]>([
    {
      id: "layout",
      title: "Which reading layout should we use?",
      description: "You can select an option or write a different answer.",
      state: "open",
      options: [
        { value: "Single reading column", label: "Single reading column" },
        { value: "Reading column with activity", label: "Reading column with activity" },
      ],
    },
    { id: "review-time", title: "When should we review the result?", state: "open" },
  ]);
  const append = () => {
    messages.value = [
      ...messages.value,
      {
        id: `message-${next++}`,
        role: "assistant",
        author: "Assistant",
        parts: [
          {
            id: "text",
            kind: "text",
            text: "A new result arrived. Your current reading position should remain stable until you return to the latest message.",
          },
        ],
      },
    ];
  };
  return h(Stack, {
    style: { height: "min(900px, calc(100dvh - 48px))", minHeight: "360px" },
    children: [
      h(Inline, {
        wrap: true,
        children: [
          h(Button, {
            variant: "outline",
            size: "small",
            onClick: append,
            children: "Append result",
          }),
          h(Button, {
            variant: "outline",
            size: "small",
            onClick: () => {
              const last = messages.value.at(-1)!;
              messages.value = [
                ...messages.value.slice(0, -1),
                {
                  ...last,
                  status: "streaming",
                  parts: [
                    {
                      id: "text",
                      kind: "text",
                      text: `${last.parts[0]?.kind === "text" ? last.parts[0].text : ""} Further streamed text keeps the existing message instance.`,
                    },
                  ],
                },
              ];
            },
            children: "Stream text",
          }),
          h(Button, {
            variant: "quiet",
            size: "small",
            onClick: () => {
              readState.value = readState.value === "error" ? "ready" : "error";
            },
            children: "Toggle read failure",
          }),
          h(Button, {
            variant: "quiet",
            size: "small",
            onClick: () => {
              disabled.value = !disabled.value;
              disabledReason.value = disabled.value ? "The host has disabled input." : "";
            },
            children: "Toggle disabled",
          }),
        ],
      }),
      h("div", {
        style: { flex: "1", minHeight: 0 },
        children: h(DemoContext.Provider, {
          value: "Ancestor context retained",
          children: h(AssistantView, {
            title: "Shared Assistant",
            description: "A complete public UI · local fixture data",
            messages,
            draft,
            onDraftChange: (nextDraft: AssistantDraft) => {
              draft.value = nextDraft;
            },
            readState,
            disabled,
            disabledReason,
            models: [
              { value: "balanced", label: "Balanced model" },
              { value: "fast", label: "Fast model" },
            ],
            model,
            onModelChange: (value: string) => {
              model.value = value;
            },
            activity: {
              title: "Reviewing the UI",
              statusText: "Checking the shared composition",
              tone: "processing",
              description: "The host owns all activity facts.",
            },
            work,
            questions,
            onLoadOlder: () => {
              messages.value = [
                {
                  id: `older-${next++}`,
                  role: "system",
                  author: "Earlier context",
                  parts: [
                    {
                      id: "text",
                      kind: "text",
                      text: "An older message was prepended. The first visible existing message should stay at its reading offset.",
                    },
                  ],
                },
                ...messages.value,
              ];
            },
            onSubmit: async (snapshot: AssistantDraft) => {
              await new Promise((resolve) => setTimeout(resolve, 600));
              messages.value = [
                ...messages.value,
                {
                  id: `message-${next++}`,
                  role: "user",
                  author: "You",
                  parts: [
                    { id: "text", kind: "text", text: snapshot.text },
                    ...(snapshot.attachments.length
                      ? [{ id: "files", kind: "attachments", items: snapshot.attachments } as const]
                      : []),
                  ],
                },
              ];
              return { accepted: true };
            },
            onAnswer: async (id: string, answer: string) => {
              questions.value = questions.value.map((question) =>
                question.id === id
                  ? { ...question, state: "answered", feedback: `Host accepted: ${answer}` }
                  : question,
              );
            },
            onDismissQuestion: (id: string) => {
              questions.value = questions.value.filter((question) => question.id !== id);
            },
            onRefreshWork: (id: string) => {
              work.value = work.value.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      readState: "error",
                      feedback:
                        "The fixture refresh failed; previously read details remain visible.",
                    }
                  : item,
              );
            },
            renderPart: (part) => (part.id === "context-note" ? h(ContextNote, null) : undefined),
          }),
        }),
      }),
    ],
  });
}

export const CompleteAssistant = defineStory({
  id: "assistant-complete",
  title: "Assistant View · Complete Assistant",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "AssistantView",
  description:
    "Messages, safe rich text, process, draft, model selection, attachments, activity, work details and questions use one public component.",
  covers: [
    "AssistantView",
    "draft",
    "process",
    "activity",
    "questions",
    "scroll",
    "assistant-composer",
    "assistant-markdown",
    "assistant-question",
    "assistant-steps",
  ],
  render: assistantDemo,
});
