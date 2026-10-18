import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Stack } from "../src/components/stack";
import { ReadBlock } from "../src/components/read-block";

export const ReadHighlightStory = defineStory({
  id: "read-highlight",
  title: "File window · Multi-line syntax and raw copy",
  group: "Content",
  render: () => (
    <Stack>
      <ReadBlock
        label="src/example.ts"
        lang="typescript"
        totalLines={120}
        maxLines={6}
        lines={[
          "/* comment starts",
          "  still a comment",
          "  const notCode = 'comment';",
          "  comment continues",
          "  whitespace is preserved  ",
          "  comment closes */",
          "const result: number = 42;",
          "",
          "export { result };",
        ].map((text, index) => ({ number: index + 41, text }))}
      />
      <ReadBlock
        label="unknown.grammar"
        lang="not-a-supported-language"
        lines={[{ number: 7, text: "  <script> plain text  " }]}
      />
    </Stack>
  ),
});
