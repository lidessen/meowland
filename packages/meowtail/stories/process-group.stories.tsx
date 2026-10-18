import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Icon, ProcessGroup, ProcessStep, StatusDot, Tag } from "meowtail";
import { SchemePair } from "./scheme-pair";

export const ProcessGroupNarrowStory = defineStory({
  id: "process-group-narrow",
  title: "Process group · Narrow rows and long sequences",
  group: "Conversation components",
  groupOrder: 30,
  component: "ProcessGroup",
  variant: "Narrow rows and long sequences",
  description:
    "In a narrow container, the title and status dots stay on the first line while the action summary gets its own second line; a long sequence of status dots can wrap.",
  covers: [
    "ProcessGroup narrow summary",
    "title never wraps",
    "separate outcome row",
    "many step dots",
  ],
  render() {
    return (
      <SchemePair width={340}>
        {() => (
          <ProcessGroup
            title="Process · 13 steps"
            status="Calls local capabilities, reads memory and knowledge, manages tasks, and more"
            trailing={Array.from({ length: 12 }, () => (
              <StatusDot state="success" size={6} />
            ))}
          >
            <ProcessStep icon={<Icon name="terminal" />} meta="2.0s">
              Run command <code>go test ./server/...</code>
            </ProcessStep>
          </ProcessGroup>
        )}
      </SchemePair>
    );
  },
});

export const ProcessGroupStory = defineStory({
  id: "process-group",
  title: "Process group · Collapsed step record",
  group: "Conversation components",
  groupOrder: 30,
  component: "ProcessGroup",
  variant: "Expanded, collapsed, and running",
  description:
    "A process group condenses what the assistant did into one line: name and step count, result, and a status dot per step. When expanded, each step gets one line, paths use a monospace font, and durations sit quietly on the right.",
  covers: [
    "ProcessGroup open/closed",
    "ProcessStep icon/meta/code",
    "trailing status dots",
    "running and failed steps",
    "light and dark",
  ],
  render() {
    return (
      <SchemePair width={460}>
        {() => (
          <div style={{ display: "grid", gap: "14px" }}>
            <ProcessGroup
              open
              title="Process · 3 steps"
              status="Completed · 4.2s"
              trailing={[
                <StatusDot state="success" size={6} />,
                <StatusDot state="success" size={6} />,
                <StatusDot state="success" size={6} />,
              ]}
            >
              <ProcessStep icon={<Icon name="search" />} meta="12 matches">
                Search content <code>workflow-prototype</code>
              </ProcessStep>
              <ProcessStep icon={<Icon name="file-text" />} meta="1.1s">
                Read file <code>docs/records/2026-09-16-workflow-prototype.md</code>
              </ProcessStep>
              <ProcessStep icon={<Icon name="file-text" />} meta="0.9s">
                Read file <code>…workflow-prototype-second-trial.md</code>
              </ProcessStep>
            </ProcessGroup>
            <ProcessGroup
              title="Process · 4 steps"
              status="1 step running"
              trailing={[
                <StatusDot state="success" size={6} />,
                <StatusDot state="success" size={6} />,
                <StatusDot state="danger" size={6} />,
                <StatusDot state="processing" size={6} />,
              ]}
            >
              <ProcessStep icon={<Icon name="terminal" />} meta="2.0s">
                Run command <code>go test ./server/...</code>
              </ProcessStep>
            </ProcessGroup>
            <ProcessGroup open title="Process · 1 step" status="Unconfirmed result">
              <ProcessStep icon={<Icon name="folder-open" />} meta={<Tag>Not checked</Tag>}>
                View directory{" "}
                <code>
                  apps/meowland/web/src/a/very/long/path/that/keeps/going/and/going/index.ts
                </code>
              </ProcessStep>
            </ProcessGroup>
          </div>
        )}
      </SchemePair>
    );
  },
});
