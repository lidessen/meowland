import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import {
  Button,
  ChatTask,
  Inline,
  ResourceLink,
  Stack,
  type ChatExecutionState,
  type ChatTaskProgress,
} from "meowtail";

export const ChatTaskFixture = defineStory({
  id: "chat-task-boundaries",
  title: "Task record boundaries",
  render: () => {
    const state = signal<ChatExecutionState>("queued");
    const status = signal("Queued for an available worker · Waiting for an available reviewer");
    const execution = signal<string | undefined>(undefined);
    const reply = signal<string | undefined>(undefined);
    const progress = signal<ChatTaskProgress | undefined>(undefined);
    const feedback = signal("");
    return (
      <Stack style="width:min(100%,620px)" data-chat-task-fixture>
        <Inline>
          <Button
            onClick={() => {
              state.value = "running";
              status.value = "Review in progress · Checking the long text";
              progress.value = {
                value: 1,
                max: 3,
                label: "Reviewed 1 of 3 sources · One source checked",
              };
            }}
          >
            Start task
          </Button>
          <Button
            onClick={() => {
              state.value = "success";
              status.value = "Execution returned successfully";
              execution.value = "Execution returned. All three sources have been checked.";
              reply.value =
                "Waiting for the author to publish the reply · Awaiting the author's reply";
              progress.value = { value: 3, max: 3, label: "Reviewed all 3 sources" };
            }}
          >
            Complete execution
          </Button>
        </Inline>
        <ChatTask
          title={"Review the shared component contract · Checking composition boundaries and long titles ".repeat(
            3,
          )}
          state={state}
          statusLabel={status}
          description={"A long English description must wrap alongside a supplementary explanation without widening a narrow task record. ".repeat(
            3,
          )}
          executionText={execution}
          replyText={reply}
          progress={progress}
          footer={[
            <Button
              size="small"
              onClick={() => (feedback.value = "Retry intent delivered to the host.")}
            >
              Retry task
            </Button>,
            <Button
              size="small"
              onClick={() => (feedback.value = "Cancellation intent delivered to the host.")}
            >
              Cancel task
            </Button>,
          ]}
        >
          <ChatTask
            title={"SubtaskIdentifier".repeat(12)}
            state="waiting"
            statusLabel={"WaitingForTheSourceOwner".repeat(6)}
            description="Waiting for a source owner is not an execution failure."
            footer={
              <Button size="small" onClick={() => (feedback.value = "Opened child task.")}>
                Open child task
              </Button>
            }
          >
            <ResourceLink
              title="Review notes"
              href="#task-review-notes"
              detail="A host-provided artifact link"
            />
          </ChatTask>
        </ChatTask>
        <p role="status">{feedback}</p>
      </Stack>
    );
  },
});
