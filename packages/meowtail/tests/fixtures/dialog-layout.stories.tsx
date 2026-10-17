import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Dialog, DialogPanel, Stack } from "meowtail";

export const DialogContentInsetsStory = defineStory({
  id: "dialog-content-insets",
  title: "Dialog content insets",
  render: () => (
    <Stack align="start">
      {(["headerless-short", "headerless-long", "custom-header"] as const).map((kind) => {
        let dialog: HTMLDialogElement | undefined;
        return (
          <div>
            <Button onClick={() => dialog?.showModal()}>Open {kind}</Button>
            <Dialog
              aria-label={kind}
              ref={(node: HTMLDialogElement) => {
                dialog = node;
              }}
            >
              <DialogPanel
                header={kind === "custom-header" ? <strong>Custom header</strong> : undefined}
              >
                <Stack gap="normal">
                  <Button>First action</Button>
                  {kind !== "headerless-short"
                    ? Array.from({ length: 20 }, (_, index) => (
                        <p>Content {index + 1}: Keep the reading area independently scrollable.</p>
                      ))
                    : null}
                  <Button onClick={() => dialog?.close()}>Last action</Button>
                </Stack>
              </DialogPanel>
            </Dialog>
          </div>
        );
      })}
    </Stack>
  ),
});
