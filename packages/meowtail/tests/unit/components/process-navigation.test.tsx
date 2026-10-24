import { expect, test } from "bun:test";
import { h, defaultRuntime } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { IconRail } from "../../../src/components/icon-rail";
import { ProcessGroup } from "../../../src/components/process-group";
import { ProcessStep } from "../../../src/components/process-step";
import { RailItem } from "../../../src/components/rail-item";
import { RailSection } from "../../../src/components/rail-section";
import { StatusDot, statusDotOptions } from "../../../src/components/status-dot";
import { Tag } from "../../../src/components/tag";
import { WorkCard } from "../../../src/components/work-card";
import { installMeowUI, meowUIComponents } from "../../../src/registry";

installMeowUI({ components: meowUIComponents }, defaultRuntime);

test("status dots are decorative and carry exactly one state", () => {
  for (const state of statusDotOptions.axes.state) {
    const html = renderToHtml(<StatusDot state={state} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain(`data-option-status-dot-state="${state}"`);
  }
  const halo = renderToHtml(<StatusDot state="processing" halo size={10} />);
  expect(halo).toContain('data-halo="true"');
  expect(halo).toContain("--status-dot-size");
  expect(halo).toContain("10px");
});

test("tags are static spans; count and path are separate kinds", () => {
  const html = renderToHtml(
    <Tag kind="count" tone="warning">
      1
    </Tag>,
  );
  expect(html).toContain("<span");
  expect(html).toContain('data-option-tag-kind="count"');
  expect(html).toContain('data-option-tag-tone="warning"');
});

test("process group keeps native details and one row per step", () => {
  const html = renderToHtml(
    <ProcessGroup title="Process · 2 steps" status="Completed" trailing="4.2s" open>
      <ProcessStep meta="1.1s">Read file</ProcessStep>
    </ProcessGroup>,
  );
  expect(html).toContain("<details");
  expect(html).toContain("<summary");
  expect(html).toContain(" open");
  expect(html).toContain("Process · 2 steps");
  expect(html).toContain("1.1s");
  expect(html).toContain("4.2s");
});

test("work card is one native button with a status dot and an open affordance", () => {
  const html = renderToHtml(
    <WorkCard
      title="Organize records"
      state="returned"
      status="In progress"
      detail="1 outcome linked"
    />,
  );
  expect(html.startsWith("<button")).toBe(true);
  expect(html).toContain('type="button"');
  expect(html).toContain('data-option-status-dot-state="returned"');
  expect(html).toContain("1 outcome linked");
  expect(html).toContain("Details");
});

test("rail items are routes or actions and keep the current location semantic", () => {
  const route = renderToHtml(
    <RailItem href="/records" current icon="i" label="Memory and knowledge" />,
  );
  expect(route.startsWith("<a")).toBe(true);
  expect(route).toContain('aria-current="page"');
  const action = renderToHtml(<RailItem icon="i" label="Settings" />);
  expect(action.startsWith("<button")).toBe(true);
  expect(action).not.toContain("aria-current");
});

test("rail section folds into a shortcut while keeping all destinations in the document", () => {
  const html = renderToHtml(
    <IconRail label="Main navigation">
      <RailSection label="Extensions" icon="i" href="/extensions">
        <RailItem href="/extensions?view=channels" icon="i" label="Communication" />
      </RailSection>
    </IconRail>,
  );
  expect(html).toContain('aria-label="Main navigation"');
  expect(html).toContain('href="/extensions"');
  expect(html).toContain('href="/extensions?view=channels"');
  expect(html).toContain('role="group"');
});
