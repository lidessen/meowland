import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Button, TextShimmer } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const TextShimmerStory = defineStory({
  id: "text-shimmer",
  title: "Text Shimmer · Activity cue",
  component: "TextShimmer",
  group: "Feedback and labels",
  groupOrder: 80,
  description: "A host-controlled sweep adds an activity cue to readable text.",
  covers: ["inactive", "controlled activity", "nested fragments"],
  render: () => {
    const active = signal(true);
    return (
      <Specimens>
        <Specimen label="Activity" align="start">
          <TextShimmer text="Checking the project" active={active} />
          <Button
            variant="outline"
            onClick={() => {
              active.value = !active.value;
            }}
          >
            Toggle animation
          </Button>
        </Specimen>
        <Specimen label="Nested fragments" align="start">
          <TextShimmer active>
            <TextShimmer text="Reading" /> project notes
          </TextShimmer>
        </Specimen>
        <Specimen label="Inactive" align="start">
          <TextShimmer text="Ready to begin" />
        </Specimen>
      </Specimens>
    );
  },
});
