import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Toast } from "../../../src/components/toast";
test("toast announces routine feedback politely and preserves caller actions", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <Toast message="已保存" actions={<button>撤销</button>} />,
  );
  expect(html).toContain('role="status"');
  expect(html).toContain('aria-atomic="true"');
  expect(html).toContain("<button>撤销</button>");
});
test("toast urgency is explicitly chosen by the host", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <Toast role="alert" message="保存失败" />,
  );
  expect(html).toContain('role="alert"');
});
