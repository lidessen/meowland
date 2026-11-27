import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Button, MetaRow } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const MetaRowStory = defineStory({
  id: "meta-row",
  title: "Meta Row · Facts and progress",
  component: "MetaRow",
  group: "Records and surfaces",
  groupOrder: 60,
  description: "Compact facts wrap with separators and may include host-provided progress.",
  covers: ["facts and separators", "live progress", "empty items", "long content"],
  render: () => {
    const progress = signal(25);
    return (
      <Specimens>
        <Specimen label="Live progress" width="narrow">
          <MetaRow
            items={[
              { label: "Draft" },
              { label: "A long project name that can wrap in a narrow space" },
            ]}
            progress={progress}
            progressLabel="Review progress"
          />
          <Button
            variant="outline"
            onClick={() => {
              progress.value = progress.value >= 100 ? 0 : progress.value + 25;
            }}
          >
            Advance progress
          </Button>
        </Specimen>
        <Specimen label="Progress without facts">
          <MetaRow items={[]} progress={60} progressLabel="Upload progress" />
        </Specimen>
        <Specimen label="No facts or progress">
          <MetaRow items={[]} aria-label="Empty metadata" />
        </Specimen>
      </Specimens>
    );
  },
});
