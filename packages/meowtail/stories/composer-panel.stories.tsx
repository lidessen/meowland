import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Badge,
  Button,
  ComposerPanel,
  Container,
  Icon,
  IconButton,
  MetaRow,
  Stack,
} from "meowtail";

export const ComposerPanelStory = defineStory({
  id: "composer-panel",
  title: "Composer panel · surface and meta",
  group: "Conversation components",
  groupOrder: 55,
  component: "ComposerPanel",
  variant: "Editor, action rail and facts",
  description:
    "ComposerPanel owns the writing surface and an optional page-level meta row. ChatComposer remains the editor and action behavior; the panel only removes its own chrome and supplies the composition.",
  covers: ["ComposerPanel default", "ComposerPanel meta row", "ChatComposer surface none"],
  render: () => (
    <Container width="content">
      <Stack gap="relaxed">
        <Stack gap="compact">
          <strong>Default panel</strong>
          <span>
            The surface and meta row belong to the panel; draft, actions and submission remain in
            ChatComposer.
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
    </Container>
  ),
});
