import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Avatar, initialsFromName, installMeowUI, meowUIComponents } from "../../../src/index";

function html(view: unknown) {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  return createWebRenderer(runtime).renderToHtml(view as never);
}

test("initials use the first letters of one or two names", () => {
  expect(initialsFromName("Ada Lovelace")).toBe("AL");
  expect(initialsFromName("Grace")).toBe("GR");
  expect(initialsFromName("  ")).toBe("?");
});

test("avatar names the figure and keeps initials when no image is supplied", () => {
  const output = html(<Avatar name="Ada Lovelace" />);
  expect(output).toContain('role="img"');
  expect(output).toContain('aria-label="Ada Lovelace"');
  expect(output).toContain('data-meowui-part="avatar/initials">AL');
  expect(output).not.toContain("<img");
});

test("an image is decorative on top of the named figure", () => {
  const output = html(<Avatar name="Ada Lovelace" src="/ada.png" size="small" />);
  expect(output).toContain('src="/ada.png"');
  expect(output).toContain('data-option-avatar-size="small"');
  expect(output).toContain('data-meowui-part="avatar/image"');
});
