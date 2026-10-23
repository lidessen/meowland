import { describe, expect, test } from "bun:test";
import type { StoryEntry } from "meowbook";
import { buildCatalog, kebabCase, styleAxes } from "../catalog";

function story(overrides: Partial<StoryEntry> & { id: string }): StoryEntry {
  return {
    title: overrides.id,
    file: `/stories/${overrides.id}.stories.tsx`,
    exportName: "Story",
    line: 1,
    ...overrides,
  };
}

describe("the component catalog", () => {
  test("a story with a component becomes a component page", () => {
    const catalog = buildCatalog([
      story({
        id: "button",
        title: "Button · Actions",
        component: "Button",
        group: "Basic controls",
      }),
    ]);
    const component = catalog.components.find((entry) => entry.title === "Button");
    expect(component).toBeDefined();
    expect(component!.slug).toBe("button");
    expect(component!.path).toBe("components/button");
    expect(component!.stories).toHaveLength(1);
    expect(component!.contract?.name).toBe("button");
  });

  test("a story without a component becomes a composition example", () => {
    const catalog = buildCatalog([
      story({ id: "code-block", title: "Code block · Language", group: "Content" }),
    ]);
    expect(catalog.examples).toHaveLength(1);
    expect(catalog.examples[0]!.path).toBe("examples/code-block");
    expect(catalog.components.some((entry) => entry.path === "examples/code-block")).toBe(false);
  });

  test("every story of a component lands on that component page", () => {
    const catalog = buildCatalog([
      story({ id: "button", component: "Button", group: "Basic controls" }),
      story({ id: "button-sizes", component: "Button", group: "Basic controls" }),
      story({ id: "badge", component: "Badge", group: "Basic controls" }),
    ]);
    const button = catalog.components.find((entry) => entry.title === "Button");
    expect(button?.stories.map((entry) => entry.id)).toEqual(["button", "button-sizes"]);
  });

  test("a component name without a registry contract still gets a page", () => {
    const catalog = buildCatalog([story({ id: "icons", component: "IconSource" })]);
    const component = catalog.components.find((entry) => entry.title === "IconSource");
    expect(component).toBeDefined();
    expect(component!.contract).toBeUndefined();
    expect(component!.slug).toBe("icon-source");
  });

  test("a component without stories borrows the stories that draw it most", () => {
    const sources: Record<string, string> = {
      form: '<Field label="Name"><Switch checked /><Switch /></Field>',
      settings: "h(Switch, { checked: true })",
      scene: "<Switch />",
      other: "<SwitchGroup />",
    };
    const catalog = buildCatalog(
      [
        story({ id: "scene", group: "Scenes" }),
        story({ id: "form", component: "Field", group: "Forms" }),
        story({ id: "settings", component: "Card", group: "Content" }),
        story({ id: "other", component: "Badge", group: "Basic controls" }),
      ],
      (entry) => sources[entry.id],
    );
    const component = catalog.components.find((entry) => entry.title === "Switch");
    expect(component?.stories).toEqual([]);
    expect(component?.usedIn.map((entry) => entry.id)).toEqual(["form", "settings", "scene"]);
    expect(component?.group).toBe("Content");
  });

  test("the registry contributes the components no story covers", () => {
    const catalog = buildCatalog([story({ id: "button", component: "Button" })]);
    const withoutStories = catalog.components.filter(
      (entry) => entry.stories.length === 0 && entry.group === "Components without examples",
    );
    expect(withoutStories.length).toBeGreaterThan(0);
    expect(withoutStories.every((entry) => entry.contract)).toBe(true);
  });

  test("a registry component the stories do not cover keeps its display name", () => {
    const catalog = buildCatalog([story({ id: "button", component: "Button" })]);
    const covered = catalog.components.find((entry) => entry.slug === "app-bar");
    expect(covered?.title).toBe("AppBar");
    expect(covered?.path).toBe("components/app-bar");
  });

  test("the sidebar groups follow the order the stories declare", () => {
    const catalog = buildCatalog([
      story({ id: "button", component: "Button", group: "Basic controls", groupOrder: 10 }),
      story({ id: "alert", component: "Alert", group: "Overlays and feedback", groupOrder: 30 }),
    ]);
    expect(catalog.navigation.map((group) => group.label)).toEqual([
      "Basic controls",
      "Overlays and feedback",
      "Components without examples",
    ]);
  });

  test("every component has its own path", () => {
    const catalog = buildCatalog([
      story({ id: "button", component: "Button" }),
      story({ id: "icon-button", component: "IconButton" }),
    ]);
    const paths = catalog.components.map((entry) => entry.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe("the style axes of a contract", () => {
  test("a contract with axes reports its choices and its default", () => {
    const catalog = buildCatalog([story({ id: "button", component: "Button" })]);
    const button = catalog.components.find((entry) => entry.title === "Button");
    const axes = styleAxes(button?.contract);
    const variant = axes.find((axis) => axis.axis === "variant");
    expect(variant?.choices).toContain("primary");
    expect(variant?.default).toBe("primary");
  });

  test("a contract without axes reports none", () => {
    expect(styleAxes(undefined)).toEqual([]);
  });
});

describe("the kebab case of a name", () => {
  test("a display name becomes a URL segment", () => {
    expect(kebabCase("IconButton")).toBe("icon-button");
    expect(kebabCase("Brand icons")).toBe("brand-icons");
    expect(kebabCase("ChatMessageList")).toBe("chat-message-list");
  });
});
