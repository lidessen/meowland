# MeowCSS

通用 TypeScript token、选项与 CSS 生成机制。根入口不依赖 JSX、UI 或 DOM；组件适配从
`meowcss/meowjsx` 导入，DOM 主题生命周期从 `meowcss/web` 导入。

MeowUI 负责具体 token 值、组件 parts、标准主题与语义布局。MeowCSS 不提供另一套组件或布局系统。

## 纯 CSS 消费

根入口可在没有 DOM、MeowJSX 或 MeowUI 的构建程序中使用。模板保留原生 CSS，类型检查覆盖
token 路径、选项与完整默认值，不承诺校验每个 CSS 属性或任意模板文本。

```ts
import { css, defineOptions, defineTokens, defineTheme, themeAttributes } from "meowcss";

const options = defineOptions("reader", {});
const tokens = defineTokens("reader", { ink: ["black", "white"] });
const theme = defineTheme({
  options,
  defaults: { scheme: "auto" },
  tokens: [tokens],
  styles: css`
    body {
      color: ${tokens.ink};
    }
  `,
});
// 构建程序交付 theme.cssText；静态 HTML 根使用 themeAttributes(theme)。
```

根 `defineTheme` 只理解显式 selector/source 绑定。若 token 依赖组件选项，纯 CSS 消费者通过
`sources` 指定选项与承载 selector；局部常量可写 `{ at: ".control", values: tokens }`。
它不从 CSS 文本猜组件，也不安装样式。

## JSX 组件适配

组件消费需要安装兼容的 `meowjsx`。`meowcss/meowjsx` 提供 `defineStyleProps`、
`partSelector`、`ThemedProps` 与 `createStylePropsPlugin`，沿同一 MeowJSX registry 使用组件身份。
该入口的 `css` 保留 typed part 依赖；同名 `defineTheme` 从片段推导组件选项的真实 carrier，
再调用纯根组装器。它不创建第二份组件表。

```ts
import { defineOptions, defineTokens } from "meowcss";
import { css, defineStyleProps, partSelector, defineTheme } from "meowcss/meowjsx";

const options = defineOptions("button", { size: ["small", "large"] });
const contract = {
  name: "button",
  parts: ["root"],
  styleProps: defineStyleProps(options, { defaults: { size: "small" } }),
} as const;
const styles = css`
  ${partSelector(contract, "root")} {
    display: inline-flex;
  }
`;
```

组件选项、part 名称与默认值由组件自己的 contract 持有；MeowCSS 不导入具体 UI。
在组装前不要 `String(styles)`，否则只剩 CSS 文本，组件依赖信息会被明确丢弃。
根与适配共用同一内部 token 模块；构建时不可将多个入口各自内联一份。

## Web 生命周期

`meowcss/web` 提供 `applyTheme`、`mountStyles` 和 Web JSX `Theme`；该入口需要 DOM 和兼容的
MeowJSX。样式交付是显式操作：`mountStyles(document, theme.cssText)` 返回清理函数；
`Theme` 只管理 scope 属性，`applyTheme` 可订阅 Signal 配置并在清理时恢复原属性。
模块导入本身不操作 DOM，不自动注册组件，也不自动加载主题。

`data-meowui-*` 保留为 CSS、静态 HTML 和适配器共同使用的既有标记，不携带产品数据或权限。
MeowUI 标准主题与 Meowpress 自有主题复用同一生成机制，具体视觉参数分别由消费者持有。

## 验证

- `bun test packages/meowcss/tests/unit` 验证纯生成、typed parts、carrier、跨入口 token 身份和主题生命周期。
- `bun run typecheck` 的独立 CSS core 检查不包含 DOM 或 JSX 类型；公共类型用例位于 `tests/types/`。
- `meowcss` 包自身没有默认 CSS 资源；消费者显式生成或安装 `cssText`。
