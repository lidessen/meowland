import { expect, test } from "bun:test";
import { auditCSS } from "meowcss";
import { standardAuditRules } from "meowtail/theme";
import { docsMeowTokenStyles, docsStyles, docsTheme } from "../theme";

test("the docs chrome holds to the standard scales, the type ramp included", () => {
  expect(auditCSS(docsStyles, standardAuditRules)).toEqual([]);
});

test("the Meow values follow the standard ones and apply only under the site's theme attribute", () => {
  const css = docsTheme.cssText;
  const meow = css.indexOf(docsMeowTokenStyles.text);
  expect(meow).toBeGreaterThan(css.indexOf("--ui-accent-base"));
  const declarations = docsMeowTokenStyles.text.match(/^[^{}@]+\{/gm) ?? [];
  expect(declarations.length).toBeGreaterThan(0);
  for (const selector of declarations) expect(selector).toContain('[data-docs-theme="meow"]');
  expect(docsMeowTokenStyles.text).toContain("--ui-accent-base: #e71c22;");
});
