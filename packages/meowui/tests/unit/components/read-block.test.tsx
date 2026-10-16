import { expect, test } from "bun:test";
import { highlightCode } from "../../../src/syntax-highlight";
import { readHighlightLines } from "../../../src/components/read-block";

test("read highlighting keeps one grammar context across the complete file window", async () => {
  const text = "/* comment\n  const value = 'comment';\n*/\nconst value = 42;\n";
  const spans = await highlightCode(text, "typescript");
  expect(spans).toBeDefined();
  const rows = readHighlightLines(spans!);
  expect(rows.map((row) => row.map((span) => span.text).join("")).join("\n")).toBe(text);
  expect(rows[1]!.every((span) => span.color?.includes("token-comment"))).toBe(true);
  expect(rows[3]!.some((span) => span.color?.includes("token-keyword"))).toBe(true);
  expect(rows.at(-1)).toEqual([]);
  expect(await highlightCode(text, "unsupported-language")).toBeUndefined();
});
