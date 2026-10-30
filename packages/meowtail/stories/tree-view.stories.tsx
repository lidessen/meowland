import { h } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { ActionRow, Button, Stack, TreeView, type TreeViewItem } from "meowtail";
import { Measure, Note, Specimen, Specimens } from "./specimen";

const files: readonly TreeViewItem[] = [
  {
    id: "src",
    label: "src",
    icon: "folder",
    children: [
      {
        id: "components",
        label: "components",
        icon: "folder",
        children: [
          { id: "button", label: "button.tsx", icon: "file", description: "2 KB" },
          { id: "tree-view", label: "tree-view.tsx", icon: "file", description: "9 KB" },
        ],
      },
      { id: "index", label: "index.ts", icon: "file", description: "1 KB" },
      { id: "empty", label: "generated", icon: "folder", children: [] },
    ],
  },
  {
    id: "docs",
    label: "docs",
    icon: "folder",
    children: [{ id: "readme", label: "README.md", icon: "file-text" }],
  },
  { id: "secrets", label: ".env", icon: "file", disabled: true, description: "No access" },
  { id: "package", label: "package.json", icon: "file" },
];

const plan: readonly TreeViewItem[] = [
  {
    id: "research",
    label: "Research",
    children: [
      { id: "interviews", label: "Interview five readers" },
      { id: "notes", label: "Summarize notes" },
    ],
  },
  {
    id: "build",
    label: "Build",
    children: [
      { id: "api", label: "Draft the API" },
      { id: "tests", label: "Write tests" },
    ],
  },
];

export const TreeViewStory = defineStory({
  id: "tree-view",
  title: "Tree View · Explore and select",
  group: "Navigation",
  groupOrder: 20,
  component: "TreeView",
  description:
    "Arrow keys move through visible rows, Right and Left open, close and climb branches, Enter selects and a letter jumps to the next match. The host owns the hierarchy, open branches and the selection it acts on.",
  covers: ["TreeView keyboard", "TreeView selection", "TreeView controlled expansion", "disabled"],
  render: () => {
    const selected = signal<string | undefined>("button");
    const expanded = signal<readonly string[]>(["research", "build"]);
    return (
      <Specimens>
        <Specimen label="Files" note="Local expansion; the host records the selection.">
          <Measure width="narrow">
            <Stack gap="compact">
              <TreeView
                label="Project files"
                items={files}
                defaultExpanded={["src", "components"]}
                selected={selected}
                onSelectedChange={(id) => {
                  selected.value = id;
                }}
              />
              <Note role="status">
                {mapSignal(selected, (id) => (id ? `Selected ${id}.` : "Nothing selected."))}
              </Note>
            </Stack>
          </Measure>
        </Specimen>
        <Specimen label="Host-owned expansion" note="Collapsing moves focus to a visible branch.">
          <Measure width="narrow">
            <Stack>
              <TreeView
                label="Plan"
                items={plan}
                expanded={expanded}
                onExpandedChange={(ids) => {
                  expanded.value = ids;
                }}
              />
              <ActionRow>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => {
                    expanded.value = [];
                  }}
                >
                  Collapse all
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => {
                    expanded.value = ["research", "build"];
                  }}
                >
                  Expand all
                </Button>
              </ActionRow>
            </Stack>
          </Measure>
        </Specimen>
      </Specimens>
    );
  },
});
