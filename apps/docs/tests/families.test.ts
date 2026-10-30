import { describe, expect, test } from "bun:test";
import type { StoryEntry } from "meowbook";
import { buildCatalog, EXAMPLE_GROUP, FOUNDATIONS_GROUP } from "../catalog";
import { displayName, parseFamilies } from "../families";

const CATALOG = `# Component catalog

## Current component families

### Actions and commands

| Family | Components | Parts | Purpose |
| --- | --- | --- | --- |
| [Buttons](src/button.tsx) | [\`Button\`](src/button.tsx), [\`IconButton\`](src/icon-button.tsx) | — | Actions. |
| [Menus](src/menu.tsx) | \`Menu\`, \`MenuButton\` | — | Commands. |

### Records and surfaces

| Family | Components | Parts | Purpose |
| --- | --- | --- | --- |
| [Card](src/card.tsx) | [\`Card\`](src/card.tsx) | [\`CardHeader\`](src/card-header.tsx) | A surface. |
| [Entries](src/entry.tsx) | \`EntryList\`, \`Entry\` | — | Entries. |

## Agent scenario index

| [Not a family](x) | \`Ignored\` | — | |
`;

function story(overrides: Partial<StoryEntry> & { id: string }): StoryEntry {
  return {
    title: overrides.id,
    file: `/stories/${overrides.id}.stories.tsx`,
    exportName: "Story",
    line: 1,
    ...overrides,
  };
}

describe("the component families", () => {
  test("each category heading holds its families' members in order, with task terms", () => {
    const families = parseFamilies(CATALOG);
    expect(families.map((category) => category.label)).toEqual([
      "Actions and commands",
      "Records and surfaces",
    ]);
    expect(families[0]!.members.slice(0, 2)).toEqual([
      { name: "Button", term: "Buttons", part: false },
      { name: "IconButton", term: "Buttons", part: false },
    ]);
  });

  test("parts come from the Parts column, never from a shared name prefix", () => {
    const members = parseFamilies(CATALOG).flatMap((category) => category.members);
    const part = (name: string) => members.find((member) => member.name === name)?.part;
    expect(part("CardHeader")).toBe(true);
    expect(part("MenuButton")).toBe(false);
    expect(part("EntryList")).toBe(false);
    expect(members.some((member) => member.name === "Ignored")).toBe(false);
  });

  test("names read with spaces, capitals and known acronyms", () => {
    expect(displayName("CardAction")).toBe("Card Action");
    expect(displayName("JsonTree")).toBe("JSON Tree");
    expect(displayName("output-block")).toBe("Output Block");
    expect(displayName("Brand icons")).toBe("Brand Icons");
  });

  test("the families decide the groups and the order, and examples gather in one group", () => {
    const catalog = buildCatalog(
      [
        story({ id: "card", component: "Card", group: "Basic controls" }),
        story({ id: "card-header", component: "CardHeader", group: "Navigation and layout" }),
        story({ id: "button", component: "Button", group: "Basic controls" }),
        story({ id: "icons", component: "Brand icons", group: "Icons and brand" }),
        story({ id: "scene", title: "Scene · Board", group: "Content" }),
      ],
      undefined,
      undefined,
      parseFamilies(CATALOG),
    );
    const groups = catalog.navigation.map((group) => group.label);
    expect(groups.indexOf("Actions and commands")).toBeLessThan(
      groups.indexOf("Records and surfaces"),
    );
    expect(groups.slice(-2)).toEqual([FOUNDATIONS_GROUP, EXAMPLE_GROUP]);

    const records = catalog.navigation.find((group) => group.label === "Records and surfaces")!;
    expect(records.entries.slice(0, 2)).toEqual([
      { href: "/components/card/", label: "Card", path: "components/card" },
      {
        href: "/components/card-header/",
        label: "Card Header",
        path: "components/card-header",
        part: true,
      },
    ]);
    const actions = catalog.navigation.find((group) => group.label === "Actions and commands")!;
    expect(actions.entries.map((entry) => entry.label)).toEqual(["Button", "Icon Button", "Menu"]);
    // Only words the label does not already say are kept.
    expect(actions.entries[0]!.terms).toBe("Buttons");

    const foundations = catalog.navigation.find((group) => group.label === FOUNDATIONS_GROUP)!;
    expect(foundations.entries.map((entry) => entry.label)).toContain("Brand Icons");
    expect(catalog.examples[0]!.group).toBe(EXAMPLE_GROUP);
  });
});
