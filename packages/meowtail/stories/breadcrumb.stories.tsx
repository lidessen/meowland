import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Breadcrumb, Stack } from "meowtail";
export const Breadcrumbs = defineStory({
  id: "breadcrumb",
  title: "Breadcrumb · Current location",
  component: "Breadcrumb",
  variant: "Long path wrapping",
  group: "Navigation and layout",
  groupOrder: 40,
  description:
    "Earlier levels keep their links and the last item marks the current location; narrow screens may wrap long paths. These links jump to the example levels on this page.",
  covers: ["Breadcrumb", "navigation", "long-label"],
  render: () => (
    <Stack>
      <Breadcrumb
        items={[
          { label: "Workspace", href: "#breadcrumb-workspace" },
          { label: "Website redesign", href: "#breadcrumb-project" },
          { label: "Stage one component and interaction design notes" },
        ]}
      />
      <h3 id="breadcrumb-workspace">Workspace</h3>
      <p id="breadcrumb-project">Website redesign · Stage one</p>
    </Stack>
  ),
});
