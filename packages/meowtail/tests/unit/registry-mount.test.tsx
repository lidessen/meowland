import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { createRuntime, defaultRuntime, h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createWebRenderer, render } from "meowjsx/web";
import { mountStyles } from "meowcss/web";
import { Button, createMeowUI, installMeowUI } from "meowtail";
import { standardOptions, standardTheme } from "meowtail/theme";
import { createMeowUITheme, focusModalityAttribute } from "meowtail/web";

function freshDocument(): Document {
  const dom = new Window() as unknown as Record<string, unknown>;
  for (const key of ["document", "HTMLElement", "HTMLInputElement", "Element", "Node"])
    Object.defineProperty(globalThis, key, { value: dom[key], configurable: true, writable: true });
  return dom.document as Document;
}

function styles(document: Document): number {
  return [...document.head.querySelectorAll("style")].filter(
    (element) => element.textContent === standardTheme.cssText,
  ).length;
}

function pressTab(document: Document): void {
  const view = document.defaultView as unknown as typeof globalThis;
  document.dispatchEvent(new view.KeyboardEvent("keydown", { key: "Tab" }));
}

const themed = (config?: Parameters<typeof createMeowUITheme>[0]["config"]) =>
  createRuntime({
    plugins: [
      createMeowUI({ components: [Button] }),
      createMeowUITheme({ theme: standardTheme, config }),
    ],
  });

test("the theme plugin delivers the stylesheet, the theme root and focus modality per mount", () => {
  const document = freshDocument();
  const first = document.createElement("main");
  const second = document.createElement("aside");
  first.setAttribute("data-host", "kept");
  document.body.append(first, second);
  const web = createWebRenderer(themed());

  const a = web.render(h(Button, {}, "Save"), first);
  const b = web.render(h(Button, {}, "Cancel"), second);
  // Two roots on one document share one stylesheet.
  expect(styles(document)).toBe(1);
  expect(first.getAttribute("data-meowui-theme-root")).toBe("meowui");
  expect(second.getAttribute("data-meowui-theme-root")).toBe("meowui");
  pressTab(document);
  expect(document.documentElement.getAttribute(focusModalityAttribute)).toBe("keyboard");
  expect(first.querySelector("button")?.getAttribute("data-meowui-part")).toBe("button/root");

  a.unmount();
  expect(styles(document)).toBe(1);
  expect(first.hasAttribute("data-meowui-theme-root")).toBe(false);
  expect(first.getAttribute("data-host")).toBe("kept");

  b.unmount();
  expect(styles(document)).toBe(0);
  // The last mount released the tracker, which clears its attribute.
  expect(document.documentElement.hasAttribute(focusModalityAttribute)).toBe(false);
});

test("a host that also mounts the stylesheet shares the same style element", () => {
  const document = freshDocument();
  const root = document.createElement("main");
  const removeStyles = mountStyles(document, standardTheme.cssText);
  const mounted = createWebRenderer(themed()).render(h(Button, {}, "Save"), root);
  expect(styles(document)).toBe(1);
  mounted.unmount();
  expect(styles(document)).toBe(1);
  removeStyles();
  expect(styles(document)).toBe(0);
});

test("a Signal config keeps the root selection live", async () => {
  const document = freshDocument();
  const root = document.createElement("main");
  const config = signal(standardOptions.select({ scheme: "light" }));
  const mounted = createWebRenderer(themed(config)).render(h(Button, {}, "Save"), root);
  expect(root.getAttribute("data-meowui-color-scheme")).toBe("light");
  config.value = standardOptions.select({ scheme: "dark" });
  await Promise.resolve();
  expect(root.getAttribute("data-meowui-color-scheme")).toBe("dark");
  mounted.unmount();
});

test("a second themed mount into the same container fails and leaves the first intact", () => {
  const document = freshDocument();
  const root = document.createElement("main");
  const web = createWebRenderer(themed());
  const first = web.render(h(Button, {}, "Save"), root);
  expect(() => web.render(h(Button, {}, "Again"), root)).toThrow("already binds this container");
  expect(root.querySelectorAll("button")).toHaveLength(1);
  expect(root.getAttribute("data-meowui-theme-root")).toBe("meowui");
  first.unmount();
  // Released, the container can be themed again.
  web.render(h(Button, {}, "Later"), root).unmount();
});

test("a container inside a shadow root is refused rather than left unstyled", () => {
  const document = freshDocument();
  const host = document.createElement("div");
  document.body.append(host);
  const shadow = host.attachShadow({ mode: "open" });
  const root = document.createElement("main");
  shadow.append(root);
  expect(() => createWebRenderer(themed()).render(h(Button, {}, "Save"), root)).toThrow(
    "shadow root",
  );
  expect(styles(document)).toBe(0);
});

test("uninstalling the theme plugin takes its delivery away from a live mount", () => {
  const document = freshDocument();
  const root = document.createElement("main");
  const runtime = createRuntime({ plugins: [createMeowUI({ components: [Button] })] });
  const uninstall = runtime.use(createMeowUITheme({ theme: standardTheme }));
  const mounted = createWebRenderer(runtime).render(h(Button, {}, "Save"), root);
  expect(styles(document)).toBe(1);
  uninstall();
  expect(styles(document)).toBe(0);
  expect(root.hasAttribute("data-meowui-theme-root")).toBe(false);
  // The tree stays; only the plugin's delivery is gone, and unmount does not release it twice.
  expect(root.querySelector("button")).not.toBeNull();
  mounted.unmount();
});

test("the default runtime and renderer take the same plugins", () => {
  const document = freshDocument();
  const root = document.createElement("main");
  const uninstall = [
    installMeowUI({ components: [Button] }, defaultRuntime),
    defaultRuntime.use(createMeowUITheme({ theme: standardTheme })),
  ];
  try {
    const mounted = render(h(Button, {}, "Save"), root);
    expect(styles(document)).toBe(1);
    expect(root.getAttribute("data-meowui-theme-root")).toBe("meowui");
    mounted.unmount();
    expect(styles(document)).toBe(0);
  } finally {
    for (const dispose of uninstall.reverse()) dispose();
  }
});

test("registration alone leaves the document alone", () => {
  const document = freshDocument();
  const root = document.createElement("main");
  const runtime = createRuntime({ plugins: [createMeowUI({ components: [Button] })] });
  const mounted = createWebRenderer(runtime).render(h(Button, {}, "Save"), root);
  expect(styles(document)).toBe(0);
  expect(root.hasAttribute("data-meowui-theme-root")).toBe(false);
  expect(root.querySelector("button")?.getAttribute("data-meowui-part")).toBe("button/root");
  mounted.unmount();
});

test("a themed mount paints the page in its scheme until the last mount releases it", async () => {
  const document = freshDocument();
  const html = document.documentElement;
  const [first, second] = [document.createElement("main"), document.createElement("aside")];
  const config = signal(standardOptions.select({ scheme: "dark" }));
  const web = createWebRenderer(themed(config));

  const a = web.render(h(Button, {}, "Save"), first);
  const b = web.render(h(Button, {}, "Cancel"), second);
  expect(html.hasAttribute("data-meowui-page")).toBe(true);
  expect(html.getAttribute("data-meowui-theme-root")).toBe("meowui");
  expect(html.getAttribute("data-meowui-color-scheme")).toBe("dark");
  // The page follows a live selection with the container.
  config.value = standardOptions.select({ scheme: "light" });
  await Promise.resolve();
  expect(html.getAttribute("data-meowui-color-scheme")).toBe("light");

  a.unmount();
  expect(html.hasAttribute("data-meowui-page")).toBe(true);
  b.unmount();
  expect(html.hasAttribute("data-meowui-page")).toBe(false);
  expect(html.hasAttribute("data-meowui-theme-root")).toBe(false);
});

test("an embedded region leaves the page to its host", () => {
  const document = freshDocument();
  const root = document.createElement("main");
  const runtime = createRuntime({
    plugins: [
      createMeowUI({ components: [Button] }),
      createMeowUITheme({ theme: standardTheme, page: false }),
    ],
  });
  const mounted = createWebRenderer(runtime).render(h(Button, {}, "Save"), root);
  expect(root.getAttribute("data-meowui-theme-root")).toBe("meowui");
  expect(document.documentElement.hasAttribute("data-meowui-page")).toBe(false);
  expect(document.documentElement.hasAttribute("data-meowui-theme-root")).toBe(false);
  mounted.unmount();
});

test("the theme paints a marked page with its canvas and color scheme", () => {
  const css = standardTheme.cssText;
  expect(css).toContain(":where(html[data-meowui-page][data-meowui-scope])");
  expect(css).toMatch(
    /html\[data-meowui-page\]\[data-meowui-color-scheme="dark"\]\)\s*\{\s*color-scheme: dark;/,
  );
});
