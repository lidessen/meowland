import { h } from "meowjsx";
import { CodeBlock, Stack } from "meowtail";
import { defineStory } from "meowbook";

export const CodeBlockStory = defineStory({
  id: "code-block",
  title: "Code block · Language, copy, and wrapping",
  group: "Content",
  render: () => (
    <Stack>
      <CodeBlock
        language="typescript"
        code={
          'const description = "Preserves code whitespace and long lines; soft wrap only changes the display, not the copied content.";\nconsole.log(description);'
        }
      />
      <CodeBlock
        code={'<script>alert("Displayed only, not executed")</script>\n  Preserves indentation'}
        defaultWrap
      />
      <CodeBlock
        language="Copy failed example"
        code="clipboard permission denied"
        onCopy={async () => {
          throw new Error("denied");
        }}
      />
    </Stack>
  ),
});
