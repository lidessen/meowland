import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Button, Field, Input } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const FieldStory = defineStory({
  id: "field",
  title: "Field · Labels and feedback",
  component: "Field",
  group: "Forms and selection",
  groupOrder: 40,
  description:
    "Labels, descriptions and errors are associated with the control as feedback changes.",
  covers: ["generated association", "description", "live error", "disabled"],
  render: () => {
    const error = signal("");
    return (
      <Specimens>
        <Specimen label="Description and live error" width="narrow">
          <Field label="Project name" description="Choose a name for the workspace." error={error}>
            <Input placeholder="Enter a name" />
          </Field>
          <Button
            variant="outline"
            onClick={() => {
              error.value = error.value ? "" : "Enter a project name.";
            }}
          >
            Toggle error
          </Button>
        </Specimen>
        <Specimen label="Unavailable" width="narrow">
          <Field label="Workspace ID" htmlFor="field-disabled" description="Assigned by the host.">
            <Input id="field-disabled" value="workspace-42" disabled />
          </Field>
        </Specimen>
      </Specimens>
    );
  },
});
