import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { ActionRow, Button, IconButton } from "meowtail";
import { Icon } from "meowtail/icons";
import { Specimen, Specimens } from "./specimen";

function publishRow() {
  return (
    <ActionRow data-action-row-sample>
      <Button variant="quiet">Discard draft</Button>
      <Button variant="outline">Preview changes</Button>
      <Button>Publish to workspace</Button>
      <IconButton label="Copy link">
        <Icon name="copy" />
      </IconButton>
      <IconButton label="More actions">
        <Icon name="menu" />
      </IconButton>
    </ActionRow>
  );
}

export const ActionRowStory = defineStory({
  id: "action-row",
  title: "Action row · One line or a whole stack",
  component: "ActionRow",
  group: "Basic controls",
  groupOrder: 10,
  variant: "Fits, stacks, keeps icons together",
  description:
    "A row of actions stays on one line while it fits. When it does not, the whole row stacks: text actions become full-width lines in their order and icon actions stay together, so no line ends ragged and no action is left alone.",
  covers: ["ActionRow", "align", "stacked", "icon actions"],
  render: () => (
    <Specimens>
      <Specimen label="Room for one line" width="content">
        {publishRow()}
      </Specimen>
      <Specimen label="Trailing edge" note="align=end, as a form footer." width="content">
        <ActionRow align="end">
          <Button variant="quiet">Cancel</Button>
          <Button>Save settings</Button>
        </ActionRow>
      </Specimen>
      <Specimen
        label="Too narrow for one line"
        note="The whole row stacks; the icon actions share one line."
      >
        <div style={{ maxWidth: "320px" }}>{publishRow()}</div>
      </Specimen>
    </Specimens>
  ),
});
