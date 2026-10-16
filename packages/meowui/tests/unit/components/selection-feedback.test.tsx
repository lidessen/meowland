import { expect, test } from "bun:test";
import { createRuntime, h, signal, unwrap, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { SegmentedControl } from "../../../src/components/segmented-control";
import { TextShimmer } from "../../../src/components/text-shimmer";
import { RiskConfirmation } from "../../../src/components/risk-confirmation";
test("segmented choices are radios and refuse disabled or unchanged requests", () => {
  const runtime = createRuntime();
  const inputs: Props[] = [];
  const values: string[] = [];
  runtime.use({
    render({ vnode }, next) {
      if (vnode.props.type === "radio") inputs.push(vnode.props);
      return next(vnode);
    },
  });
  const html = createWebRenderer(runtime).renderToHtml(
    <SegmentedControl
      id="choice"
      label="模式"
      value="a"
      onValueChange={(value) => values.push(value)}
      options={[
        { value: "a", label: "A" },
        { value: "b", label: "B", disabled: true },
        { value: "c", label: "C" },
      ]}
    />,
  );
  expect(html).not.toContain('role="tab"');
  expect(html).toContain("模式");
  for (const input of inputs)
    (input.onChange as (event: Event) => void)({
      currentTarget: { checked: true },
    } as unknown as Event);
  expect(values).toEqual(["c"]);
});
test("shimmer keeps its accessible text and marks the copy inert", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <TextShimmer text="处理内容" active />,
  );
  expect(html).toContain('data-active="true"');
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain("inert");
  expect(html.match(/处理内容/g)?.length).toBe(2);
});

test("external form and field name reach every segmented radio", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <SegmentedControl
      id="display"
      name="mode"
      form="owner"
      label="模式"
      value="a"
      onValueChange={() => {}}
      options={[
        { value: "a", label: "A" },
        { value: "b", label: "B" },
      ]}
    />,
  );
  expect(html.match(/form="owner"/g)?.length).toBe(3);
  expect(html.match(/name="mode"/g)?.length).toBe(2);
});
test("nested shimmer fragments share one inert sweep", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <TextShimmer active>
      <TextShimmer text="正在检查" />
      {" · "}
      <TextShimmer text="src" />
    </TextShimmer>,
  );
  expect(html.match(/aria-hidden="true"/g)?.length).toBe(1);
  expect(html.match(/data-active="true"/g)?.length).toBe(1);
  expect(html.match(/正在检查/g)?.length).toBe(2);
});
test("confirmation only reports confirm after host acknowledgement and while enabled", () => {
  const runtime = createRuntime();
  const buttons: Props[] = [];
  let confirmed = 0;
  const acknowledged = signal(false);
  const disabled = signal(false);
  runtime.use({
    render({ vnode }, next) {
      if (vnode.type === "button") buttons.push(vnode.props);
      return next(vnode);
    },
  });
  createWebRenderer(runtime).renderToHtml(
    <RiskConfirmation
      id="risk"
      open={false}
      title="确认"
      description="描述"
      acknowledgeLabel="已了解"
      cancelLabel="取消"
      confirmLabel="继续"
      acknowledged={acknowledged}
      disabled={disabled}
      onAcknowledgedChange={() => {}}
      onCancel={() => {}}
      onConfirm={() => {
        confirmed++;
      }}
    />,
  );
  const confirm = buttons.at(-1)!;
  expect(unwrap(confirm.disabled)).toBe(true);
  (confirm.onClick as () => void)();
  expect(confirmed).toBe(0);
  acknowledged.value = true;
  (confirm.onClick as () => void)();
  expect(confirmed).toBe(1);
  disabled.value = true;
  (confirm.onClick as () => void)();
  expect(confirmed).toBe(1);
});
