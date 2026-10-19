import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Field, Slider, Stack } from "meowtail";

export const SliderStory = defineStory({
  id: "slider",
  title: "Slider · A value in a range",
  component: "Slider",
  group: "Form inputs",
  groupOrder: 20,
  description:
    "A native range control. Arrow keys, Home, and End move it; the figure beside the track is the same value assistive technology reads.",
  covers: ["Slider keyboard", "Slider min/max/step", "disabled"],
  render: () => {
    const volume = signal(40);
    return (
      <Stack align="start">
        <Field label="Volume" htmlFor="story-volume">
          <Slider
            id="story-volume"
            label="Volume"
            min={0}
            max={100}
            step={5}
            value={volume}
            onValueChange={(next) => {
              volume.value = next;
            }}
          />
        </Field>
        <Slider label="Unavailable" defaultValue={20} disabled />
      </Stack>
    );
  },
});
