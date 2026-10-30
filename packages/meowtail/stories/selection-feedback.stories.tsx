import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Button, Stack } from "meowtail";
import { Note } from "./specimen";
import { SegmentedControl } from "../src/components/segmented-control";
import { TextShimmer } from "../src/components/text-shimmer";
import { RiskConfirmation } from "../src/components/risk-confirmation";

export const SegmentedFormStory = defineStory({
  id: "segmented-forms",
  title: "Segmented Control · Form ownership and reset",
  group: "Forms and selection",
  groupOrder: 40,
  component: "SegmentedControl",
  description:
    "Two controlled groups sit inside and outside a form; native reset does not change the host's current value.",
  render() {
    const options = [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ];
    const inside = signal("a");
    const outside = signal("a");
    return (
      <Stack gap="relaxed" align="start">
        <form id="segmented-inside">
          <Stack gap="compact" align="start">
            <SegmentedControl
              id="inside-choice"
              name="mode"
              label="Inner choice"
              value={inside}
              options={options}
              onValueChange={(value) => {
                inside.value = value;
              }}
            />
            <Button type="reset" variant="outline" size="small">
              Reset inner form
            </Button>
          </Stack>
        </form>
        <Stack gap="compact" align="start">
          <SegmentedControl
            id="outside-choice"
            name="mode"
            form="segmented-outside"
            label="Outer choice"
            value={outside}
            options={options}
            onValueChange={(value) => {
              outside.value = value;
            }}
          />
          <form id="segmented-outside">
            <Button type="reset" variant="outline" size="small">
              Reset outer form
            </Button>
          </form>
        </Stack>
      </Stack>
    );
  },
});
export const SelectionFeedbackStory = defineStory({
  id: "selection-feedback",
  title: "Segmented Control · Active text and confirmation",
  group: "Forms and selection",
  groupOrder: 40,
  component: "SegmentedControl",
  description:
    "The segmented control keeps native radio semantics. Confirmation is only used for this local example and introduces no global action gate.",
  render() {
    const mode = signal("comfortable");
    const locked = signal(false);
    const active = signal(true);
    const open = signal(false);
    const acknowledged = signal(false);
    const feedback = signal("The example has not been removed.");
    return (
      <Stack align="start">
        <SegmentedControl
          id="reading-mode"
          label="Reading spacing"
          value={mode}
          disabled={locked}
          onValueChange={(next) => {
            mode.value = next;
          }}
          options={[
            { value: "comfortable", label: "Comfortable" },
            { value: "locked", label: "Automatic", disabled: true },
            { value: "compact", label: "Compact" },
          ]}
        />
        <Button
          variant="quiet"
          onClick={() => {
            locked.value = !locked.value;
          }}
        >
          Toggle selection lock
        </Button>
        <TextShimmer text="Reading the file content" active={active} />
        <TextShimmer active={active} className="compound-shimmer">
          <TextShimmer text="Checking" />
          {" · "}
          <TextShimmer text="src/components" />
        </TextShimmer>
        <Button
          variant="quiet"
          onClick={() => {
            active.value = !active.value;
          }}
        >
          Toggle active state
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            acknowledged.value = false;
            open.value = true;
          }}
        >
          Remove example
        </Button>
        <RiskConfirmation
          id="remove-sample"
          open={open}
          title="Remove example"
          description="This is a local component example; it does not delete real files."
          acknowledgeLabel="I understand this action only affects the example."
          cancelLabel="Cancel"
          confirmLabel="Confirm removal"
          acknowledged={acknowledged}
          onAcknowledgedChange={(next) => {
            acknowledged.value = next;
          }}
          onCancel={() => {
            open.value = false;
          }}
          onConfirm={() => {
            open.value = false;
            feedback.value = "Removed the local example.";
          }}
        />
        <Note role="status">{feedback}</Note>
      </Stack>
    );
  },
});
