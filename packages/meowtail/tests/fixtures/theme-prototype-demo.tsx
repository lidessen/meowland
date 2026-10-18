import { defineComponent, h, type Child, type Runtime } from "meowjsx";
import { Button, Field, Input, Select } from "../../src/components";
import { standardTheme, standardOptions } from "../../src/theme";
import {
  defineTheme,
  defineStyleProps,
  partSelector,
  css,
  type ThemedProps,
} from "meowcss/meowjsx";
import { Theme } from "meowcss/web";
import { themeAttributes, defineOptions, defineTokens, type Selection } from "meowcss";

export const appOptions = defineOptions("prototype-app", { density: ["compact", "normal"] });
export const buttonOptions = defineOptions("prototype-button", {
  variant: ["quiet", "outline"],
  size: ["small", "default"],
});
export const paneOptions = defineOptions("prototype-pane", { tone: ["normal", "emphasis"] });
export const ui = defineTokens("prototype-ui", {
  color: {
    surface: ["#ffffff", "#242426"],
    text: ["#252527", "#ededee"],
    border: ["#dcdce0", "#424247"],
    emphasis: ["#b33636", "#f39d9d"],
  },
  control: {
    height: appOptions.by.density(["28px", "36px"]),
    small: appOptions.by.density(["24px", "28px"]),
  },
  space: "12px",
});
export const buttonTokens = defineTokens("prototype-button", {
  surface: ["#eeeef0", "#303033"],
  height: buttonOptions.by.size({ small: `${ui.control.small}`, default: `${ui.control.height}` }),
});
export const buttonContract = {
  name: "prototype-button",
  parts: ["root"],
  styleProps: defineStyleProps(buttonOptions, { defaults: { variant: "quiet", size: "default" } }),
} as const;
export const paneContract = {
  name: "prototype-pane",
  parts: ["root", "title", "body"],
  styleProps: defineStyleProps(paneOptions, {
    defaults: { tone: "normal" },
    parts: ["root", "title"],
  }),
} as const;
type ButtonProps = ThemedProps<typeof buttonOptions> & {
  id?: string;
  children?: Child;
  disabled?: boolean;
  onClick?: () => void;
};
export const PrototypeButton = defineComponent(
  buttonContract,
  ({ children, ...props }: ButtonProps, context) =>
    context.part("root", "button", { ...props, type: "button" }, children),
);
type PaneProps = ThemedProps<typeof paneOptions> & { title: string; children?: Child; id?: string };
const PrototypePane = defineComponent(paneContract, ({ title, children, id }: PaneProps, context) =>
  context.part(
    "root",
    "section",
    { id },
    context.part("title", "h3", {}, title),
    context.part("body", "div", {}, children),
  ),
);
export function installPrototype(runtime: Runtime) {
  return runtime.use({ components: [buttonContract, paneContract] });
}
const root = partSelector(buttonContract, "root");
const pane = partSelector(paneContract, "root");
const title = partSelector(paneContract, "title");
export const prototypeTheme = defineTheme({
  options: appOptions,
  defaults: { scheme: "light", density: "normal" },
  tokens: [ui, buttonTokens],
  styles: css`
    .pt-app {
      font:
        13px/1.55 -apple-system,
        BlinkMacSystemFont,
        sans-serif;
      color: ${ui.color.text};
      background: ${ui.color.surface};
      padding: 24px;
      max-width: 920px;
      margin: auto;
    }
    .pt-app h1 {
      font-size: 20px;
      margin: 0 0 8px;
    }
    .pt-app h2 {
      font-size: 15px;
      margin: 0 0 12px;
    }
    .pt-app p {
      margin: 0 0 12px;
    }
    .pt-stack {
      display: grid;
      gap: 16px;
    }
    .pt-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .pt-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding-bottom: 16px;
    }
    .pt-controls button {
      font: inherit;
      padding: 5px 10px;
      border: 1px solid ${ui.color.border};
      color: inherit;
      background: ${ui.color.surface};
      border-radius: 6px;
      cursor: pointer;
    }
    .pt-card {
      padding: 16px;
      border: 1px solid ${ui.color.border};
      border-radius: 10px;
      background: ${ui.color.surface};
      color: ${ui.color.text};
    }
    .pt-input {
      font: inherit;
      padding: 6px 8px;
      border: 1px solid ${ui.color.border};
      color: inherit;
      background: ${ui.color.surface};
      border-radius: 6px;
      max-width: 100%;
      box-sizing: border-box;
    }
    .pt-fixed-surface {
      ${ui.color.surface.name}: #f4e9cd;
      ${ui.color.text.name}: #252527;
    }
    .pt-reference {
      background: #fff;
      color: #252527;
      color-scheme: light;
    }
    ${root} {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      font: inherit;
      min-height: ${buttonTokens.height};
      padding: 0 10px;
      border: 0 solid transparent;
      border-radius: 7px;
      color: ${ui.color.text};
      background: ${buttonTokens.surface};
      cursor: pointer;
      ${buttonOptions.when({ variant: "outline" })} {
        background: transparent;
        border: 1px solid ${ui.color.border};
      }
      &:hover:not(:disabled) {
        filter: brightness(0.94);
      }
      &:focus-visible {
        outline: 2px solid #4b7bca;
        outline-offset: 2px;
      }
      &:disabled {
        opacity: 0.5;
        cursor: default;
      }
    }
    ${pane} {
      padding: 12px;
      border: 1px solid ${ui.color.border};
      border-radius: 7px;
    }
    ${title} {
      font-size: 13px;
      margin: 0 0 8px;
      color: ${ui.color.text};
      ${paneOptions.when({ tone: "emphasis" })} {
        color: ${ui.color.emphasis};
      }
    }
    @media (max-width: 480px) {
      .pt-app {
        padding: 12px;
      }
    }
  `,
});
export const prototypeCSS = prototypeTheme.cssText;

export const PrototypeDemo = defineComponent(
  { name: "prototype-demo", parts: [] },
  (_props: object, context) => {
    const application = context.signal<Selection>(
      appOptions.select({ scheme: "light", density: "normal" }),
    );
    const local = context.signal<Selection>(appOptions.select({}));
    const variant = context.signal<"quiet" | "outline" | undefined>("outline");
    const clicks = context.signal(0);
    return (
      <Theme theme={prototypeTheme} config={application} id="scope-root" className="pt-app">
        <h1>Parameterized theme prototype</h1>
        <p>
          Region configuration changes colors and density; component options independently change
          their own rules. Input, focus, and expansion state should be preserved.
        </p>
        <div className="pt-controls">
          <button
            onClick={() =>
              application.set(appOptions.select({ scheme: "light", density: "normal" }))
            }
          >
            Light globally
          </button>
          <button
            onClick={() =>
              application.set(appOptions.select({ scheme: "dark", density: "normal" }))
            }
          >
            Dark globally
          </button>
          <button
            onClick={() =>
              application.set(appOptions.select({ scheme: "dark", density: "compact" }))
            }
          >
            Dark compact
          </button>
          <button
            onClick={() =>
              application.set(appOptions.select({ scheme: "auto", density: "normal" }))
            }
          >
            Follow system
          </button>
        </div>
        <div className="pt-stack">
          <section className="pt-card">
            <h2>Instance options</h2>
            <div className="pt-row">
              <PrototypeButton
                id="dynamic-button"
                variant={variant}
                onClick={() => clicks.update((n) => n + 1)}
              >
                Toggleable button
              </PrototypeButton>
              <PrototypeButton id="small-button" size="small">
                Small
              </PrototypeButton>
              <PrototypeButton disabled>Disabled</PrototypeButton>
              <button onClick={() => variant.set("quiet")}>Switch to quiet</button>
              <button onClick={() => variant.set(undefined)}>Restore defaults</button>
              <output id="click-count">{clicks}</output>
            </div>
          </section>
          <section className="pt-card">
            <h2>Local configuration and in-place updates</h2>
            <div className="pt-controls">
              <button onClick={() => local.set(appOptions.select({ density: "compact" }))}>
                Compact locally
              </button>
              <button onClick={() => local.set(appOptions.select({ scheme: "light" }))}>
                Light locally
              </button>
              <button onClick={() => local.set(appOptions.select({ scheme: "auto" }))}>
                Follow system locally
              </button>
              <button onClick={() => local.set(appOptions.select({}))}>Undo local</button>
            </div>
            <Theme config={local} id="scope-local" className="pt-card pt-stack">
              <div className="pt-row">
                <PrototypeButton id="local-button">Inherit region parameters</PrototypeButton>
                <input
                  id="draft"
                  aria-label="Draft"
                  className="pt-input"
                  placeholder="Content entered before switching"
                />
              </div>
              <details id="details">
                <summary>Expansion state check</summary>
                <p>This node should stay in place when the configuration changes.</p>
              </details>
            </Theme>
          </section>
          <PrototypePane id="outer-pane" title="Outer emphasized title" tone="emphasis">
            <PrototypePane id="inner-pane" title="Inner default title">
              <p>The inner pane does not inherit the outer component options.</p>
            </PrototypePane>
          </PrototypePane>
          <section className="pt-card pt-fixed-surface" id="override-parent">
            <h2>Native variable overrides</h2>
            <Theme
              config={appOptions.select({ scheme: "dark" })}
              className="pt-card"
              id="override-child"
            >
              An explicit dark boundary redeclares colors.
            </Theme>
          </section>
          <section
            className="pt-card pt-reference"
            {...themeAttributes(standardTheme, standardOptions.select({ scheme: "light" }))}
          >
            <h2>Existing component reference · light</h2>
            <div className="pt-row">
              <Button>Standard Button</Button>
              <Input aria-label="Standard input" placeholder="Existing Input" />
              <Select aria-label="Native rows" size={2}>
                <option>First row</option>
                <option>Second row</option>
              </Select>
            </div>
            <Field label="Standard Field" htmlFor="reference-input">
              <Input id="reference-input" />
            </Field>
          </section>
        </div>
      </Theme>
    );
  },
);
