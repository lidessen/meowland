import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { createMeowUI, meowUIComponents } from "meowtail";
import {
  standardOptions,
  standardTheme,
  standardThemeStyles,
  standardThemeTokens,
  uiTokens,
  ui,
  utilityStyles,
} from "meowtail/theme";
import { PresentationText, createMeowSlides } from "../../src/index";
import { meowSlidesComponents, installMeowSlides } from "../../src/registry";
import {
  presentationOptions,
  presentationTheme,
  presentationThemeStyles,
  presentationThemeTokens,
  presentationTokens,
} from "../../src/theme";

test("slides registers component implementations and leaves the shared UI registration intact", () => {
  const runtime = createRuntime({ plugins: [createMeowUI({ components: meowUIComponents })] });
  expect(runtime.registry.get("presentation")).toBeUndefined();
  const remove = installMeowSlides(runtime);
  for (const component of meowSlidesComponents)
    expect(runtime.registry.get(component.meta!.name)).toBe(component);
  expect(runtime.registry.get("presentation-text")).toBe(PresentationText);
  remove();
  expect(runtime.registry.get("presentation-text")).toBeUndefined();
  expect(runtime.registry.get("button")).toBeDefined();
});

test("shared UI style adapter binds slides typography in the same runtime", () => {
  const runtime = createRuntime({
    plugins: [createMeowUI({ components: meowUIComponents }), createMeowSlides()],
  });
  const html = createWebRenderer(runtime).renderToHtml(
    <PresentationText effect="marker">One original text</PresentationText>,
  );
  expect(html).toContain('data-option-presentation-text-effect="marker"');
  expect(html).not.toContain(" effect=");
});

test("complete presentation theme reuses the original catalog, tokens and fragments", () => {
  expect(presentationOptions).toBe(standardOptions);
  expect(presentationThemeTokens).toContain(uiTokens);
  expect(presentationThemeTokens).toContain(presentationTokens);
  for (const group of standardThemeTokens) expect(presentationThemeTokens).toContain(group);
  expect(presentationThemeStyles[0]).toBe(standardThemeStyles[0]);
  expect(presentationThemeStyles.at(-1)).toBe(utilityStyles);
  expect(presentationThemeStyles.filter((fragment) => fragment === utilityStyles)).toHaveLength(1);
  for (const fragment of standardThemeStyles)
    if (fragment !== utilityStyles) expect(presentationThemeStyles).toContain(fragment);
  expect(String(ui.p.panel)).toBe("ui-p-panel");
  expect(presentationTheme.defaults).toEqual(standardTheme.defaults);
  expect(presentationTheme.cssText).toContain('data-meowui-part="button/root"');
  expect(presentationTheme.cssText).toContain('data-meowui-part="presentation/slide"');
  expect(standardTheme.cssText).not.toContain('data-meowui-part="presentation/slide"');
});
