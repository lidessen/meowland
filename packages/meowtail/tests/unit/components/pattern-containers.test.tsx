import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { ActionRail, Button, Icon, IconButton, MetaRow, installMeowUI } from "meowtail";

function web() {
  const runtime = createRuntime();
  installMeowUI(runtime);
  return createWebRenderer(runtime);
}

test("ActionRail keeps leading, trailing and submit in named parts", () => {
  const html = web().renderToHtml(
    <ActionRail
      aria-label="Composer actions"
      role="group"
      leading={<Button>Add</Button>}
      trailing={<Button variant="quiet">Review</Button>}
      submit={
        <IconButton label="Send">
          <Icon name="arrow-up" />
        </IconButton>
      }
    />,
  );
  expect(html).toContain('aria-label="Composer actions"');
  expect(html).toContain('role="group"');
  for (const part of ["root", "leading", "trailing", "submit"])
    expect(html).toContain(`data-meowui-part="action-rail/${part}"`);
  expect(html.indexOf("action-rail/leading")).toBeLessThan(html.indexOf("action-rail/trailing"));
  expect(html.indexOf("action-rail/trailing")).toBeLessThan(html.indexOf("action-rail/submit"));
});

test("MetaRow separates facts, exposes progress semantics and omits a separator on progress-only rows", () => {
  const app = web();
  const html = app.renderToHtml(
    <MetaRow
      align="center"
      progressTone="accent"
      items={[{ icon: <Icon name="refresh-cw" />, label: "7 turns" }, { label: "219 tok/s" }]}
      progress={45}
      progressLabel="Cache progress"
    />,
  );
  expect(html).toContain('data-meowui-part="meta-row/root"');
  expect(html).toContain("7 turns");
  expect(html).toContain("219 tok/s");
  expect(html).toContain('data-option-meta-row-align="center"');
  expect(html).toContain('data-option-meta-row-progress-tone="accent"');
  expect(html).toContain('role="progressbar"');
  expect(html).toContain('aria-valuenow="45"');
  expect(html).toContain('aria-label="Cache progress"');
  expect((html.match(/data-meowui-part="meta-row\/separator"/g) ?? []).length).toBe(2);
});

test("MetaRow with only progress adds no separator", () => {
  const html = web().renderToHtml(<MetaRow items={[]} progress={72} progressLabel="Budget" />);
  expect(html).toContain('role="progressbar"');
  expect(html).toContain('aria-valuenow="72"');
  expect(html).not.toContain('data-meowui-part="meta-row/separator"');
});

test("MetaRow omits non-finite progress without hiding facts or adding a separator", () => {
  for (const progress of [NaN, Infinity, -Infinity]) {
    const html = web().renderToHtml(<MetaRow items={[{ label: "Ready" }]} progress={progress} />);
    expect(html).toContain("Ready");
    expect(html).not.toContain('role="progressbar"');
    expect(html).not.toContain("--meta-progress");
    expect(html).not.toContain('data-meowui-part="meta-row/separator"');
  }
});

test("MetaRow rounds finite progress and clamps it to the accessible range", () => {
  for (const [progress, expected] of [
    [-5, 0],
    [45.6, 46],
    [101, 100],
  ]) {
    const html = web().renderToHtml(<MetaRow items={[]} progress={progress} />);
    expect(html).toContain(`aria-valuenow="${expected}"`);
    expect(html).toContain(`--meta-progress:${expected}%`);
  }
});
