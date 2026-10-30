import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { ActionRow, Button, ChatReasoning, TaskList, type TaskListEntry } from "meowtail";
import { Measure, Specimen, Specimens } from "./specimen";

const steps = [
  "Scaffold the project structure",
  "Build the component registry",
  "Implement entitlement gating",
  "Wire up Stripe checkout",
  "Polish the landing page",
];

function plan(current: number, percent?: number): TaskListEntry[] {
  return steps.map((label, index) => ({
    id: `step-${index}`,
    label,
    state: index < current ? "success" : index === current ? "running" : "queued",
    progress: index === current && percent !== undefined ? { value: percent, max: 100 } : undefined,
  }));
}

export const TaskListStory = defineStory({
  id: "task-list",
  title: "Task List · A plan an agent works through",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "TaskList",
  variant: "Pending, current, done and failed steps",
  description:
    "The host reports each step's state; the list shows the plan, the current step and how many are done. Rows keep their place by id while states move on.",
  covers: ["TaskList", "queued", "running", "success", "error", "cancelled", "waiting", "progress"],
  render() {
    const current = signal(1);
    const items = signal(plan(1, 4));
    const advance = () => {
      current.value = Math.min(current.value + 1, steps.length);
      items.value = plan(current.value, current.value < steps.length ? 0 : undefined);
    };
    return (
      <Specimens>
        <Specimen label="In progress" width="narrow">
          <TaskList items={items} />
          <ActionRow>
            <Button size="small" variant="outline" data-task-advance onClick={advance}>
              Finish current step
            </Button>
            <Button
              size="small"
              variant="quiet"
              onClick={() => {
                current.value = 1;
                items.value = plan(1, 4);
              }}
            >
              Reset
            </Button>
          </ActionRow>
        </Specimen>
        <Specimen
          label="Every state"
          note="Waiting needs someone; failed and canceled steps keep their place in the plan."
          width="narrow"
        >
          <TaskList
            title="Release checks"
            items={[
              { id: "a", label: "Run the test suite", state: "success" },
              { id: "b", label: "Approve the migration", state: "waiting" },
              { id: "c", label: "Upload the source maps", state: "error" },
              { id: "d", label: "Notify the beta channel", state: "cancelled" },
              { id: "e", label: "Tag the release", state: "queued" },
            ]}
          />
        </Specimen>
        <Specimen label="Collapsed" width="narrow">
          <TaskList items={plan(steps.length)} defaultOpen={false} />
        </Specimen>
      </Specimens>
    );
  },
});

const reasoning = [
  "Looking for the passages where the rollback comes up.",
  "The timeline has the bad build in front of everyone for 43 minutes before anyone thought to revert.",
  "Checking the existing deploy policy for a threshold to inherit rather than inventing one here.",
  "It holds anything above 25% of traffic for a second reviewer, so the fast path needs a ceiling too.",
];

export const ChatReasoningStory = defineStory({
  id: "chat-reasoning",
  title: "Chat Reasoning · A model working before it answers",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "ChatReasoning",
  variant: "Streaming and folded",
  description:
    "While active the newest lines stay in view and older ones fade under the top edge; when the host marks it done it folds to one row the reader can reopen.",
  covers: ["ChatReasoning", "active", "doneLabel", "streaming text"],
  render() {
    const shown = signal(2);
    const active = signal(true);
    const text = signal(reasoning.slice(0, 2).join("\n\n"));
    return (
      <Measure width="content">
        <Specimens>
          <Specimen label="Streaming">
            <ChatReasoning
              label="Drafting the rollout policy"
              doneLabel="Thought for 12s"
              text={text}
              active={active}
            />
            <ActionRow>
              <Button
                size="small"
                variant="outline"
                data-reasoning-stream
                onClick={() => {
                  shown.value = Math.min(shown.value + 1, reasoning.length);
                  text.value = reasoning.slice(0, shown.value).join("\n\n");
                }}
              >
                Stream a line
              </Button>
              <Button
                size="small"
                variant="quiet"
                data-reasoning-finish
                onClick={() => {
                  active.value = !active.value;
                }}
              >
                Toggle finished
              </Button>
            </ActionRow>
          </Specimen>
          <Specimen label="Finished">
            <ChatReasoning
              label="Comparing the rollout options"
              doneLabel="Thought for 8s"
              text={reasoning.join("\n\n")}
            />
          </Specimen>
        </Specimens>
      </Measure>
    );
  },
});
