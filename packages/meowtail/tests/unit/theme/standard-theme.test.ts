import { expect, test } from "bun:test";
import {
  standardTheme,
  standardOptions,
  text,
  uiTokens,
  type TextRole,
} from "../../../src/theme/index";

test("standard theme is generated from token definitions and typed part contracts", () => {
  expect(standardTheme.name).toBe(standardOptions.name);
  expect(standardTheme.defaults.attributes).toEqual({ "data-meowui-color-scheme": "auto" });
  expect(standardTheme.cssText).toContain(`${uiTokens.surface.canvas.name}:`);
  expect(standardTheme.cssText).toContain('data-meowui-part="button/root"');
  expect(standardTheme.cssText).toContain('data-meowui-part="alert/title"');
  // `--app-region` is the desktop shell's drag-area property, not a theme token.
  expect(standardTheme.cssText.replaceAll("--app-region", "")).not.toContain("--app-");
  expect(standardTheme.cssText).not.toContain("@import");
});

test("every title uses the UI face; there is no display face", () => {
  expect("display" in uiTokens.type).toBe(false);
  expect(standardTheme.cssText).not.toContain("Iowan Old Style");
  expect(standardTheme.cssText).not.toContain("--ui-type-display");
  expect(standardTheme.cssText).toContain('data-meowui-part="page-header/title"');
  expect(standardTheme.cssText).toContain('data-meowui-part="section/title"');
});

test("every text role is built from type ramp tokens alone", () => {
  const roles: TextRole[] = [
    "eyebrow",
    "caption",
    "label",
    "body",
    "secondary",
    "reading",
    "title",
    "heading",
    "pageTitle",
  ];
  for (const role of roles) {
    const declarations = text(role)
      .text.split(";")
      .map((line) => line.trim())
      .filter((line) => /^(font|letter-spacing|line-height)/.test(line));
    expect(declarations.length).toBeGreaterThan(0);
    for (const declaration of declarations) {
      const literals = declaration.replace(/var\(--[\w-]+\)/g, "").replace(/^[\w-]+:/, "");
      expect({ role, literals: literals.match(/\d/g) }).toEqual({ role, literals: null });
    }
  }
});

test("shared layout options bind every real instance carrier", () => {
  expect(standardTheme.cssText).toContain('data-meowui-part="stack/root"');
  expect(standardTheme.cssText).toContain('data-meowui-part="inline/root"');
  expect(standardTheme.cssText).toContain("data-option-layout-gap");
  expect(standardTheme.cssText).toContain("data-option-grid-gap");
});

test("the complete generated stylesheet parses without dropped or malformed rules", async () => {
  const result = await Bun.build({
    entrypoints: ["standard-theme.css"],
    plugins: [
      {
        name: "theme-source",
        setup(build) {
          build.onResolve({ filter: /^standard-theme\.css$/ }, () => ({
            path: "standard-theme.css",
            namespace: "theme",
          }));
          build.onLoad({ filter: /.*/, namespace: "theme" }, () => ({
            contents: standardTheme.cssText,
            loader: "css",
          }));
        },
      },
    ],
  });
  expect(result.success).toBe(true);
  expect(result.logs).toEqual([]);
});
