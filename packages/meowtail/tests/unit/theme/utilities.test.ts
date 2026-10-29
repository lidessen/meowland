import { describe, expect, test } from "bun:test";
import { cx, type ClassValue } from "meowcss";
import { css } from "meowcss/meowjsx";
import {
  standardFoundationStyles,
  standardThemeStyles,
  standardTheme,
  extendStandardTheme,
  ui,
  uiTokens,
  utilityStyles,
} from "meowtail/theme";

const declarations = (value: ClassValue) =>
  css`
    ${value}
  `.text;

describe("built-in theme utility values", () => {
  test("uses stable class names and retains declarations when composed", () => {
    expect(String(ui.p.group)).toBe("ui-p-group");
    expect(String(ui.bg.fill)).toBe("ui-bg-fill");
    expect(String(ui.radius.lg)).toBe("ui-radius-lg");
    const composed = cx(ui.p.group, [false, ui.bg.fill], ui.radius.lg);
    expect(String(composed)).toBe("ui-p-group ui-bg-fill ui-radius-lg");
    const expanded = declarations(composed);
    expect(expanded).toContain(`padding: ${uiTokens.space.group};`);
    expect(expanded).toContain(`background-color: ${uiTokens.surface.fill};`);
    expect(expanded).toContain(`border-radius: ${uiTokens.radius.lg};`);
  });

  test("surface and text utility declarations preserve complete token roles", () => {
    const raised = declarations(ui.surface.raised);
    expect(raised).toContain(`border: ${uiTokens.line.width} solid ${uiTokens.line.edge};`);
    expect(raised).toContain(`border-radius: ${uiTokens.radius.xl};`);
    expect(raised).toContain(`background: ${uiTokens.surface.raised};`);
    expect(raised).toContain(`box-shadow: ${uiTokens.shadow.raised};`);
    expect(raised).toContain(`--meowui-focus-halo: ${uiTokens.surface.raised};`);
    expect(declarations(ui.surface.fill)).not.toContain(uiTokens.line.edge.name);
    expect(declarations(ui.text.eyebrow)).toContain(`text-transform: uppercase;`);
    expect(declarations(ui.text.title)).toContain(
      `letter-spacing: ${uiTokens.type.trackingTight};`,
    );
  });

  test("all interaction values keep hover gates, focus, disabled and reduced motion", () => {
    const values = [
      ui.interactive.flat,
      ui.interactive.raised,
      ui.interactive.flatShadow,
      ui.interactive.raisedShadow,
    ];
    for (const value of values) {
      const text = declarations(value);
      expect(text).toContain("@media (hover: hover)");
      expect(text).toContain("&:focus-visible");
      expect(text).toContain('&:is(:disabled, [aria-disabled="true"])');
      expect(text).toContain("@media (prefers-reduced-motion: reduce)");
    }
    expect(declarations(ui.interactive.flat)).toContain("background-color:");
    expect(declarations(ui.interactive.raised)).toContain("background-image: linear-gradient(");
    expect(declarations(ui.interactive.flatShadow)).toContain(
      `box-shadow: ${uiTokens.shadow.pressed};`,
    );
    expect(declarations(ui.interactive.raisedShadow)).toContain(
      "background-image: linear-gradient(",
    );
  });

  test("the theme root turns off the browser tap highlight for every part and host element", () => {
    expect(standardTheme.cssText).toMatch(
      /:where\(\[data-meowui-theme-root="meowui"\]\)\s*\{\s*-webkit-tap-highlight-color: transparent;/,
    );
  });

  test("the standard and extended assemblies share one utility fragment last", () => {
    expect(standardThemeStyles[0]).toBe(standardFoundationStyles);
    expect(standardThemeStyles.at(-1)).toBe(utilityStyles);
    expect(standardTheme.cssText.indexOf('data-meowui-part="assistant-view/root"')).toBeLessThan(
      standardTheme.cssText.indexOf(".ui-p-group"),
    );

    const extension = css`
      .extension-marker {
        color: red;
      }
    `;
    const extended = extendStandardTheme({ styles: [extension] });
    expect(extended.cssText.indexOf(".extension-marker")).toBeLessThan(
      extended.cssText.indexOf(".ui-p-group"),
    );
    expect(extended.cssText.match(/\.ui-p-group\s*\{/g)).toHaveLength(1);
  });
});
