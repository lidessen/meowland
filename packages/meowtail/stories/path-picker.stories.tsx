import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Field, Input, PathPicker, Stack } from "meowtail";

export const PathPickerStory = defineStory({
  id: "path-picker",
  title: "Path picker · Manual entry and host browsing",
  group: "Form inputs",
  groupOrder: 20,
  component: "PathPicker",
  covers: ["PathPicker", "Field", "Input", "Button", "cancel", "failure", "disabled", "readonly"],
  render: () => {
    const value = signal("/Users/demo/Projects/my-project");
    let result: "selected" | "cancelled" | "failed" = "selected";
    return (
      <Stack gap="normal" className="workshop-constrained">
        <Field label="Project name" htmlFor="picker-name">
          <Input id="picker-name" value="Personal website" />
        </Field>
        <Field
          label="Local directory"
          htmlFor="picker-directory"
          description="The demo picker only returns a fixed path; it does not read files or grant access."
        >
          <PathPicker
            id="picker-directory"
            label="Local directory"
            value={value}
            kind="directory"
            onValueChange={(next) => {
              value.value = next;
            }}
            onChoose={async () => {
              await new Promise((resolve) => setTimeout(resolve, 450));
              if (result === "failed") throw new Error("Picker unavailable");
              return result === "cancelled" ? null : "/Users/demo/Projects/selected-project";
            }}
          />
        </Field>
        <Stack gap="compact" align="start">
          <Button
            variant="quiet"
            onClick={() => {
              result = "selected";
            }}
          >
            Simulate a successful choice
          </Button>
          <Button
            variant="quiet"
            onClick={() => {
              result = "cancelled";
            }}
          >
            Simulate a canceled choice
          </Button>
          <Button
            variant="quiet"
            onClick={() => {
              result = "failed";
            }}
          >
            Simulate a failed choice
          </Button>
        </Stack>
        <Field label="File path" htmlFor="picker-file">
          <PathPicker
            id="picker-file"
            label="File path"
            value="/tmp/report.md"
            onValueChange={() => {}}
            onChoose={async () => null}
            readOnly
          />
        </Field>
        <Field label="Waiting to save" htmlFor="picker-disabled">
          <PathPicker
            id="picker-disabled"
            label="Waiting to save"
            value="/tmp/project"
            kind="directory"
            onValueChange={() => {}}
            onChoose={async () => null}
            disabled
          />
        </Field>
        <Field
          label="Enter a directory manually"
          htmlFor="picker-manual"
          description="When the host offers no picker, keep entering an absolute path manually."
        >
          <PathPicker
            id="picker-manual"
            label="Enter a directory manually"
            value={value}
            onValueChange={(next) => {
              value.value = next;
            }}
          />
        </Field>
      </Stack>
    );
  },
});
