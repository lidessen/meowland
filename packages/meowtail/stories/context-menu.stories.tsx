import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Card, ContextMenu, Icon, Stack } from "meowtail";
import { Note } from "./specimen";

export const ContextMenuStory = defineStory({
  id: "context-menu",
  title: "Context menu · Right-click actions",
  component: "ContextMenu",
  group: "Overlays and feedback",
  groupOrder: 30,
  description:
    "Right-click the region, or focus it and press Shift+F10. Nested items reuse Menu, including keyboard movement inside the menu.",
  covers: ["ContextMenu pointer", "Shift+F10", "Menu submenus"],
  render: () => {
    const feedback = signal("No action selected yet.");
    return (
      <Stack align="start">
        <ContextMenu
          id="file-actions"
          items={[
            {
              id: "open",
              label: "Open",
              icon: <Icon name="file" />,
              onSelect: () => {
                feedback.value = "Selected Open.";
              },
            },
            {
              id: "export",
              label: "Export",
              children: [
                {
                  id: "markdown",
                  label: "Markdown",
                  onSelect: () => {
                    feedback.value = "Selected Markdown.";
                  },
                },
                {
                  id: "text",
                  label: "Plain text",
                  onSelect: () => {
                    feedback.value = "Selected Plain text.";
                  },
                },
              ],
            },
            { type: "separator", id: "divider" },
            {
              id: "remove",
              label: "Remove",
              danger: true,
              onSelect: () => {
                feedback.value = "Selected Remove.";
              },
            },
          ]}
        >
          <Card>
            <p>Right-click this card for file actions.</p>
            <p>Shift+F10 opens the same menu when the region is focused.</p>
          </Card>
        </ContextMenu>
        <Note role="status">{feedback}</Note>
      </Stack>
    );
  },
});
