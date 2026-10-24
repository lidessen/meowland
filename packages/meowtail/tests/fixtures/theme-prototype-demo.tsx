import { h, type Context, type Props, type Runtime } from "meowjsx";
import { signal, type MaybeSignal } from "meowjsx/signal";
import { Button } from "../../src/components/button";
import { Field } from "../../src/components/field";
import { Input } from "../../src/components/input";
import { Select } from "../../src/components/select";
import { standardTheme, standardOptions } from "../../src/theme";
import { defineTokens, themeAttributes, type Selection } from "meowcss";
import { css, defineStyleProps, defineTheme, parts, type ThemedProps } from "meowcss/meowjsx";
import { Theme } from "meowcss/web";
import { createMeowUI } from "meowtail";
import { appOptions, buttonOptions, paneOptions } from "./theme-prototype.options";

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

interface PrototypeButtonProps extends Props, ThemedProps<typeof buttonOptions> {
  disabled?: MaybeSignal<boolean>;
}
export function PrototypeButton(
  { children, ref, ...props }: PrototypeButtonProps,
  context: Context<typeof PrototypeButton>,
) {
  return (
    <button {...props} type="button" ref={[context.parts.root, ref]}>
      {children}
    </button>
  );
}
PrototypeButton.meta = {
  name: "prototype-button",
  parts: ["root"],
  style: defineStyleProps(buttonOptions, { defaults: { variant: "quiet", size: "default" } }),
} as const;

type PaneProps = Props & ThemedProps<typeof paneOptions> & { title: string };
export function PrototypePane(
  { title, children, id, ref, ...props }: PaneProps,
  context: Context<typeof PrototypePane>,
) {
  return (
    <section {...props} id={id} ref={[context.parts.root, ref]}>
      <h3 ref={context.parts.title}>{title}</h3>
      <div ref={context.parts.body}>{children}</div>
    </section>
  );
}
PrototypePane.meta = {
  name: "prototype-pane",
  parts: ["root", "title", "body"],
  style: defineStyleProps(paneOptions, {
    defaults: { tone: "normal" },
    parts: ["root", "title"],
  }),
} as const;

export function installPrototype(runtime: Runtime) {
  return runtime.use(createMeowUI({ components: [PrototypeButton, PrototypePane] }));
}

const button = parts<typeof PrototypeButton>("prototype-button");
const pane = parts<typeof PrototypePane>("prototype-pane");
export const prototypeStyles = css`
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
  ${button.root} {
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
  ${pane.root} {
    padding: 12px;
    border: 1px solid ${ui.color.border};
    border-radius: 7px;
  }
  ${pane.title} {
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
`;
export const prototypeTheme = defineTheme({
  options: appOptions,
  defaults: { scheme: "light", density: "normal" },
  tokens: [ui, buttonTokens],
  styles: prototypeStyles,
});
export const prototypeCSS = prototypeTheme.cssText;

export function PrototypeDemo(_props: Props) {
  const application = signal<Selection>(appOptions.select({ scheme: "light", density: "normal" }));
  const local = signal<Selection>(appOptions.select({}));
  const variant = signal<"quiet" | "outline" | undefined>("outline");
  const clicks = signal(0);
  return (
    <Theme theme={prototypeTheme} config={application} id="scope-root" className="pt-app">
      <h1>Parameterized theme prototype</h1>
      <p>
        Region configuration changes colors and density; component options independently change
        their own rules. Input, focus, and expansion state should be preserved.
      </p>
      <div className="pt-controls">
        <button
          onClick={() => application.set(appOptions.select({ scheme: "light", density: "normal" }))}
        >
          Light globally
        </button>
        <button
          onClick={() => application.set(appOptions.select({ scheme: "dark", density: "normal" }))}
        >
          Dark globally
        </button>
        <button
          onClick={() => application.set(appOptions.select({ scheme: "dark", density: "compact" }))}
        >
          Dark compact
        </button>
        <button
          onClick={() => application.set(appOptions.select({ scheme: "auto", density: "normal" }))}
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
}
PrototypeDemo.meta = { name: "prototype-demo", parts: [] } as const;
