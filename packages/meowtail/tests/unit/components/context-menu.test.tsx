import { expect, test } from "bun:test";
import { createRuntime, h, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { ContextMenu, MenuButton, installMeowUI, meowUIComponents } from "../../../src/index";

test("context menu reuses menu items and opens from the surface", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  let surface: Props | undefined;
  const events: string[] = [];
  runtime.use({
    render({ vnode }, next) {
      if (typeof vnode.props.onContextMenu === "function") surface = vnode.props;
      return next(vnode);
    },
  });
  const html = createWebRenderer(runtime).renderToHtml(
    <ContextMenu
      id="file-actions"
      onOpenChange={(open) => events.push(String(open))}
      items={[{ id: "open", label: "Open", onSelect: () => events.push("open") }]}
    >
      Region
    </ContextMenu>,
  );
  expect(html).toContain('data-meowui-part="context-menu/root"');
  expect(html).toContain('role="menu"');
  expect(html).toContain("Open");
  expect(surface?.["aria-haspopup"]).toBe("menu");
  const open = surface!.onContextMenu as (event: {
    preventDefault(): void;
    clientX: number;
    clientY: number;
  }) => void;
  open({
    preventDefault() {},
    clientX: 24,
    clientY: 48,
  });
  expect(events).toContain("true");
});

test("menu button composes a labeled trigger with the existing menu", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const html = createWebRenderer(runtime).renderToHtml(
    <MenuButton id="export" variant="outline" items={[{ id: "text", label: "Plain text" }]}>
      Export
    </MenuButton>,
  );
  expect(html).toContain("Export");
  expect(html).toContain('data-meowui-part="button/root"');
  expect(html).toContain('role="menu"');
  expect(html).toContain("Plain text");
});
