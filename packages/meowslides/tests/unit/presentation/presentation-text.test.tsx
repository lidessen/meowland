import { expect, test } from "bun:test";
import { createRuntime, h, signal } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { PresentationText } from "../../../src/presentation/presentation-text";
import { createMeowUI, meowUIComponents } from "meowtail";
import { createMeowSlides } from "../../../src/registry";

test("presentation text preserves one semantic, native text source", () => {
  const runtime = createRuntime({
    plugins: [createMeowUI({ components: meowUIComponents }), createMeowSlides()],
  });
  // Mixed-script payload is intentional: verifies text splitting across scripts.
  const text = signal("A clear idea / 清楚的想法");
  const html = createWebRenderer(runtime).renderToHtml(
    <PresentationText
      as="h1"
      effect="marker"
      id="editable-title"
      contentEditable
      aria-label="Slide title"
    >
      {text}
    </PresentationText>,
  );
  expect(html).toContain("<h1");
  expect(html).toContain('id="editable-title"');
  expect(html).toMatch(/contenteditable(?:\s|>)/i);
  expect(html).toContain('aria-label="Slide title"');
  expect(html.split("A clear idea / 清楚的想法")).toHaveLength(2);
  expect(html).not.toContain("aria-hidden");
  expect(html).not.toContain(" effect=");
});

test("presentation text defaults to an inline source without owning its text or scale", () => {
  const html = createWebRenderer(
    createRuntime({
      plugins: [createMeowUI({ components: meowUIComponents }), createMeowSlides()],
    }),
  ).renderToHtml(
    // Mixed-script payload is intentional: verifies text splitting across scripts.
    <PresentationText lang="zh-CN">
      一个想法 <em>one idea</em>
    </PresentationText>,
  );
  expect(html).toStartWith("<span");
  expect(html).toContain('lang="zh-CN"');
  expect(html).toContain("<em>one idea</em>");
  expect(html).not.toContain("font-size");
});
