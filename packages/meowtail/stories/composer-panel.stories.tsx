import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Badge, Button, ComposerPanel, Icon, IconButton, MetaRow, Stack } from "meowtail";
import { Measure } from "./specimen";

export const ComposerPanelStory = defineStory({
  id: "composer-panel",
  title: "Composer panel · surface and meta",
  group: "Conversation components",
  groupOrder: 55,
  component: "ComposerPanel",
  variant: "Editor, action rail and facts",
  description:
    "ComposerPanel refines ChatComposer's single writing surface. The keyboard hint and optional page-level facts follow outside the rounded editor and its bottom action row.",
  covers: ["ComposerPanel default", "ComposerPanel external hint", "ComposerPanel meta row"],
  render: () => (
    <Measure width="content">
      <Stack gap="relaxed">
        <Stack gap="compact">
          <strong>Default panel</strong>
          <span>
            Draft and actions share one writing surface. Supporting instructions and page facts stay
            below its edge.
          </span>
        </Stack>
        <ComposerPanel
          value="Continue — I'm wondering whether the component set is still too thin, especially for containers."
          placeholder="Continue, type a message…"
          inputLabel="Message"
          hint="Enter for a new line · Use Send to submit"
          hintId="panel-composer-hint"
          submitLabel="Send message"
          submitContent={<Icon name="arrow-up" />}
          trailing={[
            <IconButton label="Auto review">
              <Icon name="shield-check" />
            </IconButton>,
            <Button variant="quiet" size="small">
              DeepSeek-V4.1-Flash <Badge tone="accent">1017</Badge>
            </Button>,
          ]}
          meta={
            <MetaRow
              items={[
                { icon: <Icon name="refresh-cw" />, label: "7 turns 162 steps" },
                { label: "219 tok/s" },
              ]}
              progress={45}
              progressLabel="Cache progress"
              align="center"
            />
          }
        >
          <IconButton label="Add">
            <Icon name="plus" />
          </IconButton>
        </ComposerPanel>
      </Stack>
    </Measure>
  ),
});
