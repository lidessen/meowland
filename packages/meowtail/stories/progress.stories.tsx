import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Inline, Progress, Stack } from "meowtail";

export const ProgressStory = defineStory({
  id: "progress",
  title: "Progress · Known and unknown amounts",
  component: "Progress",
  group: "Overlays and feedback",
  groupOrder: 30,
  description:
    "A labeled native progress bar for a known amount, and an indeterminate bar when the length is unknown. The spinner remains the wait that takes less room.",
  covers: ["Progress determinate", "Progress indeterminate", "label"],
  render: () => {
    const value = signal(2);
    return (
      <Stack align="start">
        <Progress label="Reviewed 2 of 5 files" value={value} max={5} />
        <Inline gap="compact">
          <Button
            variant="outline"
            size="small"
            onClick={() => {
              value.value = Math.max(0, value.value - 1);
            }}
          >
            Less
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => {
              value.value = Math.min(5, value.value + 1);
            }}
          >
            More
          </Button>
        </Inline>
        <Progress label="Connecting to the workspace" />
      </Stack>
    );
  },
});
