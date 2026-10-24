import { expect, test } from "bun:test";
import { createContext, defaultRuntime, useContext } from "../../src/index";
import * as rootSignals from "../../src/index";
import * as runtimeSignals from "../../src/runtime";
import * as signals from "../../src/signal";
import { defaultRuntime as runtimeEntry, signal } from "../../src/runtime";
import { Fragment, jsx } from "../../src/jsx-runtime";
import { Fragment as developmentFragment, jsxDEV } from "../../src/jsx-dev-runtime";
import { defaultWebRenderer, renderToHtml } from "../../web/index";

test("root, automatic JSX, development JSX and Web share the same runtime and context", () => {
  expect(runtimeEntry).toBe(defaultRuntime);
  expect(defaultWebRenderer.runtime).toBe(defaultRuntime);
  expect(developmentFragment).toBe(Fragment);
  const Value = createContext("outside");
  const Read = () => useContext(Value);
  const content = jsxDEV(Value.Provider, {
    value: "shared",
    children: jsx(Fragment, { children: signal(jsx(Read, {})) }),
  });
  expect(renderToHtml(content)).toBe("shared");
  expect(renderToHtml(jsx(Read, {}))).toBe("outside");
});

test("the signal entry shares reactive functions and dependency tracking with the runtime", () => {
  for (const name of ["signal", "batch", "derived", "mapSignal", "isSignal", "unwrap"] as const) {
    expect(signals[name]).toBe(rootSignals[name]);
    expect(signals[name]).toBe(runtimeSignals[name]);
  }
  const count = signals.signal(1);
  const doubled = runtimeSignals.derived(() => count.value * 2);
  const scope = rootSignals.createLifecycleScope(defaultRuntime);
  const values: number[] = [];
  scope.effect(() => {
    values.push(doubled.value);
  });
  signals.batch(() => {
    count.value = 2;
    count.value = 3;
  });
  expect(values).toEqual([2, 6]);
  scope.dispose();
  signals.batch(() => {
    count.value = 4;
  });
  expect(values).toEqual([2, 6]);
});

test("a plugin installed through the core entry applies to the default Web renderer", () => {
  const Original = () => "original";
  const remove = defaultRuntime.use({
    resolveComponent: ({ component }) => (component === Original ? () => "replacement" : undefined),
  });
  try {
    expect(renderToHtml(jsxDEV(Original, {}))).toBe("replacement");
  } finally {
    remove();
  }
  expect(renderToHtml(jsx(Original, {}))).toBe("original");
});
