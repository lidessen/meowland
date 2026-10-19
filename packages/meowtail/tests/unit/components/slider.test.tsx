import { expect, test } from "bun:test";
import { createRuntime, h, signal, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Slider, installMeowUI } from "../../../src/index";

test("slider exposes a named native range and the same visible value", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const html = createWebRenderer(runtime).renderToHtml(
    <Slider id="volume" label="Volume" defaultValue={40} min={0} max={100} step={5} />,
  );
  expect(html).toContain('type="range"');
  expect(html).toContain('aria-label="Volume"');
  expect(html).toContain('min="0"');
  expect(html).toContain('max="100"');
  expect(html).toContain('step="5"');
  expect(html).toContain('value="40"');
  expect(html).toContain('data-meowui-part="slider/value">40');
});

test("controlled sliders report a change and restore the caller value when it is refused", () => {
  const runtime = createRuntime();
  let native: Props = {};
  runtime.use({
    render({ vnode }, next) {
      if (vnode.props?.type === "range") native = vnode.props;
      return next(vnode);
    },
  });
  const value = signal(10);
  let accept = false;
  const seen: number[] = [];
  createWebRenderer(runtime).renderToHtml(
    <Slider
      label="Volume"
      value={value}
      onValueChange={(next) => {
        seen.push(next);
        if (accept) value.value = next;
      }}
    />,
  );
  const input = { value: "25" };
  (native.onInput as (event: Event) => void)({ currentTarget: input } as unknown as Event);
  expect(input.value).toBe("10");
  accept = true;
  input.value = "25";
  (native.onInput as (event: Event) => void)({ currentTarget: input } as unknown as Event);
  expect(value.value).toBe(25);
  expect(seen).toEqual([25, 25]);
});
