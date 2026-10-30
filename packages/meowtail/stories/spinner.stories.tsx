import { h } from "meowjsx";
import { signal, mapSignal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Spinner, Button, Stack } from "meowtail";
import { Note } from "./specimen";
export const Spinners = defineStory({
  id: "spinner",
  title: "Spinner · A readable wait",
  group: "Feedback and labels",
  groupOrder: 80,
  component: "Spinner",
  variant: "Waiting and ready",
  description:
    "Keep text next to the graphic that says what is happening, without inventing a percentage; the spinner stops when reduced motion is requested. The button toggles local demo state.",
  covers: ["Spinner", "status", "reduced-motion"],
  render: () => {
    const loading = signal(true);
    return (
      <Stack align="start">
        {mapSignal(loading, (value) =>
          value ? (
            <Spinner label="Organizing the file list…" />
          ) : (
            <Note role="status">The file list is ready.</Note>
          ),
        )}
        <Button
          variant="outline"
          onClick={() => {
            loading.value = !loading.value;
          }}
        >
          {mapSignal(loading, (value) => (value ? "Simulate completion" : "Replay the wait"))}
        </Button>
      </Stack>
    );
  },
});
