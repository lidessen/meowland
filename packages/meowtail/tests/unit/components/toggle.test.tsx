import { expect, test } from "bun:test";
import { createRuntime, h, signal, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Checkbox, Switch, installMeowUI } from "../../../src/index";

test("toggles expose native form semantics and implicit labels without a theme", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const html = createWebRenderer(runtime).renderToHtml(
    <div>
      <Checkbox
        label="Remember"
        name="remember"
        value="yes"
        defaultChecked
        required
        aria-describedby="help"
      />
      <Switch label="Notifications" name="notify" disabled />
    </div>,
  );
  expect(html).toContain('name="remember"');
  expect(html).toContain('value="yes"');
  expect(html).toContain('aria-describedby="help"');
  expect(html).toContain('type="checkbox" checked');
  expect(html).toContain('role="switch"');
  expect(html).toContain('data-meowui-part="checkbox/label">Remember');
  expect(html).toContain('data-meowui-part="switch/label">Notifications');
  expect(html).not.toContain("defaultChecked");
});

test("controlled toggles accept or reject changes through the caller; uncontrolled input stays native", () => {
  for (const Component of [Checkbox, Switch]) {
    for (const controlled of [false, true]) {
      const runtime = createRuntime();
      let native: Props = {};
      runtime.use({
        render({ vnode }, next) {
          if (vnode.type === "input") native = vnode.props;
          return next(vnode);
        },
      });
      const value = signal(false);
      let accept = false;
      const changes: boolean[] = [];
      createWebRenderer(runtime).renderToHtml(
        <Component
          label="Toggle"
          checked={controlled ? value : undefined}
          onChange={(event: Event) => {
            const proposed = (event.currentTarget as HTMLInputElement).checked;
            changes.push(proposed);
            if (accept) value.value = proposed;
          }}
        />,
      );
      const input = { checked: true };
      const change = native.onChange as (event: Event) => void;
      change({ currentTarget: input } as unknown as Event);
      expect(input.checked).toBe(!controlled);
      accept = true;
      input.checked = true;
      change({ currentTarget: input } as unknown as Event);
      expect(input.checked).toBe(true);
      expect(changes).toEqual([true, true]);
    }
  }
});

test("controlled reset restores the caller value and cleanup removes the form listener", async () => {
  const runtime = createRuntime();
  let native: Props = {};
  runtime.use({
    render({ vnode }, next) {
      if (vnode.type === "input") native = vnode.props;
      return next(vnode);
    },
  });
  const checked = signal(true);
  createWebRenderer(runtime).renderToHtml(
    <Switch label="Toggle" checked={checked} defaultChecked={false} />,
  );
  const form = new EventTarget();
  const input = { form, ownerDocument: form, checked: false, defaultChecked: false };
  const cleanup = (native.ref as (input: unknown) => () => void)(input);
  await Promise.resolve();
  expect(input.checked).toBe(true);
  input.checked = false;
  form.dispatchEvent(new Event("reset"));
  await new Promise((resolve) => setTimeout(resolve, 5));
  expect(input.checked).toBe(true);
  cleanup();
  input.checked = false;
  form.dispatchEvent(new Event("reset"));
  await new Promise((resolve) => setTimeout(resolve, 5));
  expect(input.checked).toBe(false);
});
