import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Stack } from "../src/components/stack";
import { TerminalBlock } from "../src/components/terminal-block";
import { ReadBlock } from "../src/components/read-block";
import { DiffBlock } from "../src/components/diff-block";
import { SearchBlock } from "../src/components/search-block";

export const OutputBlocksStory = defineStory({
  id: "output-blocks",
  title: "Output Block · Terminal, file, diff and search",
  group: "Content and inspection",
  groupOrder: 70,
  component: "OutputBlock",
  description:
    "One titled, capped and copyable surface carries every kind of tool output: a long result hides its middle on screen while Copy keeps the whole payload.",
  covers: ["output-block", "TerminalBlock", "ReadBlock", "DiffBlock", "SearchBlock"],
  render: () => (
    <Stack>
      <TerminalBlock
        command="bun test"
        cwd="meowland"
        exitCode={0}
        output={
          "\u001b[32mPASS\u001b[0m renderer\n" +
          Array.from({ length: 24 }, (_, i) => `case ${i + 1}: passed`).join("\n")
        }
      />
      <ReadBlock
        label="src/main.ts"
        totalLines={120}
        lines={Array.from({ length: 24 }, (_, i) => ({
          number: i + 41,
          text: `const item${i} = ${i};`,
          highlighted: i === 2,
        }))}
      />
      <DiffBlock
        files={[
          {
            path: "theme.ts",
            lines: [
              { kind: "context", text: "export const theme = {" },
              { kind: "removed", text: "  radius: 8," },
              { kind: "added", text: "  radius: 16," },
              { kind: "context", text: "};" },
            ],
          },
        ]}
      />
      <SearchBlock
        kind="matches"
        total={20}
        truncated
        files={[
          { path: "src/theme.ts", matches: [{ lineNumber: 12, line: "export const theme = {};" }] },
          {
            path: "src/main.ts",
            matches: [{ lineNumber: 4, line: "import { theme } from './theme';" }],
          },
        ]}
      />
    </Stack>
  ),
});

export const TerminalStatesStory = defineStory({
  id: "terminal-states",
  title: "Terminal Block · Running, failure, and unknown status",
  group: "Content and inspection",
  groupOrder: 70,
  component: "TerminalBlock",
  render: () => (
    <Stack>
      <TerminalBlock
        command={"bun test\n  --filter renderer\n"}
        cwd="/workspace/meowland"
        running
      />
      <TerminalBlock
        command="bun test"
        cwd="/workspace/meowland"
        exitCode={1}
        output="FAIL renderer"
      />
      <TerminalBlock command="sleep 30" signal="SIGTERM" output="" />
      <TerminalBlock command="echo result" output={"result\n"} />
      <TerminalBlock command="echo 'completed'" exitCode={0} output={"completed\n"} />
    </Stack>
  ),
});
