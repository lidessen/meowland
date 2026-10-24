import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { renderToHtmlWithRuntime } from "meowjsx/web";
import { createMeowUI, MermaidDiagram, meowUIComponents } from "meowtail";

test("server output shows the source as text and draws nothing", () => {
  const html = renderToHtmlWithRuntime(
    createRuntime({ plugins: [createMeowUI({ components: meowUIComponents })] }),
    h(MermaidDiagram, { title: "Release flow", source: "flowchart LR\n  A[Draft] --> B[Publish]" }),
  );
  expect(html).toContain('data-meowui-part="mermaid-diagram/root"');
  expect(html).toContain('data-state="source"');
  expect(html).toMatch(/data-meowui-part="mermaid-diagram\/source"[^>]*>flowchart LR/);
  expect(html).toContain("A[Draft] --&gt; B[Publish]");
  expect(html).toMatch(
    /<p[^>]*hidden[^>]*data-meowui-part="mermaid-diagram\/error"|data-meowui-part="mermaid-diagram\/error"[^>]*hidden/,
  );
  expect(html).not.toContain('<svg class="pele');
  expect(html).toContain("Copy source");
});
