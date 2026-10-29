import { expect, test } from "bun:test";
import { blogTheme, blogTokens } from "../../src/theme";
import { homePage } from "../../src/site";

test("blog theme renders complete scheme tokens in static HTML", () => {
  expect(blogTheme.defaults.attributes["data-meowui-color-scheme"]).toBe("auto");
  expect(blogTheme.cssText).toContain("@media (prefers-color-scheme: dark)");
  expect(blogTheme.cssText).toContain(`${blogTokens.bg.name}: #faf8f3`);
  expect(blogTheme.cssText).toContain(`${blogTokens.bg.name}: #191816`);
  expect(blogTheme.cssText).toContain(String(blogTokens.ink));
  // Fonts are a build input, not CSS imports: runtime hosts mount cssText without a bundler.
  expect(blogTheme.cssText).not.toContain("@import");
  expect(homePage([])).toContain('data-meowui-theme-root="blog"');
  expect(homePage([])).toContain('data-meowui-color-scheme="auto"');
});
