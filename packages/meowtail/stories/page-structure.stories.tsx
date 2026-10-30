import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Icon,
  ListGroup,
  ListRow,
  PageHeader,
  ResourceCard,
  Stack,
  Tag,
  Status,
} from "meowtail";

export const PageStructureStory = defineStory({
  id: "page-structure",
  title: "Page Header · With cards and grouped rows",
  group: "Pages and layout",
  groupOrder: 10,
  component: "PageHeader",
  variant: "Individual component states",
  description:
    "Shows each public component's props and slots separately; does not assemble an application page.",
  render: () => (
    <Stack>
      <PageHeader
        title="Example page header"
        description="Component description slot"
        leading={<Icon name="folder" />}
        actions={<Button size="small">Action</Button>}
      />
      <ResourceCard
        title="Example resource"
        subtitle="Resource category"
        description="The caller provides the description."
        icon={<Icon name="folder" />}
      />
      <ResourceCard
        title="Disabled resource"
        tone="muted"
        description="Component example in the disabled state."
      />
      <ListRow
        tone="accent"
        title="Summary row"
        tags={<Tag tone="accent">Selected</Tag>}
        description="Standalone item"
      />
      <ListGroup>
        <ListRow title="First item" description="The caller provides the content" />
        <ListRow title="Expanded item" expanded>
          <p>Expanded content slot</p>
        </ListRow>
      </ListGroup>
    </Stack>
  ),
});

const longContentCopy = {
  pageTitle: "Service configuration and available capabilities in registered workspaces",
  purpose:
    "The page header, status and identity stay readable in a narrow window, and actions stay close to their object.",
  action: "View configuration",
  title: "Development workspace · Review and documentation service",
  description:
    "The name identifies the capability, the description explains its purpose, and the identity lets you check the exact instance.",
  category: "Workspace capabilities",
  status: "Enabled",
  emptyTitle: "Disabled resource",
  emptyDescription:
    "The host provides the state; the component only presents the information and available actions.",
};

export const PageStructureLongContentStory = defineStory({
  id: "page-structure-long-content",
  title: "Resource Card · Long names, identity and disabled actions",
  group: "Records and surfaces",
  groupOrder: 60,
  component: "ResourceCard",
  variant: "Narrow window and readable metadata",
  description:
    "Content pressure scenarios for the real public components; no business request is simulated.",
  covers: ["long title", "identity", "disabled action", "status label", "page title"],
  render: () => (
    <Stack>
      <PageHeader
        title={longContentCopy.pageTitle}
        description={longContentCopy.purpose}
        actions={<Button size="small">{longContentCopy.action}</Button>}
      />
      <ResourceCard
        title={longContentCopy.title}
        subtitle={longContentCopy.category}
        description={longContentCopy.description}
        icon={<Icon name="folder" />}
        status={<Status state="success" label={longContentCopy.status} />}
        identity="workspace:development-documentation-service"
        actions={<Button size="small">{longContentCopy.action}</Button>}
      />
      <ResourceCard
        title={longContentCopy.emptyTitle}
        tone="muted"
        description={longContentCopy.emptyDescription}
        actions={
          <Button size="small" disabled>
            {longContentCopy.action}
          </Button>
        }
      />
    </Stack>
  ),
});
