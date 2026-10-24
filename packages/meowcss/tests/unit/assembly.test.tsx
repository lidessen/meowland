import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { css, defineOptions, defineTokens } from "meowcss";
import { css as adapterCSS, defineStyleProps, parts, defineTheme } from "meowcss/meowjsx";
import { Theme } from "meowcss/web";

const buttonOptions = defineOptions("button", {
  size: ["small", "default", "large"],
});
const Button = (_props: Record<string, unknown>) => null;
Button.meta = {
  name: "button",
  parts: ["root"],
  style: defineStyleProps(buttonOptions, { defaults: { size: "default" } }),
} as const;
const root = parts<typeof Button>("button").root;
const options = defineOptions("assembly-test", {
  density: ["compact", "normal"],
});
const tokens = defineTokens("assembly-test", {
  surface: ["white", "black"],
  gap: options.by.density(["4px", "8px"]),
});
const instance = defineTokens("assembly-button", {
  borderWidth: "1px",
  height: buttonOptions.by.size(["24px", "28px", "32px"]),
});
const buttonCSS = adapterCSS`
  ${root} {
    min-height: ${instance.height};
  }
`;
const config = {
  options,
  defaults: { scheme: "light", density: "normal" },
  tokens: [tokens, { at: root, values: instance }],
  styles: adapterCSS`
    ${buttonCSS}
  `,
} as const;

test("root-created token definitions and plain fragments share the adapter's module identity", () => {
  const shared = defineTokens("shared-entry", { ink: "navy" });
  const plain = css`
    body {
      color: ${shared.ink};
    }
  `;
  const theme = defineTheme({
    ...config,
    tokens: [shared],
    styles: adapterCSS`
      ${plain} ${root} {
        color: ${shared.ink};
      }
    `,
  });
  expect(theme.cssText).toContain("--shared-entry-ink: navy;");
  expect(theme.cssText).toContain("color: var(--shared-entry-ink);");
  expect(theme.cssText).toContain(':where([data-meowui-part="button/root"]) {');
});

test("assembly derives sources through nested CSS without duplicate component lists", () => {
  const theme = defineTheme(config);
  expect(theme.cssText).toContain('[data-option-button-size="small"]');
  expect(theme.cssText).toContain("--assembly-button-height: 24px");
  expect(theme.cssText).toContain(
    ':where([data-meowui-part="button/root"]) {\n  --assembly-button-border-width: 1px;',
  );
  expect(theme.cssText).toContain('[data-option-assembly-test-density="compact"]');
  expect(theme.defaults.attributes[options.attribute("density")]).toBe("normal");
});

test("root applies defaults and partial configuration; local scope only emits explicit choices", () => {
  const theme = defineTheme(config);
  const web = createWebRenderer(createRuntime());
  const html = web.renderToHtml(
    h(
      Theme,
      { theme, config: options.select({ scheme: "dark" }) },
      h(Theme, { config: options.select({ density: "compact" }), id: "local" }, "Local"),
    ),
  );
  expect(html).toContain('data-meowui-color-scheme="dark"');
  expect(html).toContain('data-option-assembly-test-density="normal"');
  const local = html.slice(html.indexOf('<div id="local"'));
  expect(local).toContain('data-option-assembly-test-density="compact"');
  expect(local).not.toContain("data-meowui-color-scheme");
  expect(local).not.toContain("data-meowui-theme-root");
  const defaults = web.renderToHtml(h(Theme, { theme }, "Root"));
  expect(defaults).toContain('data-meowui-color-scheme="light"');
});

test("assembly rejects missing defaults and collisions across token collections", () => {
  expect(() => defineTheme({ ...config, defaults: { scheme: "light" } } as never)).toThrow(
    "Missing theme default: density",
  );
  expect(() =>
    defineTheme({
      ...config,
      defaults: { scheme: "light", density: "dense" },
    } as never),
  ).toThrow("Invalid selection");
  expect(() =>
    defineTheme({
      ...config,
      tokens: [tokens, defineTokens("assembly-test", { gap: "5px" })],
    }),
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
  ).not.toThrow();
  expect(defineTheme({ ...config, tokens: [instance] }).cssText).toContain(
    '[data-option-button-size="small"]',
  );
});

test("ordinary token paths cannot be mistaken for assembly descriptors", () => {
  const named = defineTokens("named", {
    at: { contract: "1px" },
    values: "2px",
  });
  const theme = defineTheme({ ...config, tokens: [named] });
  expect(theme.cssText).toContain("--named-at-contract: 1px");
  expect(theme.cssText).toContain("--named-values: 2px");
});

test("shared component option definitions collect every carrier without duplicating declarations", () => {
  const shared = defineOptions("shared-layout", { gap: ["small", "large"] });
  const stack = {
    style: defineStyleProps(shared, { defaults: { gap: "small" } }),
  };
  const inline = { style: stack.style };
  const spacing = defineTokens("shared-layout", {
    gap: shared.by.gap(["4px", "8px"]),
  });
  function Stack() {
    return null;
  }
  Stack.meta = {
    name: "test-stack",
    parts: ["root"],
    style: stack.style,
  } as const;
  function Inline() {
    return null;
  }
  Inline.meta = {
    name: "test-inline",
    parts: ["root"],
    style: inline.style,
  } as const;
  const stackRoot = parts<typeof Stack>("test-stack").root;
  const inlineRoot = parts<typeof Inline>("test-inline").root;
  const theme = defineTheme({
    ...config,
    tokens: [spacing],
    styles: adapterCSS`
      ${stackRoot}, ${inlineRoot} {
        gap: ${spacing.gap};
      }
    `,
  });
  expect(theme.cssText).toContain('[data-meowui-part="test-stack/root"]');
  expect(theme.cssText).toContain('[data-meowui-part="test-inline/root"]');
  expect(theme.cssText.match(/--shared-layout-gap: 4px/g)).toHaveLength(1);
});

// Public assembly checks: invalid input must not widen O through defaults.
function checkAssemblyTypes() {
  // @ts-expect-error Root defaults must cover custom options too.
  defineTheme({ ...config, defaults: { scheme: "light" } });
  // @ts-expect-error Invalid default value cannot widen the declared options.
  defineTheme({ ...config, defaults: { scheme: "light", density: "dense" } });
  // @ts-expect-error Unknown default field.
  defineTheme({
    ...config,
    defaults: { scheme: "light", density: "normal", size: "small" },
  });
}
void checkAssemblyTypes;
