import { h } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { ActionRow, Button, CodeBlock, Markdown } from "meowtail";
import { Measure, Note, Specimen, Specimens } from "./specimen";

const reply = `## Moving the cache

The cache now lives in **one module**, so every reader shares the same *eviction rule*. Run \`bun test\` after the change.

1. Move the store into \`cache.ts\`.
2. Replace the two local maps.
3. Keep the old export for one release.

\`\`\`ts
export const cache = new Map<string, Entry>();
\`\`\`

> Readers that held their own map now see the shared one.

| Reader | Before | After |
| --- | ---: | ---: |
| Search | 2 maps | 1 |
| Preview | 1 map | 1 |

See [the design notes](https://example.com/notes) for the reasons. Raw <b>HTML</b> stays text.`;

export const MarkdownStory = defineStory({
  id: "markdown",
  title: "Markdown · Agent text while it streams",
  group: "Content and inspection",
  groupOrder: 70,
  component: "Markdown",
  description:
    "Safe Markdown for Agent and document text. While text streams, finished blocks are never rewritten, so a selection in them survives, and the open tail hides half-typed markers. Fences can be drawn with CodeBlock.",
  covers: ["Markdown streaming", "selection kept", "incomplete syntax", "renderCode", "safe links"],
  render: () => {
    const text = signal(reply);
    const streaming = signal(false);
    let timer: ReturnType<typeof setInterval> | undefined;
    const stream = () => {
      clearInterval(timer);
      let length = 0;
      text.value = "";
      streaming.value = true;
      timer = setInterval(() => {
        length = Math.min(reply.length, length + 6);
        text.value = reply.slice(0, length);
        if (length === reply.length) {
          clearInterval(timer);
          streaming.value = false;
        }
      }, 40);
    };
    return (
      <Specimens>
        <Specimen
          label="Streamed reply"
          note="Select a sentence in the first paragraph, then stream."
        >
          <Measure width="content">
            <Markdown
              text={text}
              streaming={streaming}
              renderCode={(block) => (
                <CodeBlock
                  code={mapSignal(block, (value) => value.code)}
                  language={mapSignal(block, (value) => value.language)}
                />
              )}
            />
          </Measure>
          <ActionRow>
            <Button variant="outline" size="small" onClick={stream}>
              Stream again
            </Button>
          </ActionRow>
          <Note role="status">
            {mapSignal(streaming, (value) => (value ? "Streaming…" : "Complete."))}
          </Note>
        </Specimen>
      </Specimens>
    );
  },
});
