import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { SearchBlock } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const SearchBlockStory = defineStory({
  id: "search-block",
  title: "Search Block · Paths and matching lines",
  component: "SearchBlock",
  group: "Content and inspection",
  groupOrder: 70,
  description:
    "Display host-provided paths or matches grouped by file, with the total and truncation state.",
  covers: ["SearchBlock", "paths", "matches", "truncation", "empty results", "copy"],
  render: () => (
    <Specimens>
      <Specimen label="Matching lines">
        <SearchBlock
          kind="matches"
          total={20}
          truncated
          maxLines={4}
          files={[
            {
              path: "src/theme.ts",
              matches: Array.from({ length: 10 }, (_, i) => ({
                lineNumber: i + 1,
                line: `export const token${i + 1} = ${i};`,
              })),
            },
            {
              path: "src/main.ts",
              matches: [{ lineNumber: 4, line: 'import { theme } from "./theme";' }],
            },
          ]}
        />
      </Specimen>
      <Specimen label="Paths">
        <SearchBlock kind="paths" total={2} paths={["src/theme.ts", "src/main.ts"]} />
      </Specimen>
      <Specimen label="No results">
        <SearchBlock kind="matches" total={0} files={[]} />
      </Specimen>
    </Specimens>
  ),
});
