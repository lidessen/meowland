import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Stack } from "../src/components/stack";
import { TerminalBlock } from "../src/components/terminal-block";
import { ReadBlock } from "../src/components/read-block";
import { DiffBlock } from "../src/components/diff-block";
import { SearchBlock } from "../src/components/search-block";

export const OutputBlocksStory = defineStory({
  id: "output-blocks",
  title: "执行结果 · 终端、文件、变更与搜索",
  group: "内容",
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
  title: "终端结果 · 运行、失败与状态未知",
  group: "内容",
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
