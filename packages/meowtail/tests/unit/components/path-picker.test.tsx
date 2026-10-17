import { expect, test } from "bun:test";
import { createRuntime, h, signal, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Field, PathPicker, installMeowUI, type PathPickerProps } from "../../../src/index";

function fixture(options: Partial<PathPickerProps> = {}) {
  const runtime = createRuntime();
  installMeowUI(runtime);
  let input: Props = {};
  let button: Props = {};
  let status: unknown;
  runtime.use({
    render({ vnode }, next) {
      if (vnode.type === "input") input = vnode.props;
      if (vnode.type === "button") button = vnode.props;
      if (vnode.props.role === "status")
        status = Array.isArray(vnode.props.children)
          ? vnode.props.children[0]
          : vnode.props.children;
      return next(vnode);
    },
  });
  const value = signal("/original");
  const html = createWebRenderer(runtime).renderToHtml(
    <Field label="Directory" htmlFor="directory" description="Local path">
      <PathPicker
        id="directory"
        label="Directory"
        value={value}
        onValueChange={(next) => {
          value.value = next;
        }}
        {...options}
      />
    </Field>,
  );
  return { input, button, html, value, status };
}

test("manual path editing retains Field associations without a chooser", () => {
  const view = fixture();
  expect(view.html).not.toContain("<button");
  expect(view.input["aria-describedby"]).toBe("directory-description directory-picker-status");
  (view.input.onInput as (event: unknown) => void)({ target: { value: "/manual" } });
  expect(view.value.value).toBe("/manual");
});
