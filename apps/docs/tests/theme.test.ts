import { expect, test } from "bun:test";
import { auditCSS } from "meowcss";
import { standardAuditRules } from "meowtail/theme";
import {
  docsJournalTokenStyles,
  docsMeowTokenStyles,
  docsOttrTokenStyles,
  docsStyles,
  docsTheme,
} from "../theme";

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

test("the Journal values apply only under its own theme attribute", () => {
  const declarations = docsJournalTokenStyles.text.match(/^[^{}@]+\{/gm) ?? [];
  expect(declarations.length).toBeGreaterThan(0);
  for (const selector of declarations) expect(selector).toContain('[data-docs-theme="journal"]');
  expect(docsJournalTokenStyles.text).toContain("Newsreader");
});

test("the docs scope Ottr to the selected theme in each scheme", () => {
  expect(docsTheme.cssText.indexOf(docsOttrTokenStyles.text)).toBeGreaterThan(
    docsTheme.cssText.indexOf("--ui-accent-base"),
  );
  const declarations = docsOttrTokenStyles.text.match(/^[^{}@]+\{/gm) ?? [];
  expect(declarations.length).toBeGreaterThan(0);
  for (const selector of declarations) expect(selector).toContain('[data-docs-theme="ottr"]');
  expect(docsOttrTokenStyles.text).toContain("--ui-accent-base: #2b705e;");
  expect(docsOttrTokenStyles.text).toContain("--ui-accent-base: #5bb99f;");
});
