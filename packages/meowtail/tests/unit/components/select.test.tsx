import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Field, Select, installMeowUI, meowUIComponents } from "../../../src/index";

test("Select preserves native form semantics and change callback without a runtime visual plugin", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
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
    <Field label="Delivery method" htmlFor="delivery" description="Review first">
      <Select id="delivery" name="delivery" value="review" required disabled onChange={onChange}>
        <option value="draft">Draft</option>
        <option value="review">Review</option>
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
