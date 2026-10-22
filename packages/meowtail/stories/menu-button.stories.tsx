import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Icon, MenuButton, Stack } from "meowtail";
import { Note } from "./specimen";

export const MenuButtonStory = defineStory({
  id: "menu-button",
  title: "Menu button · Button and menu",
  component: "MenuButton",
  group: "Basic controls",
  groupOrder: 10,
  description:
    "A button that opens the existing Menu below it. Arrow keys still enter the menu; nested items stay with Menu.",
  covers: ["MenuButton", "Menu items", "nested Menu"],
  render: () => {
    const feedback = signal("No format selected yet.");
    return (
      <Stack align="start">
        <MenuButton
          id="export-menu"
          variant="outline"
          items={[
            {
              id: "markdown",
              label: "Markdown",
              icon: <Icon name="file-text" />,
              onSelect: () => {
                feedback.value = "Selected Markdown.";
              },
            },
            {
              id: "more",
              label: "More formats",
              children: [
                {
                  id: "text",
                  label: "Plain text",
                  onSelect: () => {
                    feedback.value = "Selected Plain text.";
                  },
                },
              ],
            },
          ]}
        >
          Export
        </MenuButton>
        <Note role="status">{feedback}</Note>
      </Stack>
    );
  },
});
