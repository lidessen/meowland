import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { JsonBlock } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const JsonBlockStory = defineStory({
  id: "json-block",
  title: "JSON Block · Serialized and raw values",
  component: "JsonBlock",
  group: "Content and inspection",
  groupOrder: 70,
  description:
    "Open a JSON code surface to inspect or copy a host value, including invalid source text.",
  covers: ["JsonBlock", "collapsed", "expanded", "invalid JSON", "copy"],
  render: () => (
    <Specimens>
      <Specimen label="Collapsed payload">
        <JsonBlock label="Response" payload={{ status: "ready", items: ["one", "two"] }} />
      </Specimen>
      <Specimen label="Expanded payload">
        <JsonBlock
          label="Settings"
          defaultOpen
          payload={{ theme: "standard", enabled: true, nested: { count: 3 } }}
        />
      </Specimen>
      <Specimen label="Invalid text">
        <JsonBlock label="Raw response" defaultOpen text={'{"incomplete":'} />
      </Specimen>
    </Specimens>
  ),
});
