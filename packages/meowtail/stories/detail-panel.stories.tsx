import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { DetailSection, ResourceLink, Stack, Timeline, TimelineItem } from "meowtail";

export const DetailComponentsStory = defineStory({
  id: "detail-components",
  title: "Detail components · Sections, timeline, and resource references",
  group: "Navigation and layout",
  groupOrder: 32,
  component: "DetailSection",
  variant: "Standalone component states",
  description:
    "Shows the shared detail components on their own; does not simulate a work detail panel.",
  render: () => (
    <Stack>
      <DetailSection title="Section title" aside="Supporting note">
        <p>The body is provided by the caller.</p>
      </DetailSection>
      <Timeline>
        <TimelineItem
          state="success"
          title="Draft submitted"
          stateLabel="Done"
          description="09:12 · 4 files changed"
        />
        <TimelineItem
          state="returned"
          title="Review returned"
          stateLabel="Returned"
          description="Two comments need a reply before the next run."
        />
        <TimelineItem state="processing" title="Checks running" stateLabel="In progress" />
      </Timeline>
      <ResourceLink href="#sample" title="Sample link" detail="Link style" />
      <ResourceLink
        title="A very long sample resource name to observe how caller-supplied long text behaves"
        detail="Button style"
      />
    </Stack>
  ),
});
