import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Autocomplete, Field, installMeowUI, meowUIComponents } from "../../../src/index";

function html(view: unknown) {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  return createWebRenderer(runtime).renderToHtml(view as never);
}

test("the input is a closed list combobox that keeps native form participation", () => {
  const output = html(
    <Autocomplete
      id="path"
      name="path"
      required
      defaultValue="src/"
      suggestions={[{ value: "src/index.ts" }]}
    />,
  );
  expect(output).toContain('id="path"');
  expect(output).toContain('role="combobox"');
  expect(output).toContain('aria-autocomplete="list"');
  expect(output).toContain('aria-expanded="false"');
  expect(output).toContain('aria-controls="path-list"');
  expect(output).toContain('name="path"');
  expect(output).toContain("required");
  expect(output).toContain('value="src/"');
  expect(output).not.toContain("aria-activedescendant");
  // Loading and empty text sit beside the listbox, never inside it.
  expect(output).toMatch(/<div id="path-list" role="listbox"[^>]*>.*<\/div><p role="status"/);
});

test("Field labels and describes the text input itself", () => {
  const output = html(
    <Field label="Path" description="Any path is valid">
      <Autocomplete suggestions={[]} />
    </Field>,
  );
  const id = /<label for="([^"]+)"/.exec(output)![1]!;
  const input = /<input [^>]*>/.exec(output)![0];
  expect(input).toContain(`id="${id}"`);
  expect(input).toContain(`aria-describedby="${id}-description"`);
});
