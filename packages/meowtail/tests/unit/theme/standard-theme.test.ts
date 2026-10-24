import { expect, test } from "bun:test";
import { css, parts } from "meowcss/meowjsx";
import type { Select } from "../../../src/components/select";
import { selectorForPart } from "../../../src/theme/selectors";
import {
  standardTheme,
  standardOptions,
  ui,
  utilityStyles,
  uiTokens,
} from "../../../src/theme/index";

const textValues = Object.values(ui.text);

test("standard theme is generated from token definitions and typed part descriptors", () => {
  expect(standardTheme.name).toBe(standardOptions.name);
  expect(standardTheme.defaults.attributes).toEqual({ "data-meowui-color-scheme": "auto" });
  expect(standardTheme.cssText).toContain(`${uiTokens.surface.canvas.name}:`);
  expect(standardTheme.cssText).toContain('data-meowui-part="button/root"');
  expect(standardTheme.cssText).toContain('data-meowui-part="alert/title"');
  expect(standardTheme.cssText).toContain(".ui-p-group");
  expect(standardTheme.cssText).toContain(".ui-surface-raised");
  expect(standardTheme.cssText.replaceAll("--app-region", "")).not.toContain("--app-");
  expect(standardTheme.cssText).not.toContain("@import");
});

test("serialized part selectors retain adjacent native state conditions", () => {
  const root = selectorForPart(parts<typeof Select>("select").root);
  expect(root).toBe(root.trim());
  expect(standardTheme.cssText).toContain(
    `${root}:not([multiple]):is(:not([size]), [size="0"], [size="1"])`,
  );
});

test("every title uses the UI face; there is no display face", () => {
  expect("display" in uiTokens.type).toBe(false);
  expect(standardTheme.cssText).not.toContain("Iowan Old Style");
  expect(standardTheme.cssText).not.toContain("--ui-type-display");
  expect(standardTheme.cssText).toContain('data-meowui-part="page-header/title"');
  expect(standardTheme.cssText).toContain('data-meowui-part="section/title"');
});

test("every text utility expands from type ramp tokens alone", () => {
  expect(textValues).toHaveLength(9);
  for (const value of textValues) {
    const declarations = css`
      ${value}
    `.text
      .split(";")
      .map((line) => line.trim())
      .filter((line) => /^(font|letter-spacing|line-height)/.test(line));
    expect(declarations.length).toBeGreaterThan(0);
    for (const declaration of declarations) {
      const literals = declaration.replace(/var\(--[\w-]+\)/g, "").replace(/^[\w-]+:/, "");
      expect(literals.match(/\d/g)).toBeNull();
    }
  }
});

test("standard theme exports the exact shared utility fragment last", () => {
  expect(utilityStyles).toBeDefined();
  expect(standardTheme.cssText.lastIndexOf(".ui-font-mono")).toBeGreaterThan(
    standardTheme.cssText.lastIndexOf('data-meowui-part="assistant-view/root"'),
  );
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
