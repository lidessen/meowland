import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Disclosure, installMeowUI } from "meowtail";

test("Disclosure retains native semantics and host slots through its stable part contract", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const web = createWebRenderer(runtime);
  const view = (
    <Disclosure
      summary="Execution details"
      open
      id="run-details"
      className="host"
      summaryClassName="host-summary"
      contentClassName="host-content"
    >
      <p>Check results</p>
    </Disclosure>
  );
  const html = web.renderToHtml(view);
  expect(html).toContain("<details");
  expect(html).toContain(" open");
  expect(html).toContain('<summary class="host-summary"');
  expect(html).toContain('class="host-content"');
  expect(html).toContain('data-meowui-part="disclosure/summary"');
  expect(html).toContain('id="run-details"');
});
