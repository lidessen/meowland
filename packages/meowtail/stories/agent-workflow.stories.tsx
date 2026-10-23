import { h, signal, type Child } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, DiffBlock, Icon, Inline, ResourceLink, Stack, Text } from "meowtail";
import {
  AssistantView,
  ChatProcess,
  ChatQuestion,
  ChatSources,
  ChatTask,
  ChatToolCall,
  type AssistantDraft,
  type AssistantMessage,
  type AssistantQuestion,
  type ChatExecutionState,
  type ChatTaskProgress,
} from "meowtail/chat";

const payload = [
  "Inspect packages/meowtail/src/chat/agent-workflow-with-a-very-long-unbroken-file-name.tsx",
  "Input sample: check whether nested tasks, long paths, messages and tool output can all be read in a narrow container.",
  '<img src="x" onerror="alert(1)"> is tool data, not an executable element.',
].join("\n");
const resultLines = Array.from(
  { length: 24 },
  (_, index) =>
    `Result ${index + 1}: Long lines and English output remain readable. No external tool ran.`,
).join("\n");
const attachment = {
  id: "notes",
  name: "agent-layout-review-notes.txt",
  mediaType: "text/plain",
  url: "data:text/plain,Local%20fixture%20only.%20No%20external%20tool%20ran.",
};

const turn = (id: string, text: string): AssistantMessage => ({
  id,
  role: "user",
  author: "You",
  parts: [{ id: "text", kind: "text", text }],
});
const reply = (id: string, ...parts: AssistantMessage["parts"]): AssistantMessage => ({
  id,
  role: "assistant",
  author: "Assistant",
  parts,
});

/** A host fixture owns state and local scheduling; every visible surface is a public component. */
export function agentWorkflowDemo(narrow = false): Child {
  const state = signal<ChatExecutionState>("running");
  const status = signal("Checking file 2");
  const output = signal<string | undefined>(resultLines);
  const progress = signal<ChatTaskProgress | undefined>({
    value: 2,
    max: 5,
    label: "Checked 2 / 5 files · Host report",
  });
  const publicReply = signal(
    "Public reply not received yet; execution is complete, which does not mean the reply failed.",
  );
  const answer = signal("Waiting for you to choose the check scope; no execution failed.");
  const waiting = signal<ChatExecutionState>("waiting");
  const retryState = signal<ChatExecutionState>("error");
  const retryStatus = signal("Local simulated read failed · Can retry");
  const feedback = signal(
    "All actions only change local example state; no tool or network request runs.",
  );
  let alive = true;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const later = (action: () => void) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (alive) action();
    }, 650);
    timers.add(timer);
  };
  const messages = signal<readonly AssistantMessage[]>([
    turn("ask-layout", "Check the chat components for long content and narrow containers."),
    reply(
      "layout",
      {
        id: "intro",
        kind: "text",
        text: "I'll read the components first, then report what holds up in a narrow column.",
      },
      { id: "layout-task", kind: "text", text: "" },
    ),
    turn("ask-scope", "Should the review cover anything else?"),
    reply(
      "scope",
      { id: "scope-intro", kind: "text", text: "One choice decides the next round." },
      { id: "scope-task", kind: "text", text: "" },
    ),
    turn("ask-review", "Did the keyboard review come back?"),
    reply(
      "review",
      {
        id: "review-intro",
        kind: "text",
        text: "It finished executing. Its public reply has not arrived yet, which is a separate fact.",
      },
      { id: "review-task", kind: "text", text: "" },
    ),
    turn("ask-index", "And the index read that failed earlier?"),
    reply(
      "index",
      {
        id: "index-intro",
        kind: "text",
        text: "The read failed locally and can be retried. The extra network search was canceled before it sent anything.",
      },
      { id: "index-tools", kind: "text", text: "" },
    ),
  ]);
  const custom: Record<string, () => Child> = {
    "layout-task": () => (
      <ChatTask
        title="Check component layout"
        state={state}
        statusLabel={status}
        description="Public summary: check the reading axis, long content and action reachability."
        progress={progress}
      >
        <ChatToolCall
          icon={<Icon name="file-text" />}
          label="Read file"
          summary="chat/agent-workflow-with-a-very-long-unbroken-file-name.tsx"
          state={state}
          statusLabel={status}
          input={payload}
          output={output}
          outputSummary="Returned 24 records; expand all output and copy the raw text."
          maxLines={4}
          collapsible
          onCancel={() => {
            state.value = "cancelled";
            status.value = "Canceled further checks; existing output is kept";
            progress.value = undefined;
          }}
        />
        <ChatToolCall
          icon={<Icon name="file-text" />}
          label="Generate check report"
          summary="Waiting for the file check to finish"
          state="queued"
          statusLabel="Queued · Not started yet"
          input="Summarize only confirmed findings."
          collapsible
        />
      </ChatTask>
    ),
    "scope-task": () => (
      <ChatTask
        title="Confirm check scope"
        state={waiting}
        statusLabel={answer}
        executionText="Execution paused, waiting for the user's answer."
      >
        <ChatQuestion
          question="Which areas should this round check?"
          questionId={narrow ? "agent-scope-narrow" : "agent-scope-wide"}
          description="This is an ordinary scope choice; it stays waiting until answered."
          actions={
            <Inline gap="compact">
              <Button
                size="small"
                onClick={() => {
                  waiting.value = "queued";
                  answer.value = "Scope received: Tools and tasks · Waiting for scheduling";
                }}
              >
                Tools and tasks
              </Button>
              <Button
                size="small"
                variant="outline"
                onClick={() => {
                  waiting.value = "cancelled";
                  answer.value = "The user canceled this scope confirmation";
                }}
              >
                Cancel confirmation
              </Button>
            </Inline>
          }
        />
      </ChatTask>
    ),
    "review-task": () => (
      <ChatTask
        title="Delegated: Independent keyboard review"
        state="success"
        statusLabel="Succeeded · Waiting for public reply"
        executionText="The delegated execution returned and checked 5 interaction entry points."
        replyText={publicReply}
        footer={
          <Button
            variant="outline"
            size="small"
            onClick={() => {
              publicReply.value =
                "Public reply received: the keyboard check is complete, with the review record attached.";
            }}
          >
            Receive public reply
          </Button>
        }
      >
        <ChatProcess label="Subtask record · 1 item">
          <ChatTask
            title="Check focus order"
            state="success"
            statusLabel="Succeeded"
            executionText="Tab, Shift+Tab and expandable controls were checked."
          />
        </ChatProcess>
      </ChatTask>
    ),
    "index-tools": () => (
      <Stack gap="compact">
        <ChatToolCall
          icon={<Icon name="database" />}
          label="Read local index"
          state={retryState}
          statusLabel={retryStatus}
          input="index.json"
          output="Last confirmed result retained."
          collapsible
          onRetry={() => {
            retryState.value = "running";
            retryStatus.value = "Retrying the local simulation";
            later(() => {
              retryState.value = "success";
              retryStatus.value = "Local simulation retry succeeded";
            });
          }}
        />
        <ChatToolCall
          icon={<Icon name="search" />}
          label="Extra network search"
          state="cancelled"
          statusLabel="Canceled · No network request was sent"
          outputSummary="Cancellation is a separate fact and is not shown as an execution error."
          collapsible
        />
        <ResourceLink
          title="Component review record"
          detail="Local example artifact · Click only shows a notice"
          onClick={() => {
            feedback.value =
              "The host received the intent to open the review record; the example loaded no file.";
          }}
        />
        <DiffBlock
          files={[
            {
              path: "layout-example.tsx",
              lines: [
                { kind: "removed", text: '<div className="custom-row">' },
                { kind: "added", text: '<Inline gap="compact" align="baseline">' },
                { kind: "context", text: "  Keep content and actions on one reading axis." },
              ],
            },
          ]}
        />
      </Stack>
    ),
  };
  const draft = signal<AssistantDraft>({ text: "", attachments: [] });
  return (
    <Stack
      gap="compact"
      style={{
        height: "min(900px, calc(100dvh - 104px))",
        minHeight: "480px",
        ...(narrow ? { maxWidth: "320px", width: "100%" } : {}),
      }}
      data-agent-workflow={narrow ? "narrow" : "wide"}
      ref={() => () => {
        alive = false;
        timers.forEach(clearTimeout);
      }}
    >
      <Inline gap="compact">
        <Button
          variant="outline"
          size="small"
          onClick={() => {
            state.value = "running";
            status.value = "Checking file 3";
            output.value = `${output.value ?? ""}\nNew result: New content arrived; the expanded state is kept by native details.`;
            progress.value = { value: 3, max: 5, label: "Checked 3 / 5 files · Host report" };
          }}
        >
          Advance the check
        </Button>
        <Button
          variant="quiet"
          size="small"
          onClick={() => {
            state.value = "unknown";
            status.value = "Connection lost · Keep the last known result";
            progress.value = undefined;
            feedback.value =
              "A lost connection is not an execution failure; old output is kept and the current progress is unknown.";
          }}
        >
          Simulate connection loss
        </Button>
        <Text variant="caption" as="span" role="status">
          {feedback}
        </Text>
      </Inline>
      <AssistantView
        title="Agent workflow"
        description="Concurrent execution and public progress · Local data"
        messages={messages}
        draft={draft}
        onDraftChange={(next) => {
          draft.value = next;
        }}
        onSubmit={(snapshot) => {
          messages.value = [...messages.value, turn(`ask-${messages.value.length}`, snapshot.text)];
          return { accepted: true };
        }}
        onMessageAction={(id, action) => {
          feedback.value = `The host received "${action}" for ${id}; nothing is sent.`;
        }}
        renderPart={(part) => custom[part.id]?.()}
      />
    </Stack>
  );
}

export function agentAssistantDemo(): Child {
  const messages = signal<readonly AssistantMessage[]>([
    turn("ask-check", "Check the shared components and tell me what still needs a decision."),
    {
      id: "agent-run",
      role: "assistant",
      author: "Assistant",
      status: "streaming",
      parts: [
        {
          id: "summary",
          kind: "text",
          text: "Checking shared components. **Public progress summary**: The file check is in progress, the independent review finished executing, and its public reply is still pending.\n\n`<script>alert(1)</script>` is description text. Raw HTML is not executed either: <img src=x onerror=alert(1)>.",
        },
        {
          id: "inspect-tool",
          kind: "tool",
          icon: "file-text",
          label: "Read component files",
          summary: "packages/meowtail/src/chat/long-component-file-name.tsx",
          state: "running",
          statusLabel: "Receiving output",
          input: payload,
          output: resultLines,
          outputSummary: "Returned 24 records; the full result can be expanded.",
          maxLines: 3,
          defaultOpen: true,
          canCancel: true,
        },
        {
          id: "delegate-task",
          kind: "task",
          title: "Independent keyboard review",
          state: "success",
          statusLabel: "Succeeded · Public reply not received",
          executionText: "Execution returned; 5 / 5 items complete.",
          replyText: "Waiting for the public reply does not mean execution failed.",
          progress: { value: 5, max: 5, label: "Execution check 5 / 5 items" },
        },
        {
          id: "retry-tool",
          kind: "tool",
          icon: "database",
          label: "Read index",
          state: "error",
          statusLabel: "Local simulated read failed",
          input: "index.json",
          output: "Previous confirmed data is retained.",
          canRetry: true,
        },
        { id: "files", kind: "attachments", items: [attachment] },
        { id: "references", kind: "text", text: "Artifacts and sources provided by the host" },
      ],
    },
  ]);
  const draft = signal<AssistantDraft>({
    text: "Continue checking composition in a narrow container.",
    attachments: [],
  });
  const questions = signal<readonly AssistantQuestion[]>([
    {
      id: "scope",
      title: "Which areas should be checked next?",
      state: "open",
      description: "Waiting for your answer. No reply does not mean execution failed.",
      options: [
        { value: "tools", label: "Tools and tasks" },
        { value: "composer", label: "Input and attachments" },
      ],
    },
  ]);
  let alive = true;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const patchTool = (
    id: string,
    patch: Partial<Extract<AssistantMessage["parts"][number], { kind: "tool" }>>,
  ) => {
    messages.value = messages.value.map((message) => ({
      ...message,
      parts: message.parts.map((part) =>
        part.kind === "tool" && part.id === id ? { ...part, ...patch } : part,
      ),
    }));
  };
  return (
    <Stack
      style={{ height: "min(1000px, calc(100dvh - 48px))", minHeight: "420px" }}
      ref={() => () => {
        alive = false;
        timers.forEach(clearTimeout);
      }}
    >
      <Inline>
        <Button
          size="small"
          variant="outline"
          onClick={() => {
            const part = messages.value
              .flatMap((message) => message.parts)
              .find((item) => item.id === "inspect-tool");
            if (part?.kind !== "tool") return;
            patchTool("inspect-tool", {
              output: `${part.output ?? ""}\nNew output: A text update <img src=x onerror=alert(1)> stays inert.`,
              outputSummary: "Appended one local result; expansion and focus are unchanged.",
            });
          }}
        >
          Append tool output
        </Button>
      </Inline>
      <AssistantView
        title="Agent workflow"
        description="Shared default composition · Local data, not connected to an Agent runtime"
        messages={messages}
        draft={draft}
        onDraftChange={(next) => {
          draft.value = next;
        }}
        onSubmit={async (snapshot) => {
          messages.value = [
            ...messages.value,
            {
              id: `user-${messages.value.length}`,
              role: "user",
              author: "You",
              parts: [{ id: "text", kind: "text", text: snapshot.text }],
            },
          ];
          return { accepted: true };
        }}
        activity={{
          title: "Check shared components",
          statusText: "File check in progress",
          tone: "processing",
        }}
        work={[
          {
            id: "running",
            title: "File check",
            statusText: "Receiving output",
            tone: "processing",
            executionText: "Running",
          },
          {
            id: "queued",
            title: "Organize the report",
            statusText: "Queued · Not started yet",
            tone: "idle",
            executionText: "Waiting for scheduling",
          },
          {
            id: "returned",
            title: "Independent keyboard review",
            statusText: "Succeeded · Waiting for public reply",
            tone: "success",
            executionText: "Execution complete",
            replyText: "Public reply not received yet",
          },
        ]}
        questions={questions}
        onAnswer={(id, answer) => {
          questions.value = questions.value.map((question) =>
            question.id === id
              ? {
                  ...question,
                  state: "answered",
                  feedback: `The host received the scope choice: ${answer}`,
                }
              : question,
          );
        }}
        onMessageAction={() => {}}
        onToolAction={(_messageId, partId, action) => {
          if (action === "cancel") {
            patchTool(partId, {
              state: "cancelled",
              statusLabel: "The user canceled further checks",
              canCancel: false,
            });
            return;
          }
          patchTool(partId, {
            state: "running",
            statusLabel: "Retrying the local simulation",
            retryDisabled: true,
          });
          const timer = setTimeout(() => {
            timers.delete(timer);
            if (alive)
              patchTool(partId, {
                state: "success",
                statusLabel: "Local simulation retry succeeded",
                canRetry: false,
                output: "Index read completed in this local fixture.",
              });
          }, 650);
          timers.add(timer);
        }}
        renderPart={(part) =>
          part.id === "references" ? (
            <Stack gap="compact">
              <ResourceLink
                title="Component review artifact"
                detail="Example entry point · Uses a local anchor only"
                href="#agent-reference"
              />
              <ChatSources
                items={[
                  {
                    title: "Meowtail source",
                    url: "https://github.com/lidessen/meowland",
                    description: "An explicitly provided example source; not retrieved by the UI.",
                  },
                ]}
              />
              <span id="agent-reference">
                Artifacts, references and attachments are all provided by the host.
              </span>
            </Stack>
          ) : undefined
        }
      />
    </Stack>
  );
}

export const AgentWorkflow = defineStory({
  id: "agent-workflow",
  title: "Agent · Concurrency, waiting and execution reporting",
  group: "Assistant",
  component: "ChatTask",
  description:
    "Shared tool and task display. Execution completion, public reply, user waiting and a lost connection are different facts.",
  covers: [
    "ChatTask",
    "ChatToolCall",
    "concurrent work",
    "nested tasks",
    "waiting",
    "retry",
    "cancelled",
    "progress",
  ],
  render: () => agentWorkflowDemo(),
});

export const AgentWorkflowNarrow = defineStory({
  id: "agent-workflow-narrow",
  title: "Agent · 320px local container",
  group: "Assistant",
  component: "ChatTask",
  description:
    "The same composition inside a 320px host on a wide screen, without story-only CSS patching the content.",
  covers: ["narrow container", "long input/output", "nested tasks", "default layout"],
  render: () => agentWorkflowDemo(true),
});

export const AgentWorkflowAssistant = defineStory({
  id: "agent-workflow-assistant",
  title: "Agent · Complete Assistant composition",
  group: "Assistant",
  component: "AssistantView",
  description:
    "The same Assistant renders tools and tasks by default and keeps messages, draft, attachments, activity, questions and safe Markdown.",
  covers: [
    "AssistantView",
    "tool/task parts",
    "safe Markdown",
    "reactive payload",
    "intent callbacks",
    "composer",
  ],
  render: agentAssistantDemo,
});
