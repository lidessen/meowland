import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { createRuntime, h, signal } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { installMeowUI, meowUIComponents } from "../../../src/registry";
import { NavList, type NavListItem } from "../../../src/components/nav-list";

const dom = new Window() as unknown as Record<string, unknown>;
for (const key of [
  "document",
  "HTMLElement",
  "HTMLAnchorElement",
  "HTMLButtonElement",
  "Element",
  "Node",
  "MouseEvent",
  "ResizeObserver",
  "MutationObserver",
]) {
  Object.defineProperty(globalThis, key, {
    value: dom[key],
    configurable: true,
    writable: true,
  });
}

function renderer() {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  return createWebRenderer(runtime);
}

function mount(node: unknown) {
  const host = document.createElement("div");
  document.body.append(host);
  const mounted = renderer().mount(node as never, host);
  return {
    host,
    unmount() {
      mounted.unmount();
      host.remove();
    },
  };
}

const navGroups = (items: readonly NavListItem[], label = "Components") => [{ label, items }];

test("NavList renders a labelled nav landmark with groups and item slots", () => {
  const html = renderer().renderToHtml(
    <NavList
      label="Documentation"
      className="host-nav"
      groups={[
        {
          id: "overview",
          label: "Overview",
          items: [
            {
              id: "home",
              label: "Home",
              href: "#home",
              icon: <span data-icon="home" />,
              badge: "New",
              meta: "12",
              description: "Start here.",
            },
            { id: "palette", label: "Open command palette" },
          ],
        },
        {
          label: "Guides",
          items: [{ id: "authoring", label: "Authoring pages", href: "#authoring" }],
        },
      ]}
    />,
  );
  expect(html).toContain('class="host-nav"');
  expect(html).toContain('aria-label="Documentation"');
  expect(html).toContain('data-meowui-part="nav-list/root"');
  for (const part of [
    "root",
    "group",
    "groupTitle",
    "list",
    "item",
    "icon",
    "label",
    "badge",
    "meta",
    "description",
  ])
    expect(html).toContain(`data-meowui-part="nav-list/${part}"`);
  expect(html).toContain('<section id="overview" data-meowui-part="nav-list/group">');
  expect(html).toContain('<h2 data-meowui-part="nav-list/groupTitle">Overview</h2>');
  expect([...html.matchAll(/data-meowui-part="nav-list\/groupTitle"/g)]).toHaveLength(2);
  expect([...html.matchAll(/data-meowui-part="nav-list\/item"/g)]).toHaveLength(3);
  expect(html).toContain('<a href="#home"');
  expect(html).toContain('type="button"');
  expect(html.indexOf('data-meowui-part="nav-list/groupTitle"')).toBeLessThan(
    html.indexOf('data-meowui-part="nav-list/list"'),
  );
  expect(html.indexOf('data-meowui-part="nav-list/list"')).toBeLessThan(
    html.indexOf('data-meowui-part="nav-list/item"'),
  );
  expect(html).toContain("Start here.");
});

test("activeId marks exactly one item as the current page", () => {
  const items: readonly NavListItem[] = [
    { id: "page", label: "Page", href: "#page" },
    { id: "section", label: "Section", href: "#section" },
    { id: "palette", label: "Open command palette" },
  ];
  const link = renderer().renderToHtml(
    <NavList label="Components" activeId="section" groups={navGroups(items)} />,
  );
  expect([...link.matchAll(/aria-current="page"/g)]).toHaveLength(1);
  expect(link).toMatch(/href="#section"[^>]*aria-current="page"/);

  const button = renderer().renderToHtml(
    <NavList label="Actions" activeId="palette" groups={navGroups(items, "Actions")} />,
  );
  expect([...button.matchAll(/aria-current="page"/g)]).toHaveLength(1);
  expect(button).toMatch(/<button type="button"[^>]*aria-current="page"/);
});

test("activeId accepts a Signal and keeps aria-current live without rebuilding the rows", async () => {
  const active = signal("page");
  const view = mount(
    <NavList
      label="Components"
      activeId={active}
      groups={navGroups([
        { id: "page", label: "Page", href: "#page" },
        { id: "section", label: "Section", href: "#section" },
      ])}
    />,
  );
  const currentHref = () => view.host.querySelector('a[aria-current="page"]')?.getAttribute("href");
  expect(currentHref()).toBe("#page");
  const pageLink = view.host.querySelector('a[href="#page"]');

  active.value = "section";
  await Promise.resolve();

  expect(currentHref()).toBe("#section");
  // The row mount is stable; only the bound attribute changed.
  expect(view.host.querySelector('a[href="#page"]')).toBe(pageLink);
  expect(view.host.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  view.unmount();
});

test("items without href are buttons that call onSelect; anchors leave routing to the host", () => {
  const selected: NavListItem[] = [];
  const view = mount(
    <NavList
      label="Actions"
      onSelect={(item) => selected.push(item)}
      groups={navGroups(
        [
          { id: "palette", label: "Open command palette" },
          { id: "docs", label: "Read the docs", href: "#docs" },
        ],
        "Actions",
      )}
    />,
  );
  const button = view.host.querySelector<HTMLButtonElement>(
    'button[data-meowui-part="nav-list/item"]',
  )!;
  button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  expect(selected.map((item) => item.id)).toEqual(["palette"]);

  const anchor = view.host.querySelector<HTMLAnchorElement>('a[data-meowui-part="nav-list/item"]')!;
  const click = new MouseEvent("click", { bubbles: true, cancelable: true });
  anchor.dispatchEvent(click);
  expect(click.defaultPrevented).toBe(false);
  expect(selected.map((item) => item.id)).toEqual(["palette"]);
  view.unmount();
});

test("disabled items keep their place, leave the tab order and ignore activation", () => {
  const selected: NavListItem[] = [];
  const view = mount(
    <NavList
      label="Workspaces"
      onSelect={(item) => selected.push(item)}
      groups={navGroups(
        [
          { id: "blocked-link", label: "Blocked link", href: "#blocked", disabled: true },
          { id: "blocked-action", label: "Blocked action", disabled: true },
          { id: "open", label: "Open workspace" },
        ],
        "Workspaces",
      )}
    />,
  );
  const blockedLink = view.host.querySelector<HTMLAnchorElement>(
    'a[data-meowui-part="nav-list/item"][aria-disabled="true"]',
  )!;
  expect(blockedLink.getAttribute("tabindex")).toBe("-1");
  expect(blockedLink.textContent).toContain("Blocked link");
  const blockedClick = new MouseEvent("click", { bubbles: true, cancelable: true });
  blockedLink.dispatchEvent(blockedClick);
  expect(blockedClick.defaultPrevented).toBe(true);
  expect(selected).toHaveLength(0);

  const blockedButton = view.host.querySelector<HTMLButtonElement>(
    'button[data-meowui-part="nav-list/item"][disabled]',
  )!;
  expect(blockedButton.disabled).toBe(true);
  blockedButton.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  expect(selected).toHaveLength(0);

  const openButton = view.host.querySelector<HTMLButtonElement>(
    'button[data-meowui-part="nav-list/item"]:not([disabled])',
  )!;
  openButton.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  expect(selected.map((item) => item.id)).toEqual(["open"]);
  expect(view.host.querySelectorAll('[tabindex="-1"]')).toHaveLength(1);
  view.unmount();
});

test("long labels, descriptions and child labels stay inside the item", () => {
  const longLabel = `A long navigation label ${"with-an-unbroken-identifier-".repeat(3)}end`;
  const longDescription =
    "A supporting description that is also long enough to wrap inside a narrow sidebar.";
  const html = renderer().renderToHtml(
    <NavList
      label="Long labels"
      groups={navGroups([
        { id: "long", label: longLabel, href: "#long", description: longDescription },
        { id: "rich", label: <strong>Rich label</strong>, href: "#rich" },
      ])}
    />,
  );
  expect(html).toContain(longLabel);
  expect(html).toContain(longDescription);
  expect(html).toContain("<strong>Rich label</strong>");
});

test("an empty nav list still exposes its landmark", () => {
  const html = renderer().renderToHtml(<NavList label="Empty navigation" groups={[]} />);
  expect(html).toContain('aria-label="Empty navigation"');
  expect(html).not.toContain('data-meowui-part="nav-list/item"');
});
