import { expect, test } from "bun:test";
import { css, defineOptions, defineTheme, defineTokens, themeAttributes } from "meowcss";

test("plain CSS consumers assemble scoped tokens and explicit source bindings without JSX", () => {
  const view = defineOptions("reader", { density: ["compact", "normal"] });
  const control = defineOptions("reader-control", { size: ["small", "large"] });
  const base = defineTokens("reader", {
    ink: ["black", "white"],
    gap: view.by.density(["4px", "8px"]),
  });
  const local = defineTokens("reader-control", {
    border: "1px",
    height: control.by.size(["24px", "36px"]),
  });
  const theme = defineTheme({
    options: view,
    defaults: { scheme: "auto", density: "normal" },
    tokens: [base, { at: ".control", values: local }],
    sources: [{ options: control, selector: ".control" }],
    styles: css`
      .control {
        color: ${base.ink};
        min-height: ${local.height};
      }
    `,
  });
  expect(theme.cssText).toContain(".control {\n  --reader-control-border: 1px;");
  expect(theme.cssText).toContain('.control:where([data-option-reader-control-size="small"])');
  expect(theme.cssText).toContain("--reader-control-height: 24px;");
  expect(theme.cssText).toContain("@media (prefers-color-scheme: dark)");
  expect(themeAttributes(theme, view.select({ scheme: "dark" }))).toEqual({
    "data-meowui-scope": "",
    "data-meowui-theme-root": "reader",
    "data-meowui-color-scheme": "dark",
    "data-option-reader-density": "normal",
  });
  expect(themeAttributes(undefined, view.select({ density: "compact" }))).toEqual({
    "data-meowui-scope": "",
    "data-option-reader-density": "compact",
  });
});
