import { describe, expect, test } from "bun:test";
import { markdownUrl, plainMarkdown, propsMarkdown, storyHelpers } from "../markdown";
import { installCommand } from "../packages";

describe("the Markdown copies", () => {
  test("a page's Markdown sits next to its route", () => {
    expect(markdownUrl("")).toBe("/index.md");
    expect(markdownUrl("components")).toBe("/components.md");
    expect(markdownUrl("components/choice-select")).toBe("/components/choice-select.md");
  });

  test("the props table keeps a union in one cell and lists style axes first", () => {
    const table = propsMarkdown(
      { options: { axes: { size: ["small", "large"] } }, defaults: { size: "small" } },
      {
        props: [
          { name: "size", type: "string", optional: true },
          { name: "className", type: "ClassValue", optional: true },
          {
            name: "placement",
            type: '"top" | "bottom"',
            optional: false,
            default: '"bottom"',
            description: "Where the list opens.",
          },
        ],
        extends: ["Props"],
      },
    );
    expect(table.split("\n")).toEqual([
      "| Prop | Type | Default | Description |",
      "| --- | --- | --- | --- |",
      '| `size` | `"small" \\| "large"` | `"small"` | Style axis; the theme paints each choice. |',
      '| `placement` (required) | `"top" \\| "bottom"` | `"bottom"` | Where the list opens. |',
      "",
      "Also takes `className`, `children` and the attributes and events of its root element.",
    ]);
  });

  test("a component without props says so", () => {
    expect(propsMarkdown(undefined, { props: [], extends: [] })).toBe(
      "This component documents no props of its own.",
    );
  });

  test("MDX components become Markdown, and code fences stay as written", () => {
    const body = [
      '<StoryCanvas story="buttons" title="Button" />',
      "",
      '<Callout tone="note">',
      "  Moved here.",
      "</Callout>",
      "",
      "```tsx",
      '<StoryCanvas story="kept" />',
      "```",
    ].join("\n");
    expect(plainMarkdown(body)).toBe(
      [
        "[Live example: Button](/gallery/?story=buttons)",
        "",
        "> Moved here.",
        "",
        "```tsx",
        '<StoryCanvas story="kept" />',
        "```",
      ].join("\n"),
    );
  });

  test("story scaffolding is named, package exports and local components are not", () => {
    const source = `
      function Row() { return <Inline />; }
      <Specimens>
        <Specimen label="One"><Measure width="narrow"><Button>Save</Button></Measure></Specimen>
        <Row /><Icon name="check" /><Fragment />
      </Specimens>
    `;
    expect(storyHelpers(source)).toEqual(["Specimens", "Specimen", "Measure"]);
  });

  test("the install command takes the documented channel for the package and its peers", () => {
    expect(installCommand("meowtail", ["meowjsx", "meowcss"])).toBe(
      "bun add meowtail@dev meowjsx@dev meowcss@dev",
    );
    expect(installCommand("meowjsx")).toBe("bun add meowjsx@dev");
  });
});
