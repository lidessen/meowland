# MeowSlides

`meowslides` 是独立演示包，拥有播放器、页和步骤、活动许可、渐显、媒体生命周期、演示布局与主题，以及可信本地 MDX 创作入口。本包当前为私有本地候选，未发布 npm。

Meowtail 保留通用 UI、布局、图片预览和标准应用主题。新包单向依赖 Meowtail、MeowJSX、MeowCSS；旧 `meowtail/presentation` 与根演示导出已移除，不做反向兼容转导出。

## 运行时与主题

根入口导出 `Presentation`、`Reveal`、`PresentationLayout`、`PresentationText`、`PresentationList`、`PresentationImage`、`PresentationVideo`、`PresentationAudio`、`usePresentationActivity` 和原有 `SlideDefinition`、`SlidePosition`、`SlideSession` 等类型。

`meowslides/registry` 的 `createMeowSlides`、`installMeowSlides` 只注册演示 contracts。宿主另外安装通用 `createMeowUI`，不要为每页新建 Runtime。

```tsx
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { applyTheme, mountStyles } from "meowcss/web";
import { createMeowUI } from "meowtail";
import { Presentation, Reveal, createMeowSlides, type SlideDefinition } from "meowslides";
import { presentationTheme } from "meowslides/theme";

const runtime = createRuntime({ plugins: [createMeowUI(), createMeowSlides()] });
const slides: readonly SlideDefinition[] = [
  {
    id: "observation",
    title: "观察",
    steps: 1,
    render: () => (
      <div>
        <h1>观察一个细节</h1>
        <Reveal at={1}>解释依据。</Reveal>
      </div>
    ),
  },
];
const removeStyles = mountStyles(document, presentationTheme.cssText);
const removeTheme = applyTheme(document.documentElement, presentationTheme);
const mounted = createWebRenderer(runtime).render(
  <Presentation title="观察与证据" slides={slides} active={false} />,
  document.querySelector("#app")!,
);
// 宿主销毁时：mounted.unmount(); removeTheme(); removeStyles();
```

`presentationTheme` 是包含通用 UI 的完整主题，只需加载这一份 cssText。`presentationOptions` 与 Meowtail 的 `standardOptions` 是同一对象，可用于 light/dark/auto 选择。`presentationThemeTokens`、`presentationThemeStyles` 是只读组装原件，复用 Meowtail `standardThemeTokens`、`standardThemeStyles` 的原 token/fragment 身份，不是第二份样式实现。

MDX 画布中的普通按钮默认继承演示正文尺度，使用 em 间距与自然高度；这是限定在 MDX 页面内的低特异性默认值，显式组件 size、宿主 class/style 仍可覆盖，不修改通用 UI tokens。

播放器、键盘导航、位置 ownership、活动许可、背景、过渡及媒体清理的完整合同见 [播放器与生命周期](PRESENTATION.md)。

内容 API、有限画布预算、图片 contain/cover、九点取景、原生列表和固定 header/body/footer 见 [演示内容布局](PRESENTATION-LAYOUTS.md)。`ratio="fill"` 仍要求有限父级；窄物理窗口默认整体缩放，不会自动重排逻辑列。

## 创作与工具边界

`meowslides/build` 与 `meowslides` CLI 承担本地可信 MDX 编译、构建和开发服务；运行时入口不导入编译器。生成页面经 `meowslides/mdx` 适配后仍挂载同一 Presentation/Reveal Context。具体工具参数以同版 CLI 与实现说明为准。

MDX 是可执行本地代码，允许 imports 和自定义 MeowJSX 组件；不可信文本须先审阅，或继续使用有限 Markdown/JSON。没有 React runtime、执行工具权限、后端或自动持久化。

### 从一个讲稿文件开始

普通作者只维护 `slides.mdx`，无需手写 main、服务器、主题装配或组件注册：

```mdx
# 观察

先描述一个细节。

---

# 解释

用证据支持你的判断。
```

在安装同版候选与兼容 peers 的消费者中，Bun 命令为：

```sh
bunx --no-install meowslides dev slides.mdx --port 3030
bunx --no-install meowslides build slides.mdx --outdir dist
```

开发服务只监听 loopback，修改讲稿、导入的本地模块或资源后重建并整页刷新；错误时保留上次有效画面，终端显示错误，修复后继续。刷新会重建会话，这是 reload，不是保留状态 HMR。`dist/` 是可用普通静态 HTTP 服务打开的浏览器产物，不承诺双击 file URL。新包当前没有 npm 正式版，不能用旧发布包代替本轮候选。

### 页面、布局与互动

- 顶层、空行包围的 `---` 分页；代码块、引用及 JSX 子树里的横线不分页。`文字` 后紧跟 `---` 会被 Markdown 当作 Setext 标题。正文横线可用 `<hr />`。
- 页首 `#` 同时提供目录和画面标题，只显示一次。默认 id 由标题生成；重名需显式 id，稳定深链也建议写 id。
- 可选首节点 `<Slide id="evidence" columns={2} steps={1} notes="Pause here" />` 是编译期元信息，只接受静态字面量；还可显式 title。未知字段、计算表达式、重复声明和无效步骤明确报错。
- 双栏或三栏正文明确用两组或三组顶层 `<div>…Markdown…</div>`。不按段落数猜列；列比沿现有 1/2/3、single/equal/wide-start/wide-end。
- 图片直接写 `![替代说明](./forest.jpg)`，独立图片转换为演示 figure，本地资源进入产物；混排图片仍为 inline img。默认 contain，主题为图片和后续文字分配有限高度；长内容仍需拆页，不自动缩字。
- 渐显使用 `<Reveal at={1}>…</Reveal>`，页声明相应 steps。Markdown 放进 JSX 标签时前后留空行。不会扫描任意组件来猜步骤。
- 媒体显式 import 本地文件后写 `<PresentationVideo src={clip} label="观察片段" />` 或 PresentationAudio。字幕可作为普通 track 子节点；保留来源/字幕资源。原生 video/audio 不自动获得演示生命周期合同。

复杂互动显式 import 普通 MeowJSX 组件；局部状态随该组件卸载。需要跨页保留时，从自己的模块导出会话工厂：

```mdx
import { QuickCheck } from "./QuickCheck.tsx";
export { createSession } from "./QuickCheck.tsx";

# 快速判断

<QuickCheck session={props.session} />
```

`createSession` 每次创建演示时调用一次，不同会话各自隔离。讲稿 ESM 当前支持 imports 和这个明确导出的进口工厂；其他顶层声明/导出、自定义主题配置与自动状态迁移不在支持集中。状态与复杂逻辑放在导入模块中，不把模块级 signal 当作每场状态。工具不执行作品模块来读取目录。

主题默认可用；高级 JSX 宿主可使用完整 `presentationTheme` 和原有主题组合合同。当前 MDX CLI 不接受 YAML frontmatter、主题插件协议或任意编译器配置。组件 TypeScript 源文件仍可独立检查；MDX 并未提供完整 TS props 检查或完整 source-map 调试器。

工具 API 从 `meowslides/build` 导出 `compileSlides(source, entry)`、`buildSlides({ entry, outdir })`、`serveSlides({ outdir, port })` 和 `devSlides({ entry, outdir?, port?, onError? })`。这是 Bun 工具入口，声明显式携带 Bun/Node 类型；不要将其导入浏览器运行时。构建和 CLI 需要的类型依赖由本包声明，子路径隔离不意味着安装时不下载编译器依赖。

## 检查

根统一 build 后运行 `bun test packages/meowslides/tests/unit packages/meowslides/tests/build`、`tsc --noEmit -p packages/meowslides/tsconfig.json`、`tsc -p packages/meowslides/tsconfig.types.json`。浏览器与实际 tarball 包外消费另行验收；build、pack、私有候选都不等于发布。工程统一命令见 [开发检查](../../docs/development-checks.md)。
