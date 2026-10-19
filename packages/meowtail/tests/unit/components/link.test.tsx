import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Link, ResourceLink, installMeowUI } from "../../../src/index";

test("an inline link is an anchor, not a whole-row resource reference", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const html = createWebRenderer(runtime).renderToHtml(
    <p>
      See the <Link href="https://example.com/docs">docs</Link>.
      <ResourceLink href="https://example.com/file" title="File" detail="docs/file" />
    </p>,
  );
  expect(html).toContain('href="https://example.com/docs"');
  expect(html).toContain('data-meowui-part="link/root"');
  expect(html).toContain('data-meowui-part="resource-link/root"');
  expect(html).not.toContain('data-meowui-part="link/root" data-meowui-part="resource-link');
});
