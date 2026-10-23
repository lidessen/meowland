import { describe, expect, test } from "bun:test";
import {
  extractStorySource,
  firstElementOf,
  namedRenderSource,
  renderSourceOf,
  statementEnd,
} from "../code";

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

describe("the render excerpt", () => {
  test("the excerpt is the render property, dedented, with its line offset", () => {
    const code = extractStorySource(SOURCE, "ButtonStory") ?? "";
    expect(renderSourceOf(code)).toEqual({
      code: 'render: () => h("button", null, "Save")',
      lineOffset: 3,
    });
  });

  test("a multi-line render keeps its body and stops at the closing brace", () => {
    const code = `export const A = defineStory({
  id: "a",
  render() {
    const label = "Save, then close";
    return h("button", null, label);
  },
  covers: ["a"],
});`;
    expect(renderSourceOf(code)?.code).toBe(`render() {
  const label = "Save, then close";
  return h("button", null, label);
}`);
  });

  test("a story without render yields no excerpt", () => {
    expect(renderSourceOf('export const A = defineStory({ id: "a" });')).toBeUndefined();
  });
});

describe("a named render", () => {
  const file = `import { h } from "meowjsx";

export function assistantDemo(): Child {
  const items = [{ id: "a" }];
  return h("ul", null, items.map((item) => h("li", null, item.id)));
}

export const AssistantStory = defineStory({
  id: "assistant",
  render: assistantDemo,
});
`;
  test("the docs read the function a story's render names", () => {
    const story = extractStorySource(file, "AssistantStory") ?? "";
    const named = namedRenderSource(file, story);
    expect(named?.code).toBe(`export function assistantDemo(): Child {
  const items = [{ id: "a" }];
  return h("ul", null, items.map((item) => h("li", null, item.id)));
}`);
  });

  test("an inline render has no named source", () => {
    const story = 'export const A = defineStory({ id: "a", render: () => h("p") });';
    expect(namedRenderSource(story, story)).toBeUndefined();
  });
});

describe("the usage snippet", () => {
  const code = [
    "render: () => (",
    "    <Stack>",
    '      <Button variant="quiet" onClick={() => go(">")}>',
    "        Don't <Button>inner</Button> save",
    "      </Button>",
    "      <ButtonGroup />",
    "    </Stack>",
    "  )",
  ].join("\n");

  test("is the first element of that name, nested uses included, dedented", () => {
    expect(firstElementOf(code, "Button")).toBe(
      [
        '<Button variant="quiet" onClick={() => go(">")}>',
        "  Don't <Button>inner</Button> save",
        "</Button>",
      ].join("\n"),
    );
  });

  test("matches whole names and self-closing elements", () => {
    expect(firstElementOf(code, "ButtonGroup")).toBe("<ButtonGroup />");
    expect(firstElementOf(code, "Card")).toBeUndefined();
  });

  test("skips a use bound to local variables for the next self-contained one", () => {
    const loop = [
      "{sizes.map((size) => <Button size={size}>{label}</Button>)}",
      '<Button size="small" data-action="Saved." disabled={false}>Save</Button>',
    ].join("\n");
    expect(firstElementOf(loop, "Button")).toBe(
      '<Button size="small" disabled={false}>Save</Button>',
    );
  });

  test("leaves out a first use too long to read as a usage", () => {
    const long = ["<Card>", ...Array.from({ length: 20 }, () => "  <p>line</p>"), "</Card>"];
    expect(firstElementOf(long.join("\n"), "Card")).toBeUndefined();
  });
});
