import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { JsonTree } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const JsonTreeStory = defineStory({
  id: "json-tree",
  title: "JSON Tree · Expandable values",
  component: "JsonTree",
  group: "Content and inspection",
  groupOrder: 70,
  description:
    "Inspect nested objects and arrays one branch at a time, and copy individual values.",
  covers: ["JsonTree", "nested branches", "primitive values", "empty containers", "copy feedback"],
  render: () => (
    <Specimens>
      <Specimen label="Nested result">
        <JsonTree
          label="Result"
          data={{
            name: "Example",
            enabled: true,
            count: 3,
            missing: null,
            options: { tags: ["one", "two"], empty: [] },
          }}
        />
      </Specimen>
      <Specimen label="Initially collapsed">
        <JsonTree
          label="Details"
          defaultOpen={false}
          data={{ message: "Open this branch to inspect its contents." }}
        />
      </Specimen>
      <Specimen label="Copy failure">
        <JsonTree
          label="Value"
          data="Clipboard unavailable"
          onCopy={async () => {
            throw new Error("Clipboard unavailable");
          }}
        />
      </Specimen>
    </Specimens>
  ),
});
