import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import {
  ChatTask,
  Button,
  ResourceLink,
  type ChatTaskProgress,
  type ChatExecutionState,
} from "../../src/index";

const state = signal<ChatExecutionState>("queued");
const progress = signal<ChatTaskProgress | undefined>(undefined);
const task = (
  <ChatTask
    title={signal("Review the source")}
    state={state}
    statusLabel={signal<string | undefined>("Waiting for a worker")}
    progress={progress}
    executionText="The execution has not started."
    replyText="A public reply has not been requested."
    footer={<Button>Inspect task</Button>}
  >
    <ResourceLink href="/review.txt" title="Review notes" />
    <ChatTask title="Read a chapter" state="running" />
  </ChatTask>
);
// @ts-expect-error A task needs a readable title.
const missingTitle = <ChatTask />;
// @ts-expect-error Execution state is finite.
const invalidState = <ChatTask title="Review" state="unanswered" />;
// @ts-expect-error Progress must come from explicit numerical facts.
const invalidProgress = <ChatTask title="Review" progress="halfway" />;
// @ts-expect-error Progress needs a readable label.
const missingProgressLabel = <ChatTask title="Review" progress={{ value: 1, max: 2 }} />;
void task;
void missingTitle;
void invalidState;
void invalidProgress;
void missingProgressLabel;
