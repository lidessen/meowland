import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Dialog,
  DialogPanel,
  DialogHeader,
  DialogActions,
  Field,
  Icon,
  IconButton,
  Input,
} from "meowtail";

export const DialogFormStory = defineStory({
  id: "dialog-form",
  title: "Dialog · Editing and long content",
  group: "Overlays and feedback",
  groupOrder: 30,
  component: "Dialog",
  variant: "Editing and long content",
  description:
    "Submits and returns through native form method=dialog. Long content stays readable in the dialog, and the title, description, close, and save each have their role.",
  covers: [
    "DialogPanel form",
    "DialogHeader eyebrow/actions/long title",
    "DialogActions",
    "native validation",
    "Escape/focus return",
    "long content",
  ],
  render: () => (
    <div className="workshop-stack workshop-constrained">
      <Button data-edit-open>Edit delivery notes</Button>
      <p role="status" data-edit-feedback className="workshop-feedback">
        The local sample has not been modified yet.
      </p>
      <Dialog labelledBy="edit-title" describedBy="edit-description">
        <DialogPanel as="form" method="dialog">
          <DialogHeader
            eyebrow="Pre-delivery check"
            title="Write a verifiable description for this component design and interaction improvement"
            titleId="edit-title"
            description="Built-in sample; saving only closes the dialog and shows a local receipt."
            descriptionId="edit-description"
            actions={
              <IconButton label="Close editing" data-edit-close>
                <Icon name="x" />
              </IconButton>
            }
          />
          <Field label="Description title" htmlFor="edit-name">
            <Input
              id="edit-name"
              name="title"
              value="Calibrate component proportions and theme boundaries"
              required
              autofocus
            />
          </Field>
          <section className="workshop-document" aria-label="Sample delivery notes">
            {[
              "Delivery content: This sample includes buttons, inputs, and a confirmation dialog, with two themes and light and dark appearances for each.",
              "Review scope: Check long titles, form hints, and action positions on desktop and narrow screens, and record any issues found while using the keyboard.",
              "Current limitations: No project service is connected here; saving only updates the receipt on this page, and this note is not kept after the page is refreshed.",
              "Follow-up work: Adopt the confirmed components in real pages, then verify loading, failure, and recovery. Unfinished checks should stay in the delivery record.",
            ].map((copy) => (
              <p>{copy}</p>
            ))}
          </section>
          <DialogActions>
            <Button variant="quiet" data-edit-close>
              Cancel
            </Button>
            <Button type="submit" value="save">
              Save description
            </Button>
          </DialogActions>
        </DialogPanel>
      </Dialog>
    </div>
  ),
  setup({ root, onCleanup, report }) {
    const dialog = root.querySelector<HTMLDialogElement>("dialog")!;
    const trigger = root.querySelector<HTMLButtonElement>("[data-edit-open]")!;
    const open = () => {
      dialog.returnValue = "";
      dialog.showModal();
    };
    const click = (event: Event) => {
      if ((event.target as Element).closest("[data-edit-close]")) dialog.close("cancel");
    };
    const closed = () => {
      const message =
        dialog.returnValue === "save"
          ? "Saved the local description."
          : "Editing canceled; returned to the previous place.";
      root.querySelector("[data-edit-feedback]")!.textContent = message;
      trigger.focus();
      report(message);
    };
    trigger.addEventListener("click", open);
    dialog.addEventListener("click", click);
    dialog.addEventListener("close", closed);
    onCleanup(() => {
      trigger.removeEventListener("click", open);
      dialog.removeEventListener("click", click);
      dialog.removeEventListener("close", closed);
      if (dialog.open) dialog.close();
    });
  },
});
