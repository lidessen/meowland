# 演示拆包与 MDX 创作入口

本记录先完成设计与关键可行性验证，用户随后明确回复“拆吧”，授权本轮实施 `packages/meowslides`。以下保留设计依据，实际实现与验证以本轮回执和 public exports 为准；包名不表示 npm 名称可用性或发布承诺。前序作者负担审查见[作者体验记录](2026-10-18-presentation-authoring-experience.md)；本记录把 MDX 提升为首要创作入口，替代前序“先 JSX 简写、以后考虑 MDX”的优先顺序。

## 建议

值得独立拆包。演示已拥有自己的有限画布、页与步骤导航、活动许可、媒体生命周期、诊断、专用主题和创作工具，不再只是普通 UI 组件的一组示例。

Meowtail 保留通用 UI、Stack/Inline/Grid 等通用布局、ImagePreview 等通用能力；演示包拥有播放、渐显、演示专用 Layout/Image/List/Text、演示主题及 MDX 创作。复杂互动继续写 MeowJSX 组件，不引入 React、不建立第二套播放器。

建议默认 `slides.mdx` 一文件多页；作者只维护讲稿、素材和必要的互动组件，主题与会话扩展才需要可选配置。工具统一提供真实可用的 dev/build，不让作者复制 main、registry、theme、cleanup、媒体声明和构建脚本。

## 已验证的编译与运行边界

基于当前 `769f489` 源码/既有 dist，使用仓库已经安装的 `@mdx-js/mdx@3.1.1`，没有新增依赖。

官方编译器允许指定 [jsxImportSource](https://mdxjs.com/packages/mdx/)，并支持通过 [components prop](https://mdxjs.com/guides/injecting-components/) 提供组件映射。实际试验结果：

| 项目                                   | 实际结果                                                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| program + `jsxImportSource: "meowjsx"` | 导入 `meowjsx/jsx-runtime` 的 jsx/jsxs/Fragment，没有 React runtime 导入                              |
| development 编译                       | 生成 `meowjsx/jsx-dev-runtime` 导入；本轮未运行 development 浏览器产物                                |
| function-body + run                    | 注入 MeowJSX automatic runtime，组件映射与静态 HTML 输出通过；仅作兼容探针                            |
| 浏览器 ESM 模块                        | Bun 打包两页，普通 Markdown、JS 模块导入与本地 SVG 正常                                               |
| 事件与响应式                           | 计数按钮更新 Signal，跨页后由外部会话持有的计数仍为 1                                                 |
| Context 与步骤                         | 真实 Presentation 下挂载 MDX；Reveal 在第 0 步隐藏、第 1 步显示；活动 Context 为 true，离页记录 false |
| 生命周期                               | 探针挂载一次、离页清理一次；宿主卸载后容器清空；浏览器 pageerror 为零                                 |
| AST 分页                               | 只识别顶层 thematicBreak；代码围栏、引用、JSX 子树中的横线不分页                                      |
| Setext                                 | `Title\n---` 是标题，不是分页；留空行后的顶层横线才是分页                                             |
| 独立图片段落                           | 小型 AST 转换把独立图片变为块级 Image；静态结果不产生 p > figure，混排小图保留原生 img                |
| 普通正文分组                           | 浏览器宿主把 MDX 正文放在一个 flow 区域，不把每段当独立 grid 项                                       |

试验文件在忽略目录 `artifacts/presentation-mdx-feasibility/`：experiment.ts、slides.mdx、main.tsx、compile-facts.json、browser-facts.json 和 browser.png。它是有手写宿主、标题和页面数组的有界探针，**不是已完成的 MDX 插件或单文件创作产品**。图片段落转换仅做静态结构验证，不等于完整图片构建/主题验收。

正式路径建议 build-time `compile(..., { jsxImportSource: "meowjsx", outputFormat: "program" })`，交给打包器解析 ESM 和本地资源。观众浏览器不加载 MDX 编译器，不通过 run/evaluate 接收动态文本；不需要 `@mdx-js/react` 或 React MDXProvider。

MeowJSX 的 jsx/jsxs/Fragment 已共用 core。新包不能分别内联复制 runtime、Context、contract、token 或 fragment；显式创建多个 runtime 仍是合法隔离。

## 包的职责和依赖

| 入口/角色                 | 承担                                                         | 不应进入该图的依赖                              |
| ------------------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| 演示包 runtime            | Presentation、页/步骤/活动、Reveal、媒体、演示内容组件及类型 | MDX 编译器、文件系统、CLI、Meowbook、Playwright |
| 演示包 theme              | 演示 tokens/styles，与 Meowtail 标准 UI 主题组合             | build/dev、浏览器自动化                         |
| 演示包 build 子路径与 CLI | MDX/AST、资源图、生成宿主、构建、监听重建/刷新、错误报告     | 不由 runtime/theme 反向导入                     |
| Meowtail                  | 通用组件、布局、组件注册和标准应用主题                       | 不反向依赖演示包                                |
| Meowbook                  | 场景、审查、截图与夹具                                       | 不是普通讲稿启动前提或观众 runtime              |

演示 runtime 单向依赖 Meowtail、MeowJSX、MeowCSS；同一安装图中的 JSX/CSS 由兼容 peer 提供。Bun 是首期工具宿主，可沿用仓库工具约定，不为 MDX 同时引入 Vite 生态。

先用一个演示包的独立子路径隔离模块图；这能避免浏览器打入 compiler，却**不能保证 npm 安装时完全不下载 compiler 依赖**。若后续确有仅使用 runtime 的安装成本需求，再拆工具包；不为尚未出现的需求先建立多包平台。

### 不能只移动 presentation 目录

当前演示实现还耦合于：

- `meowtail/src/registry/index.ts`：导入演示 contracts、组件名表、默认注册数组和类型扩展。
- `meowtail/src/theme/index.ts`：导入演示 tokens/styles，并并入 standardTheme。
- 根与 `meowtail/presentation` 公共导出，以及现有 stories、样例、两份课件和外部消费者。

原本考虑过 facade 过渡；在用户明确授权拆包后，本轮选择一次迁移演示实现、registry ownership、主题片段与仓库内消费者。演示包安装通用 UI 注册和自己的演示注册，演示主题复用通用 token/fragment 对象。

旧 Meowtail 根演示导出和 `meowtail/presentation` 移除，以新的本地破坏性候选版本标识；不能靠 Meowtail 反向 re-export 新包解决兼容，否则形成循环。既有 npm 正式版本不覆盖，Rossovia 等仓库外消费者不擅自切换。

## 最短作者模型

### 单文件多页优先

| 方式                    | 优点                                             | 代价                                             | 建议                                   |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------ | -------------------------------------- |
| slides.mdx + 顶层横线   | 连续写讲稿、移动页面直观、少文件，适合短中篇作品 | 分页/共享 ESM/源位置需要工具处理；顶层横线被保留 | 默认                                   |
| 每文件一页 + 排序入口   | 自然模块隔离、合作者冲突少、文件级元信息直观     | 初始即维护文件与顺序；跨页 imports/资源分散      | 大型作品后续可选，不同时实现第二套协议 |
| 每页都用 Slide 成对标签 | 边界明确，标准 MDX 元素                          | 重复包装、闭合标签与 Markdown 空行要求           | 不作为默认                             |

`---` 必须按 MDX AST 顶层 thematicBreak 判别，不能正则分割全文。分页前后留空行；顶层正文横线被保留为分页，不承诺同一语法同时表示装饰线。需要正文横线可显式 `<hr />`。不增加 `::right::`、自定义渐显指令或反复 YAML frontmatter。

### 页级元信息

可选首节点 `<Slide id="evidence" steps={1} />` 是**拟议编译期声明**，不是真正挂载的 Slide 组件。MVP 接受静态 id/title/columns/steps/notes；拒绝 spread、函数调用、对象路径和任意计算；未知字段、无效列比/步骤、重复 id 附原文件位置报错。

每页首个 `#` 标题用于目录并由默认 header 显示一次，不让作者重复写 title。无显式 id 时由静态标题生成；重复标题/id 或无标题且无 title 时要求作者明确填写，不能暗中以页序号生成易漂移定位。修改标题可能改变默认深链，要稳定引用就写 id。动态标题或特殊封面由显式元信息/高级 JSX 页面承担。

以下是建议的普通作者写法，**尚未成为公共能力**：

```mdx
import { QuickCheck } from "./QuickCheck.tsx";

# 观察栖息地

观察、比较、解释。

---

<Slide id="evidence" steps={1} />

# 寻找证据

![森林中的栖息环境](./forest.jpg)

<Reveal at={1}>

请指出支持判断的一个细节。

</Reveal>

<QuickCheck />
```

### 组件、布局、主题、媒体与渐显

- 默认 components map 只提供少量演示组件；Reveal、PresentationVideo/Audio/Image 沿用现有实现。自定义组件显式 import，按 MeowJSX 的组件、Signal、事件合同编写；React hooks 组件不因此兼容。
- 普通标题、段落、列表、引用和代码由演示主题处理。默认单列整组正文是一个 flow 区域。不能把 Markdown 的 ul 直接映射到接收 items 的 PresentationList，需保留 ul/li 语义或经过明确 AST 转换。
- 独立图片段落转为块级演示图片；混排图保留原生 inline img。默认 contain、alt 保留，完整资源图需把本地 Markdown url 改写为打包器可追踪的资源，不只把字符串复制进产物。
- 双栏声明 `columns={2}`，正文明确写两组顶层 `<div>…Markdown…</div>`。工具按列组传给现有 Layout；每组可含多个段落。不按段落数猜左右，不让 Markdown 根 Fragment 的换行成为分组规则。分组数量不符时诊断。
- 首期默认主题即可启动。可选整场配置选择主题或映射，放在文件开头的静态 `export const deck = { title: "…", theme: "standard" }`；第一版只接受内置主题标识，复杂外部主题导入可放高级配置。无需页级主题引擎。
- 媒体示意：`import clip from "./clip.mp4"` 后写 `<PresentationVideo src={clip} label="观察片段" />`；音频同理。字幕是普通 track 子节点与本地资源。原生 video/audio 不会自动获得活动许可和离页暂停合同。
- 渐显示意使用当前 `<Reveal at={1}>…</Reveal>` 和页级 steps。保留明确步骤，不扫描/执行嵌套组件来“自动发现”。

## ESM、状态与错误位置不能藏起来

单文件分页编译不能把全部 ESM 文本复制到每个页模块，导致顶层变量、模块副作用或导出执行多次。正式编译需要共享 ESM 模块保持身份，页组件只导入所需绑定；临时试验只证明共享 import 的基本路径，不证明任意声明提升已经实现。

MDX 顶层代码沿 JavaScript 模块语义，不自动变成“每场会话执行一次”。普通局部互动组件随离页卸载；跨页状态由可选 createSession 工厂持有，再经 props.session/会话组件映射传给 MDX。不要把顶层 `signal()` 变成多个预览共享的默认模式，也不要为读取标题而服务端执行模块。

编译器在 build 侧解析静态目录与元信息，不调用页面组件；真正 MDX 页内容在正常 CurrentSlide Context 中挂载。作者 position 仍唯一 owner；宿主 inactive 许可不允许被作品 props spread 覆盖。

dev 首期可以自动重建并整页 reload，明确会重置会话；不称为保留状态 HMR。错误应包含原 slides.mdx 页与行列；共享模块、分页后的 source map、资源缺失和刷新失败恢复都需要后续实现测试，不能用当前临时脚本代替。

## 复用 MeowPress 与 Meowbook

MeowPress 已有 MDX 依赖，`src/content.ts` 使用 compile/function-body/run 后 renderToHtml，并拥有站点 frontmatter、日期、文章和静态资产规则。可参考 compiler 配置与资源处理经验；其内部方法非 public exports，不跨包私引、不把文章管线改成演示宿主。需要真正共享的小型能力时再有证据地抽取，不现在拆一个泛化内容平台。

Meowbook 可接生成的 JSX 页面/既有 Presentation 夹具，复用组件观察、截图与行为回归。但当前 discovery 只识别明确 stories，不直接把 MDX 文件当 story；需要工具生成适配入口。现有 serve 也没有 HMR，不能借用其名称宣称已经实现编辑刷新。演示 runtime 不依赖 Meowbook。

## 信任边界

MDX 是可信本地代码：允许 imports、表达式和组件执行，具有相应 JS 运行权限；本地配置和插件也属于代码。[官方说明](https://mdxjs.com/packages/mdx/)明确 run/evaluate 会执行 JavaScript。将 MDX 编译成 ESM 不会把不可信内容变成安全数据。

模型生成、上传或外部拉取的文本不默认作为 MDX 运行。先审阅并进入可信作品，或走既有有限 Markdown/JSON 路径；不把 JSON 入口扩展成 MDX evaluator，也不顺带承诺沙箱。

## 设计阶段的最小范围与待验证清单

设计阶段约定的最小范围是：单 slides.mdx、AST 分页、静态页元信息/单次标题、普通 flow 与图片转换、显式列组、现有渐显/媒体映射、本地资源构建、默认主题、统一生成宿主，以及一条 dev/build 路径。后续用户授权真迁移，原复杂演示保留为实验场。用同一短稿验证“改标题、加页、换图、加一步、加互动”的实际操作与错误恢复。

设计阶段待验证的项目包括：新包 manifest/公共导出与安装态；MDX/Bun loader；共享 ESM 与会话工厂 API；元信息校验；双栏/长文/窄屏/短窗口默认主题；媒体/字幕资源；生命周期；watch/reload；source maps/TS 组件 props 检查；Meowbook 适配与消费者迁移。其中静态 deck 配置未进入本轮实现支持集，完整 HMR、source maps 与 MDX 内 TS props 检查仍是后续能力。

最初可行性探针仅验证桌面编译兼容，不能替代后续授权实施的验收。实际实施、同版检查、安装消费、宽/窄/短窗口证据及明确限制见[实施回执](../records/2026-10-18-meowslides-mdx.md)；没有推送、发布或部署。
