import { defineComponent, h } from "meowjsx";
import {
  Alert,
  Button,
  alertContract,
  alertOptions,
  buttonContract,
  buttonOptions,
} from "../../src/components";
import { css, defineTheme, partSelector } from "meowcss/meowjsx";
import { defineOptions, defineTokens, type Selection } from "meowcss";
import { Theme } from "meowcss/web";

export const controlsOptions = defineOptions("controls-trial", { density: ["compact", "normal"] });
const ui = defineTokens("controls-trial", {
  surface: ["#fff", "#242426"],
  text: ["#252527", "#ededee"],
  border: ["#dcdce0", "#424247"],
  muted: ["#eeeef0", "#303033"],
  primary: ["#303035", "#ededee"],
  onPrimary: ["#fff", "#252527"],
  danger: ["#b33636", "#f39d9d"],
  onDanger: ["#fff", "#382121"],
  info: ["#29649a", "#8cbcf0"],
  success: ["#34704e", "#8cc9a6"],
  warning: ["#88601e", "#dfbb77"],
  small: controlsOptions.by.density(["24px", "28px"]),
  height: controlsOptions.by.density(["28px", "36px"]),
  large: controlsOptions.by.density(["32px", "40px"]),
});
const buttonTokens = defineTokens("controls-button", {
  borderWidth: "1px",
  height: buttonOptions.by.size({
    small: `${ui.small}`,
    default: `${ui.height}`,
    large: `${ui.large}`,
  }),
});
const alertTokens = defineTokens("controls-alert", {
  accent: alertOptions.by.tone({
    info: `${ui.info}`,
    success: `${ui.success}`,
    warning: `${ui.warning}`,
    danger: `${ui.danger}`,
  }),
});
const button = partSelector(buttonContract, "root");
const alert = partSelector(alertContract, "root");
const title = partSelector(alertContract, "title");
const body = partSelector(alertContract, "body");
const actions = partSelector(alertContract, "actions");

const buttonCSS = css`
  ${button} {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: ${buttonTokens.height};
    padding: 0 10px;
    gap: 6px;
    font: inherit;
    border: ${buttonTokens.borderWidth} solid transparent;
    border-radius: 7px;
    background: transparent;
    color: ${ui.text};
    cursor: pointer;
    ${buttonOptions.when({ variant: "primary" })} {
      background: ${ui.primary};
      color: ${ui.onPrimary};
    }
    ${buttonOptions.when({ variant: "danger" })} {
      background: ${ui.danger};
      color: ${ui.onDanger};
    }
    ${buttonOptions.when({ variant: "outline" })} {
      border-color: ${ui.border};
      background: ${ui.surface};
    }
    @media (hover: hover) {
      &:hover:not(:disabled) {
        filter: brightness(0.93);
      }
    }
    &:focus-visible {
      outline: 2px solid #4b7bca;
      outline-offset: 3px;
    }
    &:disabled {
      cursor: not-allowed;
      background: ${ui.muted};
      color: ${ui.text};
      opacity: 0.55;
    }
  }
`;
const alertCSS = css`
  ${alert} {
    display: grid;
    gap: 8px;
    padding: 12px;
    border-radius: 7px;
    border: 1px solid color-mix(in srgb, ${alertTokens.accent} 30%, ${ui.border});
    background: color-mix(in srgb, ${alertTokens.accent} 5%, ${ui.surface});
    color: ${ui.text};
    overflow-wrap: anywhere;
  }
  ${title} {
    color: ${alertTokens.accent};
    font-weight: 600;
  }
  ${body} {
    line-height: 1.6;
  }
  ${actions} {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

export const controlsTheme = defineTheme({
  options: controlsOptions,
  defaults: { scheme: "light", density: "normal" },
  tokens: [ui, { at: button, values: buttonTokens }, alertTokens],
  styles: css`
    ${buttonCSS}
    ${alertCSS}
    .real-controls {
      max-width: 900px;
      margin: auto;
      padding: 24px;
      color: ${ui.text};
      background: ${ui.surface};
      font:
        13px/1.55 -apple-system,
        sans-serif;
    }
    .real-controls h1 {
      font-size: 20px;
      margin: 0 0 8px;
    }
    .real-controls h2 {
      font-size: 15px;
      margin: 0 0 12px;
    }
    .real-stack {
      display: grid;
      gap: 16px;
    }
    .real-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .real-panel {
      padding: 16px;
      border: 1px solid ${ui.border};
      border-radius: 10px;
    }
    .real-controls input {
      color: inherit;
      background: ${ui.surface};
      border: 1px solid ${ui.border};
      border-radius: 6px;
      padding: 7px;
      font: inherit;
      max-width: 100%;
      box-sizing: border-box;
    }
    .real-token-override {
      ${buttonTokens.borderWidth.name}: 7px;
    }
    @media (max-width: 480px) {
      .real-controls {
        padding: 12px;
      }
    }
  `,
});

export const RealControlsDemo = defineComponent(
  { name: "real-controls-demo", parts: [] },
  (_props: object, context) => {
    const config = context.signal<Selection>(controlsOptions.select({}));
    const local = context.signal<Selection>(controlsOptions.select({}));
    const variant = context.signal<"primary" | "quiet" | "outline" | undefined>("outline");
    const tone = context.signal<"info" | "danger" | undefined>("danger");
    const submitted = context.signal(0);
    return (
      <Theme
        theme={controlsTheme}
        config={config}
        id="real-root"
        className="real-controls real-stack"
      >
        <header>
          <h1>真实组件 · 参数化主题</h1>
          <p>Button 与 Alert 使用同一套组件契约；根默认值、条件来源与 part 绑定由主题组装。</p>
        </header>
        <nav className="real-row">
          <Button
            variant="outline"
            onClick={() => config.set(controlsOptions.select({ scheme: "dark" }))}
          >
            切换深色
          </Button>
          <Button
            variant="outline"
            onClick={() => config.set(controlsOptions.select({ density: "compact" }))}
          >
            切换紧凑
          </Button>
          <Button variant="outline" onClick={() => config.set(controlsOptions.select({}))}>
            恢复主题默认
          </Button>
          <a href="/">原始原型</a>
        </nav>
        <section className="real-panel real-stack">
          <h2>真实 Button：样式选项与表单行为</h2>
          <form
            className="real-row"
            onSubmit={(event: Event) => {
              event.preventDefault();
              submitted.update((n) => n + 1);
            }}
          >
            <input
              id="real-draft"
              aria-label="真实草稿"
              name="draft"
              placeholder="输入后切换配置"
            />
            <Button id="real-button" type="submit" variant={variant}>
              提交
            </Button>
            <Button id="real-disabled" disabled type="submit">
              禁用提交
            </Button>
            <output id="real-submitted">{submitted}</output>
          </form>
          <div className="real-row">
            <Button variant="quiet" onClick={() => variant.set("quiet")}>
              使用 quiet
            </Button>
            <Button variant="quiet" onClick={() => variant.set(undefined)}>
              恢复 Button 默认
            </Button>
            <Button id="real-small" size="small">
              小尺寸
            </Button>
            <Button size="large">大尺寸</Button>
          </div>
          <div className="real-token-override">
            <Button id="real-reset" variant="outline">
              实例常量不继承外层覆盖
            </Button>
          </div>
        </section>
        <section className="real-panel real-stack">
          <h2>局部只覆盖 density</h2>
          <div className="real-row">
            <Button
              variant="quiet"
              onClick={() => local.set(controlsOptions.select({ density: "compact" }))}
            >
              局部 compact
            </Button>
            <Button variant="quiet" onClick={() => local.set(controlsOptions.select({}))}>
              撤销局部配置
            </Button>
          </div>
          <Theme config={local} id="real-local">
            <Button id="real-local-button">局部按钮</Button>
          </Theme>
        </section>
        <section className="real-stack">
          <h2>真实 Alert：多 part 与嵌套实例</h2>
          <div className="real-row">
            <Button variant="quiet" onClick={() => tone.set("info")}>
              外层改为 info
            </Button>
            <Button variant="quiet" onClick={() => tone.set(undefined)}>
              恢复 Alert 默认
            </Button>
          </div>
          <Alert
            id="real-outer"
            tone={tone}
            title="外层告警"
            role="alert"
            actions={
              <Button size="small" variant="outline">
                查看详情
              </Button>
            }
          >
            <p>外层强调不会覆盖内层的默认 tone。</p>
            <Alert id="real-inner" title="内层默认提示">
              保留独立默认值与 status 语义。
            </Alert>
          </Alert>
        </section>
      </Theme>
    );
  },
);
