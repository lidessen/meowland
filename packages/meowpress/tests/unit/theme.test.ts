import { expect, test } from "bun:test";
import { journalTheme, uiTokens } from "meowtail/theme";
import { blogFonts, blogTheme } from "../../src/theme";

test("blog theme keeps Journal tokens and component styling with automatic color schemes", () => {
  expect(blogTheme.defaults.attributes["data-meowui-color-scheme"]).toBe("auto");
  expect(blogTheme.cssText).toContain("@media (prefers-color-scheme: dark)");
  // Compare emitted declarations, not a second copy of Journal's palette values.
  for (const token of [uiTokens.surface.canvas, uiTokens.ink.primary, uiTokens.type.display]) {
    const declarations = journalTheme.cssText.match(new RegExp(`${token.name}: [^;]+;`, "g"))!;
    expect(declarations.length).toBeGreaterThan(0);
    for (const declaration of declarations) expect(blogTheme.cssText).toContain(declaration);
  }
  for (const part of ["page/root", "entry/root", "prose/root", "button/root"]) {
    expect(blogTheme.cssText).toContain(part);
  }
  // Fonts are a build input, not CSS imports: static hosts mount cssText without a bundler.
  expect(blogTheme.cssText).not.toContain("@import");
  expect(blogFonts.map(({ family, styles }) => ({ family, styles }))).toEqual([
    { family: "Newsreader Variable", styles: ["normal", "italic"] },
    { family: "Inter Variable", styles: ["normal"] },
    { family: "JetBrains Mono Variable", styles: ["normal"] },
  ]);
});

test("translation notices style their link instead of leaving the browser default", () => {
  // The rich message renders a bare `<a>`; without this rule it would be the browser's link.
  const rules = blogTheme.cssText.match(/\.translation-notices a[^{]*\{[^}]*\}/g) ?? [];
  expect(rules.length).toBeGreaterThan(0);
  expect(rules.join("\n")).toContain("text-decoration: underline");
  expect(rules.join("\n")).toContain(String(uiTokens.accent.ink));
});

test("the About page's links read with the entry title instead of the browser default", () => {
  const rules = blogTheme.cssText.match(/\.site-link[^{]*\{[^}]*\}/g) ?? [];
  expect(rules.length).toBeGreaterThan(0);
  expect(rules.join("\n")).toContain("text-decoration: none");
  expect(rules.join("\n")).toContain(String(uiTokens.accent.ink));
});

test("the skip link's target takes focus without ringing the whole reading column", () => {
  const rules = blogTheme.cssText.match(/#main-content:focus-visible[^{]*\{[^}]*\}/g) ?? [];
  expect(rules.length).toBeGreaterThan(0);
  expect(rules.join("\n")).toContain("outline: none");
});
