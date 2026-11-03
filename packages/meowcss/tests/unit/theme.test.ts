import { expect, test } from "bun:test";
import { signal } from "meowjsx/signal";
import { applyTheme } from "meowcss/web";
import { themeAttributes } from "meowcss";
import { defineTheme } from "meowcss/meowjsx";
import { css, defineOptions } from "meowcss/meowjsx";

test("existing host configuration updates, restores inheritance and disposes subscriptions", async () => {
  const options = defineOptions("host", { density: ["compact", "normal"] });
  const theme = defineTheme({
    options,
    defaults: { scheme: "auto", density: "normal" },
    tokens: [],
    styles: css``,
  });
  const attributes = new Map([
    ["data-unrelated", "keep"],
    ["data-meowui-color-scheme", "light"],
  ]);
  const element = {
    getAttribute: (name: string) => attributes.get(name) ?? null,
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    removeAttribute: (name: string) => attributes.delete(name),
  } as unknown as Element;
  const config = signal(options.select({ scheme: "dark" }));
  const dispose = applyTheme(element, theme, config);
  expect(Object.fromEntries(attributes)).toEqual({
    "data-unrelated": "keep",
    ...themeAttributes(theme, config.value),
  });
  config.value = options.select({ density: "compact" });
  await Promise.resolve();
  expect(attributes.get("data-meowui-color-scheme")).toBe("auto");
  expect(attributes.get(options.attribute("density"))).toBe("compact");
  dispose();
  config.value = options.select({ scheme: "dark" });
  await Promise.resolve();
  expect(Object.fromEntries(attributes)).toEqual({
    "data-unrelated": "keep",
    "data-meowui-color-scheme": "light",
  });

  const local = signal(options.select({}));
  const clear = applyTheme(element, undefined, local);
  local.value = options.select({ density: "compact" });
  await Promise.resolve();
  expect(attributes.has(options.attribute("density"))).toBe(true);
  local.value = options.select({});
  await Promise.resolve();
  expect(attributes.has(options.attribute("density"))).toBe(false);
  expect(attributes.get("data-meowui-color-scheme")).toBe("light");
  clear();
});

test("holders of the same stylesheet in one document share one style element", async () => {
  const { Window } = await import("happy-dom");
  const { mountStyles } = await import("meowcss/web");
  const document = new Window().document as unknown as Document;
  const count = (text: string) =>
    [...document.head.querySelectorAll("style")].filter((style) => style.textContent === text)
      .length;
  const first = mountStyles(document, "a{}");
  const second = mountStyles(document, "a{}");
  const other = mountStyles(document, "b{}");
  expect(count("a{}")).toBe(1);
  expect(count("b{}")).toBe(1);
  first();
  first();
  expect(count("a{}")).toBe(1);
  second();
  expect(count("a{}")).toBe(0);
  // A later holder gets a fresh element.
  const third = mountStyles(document, "a{}");
  expect(count("a{}")).toBe(1);
  third();
  other();
  expect(document.head.querySelectorAll("style")).toHaveLength(0);
});
