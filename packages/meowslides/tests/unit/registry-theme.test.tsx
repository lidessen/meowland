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
} from "meowtail/theme";
import { PresentationText, presentationTextContract, createMeowSlides } from "../../src/index";
import { meowSlidesComponents, installMeowSlides } from "../../src/registry";
import {
  presentationOptions,
  presentationTheme,
  presentationThemeStyles,
  presentationThemeTokens,
  presentationTokens,
} from "../../src/theme";

test("slides registry owns its contracts without registering or replacing shared UI", () => {
  expect(meowUIComponents.map((contract) => contract.name)).not.toContain("presentation");
  const runtime = createRuntime({ plugins: [createMeowUI()] });
  expect(runtime.registry.get("presentation")).toBeUndefined();
  const remove = installMeowSlides(runtime);
  for (const contract of meowSlidesComponents)
    expect(runtime.registry.get(contract.name)).toBe(contract);
  expect(runtime.registry.get("presentation-text")).toBe(presentationTextContract);
  remove();
  expect(runtime.registry.get("presentation-text")).toBeUndefined();
  expect(runtime.registry.get("button")).toBeDefined();
});

test("shared UI's style adapter also binds slides typography in the same runtime", () => {
  const runtime = createRuntime({ plugins: [createMeowUI(), createMeowSlides()] });
  const html = createWebRenderer(runtime).renderToHtml(
    <PresentationText effect="marker">One original text</PresentationText>,
  );
  expect(html).toContain('data-option-presentation-text-effect="marker"');
  expect(html).not.toContain(" effect=");
});

test("complete presentation theme reuses original shared options, tokens and fragments", () => {
  expect(presentationOptions).toBe(standardOptions);
  expect(presentationThemeTokens).toContain(uiTokens);
  expect(presentationThemeTokens).toContain(presentationTokens);
  for (const group of standardThemeTokens) expect(presentationThemeTokens).toContain(group);
  for (const fragment of standardThemeStyles) expect(presentationThemeStyles).toContain(fragment);
  expect(presentationTheme.defaults).toEqual(standardTheme.defaults);
  expect(presentationTheme.cssText).toContain('data-meowui-part="button/root"');
  expect(presentationTheme.cssText).toContain('data-meowui-part="presentation/slide"');
  expect(standardTheme.cssText).not.toContain('data-meowui-part="presentation/slide"');
});
