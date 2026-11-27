import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Button, RiskConfirmation } from "meowtail";
import { Note, Specimen, Specimens } from "./specimen";

export const RiskConfirmationStory = defineStory({
  id: "risk-confirmation",
  title: "Risk Confirmation · Acknowledging an action",
  component: "RiskConfirmation",
  group: "Overlays and disclosure",
  groupOrder: 50,
  description:
    "The host opens the dialog and receives a decision after the reader acknowledges the stated consequence.",
  covers: ["RiskConfirmation", "acknowledgement", "cancel", "confirm"],
  render: () => {
    const open = signal(false);
    const acknowledged = signal(false);
    const feedback = signal("No decision made.");
    return (
      <Specimens>
        <Specimen label="Local example" align="start">
          <Button
            onClick={() => {
              acknowledged.value = false;
              open.value = true;
            }}
          >
            Remove example
          </Button>
          <RiskConfirmation
            id="story-risk-confirmation"
            open={open}
            title="Remove example"
            description="This action removes the local example from this demonstration."
            acknowledgeLabel="I understand the example will be removed."
            cancelLabel="Cancel"
            confirmLabel="Remove example"
            acknowledged={acknowledged}
            onAcknowledgedChange={(next) => {
              acknowledged.value = next;
            }}
            onCancel={() => {
              open.value = false;
              feedback.value = "Removal cancelled.";
            }}
            onConfirm={() => {
              open.value = false;
              feedback.value = "Local example removed.";
            }}
          />
          <Note role="status">{feedback}</Note>
        </Specimen>
      </Specimens>
    );
  },
});
