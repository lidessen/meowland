import { h } from "meowjsx/runtime";
import { defineStory } from "meowbook";
import { Item, Icon, Stack } from "meowtail";
import { Measure } from "./specimen";

export const ItemStory = defineStory({
  id: "item-composition",
  title: "Item · Reading and navigation",
  group: "Records and surfaces",
  groupOrder: 60,
  component: "Item",
  variant: "Information hierarchy and states",
  description:
    "The same item carries files, sources, and navigation destinations. Content wraps naturally and actions use native buttons.",
  render: () => (
    <Measure>
      <Stack>
        <Item
          title="Release check"
          description="Static records show no clickable feedback."
          meta="Record"
          leading={<Icon name="file-text" />}
        />
        <Item
          as="button"
          title="Design system"
          description="Shared conventions for type, typography, and theme"
          meta="Project"
          leading={<Icon name="network" />}
          trailing={<Icon name="arrow-right" />}
        />
        <Item
          as="button"
          size="small"
          variant="outline"
          title="very-long-source-reference-component.tsx"
          description="packages/meowtail/src/components/"
          leading={<Icon name="file-text" />}
          trailing="L24–48"
        />
        <Item
          as="button"
          selected
          title="Selected source"
          description="Keeps position and reading context"
          trailing={<Icon name="arrow-right" />}
        />
        <Item as="button" disabled title="Unavailable file" description="File is not synced yet" />
      </Stack>
    </Measure>
  ),
});
