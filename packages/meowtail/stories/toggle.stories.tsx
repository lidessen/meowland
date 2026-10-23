import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { ActionRow, Button, Checkbox, Stack, Switch } from "meowtail";

export const ToggleStory = defineStory({
  id: "toggles",
  title: "Selection · Checkboxes and switches",
  group: "Form inputs",
  component: "Checkbox",
  description:
    "Activate labels, toggle with the space bar and reset the form; a controlled switch leaves it to the caller to accept a change.",
  covers: ["Checkbox native label/required/reset", "Switch controlled/disabled/keyboard"],
  render: () => {
    const checked = signal(true);
    return (
      <form onSubmit={(event: Event) => event.preventDefault()}>
        <Stack>
          <Checkbox label="Save this choice" name="remember" defaultChecked />
          <Checkbox label="Required before submitting" name="confirm" required />
          <Checkbox label="Currently unavailable" disabled />
          <Checkbox label="Some children selected" indeterminate defaultChecked={false} />
          <Switch label="Show tool process" name="tools" defaultChecked />
          <Switch
            label="Notifications (controlled)"
            name="notifications"
            checked={checked}
            onChange={(event: Event) => {
              checked.value = (event.currentTarget as HTMLInputElement).checked;
            }}
          />
          <Switch label="Always on (rejects changes)" checked={true} />
          <Switch label="Unavailable" disabled />
          <ActionRow>
            <Button type="reset" variant="outline">
              Reset
            </Button>
            <Button type="submit">Confirm</Button>
          </ActionRow>
        </Stack>
      </form>
    );
  },
});
