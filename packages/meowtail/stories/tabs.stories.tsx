import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Tabs, Input, Stack, Container } from "meowtail";

export const ProjectTabs = defineStory({
  id: "tabs",
  title: "Tabs · Project context",
  component: "Tabs",
  variant: "Keyboard and controlled selection",
  group: "Navigation and layout",
  groupOrder: 40,
  description:
    "Arrow keys and Home / End move between enabled tabs and skip disabled items; input drafts survive leaving and coming back. The controlled example below shows a selection confirmed by the caller.",
  covers: ["Tabs", "keyboard", "disabled", "controlled"],
  render: () => {
    const selected = signal("overview");
    return (
      <Container width="content">
        <Stack gap="relaxed">
          <Tabs
            id="project-tabs"
            label="Project views"
            items={[
              {
                value: "overview",
                label: "Overview",
                content: <p>Website redesign · Organizing the pages to deliver this week.</p>,
              },
              { value: "locked", label: "Permissions", disabled: true, content: "Admins only" },
              {
                value: "notes",
                label: "Work notes",
                content: <Input aria-label="Work draft" placeholder="Write down what to do next" />,
              },
              {
                value: "files",
                label: "Files",
                content: <p>design-notes.md · Local example file</p>,
              },
            ]}
          />
          <Tabs
            id="controlled-tabs"
            label="Controlled views"
            value={selected}
            onValueChange={(value) => {
              selected.value = value;
            }}
            items={[
              {
                value: "overview",
                label: "Summary",
                content: <p>The caller stores the selection.</p>,
              },
              {
                value: "details",
                label: "Details",
                content: <p>Switched to the detailed record.</p>,
              },
            ]}
          />
        </Stack>
      </Container>
    );
  },
});
