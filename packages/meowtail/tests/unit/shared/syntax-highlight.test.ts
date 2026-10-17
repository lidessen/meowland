import { expect, test } from "bun:test";
import { highlightCode, highlightLanguage } from "../../../src/syntax-highlight";

test("unknown language stays plain without loading a grammar", async () => {
  expect(highlightLanguage(" TS ")).toBe("typescript");
  expect(await highlightCode("literal", "unregistered-grammar")).toBeUndefined();
});
test("lazy highlighting preserves CRLF, tabs, trailing spaces and token roles", async () => {
  const code = 'const value = "<script>";\r\n\t// trailing  \r\n';
  const spans = await highlightCode(code, "typescript");
  expect(spans).toBeDefined();
  expect(spans!.map((span) => span.text).join("")).toBe(code);
  expect(spans!.some((span) => span.color?.includes("token-keyword"))).toBe(true);
  expect(spans!.some((span) => span.color?.includes("token-string"))).toBe(true);
});
test("concurrent highlighting requests retain individual payloads", async () => {
  const values = ['{"answer":42}', '{"answer":false}'];
  const results = await Promise.all(values.map((value) => highlightCode(value, "json")));
  expect(results.map((result) => result?.map((span) => span.text).join(""))).toEqual(values);
});
