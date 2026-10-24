import { expect, test } from "bun:test";
import { h, defaultRuntime } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { WindowTitleBar } from "../../../src/components/window-title-bar";
import { installMeowUI, meowUIComponents } from "../../../src/registry";
import { standardTheme } from "../../../src/theme";

installMeowUI({ components: meowUIComponents }, defaultRuntime);

test("the title bar is a header with leading, title and trailing slots", () => {
  const html = renderToHtml(
    <WindowTitleBar
      title="Meowland"
      leading={<button type="button">Back</button>}
      trailing={<button type="button">Search</button>}
    />,
  );
  expect(html).toContain("<header");
  expect(html).toContain('data-meowui-part="window-title-bar/root"');
  for (const part of ["leading", "title", "trailing"])
    expect(html).toContain(`data-meowui-part="window-title-bar/${part}"`);
  expect(html).toContain("Meowland");
  expect(html.indexOf("Back")).toBeLessThan(html.indexOf("Meowland"));
  expect(html.indexOf("Meowland")).toBeLessThan(html.indexOf("Search"));
});

test("the theme makes the bar a drag area that keeps clear of the shell's room", () => {
  const css = standardTheme.cssText;
  const root = 'data-meowui-part="window-title-bar/root"';
  expect(css).toContain(root);
  expect(css).toContain("--app-region: drag");
  expect(css).toContain("--app-region: no-drag");
  expect(css).toContain("var(--mygo-titlebar-height,");
  expect(css).toContain("var(--mygo-titlebar-inset-left,");
  expect(css).toContain("var(--mygo-titlebar-inset-right,");
});
