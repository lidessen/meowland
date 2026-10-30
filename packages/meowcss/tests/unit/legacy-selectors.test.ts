import { expect, test } from "bun:test";
import { removeLegacyIsFallbacks } from "meowcss/bundle";

test("drops the legacy copies Bun writes beside each :is() rule and keeps the :is() copy", () => {
  const bundled =
    ".a:-webkit-any(:hover,:focus-within) .b{color:red}.a:-moz-any(:hover,:focus-within) .b{color:red}.a:is(:hover,:focus-within) .b{color:red}";
  expect(removeLegacyIsFallbacks(bundled)).toBe(".a:is(:hover,:focus-within) .b{color:red}");
});

test("cleans inside at-rules and nested rules and leaves other vendor prefixes alone", () => {
  const css = [
    "@media (hover:hover){.x:-moz-any(:hover){color:red}.x:is(:hover){color:red}}",
    "summary::-webkit-details-marker{display:none}",
    '.q::before{content:"{:-moz-any(}"}',
    ".n{color:blue;&:-webkit-any(:focus){color:red}&:is(:focus){color:green}}",
    "/* .c:-moz-any(x){} */.c{color:red}",
  ].join("");
  expect(removeLegacyIsFallbacks(css)).toBe(
    [
      "@media (hover:hover){.x:is(:hover){color:red}}",
      "summary::-webkit-details-marker{display:none}",
      '.q::before{content:"{:-moz-any(}"}',
      ".n{color:blue;&:is(:focus){color:green}}",
      "/* .c:-moz-any(x){} */.c{color:red}",
    ].join(""),
  );
});

test("leaves the selectors of a real theme intact apart from the legacy copies", async () => {
  const { standardTheme } = await import("meowtail/theme");
  const bundled = standardTheme.cssText.replaceAll(":is(", ":-moz-any(") + standardTheme.cssText;
  expect(removeLegacyIsFallbacks(bundled)).not.toContain(":-moz-any(");
});

test("drops the copies Bun writes for a :not() with a selector list", () => {
  const bundled =
    ".z:not(:-webkit-any(:focus,:hover)){color:red}.z:not(:-moz-any(:focus,:hover)){color:red}.z:not(:is(:focus,:hover)){color:red}";
  expect(removeLegacyIsFallbacks(bundled)).toBe(".z:not(:is(:focus,:hover)){color:red}");
});
