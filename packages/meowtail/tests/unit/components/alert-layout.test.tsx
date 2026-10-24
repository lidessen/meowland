import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Alert, installMeowUI, meowUIComponents } from "meowtail";
import { standardTheme } from "../../../src/theme";

function web() {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
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
  expect(html).toContain('data-option-alert-marker="dot"');
  expect(html).toContain('role="status"');
  expect(html).toContain('data-meowui-part="alert/body"');
  expect(html).toContain('data-meowui-part="alert/actions"');
  expect(html).toContain("View receipt");
});

test("a neutral bar can omit the status dot", () => {
  const html = web().renderToHtml(
    <Alert layout="bar" tone="neutral" marker="none">
      Saved on this device only.
    </Alert>,
  );
  expect(html).toContain('data-option-alert-tone="neutral"');
  expect(html).toContain('data-option-alert-marker="none"');
  expect(html).toContain('role="status"');
  expect(standardTheme.cssText).toContain('[data-option-alert-tone="neutral"]');
  expect(standardTheme.cssText).toContain('[data-option-alert-marker="none"]');
  expect(standardTheme.cssText).toContain("content: none");
});

test("Alert layout defaults to the block form", () => {
  const html = web().renderToHtml(<Alert title="Saved">Draft kept.</Alert>);
  expect(html).toContain('data-option-alert-layout="block"');
  expect(html).toContain('data-meowui-part="alert/title"');
});
