import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Stack } from "../src/components/stack";
import { WebBlock } from "../src/components/web-block";
import { JsonBlock } from "../src/components/json-block";
import { JsonTree } from "../src/components/json-tree";
import { ImageLightbox } from "../src/components/image-lightbox";

const sampleImage =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#edf3fe"/><circle cx="320" cy="180" r="100" fill="#4176e6"/></svg>',
  );
export const ContentViewsStory = defineStory({
  id: "content-views",
  title: "Content views · Sources, JSON and images",
  group: "Content",
  render: () => (
    <Stack>
      <WebBlock
        kind="search"
        answer="Sources are provided by the host; the component does not run searches."
        sources={[
          { title: "Example", url: "https://example.com", snippet: "A verifiable source note." },
          { url: "javascript:alert(1)", title: "A source that cannot be navigated" },
        ]}
      />
      <JsonTree
        data={{ name: "Meowland", options: { theme: "DeepSeek", enabled: true }, items: [1, 2, 3] }}
      />
      <JsonBlock text={'{"broken":'} />
      <ImageLightbox
        src={sampleImage}
        alt="Blue circle example"
        caption="Image preview · Escape returns to the original button"
      />
    </Stack>
  ),
});

export const JsonTreeStatesStory = defineStory({
  id: "json-tree-states",
  title: "JSON viewer · Properties, expansion and copy feedback",
  group: "Content",
  render: () => (
    <Stack>
      <JsonTree
        label="Result"
        data={{
          path: "/workspace/meowland/src/main.ts",
          count: 3,
          enabled: true,
          empty: null,
          nested: { text: "<content>\nsecond line", items: [1, 2] },
        }}
      />
      <JsonTree
        label="Copy failure example"
        data={{ message: "You can select the text to copy" }}
        onCopy={async () => {
          throw new Error("clipboard unavailable");
        }}
      />
    </Stack>
  ),
});
