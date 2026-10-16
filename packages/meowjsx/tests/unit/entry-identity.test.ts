import { expect, test } from "bun:test";
import { createContext, defaultRuntime, useContext } from "../../src/index";
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
