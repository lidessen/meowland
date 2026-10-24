import { h } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Button, Field, PathPicker, Stack } from "meowtail";

export const PathPickerLifecycle = defineStory({
  id: "path-picker-lifecycle",
  title: "Path picker lifecycle fixture",
  render: () => {
    const value = signal("/original");
    const disabled = signal(false);
    const readOnly = signal(false);
    const visible = signal(true);
    let resolve: ((value: string | null) => void) | undefined;
    let reject: ((error: Error) => void) | undefined;
    return (
      <Stack>
        {mapSignal(visible, (show) =>
          show ? (
            <Field label="Directory" htmlFor="path">
              <PathPicker
                id="path"
                label="Directory"
                kind="directory"
                value={value}
                disabled={disabled}
                readOnly={readOnly}
                onValueChange={(next) => {
                  value.value = next;
                }}
                onChoose={() =>
                  new Promise((yes, no) => {
                    resolve = yes;
                    reject = no;
                  })
                }
              />
            </Field>
          ) : null,
        )}
        <output aria-label="Current path">{value}</output>
        <Button onClick={() => resolve?.("/selected")}>Resolve selection</Button>
        <Button onClick={() => resolve?.(null)}>Cancel selection</Button>
        <Button onClick={() => reject?.(new Error("Unavailable"))}>Reject selection</Button>
        <Button
          onClick={() => {
            value.value = "/parent";
          }}
        >
          Change parent
        </Button>
        <Button
          onClick={() => {
            disabled.value = true;
          }}
        >
          Disable
        </Button>
        <Button
          onClick={() => {
            readOnly.value = true;
          }}
        >
          Read only
        </Button>
        <Button
          onClick={() => {
            visible.value = false;
          }}
        >
          Unmount
        </Button>
      </Stack>
    );
  },
});
