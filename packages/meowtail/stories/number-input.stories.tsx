import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Field, NumberInput, Stack } from "meowtail";

export const NumberInputStory = defineStory({
  id: "number-input",
  title: "Number input · Type or step",
  component: "NumberInput",
  group: "Form inputs",
  groupOrder: 20,
  description:
    "Type a number or use the stepper. Values clamp to min, max and step on commit, and the committed figure uses the decimal places of the step.",
  covers: ["NumberInput stepper", "min/max/step", "formatting", "disabled"],
  render: () => {
    const quantity = signal<number | undefined>(2);
    return (
      <Stack align="start">
        <Field label="Copies" htmlFor="story-copies" description="1 to 12, in whole numbers.">
          <NumberInput
            id="story-copies"
            min={1}
            max={12}
            step={1}
            value={quantity}
            onValueChange={(next) => {
              quantity.value = next;
            }}
          />
        </Field>
        <Field label="Line height" htmlFor="story-leading">
          <NumberInput id="story-leading" defaultValue={1.5} min={1} max={2} step={0.1} />
        </Field>
        <Field label="Unavailable" htmlFor="story-locked">
          <NumberInput id="story-locked" defaultValue={3} disabled />
        </Field>
      </Stack>
    );
  },
});
