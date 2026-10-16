import { expect, test } from "bun:test";
import { createRuntime, h, type Component, type RuntimePlugin } from "../../src/runtime";

test("component resolution follows plugin order, stops on the original, and never recurses", () => {
  const Original: Component = () => "original";
  const Replacement: Component = () => "replacement";
  const events: string[] = [];
  const runtime = createRuntime();
  const plugin = (name: string, enforce?: "pre" | "post", result?: Component): RuntimePlugin => ({
    enforce,
    resolveComponent(context) {
      expect(context.component).toBe(Original);
      expect(context.runtime).toBe(runtime);
      expect(context.props.value).toBe(1);
      events.push(name);
      return result;
    },
  });
  runtime.use(plugin("post", "post", Replacement));
  runtime.use(plugin("normal"));
  runtime.use(plugin("pre-1", "pre"));
  const stop = runtime.use(plugin("pre-2", "pre", Original));
  const call = () => {
    const invocation = runtime.targetHooks.invokeComponent(Original, { value: 1 });
    invocation.dispose();
    return invocation.child;
  };
  expect(call()).toBe("original");
  expect(events).toEqual(["pre-1", "pre-2"]);
  events.length = 0;
  stop();
  stop();
  expect(call()).toBe("replacement");
  expect(events).toEqual(["pre-1", "normal", "post"]);
});

test("resolver registration rolls back after setup failure and remains runtime-local", () => {
  const Original: Component = () => "original";
  const Replacement: Component = () => "replacement";
  const runtime = createRuntime();
  const other = createRuntime();
  const before = h(Original, {});
  expect(() =>
    runtime.use({
      resolveComponent: () => Replacement,
      setup() {
        throw new Error("setup failed");
      },
    }),
  ).toThrow("setup failed");
  expect(runtime.targetHooks.invokeComponent(Original, before.props).child).toBe("original");
  const remove = runtime.use({ resolveComponent: () => Replacement });
  expect(runtime.targetHooks.invokeComponent(Original, before.props).child).toBe("replacement");
  expect(other.targetHooks.invokeComponent(Original, before.props).child).toBe("original");
  remove();
  expect(runtime.targetHooks.invokeComponent(Original, before.props).child).toBe("original");
});
