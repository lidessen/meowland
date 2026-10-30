import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { ActionRail, Button, Icon, IconButton, MetaRow, Stack } from "meowtail";
import { Measure } from "./specimen";

export const PatternContainersStory = defineStory({
  id: "pattern-containers",
  title: "Composition Containers · Action rail and meta row",
  group: "Composition examples",
  groupOrder: 110,
  variant: "Actions and facts",
  description:
    "The action rail owns start/end anchoring and keeps the submit action visible; the meta row owns fact separators, wrapping and progress. Callers pass actions and facts, not layout styles.",
  covers: [
    "ActionRail leading/trailing/submit",
    "ActionRail trailing label",
    "MetaRow items and separators",
    "MetaRow progress",
    "MetaRow centered facts",
  ],
  render: () => (
    <Measure width="content">
      <Stack gap="relaxed">
        <Stack gap="compact">
          <strong>Action rail</strong>
          <span>
            Leading actions stay at the start; trailing actions and the submit action stay at the
            end. Flexible actions wrap so the submit action remains visible.
          </span>
        </Stack>
        <ActionRail
          aria-label="Composer actions"
          role="group"
          leading={
            <Button variant="quiet" size="small">
              Add
            </Button>
          }
          trailing={[
            <Button variant="quiet" size="small">
              Auto review
            </Button>,
            <IconButton label="Voice input">
              <Icon name="message-square" />
            </IconButton>,
          ]}
          submit={
            <Button size="small" aria-label="Send message">
              <Icon name="arrow-up" />
            </Button>
          }
        />
        <ActionRail
          aria-label="Long action rail"
          role="group"
          leading={
            <IconButton label="Add an attachment">
              <Icon name="plus" />
            </IconButton>
          }
          trailing={[
            <Button variant="quiet" size="small">
              A long provider or model selection to inspect
            </Button>,
            <IconButton label="Voice input">
              <Icon name="message-square" />
            </IconButton>,
          ]}
          submit={
            <Button size="small" aria-label="Send message">
              <Icon name="arrow-up" />
            </Button>
          }
        />

        <Stack gap="compact">
          <strong>Meta row</strong>
          <span>
            Facts keep separators and wrap instead of clipping. Progress is one more fact and does
            not add a leading separator when the row has no items.
          </span>
        </Stack>
        <MetaRow
          aria-label="Run facts"
          items={[
            { icon: <Icon name="refresh-cw" />, label: "7 turns 162 steps" },
            { label: "219 tok/s" },
            { icon: <Icon name="list-checks" />, label: "Cache hit 99.5%" },
          ]}
          progress={45}
          progressLabel="Cache progress"
        />
        <MetaRow
          aria-label="Centered run facts"
          align="center"
          progressTone="accent"
          items={[
            { icon: <Icon name="folder" />, label: "46.9M tokens" },
            { label: "Session budget" },
          ]}
          progress={72}
          progressLabel="Session budget"
        />
        <MetaRow
          aria-label="Progress only"
          items={[]}
          progress={72}
          progressLabel="Session budget"
        />
      </Stack>
    </Measure>
  ),
});
