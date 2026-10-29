import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { TokenField, installMeowUI, meowUIComponents } from "../../../src/index";

function html(view: unknown) {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  return createWebRenderer(runtime).renderToHtml(view as never);
}

test("tokens are a labelled list with one tab stop, named removals and submitted values", () => {
  const output = html(
    <TokenField
      id="to"
      name="to"
      listLabel="Recipients"
      tokens={[
        { id: "ada", label: "Ada Lovelace" },
        { id: "x", label: "x@example", invalid: true },
      ]}
      onAdd={() => {}}
      onRemove={() => {}}
    />,
  );
  expect(output).toContain('role="list" aria-label="Recipients"');
  expect(output).toContain('aria-label="Remove Ada Lovelace"');
  // The last token, nearest the draft, holds the single tab stop.
  expect(output.match(/tabindex="0"/g)).toHaveLength(1);
  expect(output).toMatch(/tabindex="0"[^>]*aria-label="Remove x@example"/);
  // Invalid state is part of the token's description, not aria-invalid on a button.
  expect(output).toContain('aria-describedby="to-token-x-invalid"');
  expect(output).not.toMatch(/<button[^>]*aria-invalid/);
  expect(output).toContain('<input type="hidden" name="to" value="ada">');
  expect(output).toContain('<input type="hidden" name="to" value="x">');
  expect(output).toMatch(/<input [^>]*id="to"/);
});
