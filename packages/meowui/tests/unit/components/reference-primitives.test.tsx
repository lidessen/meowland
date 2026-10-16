import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { PathLabel } from "../../../src/components/path-label";
import { ShortcutKeys } from "../../../src/components/shortcut-keys";
import { StateDot } from "../../../src/components/state-dot";
import { HoverCard } from "../../../src/components/hover-card";

test("path label preserves POSIX and Windows names and never creates a link", () => {
  const web = createWebRenderer(createRuntime());
  for (const path of ["src/components/menu.tsx", "C:\\work\\menu.tsx", "menu.tsx"]) {
    const html = web.renderToHtml(<PathLabel path={path} />);
    expect(html).toContain(`title="${path}"`);
    expect(html).toContain(">menu.tsx</span>");
    expect(html).not.toContain("href=");
  }
});
test("shortcut keys preserve host platform labels and distinguish the separator", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <ShortcutKeys keys={["Ctrl", "+", "S"]} variant="tooltip" />,
  );
  expect(html).toContain('data-separator="true"');
  expect(html).toContain(">Ctrl</kbd>");
  expect(html).toContain(">S</kbd>");
});
test("state marks remain decorative and distinguish active motion from a completed step", () => {
  const web = createWebRenderer(createRuntime());
  const ongoing = web.renderToHtml(<StateDot state="ongoing" />);
  expect(ongoing).toContain('aria-hidden="true"');
  expect(ongoing).toContain('data-state="ongoing"');
  expect(web.renderToHtml(<StateDot state="done" appearance="step" />)).toContain("<svg");
});
test("hover card keeps owner content available and its accessible trigger initially closed", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <HoverCard
      id="preview"
      disabled
      trigger={(bindings) => <button {...bindings}>预览</button>}
      content={<p>宿主内容</p>}
    />,
  );
  expect(html).toContain("宿主内容");
  expect(html).toContain('aria-controls="preview"');
  expect(html).toContain('aria-expanded="false"');
});
