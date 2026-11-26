import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import { Button } from "../../../src/components/button";
import { createMeowUI } from "../../../src/registry";

test("Button keeps form semantics by default and applies the same parts to navigation", () => {
  const runtime = createRuntime();
  runtime.use(createMeowUI({ components: [Button] }));
  const web = createWebRenderer(runtime);
  const submit = web.renderToHtml(<Button type="submit">Submit</Button>);
  const destination = web.renderToHtml(
    <Button href="/guide/" size="large">
      Guide
    </Button>,
  );
  const inactive = web.renderToHtml(
    <Button href="/guide/" disabled={signal(true)}>
      Unavailable
    </Button>,
  );
  expect(submit).toMatch(/<button[^>]*type="submit"/);
  expect(destination).toMatch(/<a[^>]*href="\/guide\/"/);
  expect(destination).toContain('data-meowui-part="button/root"');
  expect(destination).not.toContain("type=");
  expect(inactive).toContain('role="link"');
  expect(inactive).toContain('aria-disabled="true"');
  expect(inactive).not.toContain("href=");
});
