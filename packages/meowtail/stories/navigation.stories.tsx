import { h } from "meowjsx";
import { signal, mapSignal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Badge, Icon, NavItem, Stack } from "meowtail";

export const NavigationItemsStory = defineStory({
  id: "navigation-cards",
  title: "Navigation item · Selected, disabled, and long labels",
  group: "Navigation and layout",
  groupOrder: 40,
  component: "NavItem",
  variant: "Item states",
  description: "Selection is driven by local gallery props; no business page is switched.",
  render() {
    const active = signal("first");
    return (
      <Stack>
        {mapSignal(active, (value) => (
          <NavItem
            label="Sample item"
            icon={<Icon name="file" />}
            badge={<Badge size="small">3</Badge>}
            active={value === "first"}
            onClick={() => {
              active.value = "first";
            }}
          />
        ))}
        {mapSignal(active, (value) => (
          <NavItem
            label="A longer navigation item label to observe wrapping behavior"
            active={value === "second"}
            onClick={() => {
              active.value = "second";
            }}
          />
        ))}
        <NavItem label="Disabled item" icon={<Icon name="folder" />} disabled />
      </Stack>
    );
  },
});

export const FileNavigationStory = defineStory({
  id: "navigation-file-metadata",
  title: "Navigation item · Long file names and metadata",
  group: "Navigation and layout",
  groupOrder: 40,
  component: "NavItem",
  variant: "Limited outline width",
  description:
    "File names wrap naturally and sizes keep their own position; selected and disabled states use the same navigation component.",
  render() {
    const selected = signal("long");
    return (
      <Stack style={{ width: "min(100%, 240px)" }} gap="compact">
        <NavItem
          label="long-component-layout-review-and-source-reference.test.tsx"
          icon={<Icon name="file" />}
          badge="24.5 KB"
          active={mapSignal(selected, (value) => value === "long")}
          onClick={() => {
            selected.value = "long";
          }}
        />
        <NavItem
          label="README.md"
          icon={<Icon name="file" />}
          badge="1.2 KB"
          active={mapSignal(selected, (value) => value === "readme")}
          onClick={() => {
            selected.value = "readme";
          }}
        />
        <NavItem
          label="unreadable-long-name-sample-file-with-unavailable-content.txt"
          badge="Unknown"
          disabled
        />
      </Stack>
    );
  },
});
