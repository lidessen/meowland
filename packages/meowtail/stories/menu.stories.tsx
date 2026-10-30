import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Button, Icon, Stack } from "meowtail";
import { Note } from "./specimen";
import { Menu } from "../src/components/menu";
export const MenuStory = defineStory({
  id: "menu-actions",
  title: "Menu · Groups and keyboard operation",
  group: "Actions and commands",
  groupOrder: 30,
  component: "Menu",
  description:
    "Arrow keys and Home/End move the focus, typing text jumps to an item; Escape returns to the trigger button. All actions only update the local receipt.",
  render() {
    const feedback = signal("No action selected yet.");
    return (
      <Stack align="start">
        <Menu
          id="story-actions"
          trigger={(bindings) => (
            <Button variant="outline" {...bindings}>
              Actions
              <Icon name="chevron-down" />
            </Button>
          )}
          items={[
            {
              type: "group",
              id: "file",
              label: "File",
              items: [
                {
                  id: "open",
                  label: "Open",
                  icon: <Icon name="file" />,
                  shortcut: "↵",
                  onSelect: () => {
                    feedback.value = "Selected Open.";
                  },
                },
                {
                  id: "copy",
                  label: "Copy",
                  icon: <Icon name="copy" />,
                  onSelect: () => {
                    feedback.value = "Selected Copy.";
                  },
                },
                { id: "export", label: "Export (unavailable)", disabled: true, onSelect: () => {} },
              ],
            },
            { type: "separator", id: "divider" },
            {
              id: "remove",
              label: "Remove",
              danger: true,
              onSelect: () => {
                feedback.value = "Selected Remove sample.";
              },
            },
          ]}
        />
        <Note role="status">{feedback}</Note>
      </Stack>
    );
  },
});

export const NestedMenuStory = defineStory({
  id: "menu-nested",
  title: "Menu · Nesting and touch",
  group: "Actions and commands",
  groupOrder: 30,
  component: "Menu",
  description:
    "Hover or click to open a submenu; the right-arrow direction enters it, the left-arrow direction goes back, and Escape closes one level at a time.",
  render() {
    const feedback = signal("No format selected yet.");
    return (
      <Stack align="start">
        <Menu
          id="nested-actions"
          trigger={(bindings) => (
            <Button variant="outline" {...bindings}>
              Format actions
            </Button>
          )}
          items={[
            {
              id: "export",
              label: "Export format",
              children: [
                {
                  id: "markdown",
                  label: "Markdown",
                  onSelect: () => {
                    feedback.value = "Selected Markdown.";
                  },
                },
                { id: "disabled", label: "PDF (unavailable)", disabled: true, onSelect: () => {} },
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
              ],
            },
            {
              id: "locked",
              label: "Unavailable submenu",
              disabled: true,
              children: [{ id: "locked-child", label: "Unreachable item", onSelect: () => {} }],
            },
            {
              id: "copy",
              label: "Copy",
              onSelect: () => {
                feedback.value = "Selected Copy.";
              },
            },
          ]}
        />
        <Note role="status">{feedback}</Note>
      </Stack>
    );
  },
});
