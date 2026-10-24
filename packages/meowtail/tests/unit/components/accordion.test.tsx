import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import { Accordion, installMeowUI, meowUIComponents } from "../../../src/index";

const items = [
  { id: "general", summary: "General", content: <p>Language</p> },
  { id: "privacy", summary: "Privacy", content: <p>Logs</p> },
];

test("accordion composes disclosures and keeps a group name", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const html = createWebRenderer(runtime).renderToHtml(
    <Accordion id="settings" label="Settings" defaultValue="general" items={items} />,
  );
  expect(html).toContain('aria-label="Settings"');
  expect(html).toContain('data-meowui-part="accordion/root"');
  expect(html).toContain('data-meowui-part="disclosure/summary"');
  expect(html).toContain("General");
  expect(html).toContain("Privacy");
});

test("single mode reports one open id; multiple mode keeps a list", () => {
  const runtime = createRuntime();
  const toggles: Array<(event: Event) => void> = [];
  runtime.use({
    render({ vnode }, next) {
      if (typeof vnode.props.onToggle === "function")
        toggles.push(vnode.props.onToggle as (event: Event) => void);
      return next(vnode);
    },
  });
  const value = signal<string>("general");
  createWebRenderer(runtime).renderToHtml(
    <Accordion
      type="single"
      value={value}
      onValueChange={(next) => {
        value.value = typeof next === "string" ? next : "";
      }}
      items={items}
    />,
  );
  toggles[0]!({ currentTarget: { open: false } } as unknown as Event);
  expect(value.value).toBe("");
});

test("multiple accordion collects several open ids", () => {
  const seen: Array<string | readonly string[]> = [];
  const runtime = createRuntime();
  const toggles: Array<(event: Event) => void> = [];
  runtime.use({
    render({ vnode }, next) {
      if (typeof vnode.props.onToggle === "function")
        toggles.push(vnode.props.onToggle as (event: Event) => void);
      return next(vnode);
    },
  });
  createWebRenderer(runtime).renderToHtml(
    <Accordion
      type="multiple"
      defaultValue={["general"]}
      onValueChange={(next) => seen.push(next)}
      items={items}
    />,
  );
  toggles[1]!({ currentTarget: { open: true } } as unknown as Event);
  expect(seen[0]).toEqual(["general", "privacy"]);
});
