import { expect, test } from "bun:test";
import { createRuntime, h, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import {
  NumberInput,
  clampNumber,
  formatNumber,
  numberPrecision,
  installMeowUI,
  meowUIComponents,
} from "../../../src/index";

test("step precision and clamping format a committed number", () => {
  expect(numberPrecision(0.1)).toBe(1);
  expect(formatNumber(1.26, 1)).toBe("1.3");
  expect(clampNumber(12, 1, 10, 1, 1)).toBe(10);
  expect(clampNumber(0.24, 0, 1, 0.1, 0)).toBe(0.2);
});

test("number input names its steppers and shows a committed default", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const html = createWebRenderer(runtime).renderToHtml(
    <NumberInput id="copies" name="copies" defaultValue={2} min={1} max={12} />,
  );
  expect(html).toContain('id="copies"');
  expect(html).toContain('name="copies"');
  expect(html).toContain('aria-label="Decrease"');
  expect(html).toContain('aria-label="Increase"');
  expect(html).toContain('data-icon="minus"');
  expect(html).toContain('data-icon="plus"');
  expect(html).toContain('d="M5 12h14"');
  expect(html).toContain('d="M12 5v14"');
  expect(html).toContain('value="2"');
});

test("steppers notify the caller and clamp at the bounds", () => {
  const runtime = createRuntime();
  const buttons: Props[] = [];
  runtime.use({
    render({ vnode }, next) {
      if (vnode.type === "button") buttons.push(vnode.props);
      return next(vnode);
    },
  });
  const seen: Array<number | undefined> = [];
  createWebRenderer(runtime).renderToHtml(
    <NumberInput
      defaultValue={10}
      min={0}
      max={10}
      step={1}
      onValueChange={(next) => seen.push(next)}
    />,
  );
  (buttons[1]!.onClick as () => void)();
  (buttons[0]!.onClick as () => void)();
  expect(seen).toEqual([10, 9]);
});
