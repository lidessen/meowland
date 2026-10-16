import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Field, Select, installMeowUI } from "../../../src/index";

test("Select preserves native form semantics and change callback without a runtime visual plugin", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const onChange = (_event: Event) => {};
  let handler: unknown;
  runtime.use({
    render({ vnode }, next) {
      if (vnode.type === "select") handler = vnode.props.onChange;
      return next(vnode);
    },
  });
  const web = createWebRenderer(runtime);
  const view = (
    <Field label="交付方式" htmlFor="delivery" description="先审阅">
      <Select id="delivery" name="delivery" value="review" required disabled onChange={onChange}>
        <option value="draft">草稿</option>
        <option value="review">审阅</option>
      </Select>
    </Field>
  );
  const html = web.renderToHtml(view);
  expect(handler).toBe(onChange);
  expect(html).toContain('name="delivery"');
  expect(html).toContain('value="review"');
  expect(html).toContain("required disabled");
  expect(html).toContain('aria-describedby="delivery-description"');
  expect(html).toContain('data-meowui-part="select/root"');
});
