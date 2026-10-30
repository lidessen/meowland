import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Icon, ProcessGroup, ProcessStep, Status, Tag } from "meowtail";
import { SchemePair } from "./scheme-pair";

export const ProcessGroupStory = defineStory({
  id: "process-group",
  title: "Process Group · Collapsed step record",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "ProcessGroup",
  variant: "Expanded, collapsed, and running",
  description:
    "A process group condenses what the assistant did into one line: name and step count, the state badge, and one quiet closing fact. When expanded, each step gets one line, paths use a monospace font, and durations sit quietly on the right.",
  covers: [
    "ProcessGroup open/closed",
    "ProcessStep icon/meta/code",
    "state badge and closing fact",
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
              status={<Status state="success" label="Completed" />}
              trailing="4.2s"
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
              status={<Status state="processing" label="Running" />}
              trailing="2 / 4"
            >
              <ProcessStep icon={<Icon name="terminal" />} meta="2.0s">
                Run command <code>go test ./server/...</code>
              </ProcessStep>
            </ProcessGroup>
            <ProcessGroup
              open
              title="Process · 1 step"
              status={<Status state="unknown" label="Unconfirmed" />}
            >
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

export const ProcessGroupNarrowStory = defineStory({
  id: "process-group-narrow",
  title: "Process Group · Narrow rows and long sequences",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "ProcessGroup",
  variant: "Narrow rows and long sequences",
  description:
    "In a narrow container, the name and the closing fact stay on the first line while the state badge gets its own second line; a long sequence is summarized as a count, not a row of marks.",
  covers: [
    "ProcessGroup narrow summary",
    "title never wraps",
    "separate outcome row",
    "long sequence as a count",
  ],
  render() {
    return (
      <SchemePair width={340}>
        {() => (
          <ProcessGroup
            title="Process · 13 steps"
            status={<Status state="success" label="Completed" />}
            trailing="12.4s"
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

export const ProcessStepStory = defineStory({
  id: "process-step",
  title: "Process Step · Icon, one line and a quiet fact",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "ProcessStep",
  variant: "Step rows",
  description:
    "One step of public work is one line: an icon for the kind of action, what was done, and a quiet fact such as a duration or a count. A long target truncates instead of wrapping.",
  render: () => (
    <div style={{ maxWidth: "560px" }}>
      <ProcessGroup open title="Process · 4 steps" trailing="3.6s">
        <ProcessStep icon={<Icon name="search" />} meta="8 matches">
          Search content <code>retryPolicy</code>
        </ProcessStep>
        <ProcessStep icon={<Icon name="file-text" />} meta="0.4s">
          Read file <code>src/network/retry-policy.ts</code>
        </ProcessStep>
        <ProcessStep icon={<Icon name="terminal" />} meta="2.9s">
          Run command <code>bun test tests/network/retry-policy-and-backoff-limits.test.ts</code>
        </ProcessStep>
        <ProcessStep icon={<Icon name="folder" />}>
          List directory <code>src/network</code>
        </ProcessStep>
      </ProcessGroup>
    </div>
  ),
});
