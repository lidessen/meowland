import { expect, test } from "bun:test";
import { h } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { Status, installMeowUI } from "../../../src";

installMeowUI();

test("status presents its label with a decorative marker", () => {
  const html = renderToHtml(<Status state="returned" label="Execution returned" />);
  expect(html).toContain("Execution returned");
  expect(html).toMatch(/<span[^>]*aria-hidden="true"[^>]*>/);
});
