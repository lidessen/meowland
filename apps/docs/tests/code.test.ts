import { describe, expect, test } from "bun:test";
import { extractStorySource, statementEnd } from "../code";

const SOURCE = `import { h } from "meowjsx/runtime";
import { defineStory } from "meowbook";

export const ButtonStory = defineStory({
  id: "button",
  title: "Button · Actions",
  render: () => h("button", null, "Save"),
});

export const OtherStory = defineStory({
  id: "other",
  render: () => h("button", null, "Other");
});
`;

describe("the story source", () => {
  test("the sliced source is the statement that defines the story", () => {
    const code = extractStorySource(SOURCE, "ButtonStory");
    expect(code).toBe(
      `export const ButtonStory = defineStory({
  id: "button",
  title: "Button · Actions",
  render: () => h("button", null, "Save"),
});`,
    );
  });

  test("the sliced source does not run past the end of its statement", () => {
    const code = extractStorySource(SOURCE, "ButtonStory") ?? "";
    expect(code).not.toContain("OtherStory");
  });

  test("an unknown export name yields no source", () => {
    expect(extractStorySource(SOURCE, "MissingStory")).toBeUndefined();
  });

  test("a semicolon inside a string does not end the statement", () => {
    const source = `export const A = defineStory({ id: "a;", title: "A; B" });\n`;
    const code = extractStorySource(source, "A") ?? "";
    expect(code).toContain('title: "A; B"');
    expect(code.trimEnd().endsWith(";")).toBe(true);
  });

  test("a comment inside the statement does not end it", () => {
    const source = `export const A = defineStory({\n  // a comment with a ; inside\n  id: "a",\n});\n`;
    const code = extractStorySource(source, "A") ?? "";
    expect(code).toContain('id: "a"');
  });
});

describe("the end of a statement", () => {
  test("a closing brace inside a template literal does not count", () => {
    const source = "const a = `}`; const b = 2;";
    expect(statementEnd(source, 0)).toBe(source.indexOf("const b") - 1);
  });
});
