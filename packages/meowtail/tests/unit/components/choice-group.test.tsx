import { expect, test } from "bun:test";
import { createRuntime, h, type Props } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import { ChoiceGroup } from "../../../src/components/choice-group";
import { mountComponent } from "./mount";

const options = [
  { value: "draft", label: "Keep the draft for now", description: "Not published" },
  { value: "review", label: "Send for review" },
  { value: "locked", label: "Currently unavailable", disabled: true },
];

test("choice group preserves fieldset, legend and native radios without theme", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <ChoiceGroup
      id="delivery"
      name="delivery"
      form="review-form"
      label="Choose a delivery method"
      options={options}
      defaultValue="review"
      required
      aria-describedby="help"
    />,
  );
  expect(html).toContain('<fieldset aria-describedby="help" id="delivery" form="review-form">');
  expect(html).toContain("<legend>Choose a delivery method</legend>");
  expect(html.match(/type="radio"/g)).toHaveLength(3);
  expect(html.match(/name="delivery"/g)).toHaveLength(3);
  expect(html).toContain('value="review" checked required');
  expect(html).toContain('value="locked" disabled required');
  expect(html).toContain('aria-describedby="delivery-description-0"');
  expect(html).toContain('<span id="delivery-description-0">Not published</span>');
  expect(html).not.toContain('role="radio"');
});

test("hidden legend stays named and disabled groups retain native disabled semantics", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <ChoiceGroup label="Select an option" options={options} hideLabel disabled />,
  );
  expect(html).toContain('<legend data-hidden="true">Select an option</legend>');
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
    const view = mountComponent(
      <ChoiceGroup
        label="Delivery method"
        options={options}
        defaultValue="draft"
        value={controlled ? value : undefined}
        onValueChange={(next) => changes.push(next)}
      />,
      runtime,
    );
    try {
      const input = view.host.querySelector<HTMLInputElement>('input[value="review"]')!;
      input.checked = true;
      (radios.get("review")!.onChange as (event: Event) => void)({
        currentTarget: input,
      } as unknown as Event);
      expect(changes).toEqual(["review"]);
      expect(input.checked).toBe(!controlled);
      (radios.get("locked")!.onChange as (event: Event) => void)({
        currentTarget: view.host.querySelector('input[value="locked"]'),
      } as unknown as Event);
      expect(changes).toEqual(["review"]);
    } finally {
      view.unmount();
    }
  }
});
