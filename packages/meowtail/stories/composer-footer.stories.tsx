import { h, type Child } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import {
  Button,
  ChatAttachments,
  ChatComposer,
  ChatStatus,
  ChoiceSelect,
  Icon,
  IconButton,
  Inline,
  Stack,
} from "meowtail";
import { Measure } from "./specimen";

export const ComposerFooterStory = defineStory({
  id: "composer-footer",
  title: "Chat Composer · Model state, keyboard hint and send",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "ChatComposer",
  variant: "Stacked footer allocation",
  description:
    "The writing surface contains draft and bottom actions; keyboard help follows outside its rounded edge. Controls only change fixture data; the story adds no layout styles.",
  covers: ["stacked hint with trailing", "long model and status", "draft and focus", "attachments"],
  render() {
    const draft = signal("");
    const trailing = signal<Child>(<ChatStatus label="No model connected" tone="idle" />);
    const attachmentsHidden = signal(true);
    const helpCount = signal(0);
    const sentCount = signal(0);
    return (
      <Measure width="content">
        <Stack gap="relaxed">
          <h2>Stacked composer footer</h2>
          <Inline wrap gap="compact">
            <Button
              variant="quiet"
              onClick={() => {
                trailing.value = <ChatStatus label="No model connected" tone="idle" />;
              }}
            >
              Disconnected model
            </Button>
            <Button
              variant="quiet"
              onClick={() => {
                trailing.value = (
                  <ChatStatus
                    label="No model connection is available for the currently selected workspace and provider profile"
                    tone="waiting"
                  />
                );
              }}
            >
              Long status
            </Button>
            <Button
              variant="quiet"
              onClick={() => {
                trailing.value = (
                  <ChoiceSelect
                    aria-label="Model"
                    defaultValue="long"
                    options={[
                      {
                        value: "long",
                        label:
                          "AnUnbrokenProviderAndModelIdentifierThatStillNeedsAReachableSelector",
                      },
                    ]}
                    placement="top"
                  />
                );
              }}
            >
              Long model name
            </Button>
            <Button
              variant="quiet"
              onClick={() => {
                attachmentsHidden.value = !attachmentsHidden.value;
              }}
            >
              Toggle attachments
            </Button>
          </Inline>
          <ChatComposer
            value={draft}
            inputLabel="Footer draft"
            hintId="stacked-footer-hint"
            hint={[
              "Enter for a new line · Use Send to submit. ",
              <a
                href="#footer-help"
                onClick={(event: MouseEvent) => {
                  event.preventDefault();
                  helpCount.value++;
                }}
              >
                Keyboard help
              </a>,
            ]}
            trailing={trailing}
            attachments={
              <div hidden={attachmentsHidden}>
                <ChatAttachments
                  items={[
                    {
                      id: "notes",
                      name: "footer-notes.md",
                      mediaType: "text/markdown",
                      url: "data:text/plain,Local%20fixture",
                    },
                  ]}
                />
              </div>
            }
            onInput={(event) => {
              draft.value = (event.currentTarget as HTMLTextAreaElement).value;
            }}
            onSubmit={(event) => {
              event.preventDefault();
              sentCount.value++;
            }}
            submitLabel="Send draft"
          >
            <IconButton label="Attach files">
              <Icon name="plus" />
            </IconButton>
          </ChatComposer>
          <p id="footer-help">
            Help opened: {helpCount}. Submissions: {sentCount}.
          </p>
        </Stack>
      </Measure>
    );
  },
});
