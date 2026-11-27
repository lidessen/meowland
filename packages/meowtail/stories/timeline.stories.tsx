import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Timeline, TimelineItem } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const TimelineStory = defineStory({
  id: "timeline",
  title: "Timeline · Events and their states",
  component: "Timeline",
  group: "Records and surfaces",
  groupOrder: 60,
  description:
    "An ordered history combines readable state labels, details, and optional actions for each event.",
  covers: ["Timeline", "TimelineItem", "state labels", "description", "actions"],
  render: () => (
    <Specimens>
      <Specimen label="Recent activity" width="content">
        <Timeline>
          <TimelineItem
            title="Checks running"
            state="processing"
            stateLabel="In progress"
            description="The host is checking the submitted changes."
          />
          <TimelineItem
            title="Changes received"
            state="success"
            stateLabel="Complete"
            description="All files were received and are ready for review."
            actions={
              <Button size="small" variant="quiet">
                View details
              </Button>
            }
          />
          <TimelineItem title="Request created" stateLabel="Recorded" />
        </Timeline>
      </Specimen>
      <Specimen label="Empty history">
        <Timeline aria-label="No events" />
      </Specimen>
    </Specimens>
  ),
});
