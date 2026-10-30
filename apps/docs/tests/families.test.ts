import { describe, expect, test } from "bun:test";
import type { StoryEntry } from "meowbook";
import { buildCatalog, EXAMPLE_GROUP, FOUNDATIONS_GROUP } from "../catalog";
import { displayName, parseFamilies } from "../families";

const CATALOG = `# Component catalog

## Current component families

### Actions and commands

| Family and public members | Purpose |
| --- | --- |
| [Buttons](src/button.tsx): \`Button\`, [Icon button](src/icon-button.tsx): \`IconButton\` | Actions. |

### Records and surfaces

| Family and public members | Purpose |
| --- | --- |
| [Card](src/card.tsx): \`Card\`, [CardHeader](src/card-header.tsx): \`CardHeader\` | A surface. |
| [Entries](src/entry.tsx): \`EntryList\`, \`Entry\` | Entries. |

## Agent scenario index

| [Not a family](x): \`Ignored\` | |
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
    expect(families[0]!.members).toEqual([
      { name: "Button", term: "Buttons" },
      { name: "IconButton", term: "Icon button" },
    ]);
  });

  test("a part extends the name of an owner listed before it", () => {
    const members = parseFamilies(CATALOG)[1]!.members;
    expect(members.find((member) => member.name === "CardHeader")?.parent).toBe("Card");
    expect(members.find((member) => member.name === "EntryList")?.parent).toBeUndefined();
    expect(members.find((member) => member.name === "Entry")?.term).toBe("Entries");
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
    expect(actions.entries.map((entry) => entry.label)).toEqual(["Button", "Icon Button"]);
    // The label already says the export name and this task term; only new words are kept.
    expect(actions.entries[1]!.terms).toBeUndefined();
    expect(actions.entries[0]!.terms).toBe("Buttons");

    const foundations = catalog.navigation.find((group) => group.label === FOUNDATIONS_GROUP)!;
    expect(foundations.entries.map((entry) => entry.label)).toContain("Brand Icons");
    expect(catalog.examples[0]!.group).toBe(EXAMPLE_GROUP);
  });
});
