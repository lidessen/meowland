import { h, mapSignal, signal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Card,
  CardContent,
  Container,
  Field,
  Icon,
  IconButton,
  Inline,
  Input,
  ListGroup,
  ListRow,
  PageFrame,
  PageHeader,
  Popover,
  Stack,
  Toolbar,
  Status,
} from "meowtail";

export const WorkspaceCompositionStory = defineStory({
  id: "workspace-composition",
  title: "Workspace composition · Fixed header, form and dynamic body",
  group: "Navigation and layout",
  groupOrder: 40,
  component: "PageFrame",
  variant: "Shared layout and control composition",
  description:
    "One focused content page: keep the draft, inspect the checks, and finish with one action; a short narrow window still returns to the page header and never clips an overlay.",
  covers: [
    "fixed header",
    "layout scroll owner",
    "single content column",
    "dynamic checks",
    "form draft",
    "popover",
  ],
  render: () => {
    const expanded = signal(false);
    const draft = signal("");
    const feedback = signal("The local draft has not been checked yet.");
    return (
      <div style={{ height: "min(640px, calc(100dvh - 90px))" }} data-workspace-composition>
        <PageFrame
          variant="page"
          scrollOwner="layout"
          header={
            <Container width="content">
              <PageHeader
                title="Check the draft"
                description="Keep the current input, inspect the checks, and finish with one action."
              />
            </Container>
          }
        >
          <Container width="content">
            <Stack gap="relaxed">
              <Card>
                <CardContent>
                  <Field
                    label="Composition draft"
                    htmlFor="workspace-composition-draft"
                    description="The same input node stays mounted when the window or grid changes."
                  >
                    <Input
                      id="workspace-composition-draft"
                      value={draft}
                      placeholder="Write the current composition draft"
                      onInput={(event: Event) => {
                        draft.value = (event.currentTarget as HTMLInputElement).value;
                      }}
                    />
                  </Field>
                </CardContent>
              </Card>

              <Stack gap="compact" data-workspace-composition-content>
                <Inline justify="between" align="center">
                  <strong>Checks</strong>
                  <Toolbar label="Check controls">
                    <Popover
                      id="workspace-review-options"
                      trigger={(bindings) => (
                        <IconButton {...bindings} label="Check options">
                          <Icon name="settings" />
                        </IconButton>
                      )}
                    >
                      <Stack gap="compact" align="start">
                        <span>Keep checking the current draft after the window changes.</span>
                        <Button
                          size="small"
                          onClick={() => {
                            feedback.value = "Checked the current local draft.";
                          }}
                        >
                          Check current draft
                        </Button>
                      </Stack>
                    </Popover>
                    <Button
                      variant="quiet"
                      size="small"
                      onClick={() => {
                        expanded.value = !expanded.value;
                      }}
                    >
                      <Icon name="list-checks" />
                      {mapSignal(expanded, (value) =>
                        value ? "Collapse checks" : "Expand checks",
                      )}
                    </Button>
                  </Toolbar>
                </Inline>
                <ListGroup>
                  {mapSignal(expanded, (value) =>
                    Array.from({ length: value ? 28 : 10 }, (_, index) => (
                      <ListRow
                        title={`Check ${index + 1}`}
                        description="Dynamic content grows in the natural text flow; the body keeps scrolling while the page header stays put."
                        status={<Status state="success" label="Ready" />}
                      />
                    )),
                  )}
                </ListGroup>
              </Stack>

              <Inline as="footer">
                <Button
                  onClick={() => {
                    feedback.value = "Checked the current local draft.";
                  }}
                >
                  Check the draft at the end
                </Button>
                <span role="status">{feedback}</span>
              </Inline>
            </Stack>
          </Container>
        </PageFrame>
      </div>
    );
  },
});
