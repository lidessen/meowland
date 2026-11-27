import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { WebBlock } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const WebBlockStory = defineStory({
  id: "web-block",
  title: "Web Block · Answers and sources",
  component: "WebBlock",
  group: "Content and inspection",
  groupOrder: 70,
  description: "Show a host-provided answer with sources, or the status of a fetched page.",
  covers: ["WebBlock", "search sources", "fetch status", "truncation", "empty results"],
  render: () => (
    <Specimens>
      <Specimen label="Search result">
        <WebBlock
          kind="search"
          answer="These sources describe the example topic."
          truncated
          sources={[
            {
              url: "https://example.com/guide",
              title: "Example guide",
              snippet: "A longer source excerpt gives the reader context before opening the page.",
              publishedAt: "November 2026",
            },
            { url: "https://example.org/reference", title: "Reference" },
          ]}
        />
      </Specimen>
      <Specimen label="Fetched page">
        <WebBlock kind="fetch" url="https://example.com/article" statusCode={200} truncated />
      </Specimen>
      <Specimen label="No results">
        <WebBlock kind="search" sources={[]} />
      </Specimen>
    </Specimens>
  ),
});
