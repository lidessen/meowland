import { expect, test } from "bun:test";
import { signal } from "meowjsx";
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
