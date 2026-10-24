import { describe, expect, test } from "bun:test";
import { createRuntime, h, type Context } from "meowjsx";
import { renderToHtmlWithRuntime } from "meowjsx/web";
import { createStylePropsPlugin, css, defineStyleProps, parts } from "meowcss/meowjsx";
import { defineOptions } from "meowcss";

const options = defineOptions("prototype-button", {
  variant: ["primary", "quiet"],
  size: ["small", "normal"],
});
const style = defineStyleProps(options, {
  defaults: { variant: "primary", size: "normal" },
});

function Button(props: Record<string, unknown>, context: Context<typeof Button>) {
  return h("button", { ...props, ref: context.parts.root });
}
Button.meta = {
  name: "prototype-button",
  parts: ["root", "label", "icon"],
  style,
} as const;
const p = parts<typeof Button>("prototype-button");

function runtime() {
  return createRuntime({
    components: [Button],
    plugins: [createStylePropsPlugin()],
  });
}

describe("component style props Web adapter", () => {
  test("style props resolve on part nodes and preserve explicit and default values", () => {
    const rt = runtime();
    const node = rt.h(Button, { variant: "quiet" });
    const html = renderToHtmlWithRuntime(rt, node);
    expect(html).toContain('data-option-prototype-button-variant="quiet"');
    expect(html).toContain('data-option-prototype-button-size="normal"');
    expect(html).toContain('data-meowui-part="prototype-button/root"');
  });

  test("part descriptors are bound to stable component and part names", () => {
    const descriptor = p.root;
    expect(descriptor).toMatchObject({
      component: "prototype-button",
      part: "root",
    });
  });

  test("invalid metadata carrier parts and runtime selections fail explicitly", () => {
    const invalid = defineStyleProps(options, {
      defaults: style.defaults,
      parts: ["missing"],
    });
    function Invalid(_props: Record<string, unknown>, context: Context<typeof Invalid>) {
      return h("button", { ref: context.parts.root });
    }
    Invalid.meta = {
      name: "invalid",
      parts: ["root"],
      style: invalid,
    } as const;
    const rt = createRuntime({
      components: [Invalid],
      plugins: [createStylePropsPlugin()],
    });
    const node = rt.h(Invalid, {});
    node.componentPart = { component: "invalid", part: "root" };
    expect(() => renderToHtmlWithRuntime(rt, node)).toThrow("Unknown bound part");
  });
});

test("a descriptor that this meowjsx copy did not create fails instead of emitting [object Object]", () => {
  // Same shape as a descriptor from a second installed meowjsx copy.
  const foreign = Object.freeze({ component: "prototype-button", part: "root" });
  expect(
    () => css`
      ${foreign as unknown as string} {
        color: red;
      }
    `,
  ).toThrow(/same meowjsx copy/);
  expect(
    css`
      ${p.root} {
        color: red;
      }
    `.text,
  ).toContain('data-meowui-part="prototype-button/root"');
});
