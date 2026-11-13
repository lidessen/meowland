import { expect, test } from "bun:test";
import { createContext, defaultRuntime, useContext } from "../../src/index";
import * as rootSignals from "../../src/index";
import * as runtimeSignals from "../../src/runtime";
import * as signals from "../../src/signal";
import { I18nProvider, createI18n, t } from "../../src/i18n";
import { defaultRuntime as runtimeEntry, signal } from "../../src/runtime";
import { Fragment, jsx } from "../../src/jsx-runtime";
import { Fragment as developmentFragment, jsxDEV } from "../../src/jsx-dev-runtime";
import { defaultWebRenderer, renderToHtml } from "../../web/index";
import * as web from "../../web/index";

test("root, automatic JSX, development JSX and Web share the same runtime and context", () => {
  expect(runtimeEntry).toBe(defaultRuntime);
  expect(defaultWebRenderer.runtime).toBe(defaultRuntime);
  expect(rootSignals.defineShadow).toBe(runtimeSignals.defineShadow);
  expect("shadow" in rootSignals).toBe(false);
  expect("shadow" in runtimeSignals).toBe(false);
  expect(web.render).toBe(defaultWebRenderer.render);
  expect("mount" in web).toBe(false);
  expect("mount" in defaultWebRenderer).toBe(false);
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

test("the i18n entry shares Context and reactive modules with the root and automatic JSX", async () => {
  const i18n = createI18n({ source: "en", locale: "fr", catalogs: { fr: { Posts: "Articles" } } });
  // A component created through the automatic JSX runtime reads the Provider of the i18n entry.
  const Label = () => jsx("span", { children: t("Posts") });
  const tree = (value: typeof i18n) => jsx(I18nProvider, { value, children: jsx(Label, {}) });
  expect(renderToHtml(tree(i18n))).toBe("<span>Articles</span>");
  expect(renderToHtml(jsx(Label, {}))).toBe("<span>Posts</span>");
  // Messages are root Signals: the root recognizes them and tracks them in a derived read.
  const message = i18n.t("Posts");
  expect(rootSignals.isSignal(message)).toBe(true);
  const seen: string[] = [];
  const stop = rootSignals
    .derived(() => message.value + "!")
    .subscribe((value) => seen.push(value));
  i18n.locale.value = "en";
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  expect(seen).toEqual(["Posts!"]);
  stop();
  // The root Context API sees no i18n state, and the root does not export the i18n entry.
  expect("createI18n" in rootSignals).toBe(false);
  expect("t" in rootSignals).toBe(false);
});
