import { expect, test } from "bun:test";
import { createRuntime, h, signal, unwrap, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { ChoiceSelect } from "../../../src/components/choice-select";

const options = [
  { value: "draft", label: "Keep draft", group: "Local" },
  { value: "review", label: "Submit for review", group: "Remote" },
  { value: "locked", label: "Currently unavailable", disabled: true },
];

test("unthemed choices retain native form validation and caller labelling", () => {
  const web = createWebRenderer(createRuntime());
  const html = web.renderToHtml(
    <ChoiceSelect
      id="delivery"
      name="delivery"
      options={options}
      defaultValue="review"
      required
      aria-labelledby="delivery-label"
      aria-describedby="delivery-help"
    />,
  );
  expect(html).toContain('name="delivery"');
  expect(html).toContain('value="review" required');
  expect(html).toContain('aria-labelledby="delivery-label"');
  expect(html).toContain('aria-describedby="delivery-help delivery-value delivery-validation"');
  expect(html).toContain('id="delivery-validation" role="alert"');
  expect(html).toContain('<option value="locked" disabled>');
});

test("uncontrolled selection updates the form value while controlled selection remains caller-owned", () => {
  for (const controlled of [false, true]) {
    const runtime = createRuntime();
    const clicked = new Map<string, () => void>();
    let native: Props = {};
    const changes: string[] = [];
    runtime.use({
      render({ vnode }, next) {
        if (vnode.type === "select") native = vnode.props;
        if (vnode.props.role === "option")
          clicked.set(
            String(unwrap(vnode.props["data-choice-index"])),
            vnode.props.onClick as () => void,
          );
        return next(vnode);
      },
    });
    const value = signal("draft");
    createWebRenderer(runtime).renderToHtml(
      <ChoiceSelect
        options={options}
        defaultValue="draft"
        value={controlled ? value : undefined}
        onValueChange={(next) => changes.push(next)}
      />,
    );
    clicked.get("1")!();
    expect(changes).toEqual(["review"]);
    expect(unwrap(native.value)).toBe(controlled ? "draft" : "review");
    clicked.get("2")!();
    expect(changes).toEqual(["review"]);
  }
});
