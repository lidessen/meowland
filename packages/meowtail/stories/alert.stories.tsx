import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Alert, Button, Stack } from "meowtail";
import { Measure } from "./specimen";
export const Alerts = defineStory({
  id: "alert",
  title: "Alert · Outcome and next step",
  component: "Alert",
  variant: "Informational and urgent feedback",
  group: "Overlays and feedback",
  groupOrder: 30,
  description:
    "Color conveys semantics; the announced urgency is set independently with role. These are all local demo messages.",
  covers: ["Alert", "bar", "neutral", "marker", "status", "error"],
  render: () => (
    <Measure width="content">
      <Stack>
        <Alert title="Saved on this device only">
          The current draft has not been published yet; you can keep editing.
        </Alert>
        <Alert layout="bar" tone="neutral" marker="none">
          Kept locally. Nothing is waiting on you.
        </Alert>
        <Alert
          layout="bar"
          tone="warning"
          actions={
            <Button variant="quiet" size="small">
              View receipt
            </Button>
          }
        >
          Last submission unverified; draft kept.
        </Alert>
        <Alert title="Draft saved" tone="success">
          You can continue editing the next time you open it.
        </Alert>
        <Alert title="Connection temporarily interrupted" tone="warning">
          Your input has been kept; you can send it after the connection recovers.
        </Alert>
        <Alert title="File could not be read" tone="danger" role="alert">
          The file may have moved. Select the file again and try again.
        </Alert>
      </Stack>
    </Measure>
  ),
});
