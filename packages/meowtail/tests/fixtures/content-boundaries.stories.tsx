import { h, mapSignal, signal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Icon,
  IconButton,
  Input,
  ListGroup,
  ListRow,
  ResourceCard,
  Stack,
  Status,
  Inline,
} from "meowtail";

const identity = "WORKSPACEIDENTIFIER".repeat(8);
const title = "Development workspace review and documentation service";
const status = "Waiting for administrator authorization";

export const ContentBoundariesStory = defineStory({
  id: "content-boundaries",
  title: "Content boundaries",
  render: () => {
    const expanded = signal(false);
    return (
      <Stack style="width:min(100%,280px)" data-content-boundaries>
        <Field label={identity} description={identity} error={identity} htmlFor="boundary-draft">
          <Input id="boundary-draft" value="Draft remains editable" />
        </Field>
        <Card data-boundary-card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Keep the title readable beside multiple actions.</CardDescription>
            <CardAction>
              {(["eye", "folder", "search", "settings", "list-checks"] as const).map(
                (name, index) => (
                  <IconButton label={`Inspect ${index + 1}`}>
                    <Icon name={name} />
                  </IconButton>
                ),
              )}
            </CardAction>
          </CardHeader>
          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle>Nested record</CardTitle>
                <CardAction>
                  <IconButton label="Inspect nested record">
                    <Icon name="eye" />
                  </IconButton>
                </CardAction>
              </CardHeader>
            </Card>
          </CardContent>
        </Card>
        <CardHeader data-boundary-header>
          <CardTitle>{title}</CardTitle>
          <CardDescription>CardHeader also works without a Card ancestor.</CardDescription>
          <CardAction>
            <Button size="small">查看详情</Button>
            <Button size="small">编辑记录</Button>
          </CardAction>
        </CardHeader>
        <ResourceCard
          title={title}
          icon={<Icon name="folder" />}
          status={<Status state="warning" label={status} />}
          identity={identity}
          actions={<Button size="small">Inspect resource</Button>}
        />
        <ResourceCard title="Short title" status={<Status state="idle" label={identity} />} />
        <ListGroup>
          <ListRow
            title={title}
            description={mapSignal(expanded, (value) => (value ? identity : "A short description"))}
            status={<Status state="warning" label={status} />}
            actions={
              <Inline gap="compact">
                <Button size="small" onClick={() => (expanded.value = !expanded.value)}>
                  Toggle details
                </Button>
                <Button size="small">Inspect record</Button>
              </Inline>
            }
          />
        </ListGroup>
      </Stack>
    );
  },
});
