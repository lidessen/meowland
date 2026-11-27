import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { AppBar, Button } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const AppBarStory = defineStory({
  id: "app-bar",
  title: "App Bar · Identity and actions",
  component: "AppBar",
  group: "Pages and layout",
  groupOrder: 10,
  description: "A screen title can stand alone or include status and screen-wide actions.",
  covers: ["title", "status and actions", "long title"],
  render: () => (
    <Specimens>
      <Specimen label="Title only">
        <AppBar title="Workspace" />
      </Specimen>
      <Specimen label="Status and action" width="narrow">
        <AppBar
          title="Project review and delivery workspace"
          status="Changes saved"
          actions={<Button size="small">Share</Button>}
        />
      </Specimen>
    </Specimens>
  ),
});
