import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Button, ComposerPanel, MetaRow, installMeowUI, meowUIComponents } from "meowtail";

function web() {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  return createWebRenderer(runtime);
}

test("ComposerPanel keeps one ChatComposer surface with supporting hint and meta slots", () => {
  const html = web().renderToHtml(
    <ComposerPanel
      value="Draft"
      placeholder="Type a message"
      inputLabel="Message"
      hint="Use Send to submit"
      meta={<MetaRow items={[{ label: "45%" }]} progress={45} />}
    >
      <Button>Add</Button>
    </ComposerPanel>,
  );
  expect(html).toContain('data-meowui-part="composer-panel/root"');
  expect(html).toContain('data-meowui-part="composer-panel/surface"');
  expect(html).toContain('data-meowui-part="composer-panel/meta"');
  expect(html).toContain('data-meowui-part="chat-composer/root"');
  expect(html).toContain('data-option-chat-composer-surface="default"');
  expect(html.match(/data-meowui-part="chat-composer\/surface"/g)).toHaveLength(1);
  expect(html).not.toContain('data-option-chat-composer-surface="none"');
  expect(html.indexOf("Use Send to submit")).toBeLessThan(
    html.indexOf('data-meowui-part="composer-panel/meta"'),
  );
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
