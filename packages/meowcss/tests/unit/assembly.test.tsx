import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { css, defineOptions, defineTokens } from "meowcss/meowjsx";
import { defineStyleProps, partSelector } from "meowcss/meowjsx";
import { defineTheme } from "meowcss/meowjsx";
import { Theme } from "meowcss/web";
import { css as plainCSS, defineTokens as createCoreTokens } from "meowcss";

const buttonOptions = defineOptions("button", { size: ["small", "default", "large"] });
const buttonContract = {
  name: "button",
  parts: ["root"],
  styleProps: defineStyleProps(buttonOptions, { defaults: { size: "default" } }),
} as const;

const options = defineOptions("assembly-test", { density: ["compact", "normal"] });
const root = partSelector(buttonContract, "root");
const tokens = defineTokens("assembly-test", {
  surface: ["white", "black"],
  gap: options.by.density(["4px", "8px"]),
});
const instance = defineTokens("assembly-button", {
  borderWidth: "1px",
  height: buttonOptions.by.size(["24px", "28px", "32px"]),
});
const buttonCSS = css`
  ${root} {
    min-height: ${instance.height};
  }
`;
const config = {
  options,
  defaults: { scheme: "light", density: "normal" },
  tokens: [tokens, { at: root, values: instance }],
  styles: css`
    ${buttonCSS}
  `,
} as const;

test("root-created token definitions and plain fragments share the adapter's module identity", () => {
  const shared = createCoreTokens("shared-entry", { ink: "navy" });
  const plain = plainCSS`body { color: ${shared.ink}; }`;
  const theme = defineTheme({
    ...config,
    tokens: [shared],
    styles: css`
      ${plain} ${root} {
        color: ${shared.ink};
      }
    `,
  });
  expect(theme.cssText).toContain("--shared-entry-ink: navy;");
  expect(theme.cssText).toContain("body { color: var(--shared-entry-ink); }");
  expect(theme.cssText).toContain(String(root));
});

test("assembly derives sources through nested CSS without duplicate component lists", () => {
  const theme = defineTheme(config);
  expect(theme.cssText).toContain('[data-option-button-size="small"]');
  expect(theme.cssText).toContain("--assembly-button-height: 24px");
  expect(theme.cssText).toContain(`${root} {\n  --assembly-button-border-width: 1px;`);
  expect(theme.cssText).toContain('[data-option-assembly-test-density="compact"]');
  expect(theme.defaults.attributes[options.attribute("density")]).toBe("normal");
});

test("root applies defaults and partial configuration; local scope only emits explicit choices", () => {
  const theme = defineTheme(config);
  const web = createWebRenderer(createRuntime());
  const html = web.renderToHtml(
    <Theme theme={theme} config={options.select({ scheme: "dark" })}>
      <Theme config={options.select({ density: "compact" })} id="local">
        Local
      </Theme>
    </Theme>,
  );
  expect(html).toContain('data-meowui-color-scheme="dark"');
  expect(html).toContain('data-option-assembly-test-density="normal"');
  const local = html.slice(html.indexOf('<div id="local"'));
  expect(local).toContain('data-option-assembly-test-density="compact"');
  expect(local).not.toContain("data-meowui-color-scheme");
  expect(local).not.toContain("data-meowui-theme-root");
  const defaults = web.renderToHtml(<Theme theme={theme}>Root</Theme>);
  expect(defaults).toContain('data-meowui-color-scheme="light"');
});

test("assembly rejects missing defaults and collisions across token collections", () => {
  expect(() => defineTheme({ ...config, defaults: { scheme: "light" } } as never)).toThrow(
    "Missing theme default: density",
  );
  expect(() =>
    defineTheme({ ...config, defaults: { scheme: "light", density: "dense" } } as never),
  ).toThrow("Invalid selection");
  expect(() =>
    defineTheme({ ...config, tokens: [tokens, defineTokens("assembly-test", { gap: "5px" })] }),
  ).toThrow("Token name collision");
  expect(() =>
    defineTheme({
      ...config,
      tokens: [instance],
      styles: css`
        button {
        }
      `,
    }),
  ).toThrow("Missing source binding");
});

test("ordinary token paths cannot be mistaken for assembly descriptors", () => {
  const named = defineTokens("named", { at: { contract: "1px" }, values: "2px" });
  const theme = defineTheme({ ...config, tokens: [named] });
  expect(theme.cssText).toContain("--named-at-contract: 1px");
  expect(theme.cssText).toContain("--named-values: 2px");
});

test("shared component option definitions collect every carrier without duplicating declarations", () => {
  const shared = defineOptions("shared-layout", { gap: ["small", "large"] });
  const stack = {
    name: "test-stack",
    parts: ["root"],
    styleProps: defineStyleProps(shared, { defaults: { gap: "small" } }),
  } as const;
  const inline = { name: "test-inline", parts: ["root"], styleProps: stack.styleProps } as const;
  const spacing = defineTokens("shared-layout", { gap: shared.by.gap(["4px", "8px"]) });
  const theme = defineTheme({
    ...config,
    tokens: [spacing],
    styles: css`
      ${partSelector(stack, "root")}, ${partSelector(inline, "root")} {
        gap: ${spacing.gap};
      }
    `,
  });
  expect(theme.cssText).toContain("test-stack/root");
  expect(theme.cssText).toContain("test-inline/root");
  expect(theme.cssText.match(/--shared-layout-gap: 4px/g)).toHaveLength(1);
});

// Public assembly checks: invalid input must not widen O through defaults.
function checkAssemblyTypes() {
  // @ts-expect-error Root defaults must cover custom options too.
  defineTheme({ ...config, defaults: { scheme: "light" } });
  // @ts-expect-error Invalid default value cannot widen the declared options.
  defineTheme({ ...config, defaults: { scheme: "light", density: "dense" } });
  // @ts-expect-error Unknown default field.
  defineTheme({ ...config, defaults: { scheme: "light", density: "normal", size: "small" } });
}
void checkAssemblyTypes;
