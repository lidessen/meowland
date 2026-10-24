import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Field, Slider } from "meowtail";
import { Specimen, Specimens } from "./specimen";

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
      <Specimens>
        <Specimen label="Adjustable" align="start">
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
        </Specimen>
        <Specimen label="Disabled" align="start">
          <Slider label="Unavailable" defaultValue={20} disabled />
        </Specimen>
      </Specimens>
    );
  },
});
