import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { ActionRail, Button } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const ActionRailStory = defineStory({
  id: "action-rail",
  title: "Action Rail · Grouped actions",
  component: "ActionRail",
  group: "Actions and commands",
  groupOrder: 30,
  description: "Leading, secondary and submit actions keep their order as the rail wraps.",
  covers: ["leading/trailing/submit", "long actions", "disabled submit"],
  render: () => (
    <Specimens>
      <Specimen label="Composer actions">
        <ActionRail
          role="group"
          aria-label="Composer actions"
          leading={<Button variant="quiet">Attach</Button>}
          trailing={<Button variant="quiet">Options</Button>}
          submit={<Button>Send</Button>}
        />
      </Specimen>
      <Specimen label="Long actions and unavailable submit" width="narrow">
        <ActionRail
          role="group"
          aria-label="Draft actions"
          leading={<Button variant="quiet">Add a reference document</Button>}
          trailing={<Button variant="quiet">Choose a delivery option</Button>}
          submit={<Button disabled>Send</Button>}
        />
      </Specimen>
    </Specimens>
  ),
});
