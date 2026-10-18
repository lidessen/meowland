import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Alert, installMeowUI } from "meowtail";

function web() {
  const runtime = createRuntime();
  installMeowUI(runtime);
  return createWebRenderer(runtime);
}

test("Alert bar is one compact status line with an end action", () => {
  const html = web().renderToHtml(
    <Alert layout="bar" tone="warning" actions={<button type="button">View receipt</button>}>
      Last submission unverified; draft kept.
    </Alert>,
  );
  expect(html).toContain('data-option-alert-layout="bar"');
  expect(html).toContain('data-option-alert-tone="warning"');
  expect(html).toContain('role="status"');
  expect(html).toContain('data-meowui-part="alert/body"');
  expect(html).toContain('data-meowui-part="alert/actions"');
  expect(html).toContain("View receipt");
});

test("Alert layout defaults to the block form", () => {
  const html = web().renderToHtml(<Alert title="Saved">Draft kept.</Alert>);
  expect(html).toContain('data-option-alert-layout="block"');
  expect(html).toContain('data-meowui-part="alert/title"');
});
