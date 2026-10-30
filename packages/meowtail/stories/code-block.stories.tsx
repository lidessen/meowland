import { h } from "meowjsx";
import { Button, CodeBlock, Stack } from "meowtail";
import { defineStory } from "meowbook";

export const CodeBlockStory = defineStory({
  id: "code-block",
  title: "Code block · Language, copy, and wrapping",
  group: "Content",
  component: "CodeBlock",
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

export const CodeBlockHeaderStory = defineStory({
  id: "code-block-header",
  title: "Code block · Title, caption, and host actions",
  group: "Content",
  component: "CodeBlock",
  description:
    "A named code surface keeps its language, soft-wrap, and copy controls; the title and quiet caption share the header, and host actions sit before the built-in ones.",
  covers: ["title", "caption", "host actions", "soft wrap", "copy feedback"],
  render: () => (
    <Stack>
      <CodeBlock
        language="typescript"
        title="connection.ts"
        caption="examples/authoring"
        actions={[
          <Button variant="quiet" size="small">
            Open in workbench
          </Button>,
          <Button variant="quiet" size="small">
            View source
          </Button>,
        ]}
        code={`import { signal } from "meowjsx/signal";

const connection = signal<"idle" | "connecting" | "ready">("idle");

export async function connect(endpoint: string) {
  connection.value = "connecting";
  await fetch(endpoint, { method: "HEAD" });
  connection.value = "ready";
}`}
      />
      <CodeBlock
        language="shell"
        title="Install the package"
        caption="Run once in the workspace root."
        actions={
          <Button variant="quiet" size="small">
            Package reference
          </Button>
        }
        code="bun add meowtail"
      />
    </Stack>
  ),
});
