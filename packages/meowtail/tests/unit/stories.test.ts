import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { discoverStories } from "meowbook/bun";
import config from "../../meowbook.config";

// The story metadata rules in AGENTS.md ("Story metadata"), checked against the stories as
// Meowbook discovers them and against the categories COMPONENTS.md declares.

const FOUNDATIONS = "Foundations and parts";
const EXAMPLES = "Composition examples";

async function categories(): Promise<Map<string, Set<string>>> {
  const markdown = await readFile(resolve(import.meta.dir, "../../COMPONENTS.md"), "utf8");
  const section = markdown.slice(
    markdown.indexOf("## Current component families"),
    markdown.indexOf("## Agent scenario index"),
  );
  const result = new Map<string, Set<string>>();
  let current: Set<string> | undefined;
  for (const line of section.split("\n")) {
    const heading = /^### (.+)$/.exec(line);
    if (heading) result.set(heading[1]!.trim(), (current = new Set()));
    else if (current && line.startsWith("|"))
      for (const cell of line.split("|").slice(2, 4))
        for (const match of cell.matchAll(/`([A-Za-z][A-Za-z0-9]*)`/g)) current.add(match[1]!);
  }
  return result;
}

/** CardAction reads "Card Action", JsonTree "JSON Tree": the form the docs and gallery show. */
function readingName(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s-]+/)
    .map((word) => {
      const capital = word[0]!.toUpperCase() + word.slice(1);
      return capital === "Json" ? "JSON" : capital;
    })
    .join(" ");
}

describe("story metadata", async () => {
  const families = await categories();
  const groups = [...families.keys(), FOUNDATIONS, EXAMPLES];
  const listed = new Set([...families.values()].flatMap((members) => [...members]));
  const stories = await discoverStories(config);

  test.each(stories.map((story) => [story.id, story] as const))("%s", (_, story) => {
    // The group is a catalog category, foundations, or the composition examples.
    expect(groups).toContain(story.group!);
    // Every story states its group's order, so the gallery and the docs agree.
    expect(story.groupOrder).toBe((groups.indexOf(story.group!) + 1) * 10);

    const [topic, scenario, ...rest] = story.title.split(" · ");
    expect(rest).toEqual([]);
    expect(scenario).toMatch(/^[A-Z0-9]/);

    if (story.group === EXAMPLES) {
      // A scene of several components declares none and names its topic in title case.
      expect(story.component).toBeUndefined();
      expect(topic).toBe(readingName(topic!));
      return;
    }
    // A single-component story names the export it documents and leads its title with it.
    expect(story.component).toBeDefined();
    expect(topic).toBe(readingName(story.component!));
    if (story.group === FOUNDATIONS) expect(listed.has(story.component!)).toBe(false);
    else expect(families.get(story.group!)?.has(story.component!)).toBe(true);
  });
});
