import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { DiffBlock } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const DiffBlockStory = defineStory({
  id: "diff-block",
  title: "Diff Block · File changes and context",
  component: "DiffBlock",
  group: "Content and inspection",
  groupOrder: 70,
  description:
    "Review host-provided changes by file, including a long diff whose middle can be expanded.",
  covers: ["DiffBlock", "added and removed lines", "long output", "copy"],
  render: () => (
    <Specimens>
      <Specimen label="Changes across files">
        <DiffBlock
          files={[
            {
              path: "src/theme.ts",
              lines: [
                { kind: "context", text: "export const theme = {" },
                { kind: "removed", text: "  spacing: 8," },
                { kind: "added", text: "  spacing: 12," },
                { kind: "context", text: "};" },
              ],
            },
            { path: "README.md", lines: [{ kind: "added", text: "Use the shared theme." }] },
          ]}
        />
      </Specimen>
      <Specimen label="Long change" note="Expand the hidden middle or copy the full diff.">
        <DiffBlock
          maxLines={6}
          files={[
            {
              path: "notes.txt",
              lines: Array.from({ length: 16 }, (_, i) => ({
                kind: "added" as const,
                text: `Added note ${i + 1}`,
              })),
            },
          ]}
        />
      </Specimen>
      <Specimen label="No files">
        <DiffBlock files={[]} />
      </Specimen>
    </Specimens>
  ),
});
