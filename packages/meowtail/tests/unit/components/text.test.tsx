import { expect, test } from "bun:test";
import { createRuntime, h, signal } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { standardTheme } from "../../../src/theme/index";
import { Prose, Text, installMeowUI } from "../../../src/index";

function render(child: Parameters<ReturnType<typeof createWebRenderer>["renderToHtml"]>[0]) {
  const runtime = createRuntime();
  installMeowUI(runtime);
  return createWebRenderer(runtime).renderToHtml(child);
}

test("text is a paragraph in the body role unless the caller picks a role and element", () => {
  const html = render(
    <div>
      <Text>Body copy</Text>
      <Text variant="eyebrow" as="span">
        Group
      </Text>
    </div>,
  );
  expect(html).toContain(
    '<p data-meowui-part="text/root" data-option-text-variant="body">Body copy</p>',
  );
  expect(html).toContain(
    '<span data-meowui-part="text/root" data-option-text-variant="eyebrow">Group</span>',
  );
  expect(html).not.toMatch(/\s(?:variant|as)="/);
});

test("text roles accept a signal", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const variant = signal<"secondary" | "caption">("secondary");
  const host = createWebRenderer(runtime).renderToHtml(<Text variant={variant}>Note</Text>);
  expect(host).toContain('data-option-text-variant="secondary"');
});

test("prose wraps native reading content and caps the measure by default", () => {
  const html = render(
    <Prose as="article">
      <h2>Overview</h2>
      <p>Paragraph</p>
    </Prose>,
  );
  expect(html).toContain(
    '<article data-meowui-part="prose/root" data-option-prose-measure="reading">',
  );
  expect(render(<Prose measure="fill" />)).toContain('data-option-prose-measure="fill"');
});

test("prose, chat content and assistant markdown share one reading rhythm", () => {
  const css = standardTheme.cssText;
  expect(css).toContain("prose/root");
  expect(css).toContain("chat-message/content");
  expect(css).toContain("assistant-markdown/root");
  expect(css).toContain("--ui-measure");
  expect(css).toContain("--ui-prose-gap");
});
