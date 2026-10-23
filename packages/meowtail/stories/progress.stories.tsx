import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { ActionRow, Button, Progress, Stack } from "meowtail";
import { Measure } from "./specimen";

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
      <Measure width="narrow">
        <Stack>
          <Stack gap="compact">
            <span>Reviewed 2 of 5 files</span>
            <Progress label="Reviewed 2 of 5 files" value={value} max={5} />
          </Stack>
          <ActionRow>
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
          </ActionRow>
          <Stack gap="compact">
            <span>Connecting to the workspace</span>
            <Progress label="Connecting to the workspace" />
          </Stack>
        </Stack>
      </Measure>
    );
  },
});
