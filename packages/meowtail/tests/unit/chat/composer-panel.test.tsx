import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Button, ComposerPanel, MetaRow, installMeowUI } from "meowtail";

function web() {
  const runtime = createRuntime();
  installMeowUI(runtime);
  return createWebRenderer(runtime);
}

test("ComposerPanel owns the surface and meta slot while keeping ChatComposer behavior bare", () => {
  const html = web().renderToHtml(
    <ComposerPanel
      value="Draft"
      placeholder="Type a message"
      inputLabel="Message"
      meta={<MetaRow items={[{ label: "45%" }]} progress={45} />}
    >
      <Button>Add</Button>
    </ComposerPanel>,
  );
  expect(html).toContain('data-meowui-part="composer-panel/root"');
  expect(html).toContain('data-meowui-part="composer-panel/surface"');
  expect(html).toContain('data-meowui-part="composer-panel/meta"');
  expect(html).toContain('data-meowui-part="chat-composer/root"');
  expect(html).toContain('data-option-chat-composer-surface="none"');
  expect(html).toContain('data-meowui-part="meta-row/root"');
  expect(html).toContain("Draft");
});

test("ComposerPanel disabled composer remains one composition", () => {
  const html = web().renderToHtml(
    <ComposerPanel value="" placeholder="Type a message" disabled submitDisabled />,
  );
  expect(html).toContain("disabled");
  expect(html).not.toContain('data-meowui-part="composer-panel/meta"');
  expect(html).toContain('data-meowui-part="chat-composer/submit"');
});
