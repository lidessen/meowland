import { expect, test } from "bun:test";
import { h, defaultRuntime } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { signal } from "meowjsx/signal";
import { Stat, installMeowUI, meowUIComponents } from "../../../src";

installMeowUI({ components: meowUIComponents }, defaultRuntime);

test("stat names its figure and keeps the supporting fact optional", () => {
  const html = renderToHtml(<Stat label="Active runs" value="3" detail="Across 2 projects" />);
  expect(html).toMatch(/data-meowui-part="stat\/label"[^>]*>Active runs</);
  expect(html).toMatch(/data-meowui-part="stat\/value"[^>]*>3</);
  expect(html).toContain("Across 2 projects");
  expect(html).not.toContain("<a");
  expect(renderToHtml(<Stat label="Goals" value="unknown" />)).not.toContain("stat/detail");
});

test("stat links to the records it counts and keeps a live figure", () => {
  const count = signal("4");
  const html = renderToHtml(<Stat href="/tasks" label="Open tasks" value={count} />);
  expect(html).toContain('<a href="/tasks"');
  expect(html).toContain(">4<");
});
