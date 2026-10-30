import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Icon, MenuButton, Stack } from "meowtail";
import { Note } from "./specimen";

export const MenuButtonStory = defineStory({
  id: "menu-button",
  title: "Menu Button · Button and menu",
  group: "Actions and commands",
  groupOrder: 30,
  component: "MenuButton",
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
