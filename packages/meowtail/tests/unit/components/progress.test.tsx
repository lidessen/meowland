import { expect, test } from "bun:test";
import { createRuntime, h, signal } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Progress, installMeowUI, meowUIComponents } from "../../../src/index";

function html(view: unknown) {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  return createWebRenderer(runtime).renderToHtml(view as never);
}

test("determinate progress uses native semantics and keeps the accessible name", () => {
  const output = html(<Progress label="Reviewed 2 of 5 files" value={2} max={5} />);
  expect(output).toContain("<progress");
  expect(output).toContain('value="2"');
  expect(output).toContain('max="5"');
  expect(output).toContain('aria-label="Reviewed 2 of 5 files"');
  expect(output).toContain('data-meowui-part="progress/root"');
  expect(output).toContain('data-meowui-part="progress/bar"');
});

test("omitting value leaves an indeterminate native progress", () => {
  const output = html(<Progress label="Connecting" />);
  expect(output).toContain("<progress");
  expect(output).toContain('aria-label="Connecting"');
  expect(output).not.toContain(" value=");
});

test("progress values accept signals", () => {
  const value = signal(1);
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const app = createWebRenderer(runtime);
  const view = <Progress label="Copying" value={value} max={4} />;
  expect(app.renderToHtml(view)).toContain('value="1"');
  value.value = 3;
  expect(app.renderToHtml(view)).toContain('value="3"');
});
