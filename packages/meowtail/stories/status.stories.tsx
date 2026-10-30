import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Field,
  Inline,
  Input,
  ListGroup,
  ListRow,
  ResourceCard,
  Stack,
  Status,
} from "meowtail";
import { SchemePair } from "./scheme-pair";

export const StatusStory = defineStory({
  id: "status",
  title: "Status · Text, indicator, and page slots",
  group: "Feedback and labels",
  groupOrder: 80,
  component: "Status",
  covers: [
    "required visible label",
    "ListRow status",
    "ResourceCard status",
    "long label",
    "light and dark",
  ],
  render: () => (
    <SchemePair>
      {(scheme) => (
        <Stack gap="relaxed">
          <Inline gap="normal">
            <Status state="processing" label="In progress" />
            <Status state="returned" label="Run returned" />
            <Status state="warning" label="Waiting for answer" />
            <Status state="danger" label="Connection failed" />
            <Status state="unknown" label="Status unconfirmed" />
          </Inline>
          <ListGroup>
            <ListRow
              title="Model source"
              description="Choose an executable model connection"
              status={<Status state="success" label="In use" />}
              actions={
                <Button size="small" variant="quiet">
                  Configure
                </Button>
              }
            />
            <ListRow
              title="Local service"
              status={<Status state="unknown" label="No version yet" />}
            />
          </ListGroup>
          <ResourceCard
            title="Message extensions"
            subtitle="Channel"
            status={<Status state="success" label="Enabled" />}
            actions={<Button size="small">View settings</Button>}
          />
          <Status
            state="danger"
            label="Connection failed for development-workspace-with-a-long-identifier; retry after checking its configuration."
          />
          <Field label="Connection name" htmlFor={`status-connection-${scheme}`}>
            <Input id={`status-connection-${scheme}`} value="Development workspace" />
          </Field>
        </Stack>
      )}
    </SchemePair>
  ),
});
