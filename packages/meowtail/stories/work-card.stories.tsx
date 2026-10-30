import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Icon, WorkCard } from "meowtail";
import { SchemePair } from "./scheme-pair";

export const WorkCardStory = defineStory({
  id: "work-card",
  title: "Work Card · Task entry in a conversation",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "WorkCard",
  variant: "States and detail entry",
  description:
    "A work card is the entry point for one piece of work in a conversation: the title keeps the wording from when it was published, the status line explains current progress, and the whole card opens details. Only a completed goal uses a solid dot; a returned run stays hollow.",
  covers: [
    "WorkCard processing/returned/success/warning/unknown",
    "long title",
    "detail fact",
    "keyboard activation",
    "light and dark",
  ],
  render() {
    const opened = signal("Not opened yet");
    const open = (name: string) => () => {
      opened.value = `Opened: ${name}`;
    };
    return (
      <SchemePair width={480}>
        {() => (
          <div style={{ display: "grid", gap: "12px" }}>
            <WorkCard
              title="Organize notes from the workflow prototype trial"
              state="processing"
              status="In progress: reviewing the record format"
              detail="1 outcome linked"
              onClick={open("prototype notes")}
            />
            <WorkCard
              title="Complete the release notes"
              state="returned"
              status="Backend returned · awaiting a public reply"
              onClick={open("release notes")}
            />
            <WorkCard
              title="Verify the Kimi provider trial results"
              state="warning"
              status="Waiting for your answer"
              icon={<Icon name="list-checks" />}
              onClick={open("Kimi")}
            />
            <WorkCard
              title="Migrate the old Notes data while keeping all history and attachments, and remove the interfaces and configuration items that have already been replaced"
              state="success"
              status="Goal completed"
              onClick={open("migration")}
            />
            <WorkCard
              title="A goal that has not started"
              state="unknown"
              status="Goal registered"
              action="View work"
              onClick={open("registration")}
            />
            <p style={{ margin: 0, fontSize: "12.5px", color: "var(--ui-ink-tertiary)" }}>
              {opened}
            </p>
          </div>
        )}
      </SchemePair>
    );
  },
});
