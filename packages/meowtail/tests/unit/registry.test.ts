import { expect, test } from "bun:test";
import { createRuntime } from "meowjsx";
import { Button } from "../../src/components/button";
import { createMeowUI, installMeowUI, MeowUIComponent, meowUIComponents } from "../../src/registry";

test("MeowUI factory registers only explicitly selected component functions", () => {
  const runtime = createRuntime({ plugins: [createMeowUI({ components: [Button] })] });

  expect(runtime.registry.list()).toEqual([Button]);
  expect(runtime.registry.get("button")).toBe(Button);
  expect(runtime.registry.get("code-block")).toBeUndefined();
});

test("MeowUI installer applies the same explicit component selection", () => {
  const runtime = createRuntime();
  const uninstall = installMeowUI({ components: [Button] }, runtime);

  expect(runtime.registry.list()).toEqual([Button]);
  uninstall();
  expect(runtime.registry.list()).toEqual([]);
});

test("full catalog contains registered functions with metadata", () => {
  const names = meowUIComponents.map((component) => component.meta.name);

  expect(names).toContain("button");
  expect(names).toContain("assistant-view");
  expect(names).toContain("assistant-question");
  expect(names).toContain("chat-question");
  expect(names).not.toContain("presentation");
  expect(new Set(names).size).toBe(names.length);
  expect(MeowUIComponent.Button).toBe("button");
});
