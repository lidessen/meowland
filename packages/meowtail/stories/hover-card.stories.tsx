import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, HoverCard } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const HoverCardStatesStory = defineStory({
  id: "hover-card-states",
  title: "Hover Card · Preview states",
  component: "HoverCard",
  group: "Overlays and disclosure",
  groupOrder: 50,
  description: "Hover, focus or tap for a preview; Escape dismisses it.",
  covers: ["hover and focus", "preview and copy", "disabled"],
  render: () => (
    <Specimens>
      <Specimen label="Preview and copy" align="start">
        <HoverCard
          openDelay={200}
          copyText="docs/project-notes.md"
          trigger={(bindings) => (
            <Button variant="outline" {...bindings}>
              Project notes
            </Button>
          )}
          content="docs/project-notes.md"
        />
      </Specimen>
      <Specimen label="Unavailable" align="start">
        <HoverCard
          disabled
          trigger={(bindings) => (
            <Button variant="outline" {...bindings}>
              Unavailable preview
            </Button>
          )}
          content="This preview is unavailable."
        />
      </Specimen>
    </Specimens>
  ),
});
