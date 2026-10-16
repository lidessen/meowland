# Meowbook

`meowbook` 是 MeowJSX Web 组件开发包。提供静态场景索引、隔离画布、选择性组件替换与普通浏览器测试入口，不依赖 Storybook，也不包含旧 Notes/Tasks 应用。

Gallery 自身由 MeowJSX 渲染，复用 MeowUI 的 Button、Input、Icon 与标准主题，使用独立 runtime，不影响场景执行环境。Meowbook 只维护工具的目录、画布与检查抽屉布局。检查说明默认收起，窄屏通过目录按钮选择场景。

工具以画布为主：默认自适应可用空间，固定设备宽度用于明确比较。交互最新反馈直接显示在底部，完整记录按需展开。搜索显示命中数量；窄屏目录支持遮罩关闭、Escape 和焦点返回。左下「工具外观」支持浅色、深色和跟随系统，独立于场景内部主题，不重挂载场景。

## 使用

Meowbook 由消费者自己的配置组装场景。安装包后，在消费者目录运行：

```sh
bunx --no-install meowbook list --config meowbook.config.ts --json
bunx --no-install meowbook check --config meowbook.config.ts
bunx --no-install meowbook serve --config meowbook.config.ts --port 13004
bunx --no-install meowbook capture --config meowbook.config.ts --story composer --depth all
```

CLI 需要 Bun。当前迁移只提供本地构建与 tarball，尚未正式发布 npm；先安装本轮产物及其
`meowjsx`、`meowcss`、`meowui` peers，再使用以上已安装 CLI 命令，不从 registry 猜取同名包。
公开入口为 `meowbook`、`meowbook/web`、`meowbook/bun`、`meowbook/playwright`。
发行包携带编译后的 JS、类型声明与 gallery HTML；构建和摄影不读取库仓库的源码目录。
静态构建使用 `meowbook/bun` 的 `buildStories(config, outdir)`；CLI 提供 list、check、serve、capture。
`meowbook/bun` 是 Bun 工具入口，`meowbook/playwright` 用于 Node/Bun 摄影脚本；
这两个入口的声明显式加载本包声明的宿主类型依赖，无需消费者额外安装 ambient 类型包。
它们不能当作纯浏览器入口。浏览器预览代码使用根入口与 `meowbook/web`。
`--json` 的 stdout 仅输出结构化结果；错误到 stderr 并返回非零状态。服务只监听 loopback，前台运行，Ctrl-C 清理本次临时构建。源码修改后重启服务；首版没有 HMR。

```ts
import { defineConfig } from "meowbook";
export default defineConfig({
  root: import.meta.dir,
  stories: ["src/**/*.stories.tsx", "src/components/**/*.tsx"],
  preview: "preview.ts",
  tsconfig: "tsconfig.json",
});
```

`preview.ts` 默认导出环境函数，挂载消费者的 TS 样式、绑定主题根，并返回执行用的 runtime。
样式生命周期归环境管理；同一文档切换场景时先清理，gallery 与 canvas 分别拥有各自的 document：

```ts
import { createRuntime } from "meowjsx";
import { createMeowUI } from "meowui";
import { standardTheme } from "meowui/theme";
import { applyTheme, mountStyles } from "meowcss/web";
import type { PreviewEnvironment } from "meowbook";
export default (({ root, onCleanup }) => {
  onCleanup(mountStyles(root.ownerDocument, standardTheme.cssText));
  onCleanup(applyTheme(root.ownerDocument.documentElement, standardTheme));
  return createRuntime({ plugins: [createMeowUI()] });
}) satisfies PreviewEnvironment;
```

## 场景与注释

```tsx
import { h } from "meowjsx";
import { defineStory } from "meowbook";
export const Primary = defineStory({
  id: "button/primary",
  title: "主要按钮",
  group: "基础组件",
  groupOrder: 10,
  component: "Button",
  variant: "操作层级",
  render: () => <Button>保存</Button>,
  setup({ root, signal, onCleanup, report }) {
    /* 可登记交互和清理 */
  },
  async ready({ root }) {
    /* 等待该场景真实的异步就绪条件 */
  },
});
```

目录按 `group` 分类，`groupOrder` 为可选有限数字，越小越靠前；同组不同值取最小值，未指定的组保持发现顺序并排在后面。同组的 `component` 合并为一个目录入口，`variant` 用作组件页的短场景标签。未填写时保持每个 story 独立展示；`title` 和 `covers` 仍参与搜索，搜索场景关键词会进入匹配场景。

`id/title/group/component/variant` 必须是静态字符串字面量，`groupOrder` 必须是静态有限数字；具名导出直接调用从包导入的 `defineStory`，不支持计算 id、对象展开或自定义 wrapper。`list` 仅解析源文件，不执行 story 模块；配置文件是受信任的可执行代码。

简单 props 可写在导出组件的 JSDoc 中，一行一个 JSON：

```tsx
/** @story {"id":"button/disabled","props":{"label":"保存","disabled":true}} */
export function Button(props: { label: string; disabled?: boolean }) {
  /* ... */
}
```

注释生成真正的 typed JSX，再由消费者 TypeScript 配置检查。类型错误附上原组件路径与注释位置。支持 JSON 值，不在注释内执行函数/import；开放索引签名仍遵循原组件类型。

临时预览复用同一检查与构建链，不写永久 story，使用上述已安装 CLI 与消费者配置。本文中的 `meowbook.config.ts` 和 story id 是消费者示例；在库仓库内查看通用场景时，从根目录使用 `--config apps/showcase/meowbook.config.ts`。本地 tarball 安装不代表已经公开发布。

路径在配置 root 内解析。省略 props 文件时为 `{}`；必填属性照常报错。

## 选择性子组件替换

```tsx
import { defineStory, replaceComponent } from "meowbook";
import { Placeholder } from "meowbook/web";
export const LayoutOnly = defineStory({
  id: "panel/layout",
  title: "布局预览",
  replacements: [replaceComponent(Chart, () => <Placeholder label="图表" height={240} />)],
  render: () => <Panel />,
});
```

按函数身份在执行 runtime 的组件调用前替换，原组件不执行。预创建 VNode、Signal、Promise 和多实例均覆盖。替代组件正常经历生命周期、主题和清理；需要 shadow 的替代 contract 仍须由环境注册。规则是 `pre` 插件，遵循 runtime 的首个命中，不递归替换。

局部预览明确显示替换标记；`#story-replacements` 提供命中次数（含零命中）。直接调用函数、模块 import 副作用和私有 renderer 不受替换控制。完整与局部场景使用不同 id，不能用占位场景证明完整行为。

## 组件拍摄

大目录先用 `list --query <文字> --json` 缩小发现范围，例如 `--query composer` 或 `--query 过程`。
查询不区分大小写，按 id、标题、分组、组件名及 variant 做字面包含匹配；保留完整来源信息，零匹配返回空数组。
它仅用于目录发现，不改变 capture 的选择合同。

`capture` 复用发现、类型检查和画布，构建一次，每个场景使用独立 Chromium context。
默认输出场景整体图及下一层组件局部图，局部图裁自同一张视口原图，不重新挂载组件：

```sh
bunx --no-install meowbook capture --config meowbook.config.ts --story composer
bunx --no-install meowbook capture --config meowbook.config.ts --story composer --depth all --viewport 390x844 --dpr 2 --color-scheme dark
bunx --no-install meowbook capture --config meowbook.config.ts --story buttons --select button --depth 0
bunx --no-install meowbook capture --config meowbook.config.ts --all --select button --json
bunx --no-install meowbook capture --config meowbook.config.ts --all --full-page --out /tmp/meowland-ui-review --json
bunx --no-install meowbook capture --config meowbook.config.ts \
  --component packages/meowui/src/components/button.tsx --export Button
```

`--story`、`--all` 与临时组件入口互斥。临时 props 仍由 `--props-file` 提供，路径相对配置 root。
默认深度 `1`，首层非透明组件为 `0`；Fragment、内置 Context Provider 自动透明。
其他透明组件在声明旁赋值，core 不解释拍摄 metadata：

```ts
import type { ComponentMetadata } from "meowbook";
Layout.metadata = { capture: { transparent: true } } satisfies ComponentMetadata;
```

`--select` 精确匹配实际组件或被替换组件的显示名，保留全部同名实例；显式选中透明组件时也可拍摄它。
组件名优先来自 contract，其次为保留的函数名；匿名组件只能使用当次实例名。
完整树保留透明、隐藏、离屏、祖先裁剪和范围外节点，实例 ID 仅在本次挂载内有效。
复杂 transform、clip-path、mask 等范围标为近似；私有 renderer、直接函数调用和原生弹层无法补出内部实例树。

默认环境为 `1100x900`、DPR `1`、浅色、reduced motion；`--device` 先展开 Playwright 设备预设，
再应用显式参数。视口每边 `64–4096` CSS 像素，DPR `0.25–4`，最多 `3200` 万像素；
`--timeout` 为每场景 `1–120000` 毫秒，默认 `30000`，不包含构建。颜色偏好来自浏览器媒体查询；
没有响应该偏好的场景不能视为暗色主题已验证。移动设备预设仍是模拟。

默认产物位于配置 root 的 `dist/meowbook/captures/<run>/`，`--out` 可指定父目录。
每次运行有独立的 `index.html`、`manifest.json`、整体和局部 PNG、ARIA snapshot。
报告可直接离线打开，顶部缩略图总览显示场景、状态及环境，再进入场景详情按组件树查看原图或已保存的整体图区域；manifest 保存完整实例树、环境、来源、
替换记录和重跑命令，不复制 props 内容。批量失败后继续其他场景并非零退出；取消保留已完成产物和未执行项。
批量 select 中单场景未匹配不是失败，但全批零匹配是失败。截图成功不等于 UI 验收通过。

同一次观察 snapshot 另保存只读 `activeFocus` 与 `scrollViews`，离线报告在“DOM focus and scroll facts”面板与原图、ARIA 一起呈现。focus 沿开放 shadow 读取 DOM active element，通过同次 observation membership 关联最深且唯一的实例；`activeFocus.part` 是最近包含焦点节点的 part，不保证该 part 节点就是 active element。scroll facts 保存实际 client / scroll 尺寸与 offsets，显式 `declaredOwner` 来自 PageFrame / Region 已有属性，声明与实际 overflow 是不同事实，不自动判定双滚动为缺陷。

无实例映射、归属不唯一、不可观察 iframe 或潜在非开放 shadow 内部保留 `unknown` 与准确 reason；普通 host 的 DOM 信息不能可靠发现所有 closed shadow，原生 Select 的 DOM 焦点可观察不表示系统 popup / native AX 已观察。`none` 仅指已观察范围内没有活动控件。实例身份限本次 renderer，不建立第二树、长期订阅或 readiness 状态；读取不移焦、不滚动、不改原 PNG，也不采输入值、密码、正文或完整 Props。原图和 ARIA 仍可能包含用户内容，事实字段不使原有摄影产物自动脱敏。

长页面可用 `--full-page` 额外保存 `full-page.png`，manifest 的场景 `fullPage` 提供相对路径，
`environment.fullPageSize` 记录像素尺寸。视口整体图及组件树局部裁图仍基于原视口，避免滚动或
扩大视口改变响应式效果。全页图同样受 3200 万像素限制，超限明确失败，不静默裁短。
它展示当前已渲染的文档，不会展开内部滚动容器或主动触发懒加载；这些状态仍需交互取证。

交互照片使用同一拍摄函数。先用 `serve --capture` 启动保留组件名并开启观察的画布，再由普通 Playwright
执行 hover、输入或聚焦：

```ts
import { resolve } from "node:path";
import { capturePage } from "meowbook/playwright";
await page.goto("http://127.0.0.1:13003/canvas.html?story=composer");
await page.locator('#story-state[data-status="ready"]').waitFor({ state: "attached" });
await page.getByRole("textbox").fill("Draft");
const result = await capturePage(page, {
  name: "filled",
  testLocation: "composer.spec.ts",
  depth: "all",
  fullPage: true,
});
const scene = result.manifest.scenes[0];
if (scene?.status === "success" && scene.frame) {
  console.log(resolve(result.directory, scene.frame));
  if (scene.fullPage) console.log(resolve(result.directory, scene.fullPage));
}
```

`capturePage` 保留调用方的 Page、输入、焦点和环境，不导航或重挂载；失败产物标为诊断图。
API 的场景图片路径相对 `result.directory`；从 `manifest.scenes` 读取实际成功场景的 `frame`、
`fullPage` 或 `guides`，不要猜文件名。CLI 的 `--json` 回执另提供绝对路径 `artifacts`。
未开启 capture 接口的普通画布会报告摄影能力缺失。交互照片通过调用方脚本或测试记录的步骤复现，不生成等价的 story 重跑命令。
摄影合同由本页与导出的类型共同说明。

### 真实页面批量摄影

已运行的页面使用 `--url`，不加载 story 配置或构建展板。单页必须明确给出就绪原生 CSS
选择器（不支持 Playwright 的 `:visible` 等扩展）：

```sh
bunx --no-install meowbook capture --url http://127.0.0.1:13001/ \
  --ready 'main[data-ready="true"]' --root main --channel chrome --json
bunx --no-install meowbook capture --url http://127.0.0.1:13001/ \
  --pages /absolute/path/capture-pages.ts --all --json
```

`--pages` 是受信任的本地可执行 TypeScript / JavaScript 文件，CLI 将路径相对当前目录解析，默认导出
`CapturePagePlan` 工厂。工厂接收 `{ baseURL, request }`，可通过同一浏览器 context 的 API
request 动态发现当前扩展，返回最多 500 个 `LiveCaptureEntry`：唯一 `id`、`title`、`ready`、
可选 `root` 和 `async prepare(page)`。`prepare` 显式导航、选择页面或准备状态，不接受 CLI
JavaScript 字符串。类型从 `meowbook/bun` 导入。

计划通过 `--all` 批量执行，或以 `--scene <id>` 选择一个入口；零匹配明确失败。整批共享
context 会话，每个入口创建新 Page，prepare 与摄影受每场景 timeout 限制。失败继续其余
入口，取消保留已完成照片、失败诊断和未执行项，交付一份总览报告并非零退出。
默认使用 Chromium，`--channel chrome` 使用本机已安装的 Chrome。
也可用 `--cdp http://127.0.0.1:<port>/` 连接已运行的专用 Chrome DevTools 端点；与
`--channel` 互斥，端点仅允许无凭据、查询参数或 fragment 的 loopback HTTP(S) 地址。
摄影创建自己的 context，结束只释放该 context 和连接，不复用或关闭浏览器已有 tab。

来源、当前页面及可见 iframe 区域保留在报告；普通页面没有组件实例树，因此不支持
`--select` / 自动 `--guides`，可用显式 CSS `--guide`。缺少骨架摄影接口时 `--focus` 明确失败。
摄影不改变 CSP、iframe sandbox 或认证机制。远端 URL 要求 HTTPS，HTTP 仅允许 loopback，
拒绝 URL 内嵌用户名与密码；查询参数和 fragment 不进入 manifest 或重跑命令，含此类
导航条件的复现由受信任计划负责。照片及 ARIA 可能包含页面内容，产物由调用者保管。

## 浏览器与 Agent

### 聚焦素材

`--focus` 可重复传入 CSS 选择器，全部匹配保持原像素；其他区域的可观察 HTML 文字变为浅色条，图片、SVG 与原生控件变为等尺寸占位，保留换行、行宽与对齐。页面背景和几何保持原样，并保留干净原图。

```sh
bunx --no-install meowbook capture --config meowbook.config.ts --story field-group \
  --focus 'fieldset:first-of-type' --json
bunx --no-install meowbook capture --config meowbook.config.ts --story page-structure \
  --focus '[data-meowui-part="resource-card/root"]' \
  --guide '[data-meowui-part="resource-card/root"]' --guide-lines bottom --json
```

`--focus-padding` 默认为 12 CSS px，可设 0–128；扩展受祖先裁剪限制。多个目标保留独立区域，不把中间内容一起照亮。
表单应选包含标签和说明的字段容器，padding 不会自动寻找语义关联元素。
无效、零可见匹配或超限选择明确报错；最多 12 个选择器、每个 512 字符、48 个可见目标。

输出 `focus.png` 和 `focus.json`；`--full-page` 补充 `focus-full-page.png`。
同时请求参照线时输出 `focus-guides.png` 及可选 `focus-guides-full-page.png`，先聚焦后画线。
参照线与清晰区各自选择，参照线不会扩大清晰区。JSON 回执列出绝对路径，离线报告并排展示原图与聚焦图，窄屏上下排列。

Playwright `capturePage` 使用 `focus: { selectors: string[], padding?: number }`。
Meowbook 的所有画布显式创建一个 `ComponentObservation`，供加载骨架与摄影投影共享；摄影接口仍仅在 capture 模式开放。投影从 `read()` 读取当前实例，不另建组件 Map；内容根排除展板容器，卸载视图后释放观察中心。观察事实属于当前 renderer，不构成产品就绪或系统 AX 合同。
Meowbook 调用 `meowjsx/web` 的共享骨架控制器临时拍摄，随后清理；不改文本、布局、焦点、输入值或滚动状态。已有 SkeletonBoundary 加载态保持其原有所有权。
原生控件特殊装饰、复杂背景、伪元素和外部 iframe 不保证完全骨架化；本功能不是敏感内容脱敏工具。
旋转、裁剪等目标以元数据标明矩形近似，遮挡不会被移除。聚焦图是加工素材，颜色、对比度及整体层级必须回到原图判断。

### 对齐参照线与测量素材

无需写临时浏览器脚本，`capture` 可以同时生成原图、带编号的参照线图和几何 JSON：

```sh
# 按现有组件选择与深度绘制边界、中心线；同名组件分组比较
bunx --no-install meowbook capture --config meowbook.config.ts --story composer --guides --json

# CSS 选择器精确指定要比较的元素；每个选择器是一组，保留全部匹配
bunx --no-install meowbook capture \
  --config meowbook.config.ts --story page-structure \
  --guide '[data-meowui-part="resource-card/root"]' \
  --guide-lines bottom --full-page \
  --out /tmp/meowbook-guides --json

# 比较阅读区与输入框的边缘、中心及宽度
bunx --no-install meowbook capture \
  --config meowbook.config.ts --story conversation-layout \
  --guide 'article[data-chat-role="assistant"], [data-meowui-part="chat-composer/root"]' \
  --guide-lines left,right,center-x --json
```

`--guides` 与 `--guide` 互斥。前者复用 `--select` 和 `--depth` 的组件选择，
后者使用浏览器原生 CSS 选择器，不是 Playwright selector 或脚本；不改变局部组件照片的选择。
`--guide-lines` 可从 `left,right,top,bottom,center-x,center-y` 中按需选取，逗号分隔，
默认全部；只选一条时，标签同时显示相对本组首项的差值。卡片操作比较常用 `bottom`，
阅读列比较常用 `left,right,center-x`。需要将不同角色作为一组比较时，用一个 CSS 逗号选择器。
最多 12 个选择器，每个最多 512 字符，总计最多 48 个目标；超限明确失败，按比较对象缩小范围。
选择器无效或没有可拍的匹配也明确失败，不交付看似成功的空批注图。

回执 `artifacts[]` 直接给出原图、批注图和测量文件的绝对路径。
场景 manifest 的 `guides` 关联 `guides.png`、可选的 `guides-full-page.png` 和 `measurements.json`，
离线报告可展开 Alignment guides 查看。原图与组件局部图保持无批注；参照线只在附加照片中出现，
辅助线使用原生 top layer 的手动 popover，覆盖原生 modal dialog 与已有 popover，
不受页面祖先的 transform 或 overflow 裁剪影响；不关闭业务弹层，不获取焦点。
拍完清理临时覆盖层，保留交互状态。

JSON 的目标编号与图上对应，记录视口及文档坐标、宽高，以及相对本组首个目标的
左/右/上/下边缘、中心和宽高差值。不同选择器各自成组；跨组比较直接读取目标坐标。
所有尺寸均为 CSS 像素，图片仍按指定 DPR 输出。测量的是轴对齐边界框，不是文字基线；
旋转、多根组件、裁剪与遮挡需要结合原图判断，不以边界相同证明视觉对齐。
默认只画当前视口可见目标；`--full-page` 的 CSS 目标可包含文档离屏内容，
不会展开内部滚动容器、触发懒加载或穿透 iframe / shadow root。

交互后直接复用同一 API：

```ts
const result = await capturePage(page, {
  name: "expanded-alignment",
  guides: { selectors: ['[data-meowui-part="resource-card/root"]'], lines: ["bottom"] },
  fullPage: true,
});
```

先看原图建立任务与设计判断，再用少量目标核对疑点。差值是测量事实，不是自动缺陷判定；
例如正文和输入框中心一致但宽度不同，应讨论阅读列关系，不能直接写成未居中。
参照线不能代替对颜色、字体、层级、密度与整体审美的视觉判断。

- `/manifest.json` 提供 id、路径、导出名和行号；`/canvas.html?story=<id>` 是独立画布。
- 等待 `#story-state[data-status="ready"]` 的属性或 attached 状态；该标记就绪后隐藏，默认 visible 等待会超时。失败变为 `error` 并保留错误信息，不能被检查结果覆盖。`capturePage` 自己等待 ready，调用方在操作前仍需等待目标控件。
- 桌面 1100px、移动端 390px、平板 768px、自适应切换不重新挂载；切换 story 和重置使用新文档。
- Meowbook 外壳也适配手机：目录抽屉、触控不自动聚焦搜索、窄屏贴边画布、短屏可滚动的检查面板；工具外壳与 story 视口分别验证。390px/短屏/横屏浏览器模拟不等于真机软键盘验收。
- `onCleanup` 逆序执行，取消后新登记的清理立即执行；`signal` 用于中止自定义异步工作。
- `ready` 由场景作者声明，不能依靠自动延时推断稳定。Bun 服务和 iframe 是开发隔离，不是安全沙箱；场景代码应可信，数据/API mock 由使用方绑定。

普通 Playwright Test 可访问上述 URL，无需专用组件测试适配器。本包 `playwright.config.ts` 固定 Chromium 与视口，失败保留 screenshot/trace；测试步骤附原场景位置，正常运行输出 390/1100px 截图。当前是响应式宽度测试（高度 900、DPR 1、桌面输入），不代表真机测试。未建立跨平台像素基线；无溢出或名称提示也不代表设计验收。

Playwright CLI 可另行使用 `bunx --package @playwright/cli playwright-cli` 操作同一普通 URL；它不成为 Meowbook 内部依赖或文本协议。

## 分层验证

仓库依赖就绪后，从根目录运行 `bun run --cwd packages/meowbook test` 验证机械合同。浏览器验证进入 `packages/meowbook` 后使用实际 Playwright 配置：

```sh
bunx --no-install playwright test --config playwright.config.ts
bunx --no-install playwright test --config playwright.capture.config.ts
```

第一项只启动包自身 fixture，验证 renderer 生命周期、canvas、测量和 gallery 行为；第二项验证拍摄观察、透明选择、DPR 裁切、输入保留和失败诊断。它们不启动产品应用，也不证明 Rossovia 已切换消费。
Meowbook 只保留 fixture 规格。与真实消费者的接合由消费者自己的 Playwright 配置执行：
MeowUI 目录、搜索与移动端规格在 `packages/meowui/tests/browser`，由其 `playwright.config.ts` 运行；
产品页面的规格与数据由各消费者维护，不随本包分发。
浏览器命令需要已安装的 Playwright Chromium。安装包不自动下载浏览器；在自己的环境显式准备
`bunx --no-install playwright install chromium`，或摄影时通过 `--channel chrome` 使用已安装的 Chrome。
