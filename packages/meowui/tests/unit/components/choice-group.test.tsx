import { expect, test } from "bun:test";
import { createRuntime, h, signal, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { ChoiceGroup } from "../../../src/components/choice-group";

const options = [
  { value: "draft", label: "先保留草稿", description: "不会发布" },
  { value: "review", label: "送交审阅" },
  { value: "locked", label: "暂不可用", disabled: true },
];

test("choice group preserves fieldset, legend and native radios without theme", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <ChoiceGroup
      id="delivery"
      name="delivery"
      form="review-form"
      label="选择交付方式"
      options={options}
      defaultValue="review"
      required
      aria-describedby="help"
    />,
  );
  expect(html).toContain('<fieldset aria-describedby="help" id="delivery" form="review-form">');
  expect(html).toContain("<legend>选择交付方式</legend>");
  expect(html.match(/type="radio"/g)).toHaveLength(3);
  expect(html.match(/name="delivery"/g)).toHaveLength(3);
  expect(html).toContain('value="review" checked required');
  expect(html).toContain('value="locked" disabled required');
  expect(html).toContain('aria-describedby="delivery-description-0"');
  expect(html).toContain('<span id="delivery-description-0">不会发布</span>');
  expect(html).not.toContain('role="radio"');
});

test("hidden legend stays named and disabled groups retain native disabled semantics", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <ChoiceGroup label="请选择" options={options} hideLabel disabled />,
  );
  expect(html).toContain('<legend data-hidden="true">请选择</legend>');
  expect(html).toContain(" disabled>");
  expect(html.match(/type="radio"[^>]*disabled/g)).toHaveLength(3);
});

test("uncontrolled selection updates while a controlled caller can reject native selection", () => {
  for (const controlled of [false, true]) {
    const runtime = createRuntime();
    const radios = new Map<string, Props>();
    const changes: string[] = [];
    runtime.use({
      render({ vnode }, next) {
        if (vnode.type === "input") radios.set(String(vnode.props.value), vnode.props);
        return next(vnode);
      },
    });
    const value = signal("draft");
    createWebRenderer(runtime).renderToHtml(
      <ChoiceGroup
        label="交付方式"
        options={options}
        defaultValue="draft"
        value={controlled ? value : undefined}
        onValueChange={(next) => changes.push(next)}
      />,
    );
    const input = { checked: true } as HTMLInputElement;
    (radios.get("review")!.ref as (input: HTMLInputElement) => void)(input);
    input.checked = true;
    (radios.get("review")!.onChange as (event: Event) => void)({
      currentTarget: input,
    } as unknown as Event);
    expect(changes).toEqual(["review"]);
    expect(input.checked).toBe(!controlled);
    (radios.get("locked")!.onChange as (event: Event) => void)({
      currentTarget: { checked: true },
    } as unknown as Event);
    expect(changes).toEqual(["review"]);
  }
});
