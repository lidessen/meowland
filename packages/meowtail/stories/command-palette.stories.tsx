import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { ActionRow, Button, CommandPalette, type CommandPaletteCommand } from "meowtail";
import { Note, Specimen, Specimens } from "./specimen";

const commands: readonly CommandPaletteCommand[] = [
  {
    id: "new-chat",
    label: "New conversation",
    group: "Assistant",
    icon: "plus",
    shortcut: ["⌘", "N"],
  },
  {
    id: "search",
    label: "Search messages",
    group: "Assistant",
    icon: "search",
    keywords: ["find"],
  },
  {
    id: "stop",
    label: "Stop the running reply",
    group: "Assistant",
    icon: "square",
    disabled: true,
  },
  { id: "open-file", label: "Open file", group: "Workspace", icon: "file", shortcut: ["⌘", "O"] },
  {
    id: "terminal",
    label: "Open terminal",
    group: "Workspace",
    icon: "terminal",
    keywords: ["shell"],
  },
  {
    id: "panel",
    label: "Toggle side panel",
    group: "View",
    icon: "panel-left",
    shortcut: ["⌘", "B"],
  },
  { id: "refresh", label: "Reload workspace", group: "Workspace", icon: "refresh-cw" },
];

export const CommandPaletteStory = defineStory({
  id: "command-palette",
  title: "Command palette · Search and run",
  component: "CommandPalette",
  group: "Overlays and feedback",
  groupOrder: 35,
  description:
    "The host opens the palette from a button or its own ⌘K shortcut. Every word of the query must match a label, group or keyword; arrow keys move, Enter runs and focus returns to the opener before the command runs.",
  covers: ["CommandPalette filter", "CommandPalette run", "focus return", "disabled command"],
  render: () => {
    const open = signal(false);
    const ran = signal("No command run yet.");
    return (
      <Specimens>
        <Specimen label="Workspace commands" note="Press ⌘K or Ctrl+K, or use the button.">
          <ActionRow>
            <Button
              variant="outline"
              onClick={() => {
                open.value = true;
              }}
              ref={(button: HTMLButtonElement) => {
                const doc = button.ownerDocument;
                const shortcut = (event: KeyboardEvent) => {
                  if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    open.value = true;
                  }
                };
                doc.addEventListener("keydown", shortcut);
                return () => doc.removeEventListener("keydown", shortcut);
              }}
            >
              Open command palette
            </Button>
          </ActionRow>
          <Note role="status">{ran}</Note>
          <CommandPalette
            open={open}
            onOpenChange={(next) => {
              open.value = next;
            }}
            commands={commands}
            onRun={(id) => {
              ran.value = `Ran ${commands.find((command) => command.id === id)?.label}.`;
            }}
          />
        </Specimen>
      </Specimens>
    );
  },
});
