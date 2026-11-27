import { h } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Switch } from "meowtail";
import { Note, Specimen, Specimens } from "./specimen";

export const SwitchStory = defineStory({
  id: "switch",
  title: "Switch · On and off settings",
  component: "Switch",
  group: "Forms and selection",
  groupOrder: 40,
  description: "A native switch can keep its own state or follow a host-controlled signal.",
  covers: ["default", "controlled", "disabled"],
  render: () => {
    const enabled = signal(false);
    return (
      <Specimens>
        <Specimen label="Uncontrolled" align="start">
          <Switch label="Show notifications" defaultChecked />
        </Specimen>
        <Specimen label="Controlled" align="start">
          <Switch
            label="Enable updates"
            checked={enabled}
            onChange={(event) => {
              enabled.value = (event.currentTarget as HTMLInputElement).checked;
            }}
          />
          <Note>
            {mapSignal(enabled, (value) => (value ? "Updates enabled" : "Updates disabled"))}
          </Note>
        </Specimen>
        <Specimen label="Unavailable" align="start">
          <Switch label="Automatic sync" disabled />
          <Switch label="Required protection" defaultChecked disabled />
        </Specimen>
      </Specimens>
    );
  },
});
