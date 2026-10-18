import { h, signal } from "meowjsx";
import {
  AssistantView,
  type AssistantMessage,
  type AssistantToolPart,
  type AssistantTaskPart,
} from "../../src/chat";

const tool: AssistantToolPart = {
  id: "read",
  kind: "tool",
  label: "Read source",
  state: "queued",
  input: "path/to/source.ts",
  output: "",
  canCancel: true,
};
const task: AssistantTaskPart = {
  id: "review",
  kind: "task",
  title: "Review sources",
  state: "success",
  executionText: "Execution completed",
  replyText: "Awaiting a public reply",
  progress: { value: 2, max: 3, label: "Two files reviewed" },
};
const messages = signal<readonly AssistantMessage[]>([
  { id: "message", role: "assistant", author: "Assistant", parts: [tool, task] },
]);
const view = (
  <AssistantView
    messages={messages}
    onToolAction={(messageId, partId, action) => {
      const identity: readonly [string, string, "retry" | "cancel"] = [messageId, partId, action];
      void identity;
    }}
  />
);
const invalidInput: AssistantToolPart = {
  id: "x",
  kind: "tool",
  label: "Read",
  // @ts-expect-error Tool input is inert text, not arbitrary JSON or HTML instructions.
  input: { html: "<b>unsafe</b>" },
};
const invalidState: AssistantTaskPart = {
  id: "x",
  kind: "task",
  title: "Review",
  // @ts-expect-error Missing public reply is not an execution failure state.
  state: "not-replied",
};
const invalidProgress: AssistantTaskPart = {
  id: "x",
  kind: "task",
  title: "Review",
  state: "running",
  // @ts-expect-error A task progress fact needs its readable label.
  progress: { value: 1, max: 2 },
};
void [view, invalidInput, invalidState, invalidProgress];
