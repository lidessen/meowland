import { describe, expect, test } from "bun:test";
import { createRuntime, defineComponent, isSignal, signal } from "meowjsx";
import { renderToHtmlWithRuntime } from "meowjsx/web";
import { createStylePropsPlugin, defineStyleProps, partSelector } from "meowcss/meowjsx";

import { defineOptions } from "meowcss/meowjsx";
const options = defineOptions("prototype-button", {
  variant: ["primary", "quiet"],
  size: ["small", "normal"],
});
const binding = defineStyleProps(options, { defaults: { variant: "primary", size: "normal" } });
const contract = {
  name: "prototype-button",
  parts: ["root", "label", "icon"],
  styleProps: binding,
} as const;

describe("component style props Web adapter", () => {
  test("a second installed style props plugin keeps the explicit option the first resolved", () => {
    const runtime = createRuntime({
      components: [contract],
      plugins: [createStylePropsPlugin(), { ...createStylePropsPlugin(), name: "second-copy" }],
    });
    const vnode = runtime.part({ component: contract.name, part: "root" }, "button", {
      variant: "quiet",
    });
    const html = renderToHtmlWithRuntime(runtime, vnode);
    expect(html).toContain('data-option-prototype-button-variant="quiet"');
    expect(html).not.toContain('data-option-prototype-button-variant="primary"');
  });
  test("a registered component without options still exposes its typed part selector", () => {
    const plain = { name: "plain", parts: ["root"] } as const;
    const runtime = createRuntime({ components: [plain], plugins: [createStylePropsPlugin()] });
    const vnode = runtime.part({ component: plain.name, part: "root" }, "select", { size: 4 });
    const html = renderToHtmlWithRuntime(runtime, vnode);
    expect(html).toContain('data-meowui-part="plain/root"');
    expect(html).toContain('size="4"');
    expect(String(partSelector(plain, "root"))).toBe(':where([data-meowui-part="plain/root"])');
  });
  test("HTML consumes own style props, retains native props and renders independent defaults", () => {
    const runtime = createRuntime({ components: [contract], plugins: [createStylePropsPlugin()] });
    const child = runtime.part({ component: contract.name, part: "root", state: {} }, "button", {});
    const parent = runtime.part(
      { component: contract.name, part: "root", state: { variant: "quiet", size: "small" } },
      "button",
      {
        variant: "quiet",
        size: "small",
        className: "custom",
        style: "opacity:0.5",
        disabled: true,
      },
      child,
    );
    const html = renderToHtmlWithRuntime(runtime, parent);
    expect(html).toContain('data-option-prototype-button-variant="quiet"');
    expect(html).toContain('data-option-prototype-button-variant="primary"');
    expect(html).toContain('data-option-prototype-button-size="normal"');
    expect(html).not.toMatch(/\s(?:variant|size)=/);
    expect(html).toContain('class="custom"');
    expect(html).toContain('style="opacity:0.5"');
    expect(html).toContain("disabled");
    const native = runtime.part({ component: "native-select", part: "root" }, "select", {
      size: 4,
    });
    expect(renderToHtmlWithRuntime(runtime, native)).toContain('size="4"');
  });

  test("original input survives component destructuring; explicit part override wins", () => {
    const runtime = createRuntime({ components: [contract], plugins: [createStylePropsPlugin()] });
    const Button = defineComponent(
      contract,
      ({ variant: _variant, ...rest }: { variant?: string }, context) =>
        context.part("root", "button", { ...rest, variant: undefined }),
    );
    expect(renderToHtmlWithRuntime(runtime, runtime.h(Button, { variant: "quiet" }))).toContain(
      'data-option-prototype-button-variant="quiet"',
    );
    const vnode = runtime.part(
      { component: contract.name, part: "root", state: { variant: "quiet" } },
      "button",
      { variant: "primary" },
    );
    expect(renderToHtmlWithRuntime(runtime, vnode)).toContain(
      'data-option-prototype-button-variant="primary"',
    );
  });

  test("all parts consume style props, only explicit carriers get instance markers", () => {
    const multiContract = {
      ...contract,
      styleProps: defineStyleProps(options, {
        defaults: binding.defaults,
        parts: ["root", "label"],
      }),
    };
    const runtime = createRuntime({
      components: [multiContract],
      plugins: [createStylePropsPlugin()],
    });
    for (const part of contract.parts) {
      const vnode = runtime.part(
        { component: contract.name, part, state: { variant: "quiet" } },
        "span",
        { variant: "quiet", size: "small" },
      );
      const html = renderToHtmlWithRuntime(runtime, vnode);
      expect(html).not.toMatch(/\s(?:variant|size)=/);
      expect(html.includes('data-option-prototype-button-variant="quiet"')).toBe(part !== "icon");
      expect(html).toContain(`data-meowui-part="prototype-button/${part}"`);
    }
    expect(String(partSelector(contract, "label"))).toBe(
      ':where([data-meowui-part="prototype-button/label"])',
    );
  });

  test("signals update markers and undefined restores original/default without rebuilding VNodes", async () => {
    const original = signal<string | undefined>("quiet");
    const explicit = signal<string | undefined>(undefined);
    const runtime = createRuntime({ components: [contract], plugins: [createStylePropsPlugin()] });
    const node = runtime.part(
      { component: contract.name, part: "root", state: { variant: original } },
      "button",
      { variant: explicit },
    );
    const transformed = runtime.targetHooks.transformVNode(node);
    const marker = transformed.props[options.attribute("variant")];
    expect(isSignal(marker)).toBe(true);
    if (!isSignal(marker)) throw new Error("expected signal");
    const seen: unknown[] = [];
    const cleanup = marker.subscribe((value) => seen.push(value));
    expect(marker.value).toBe("quiet");
    explicit.value = "primary";
    await Promise.resolve();
    original.value = "primary";
    await Promise.resolve();
    explicit.value = undefined;
    await Promise.resolve();
    original.value = "quiet";
    await Promise.resolve();
    original.value = undefined;
    await Promise.resolve();
    expect(seen).toEqual(["primary", "quiet", "primary"]);
    expect(renderToHtmlWithRuntime(runtime, node)).toContain(
      'data-option-prototype-button-variant="primary"',
    );
    cleanup();
    original.value = "quiet";
    await Promise.resolve();
    expect(seen).toHaveLength(3);
  });

  test("invalid bindings and runtime selections fail explicitly", () => {
    expect(() => defineStyleProps(options, { defaults: {} } as any)).toThrow("default");
    const badContract = {
      ...contract,
      styleProps: defineStyleProps(options, { defaults: binding.defaults, parts: ["missing"] }),
    };
    const badRuntime = createRuntime({
      components: [badContract],
      plugins: [createStylePropsPlugin()],
    });
    expect(() =>
      renderToHtmlWithRuntime(
        badRuntime,
        badRuntime.part({ component: contract.name, part: "root" }, "button", {}),
      ),
    ).toThrow("part");
    const runtime = createRuntime({ components: [contract], plugins: [createStylePropsPlugin()] });
    const node = runtime.part({ component: contract.name, part: "root" }, "button", {
      variant: "missing",
    });
    expect(() => renderToHtmlWithRuntime(runtime, node)).toThrow("Invalid style option");
  });
});
