import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Field, Input, Modal, Stack } from "meowtail";

export const ModalStory = defineStory({
  id: "modal",
  title: "Modal · Title, body, actions, and focus return",
  group: "Overlays and feedback",
  groupOrder: 30,
  component: "Modal",
  variant: "Controlled open state",
  description:
    "The host owns the open signal: the trigger opens a native modal, Escape, the backdrop and the header close entry ask the host to close it, and focus returns to the trigger.",
  covers: ["title", "description", "actions", "Escape", "backdrop", "focus return"],
  render() {
    const open = signal(false);
    return (
      <Stack align="start">
        <Button
          onClick={() => {
            open.value = true;
          }}
        >
          Rename workspace
        </Button>
        <p>The dialog edits one name and keeps its draft until the review is done.</p>
        <Modal
          open={open}
          onOpenChange={(next) => {
            open.value = next;
          }}
          title="Rename workspace"
          description="The name appears in the sidebar, shared links and browser titles."
          actions={[
            <Button
              variant="quiet"
              onClick={() => {
                open.value = false;
              }}
            >
              Cancel
            </Button>,
            <Button
              onClick={() => {
                open.value = false;
              }}
            >
              Save name
            </Button>,
          ]}
        >
          <Field label="Workspace name" htmlFor="modal-workspace-name">
            <Input id="modal-workspace-name" value="Meowland workspace" />
          </Field>
        </Modal>
      </Stack>
    );
  },
});

export const ModalLongBodyStory = defineStory({
  id: "modal-long-body",
  title: "Modal · Long body scrolling",
  group: "Overlays and feedback",
  groupOrder: 30,
  component: "Modal",
  variant: "Fixed header and scrolling body",
  description:
    "The title and close entry stay in the panel header while a long generated review scrolls in the body; the action row sits after the content.",
  covers: ["long body", "body scroll", "header stays", "action row"],
  render() {
    const open = signal(false);
    return (
      <Stack align="start">
        <Button
          onClick={() => {
            open.value = true;
          }}
        >
          Review long summary
        </Button>
        <Modal
          open={open}
          onOpenChange={(next) => {
            open.value = next;
          }}
          title="Review generated summary"
          description="The source order and the operator comments stay together in the review."
          actions={[
            <Button
              variant="quiet"
              onClick={() => {
                open.value = false;
              }}
            >
              Close review
            </Button>,
            <Button
              onClick={() => {
                open.value = false;
              }}
            >
              Accept summary
            </Button>,
          ]}
        >
          <Stack gap="compact">
            {Array.from({ length: 24 }, (_, index) => (
              <p>
                Item {index + 1}: The generated summary keeps the source order, notes which files
                changed, and leaves the operator's comments beside the matching paragraph.
              </p>
            ))}
          </Stack>
        </Modal>
      </Stack>
    );
  },
});

export const ModalNonDismissibleStory = defineStory({
  id: "modal-non-dismissible",
  title: "Modal · Explicit close only",
  group: "Overlays and feedback",
  groupOrder: 30,
  component: "Modal",
  variant: "Non-dismissible review",
  description:
    "dismissible={false} removes the header close entry and ignores Escape and backdrop clicks, so only the host action can finish the review.",
  covers: ["dismissible false", "no header close", "Escape ignored", "backdrop ignored"],
  render() {
    const open = signal(false);
    return (
      <Stack align="start">
        <Button
          onClick={() => {
            open.value = true;
          }}
        >
          Start final review
        </Button>
        <Modal
          open={open}
          onOpenChange={(next) => {
            open.value = next;
          }}
          title="Final review in progress"
          description="Escape and the backdrop are disabled until the review completes."
          dismissible={false}
          actions={
            <Button
              onClick={() => {
                open.value = false;
              }}
            >
              Mark review complete
            </Button>
          }
        >
          <p>
            Finishing the review records the current summary. The dialog closes only from the
            explicit action so an accidental Escape does not lose the review.
          </p>
        </Modal>
      </Stack>
    );
  },
});
