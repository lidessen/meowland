# 演示作者体验：把讲稿与组件实验场分开

本轮是审查与设计，不是新 API 实施。未修改 `examples/presentation`、公共组件、依赖或锁文件，未推送、发布；未知 `data/` 与独立 B+C 原型均未读取或修改。

## 结论

用户的反馈成立：当前入口让作者先接触宿主、生命周期与验收工程，再开始写页面。`examples/presentation` 应保留为复杂互动作品与组件验收实验场，不能继续代表“写一份 PPT 的最低成本”。

建议分两步：先把单一讲稿入口、默认主题、挂载、资源构建和开发刷新交给工具；再用一个薄作者适配层，把普通页的 `title + content` 标准化为既有标题/布局/render。播放器、主题和生命周期仍使用现有实现。不要先复制 Slidev 的 Markdown/Vue/UnoCSS/Vite 整套编译体系。

仅把代码挪到更多文件、增加一个返回原对象的 `defineDeck`，或把全部实现藏进脚手架但仍要求每份作品维护它们，都不能解决问题。

## 当前 451 行及周边代码的真实职责

基线为本轮起点 `769f489`。以下为已跟踪文本物理行，包含空行/注释；二进制素材不按换行统计。

| 归属                     | 文件与行数                                                                                  | 合计 | 是否应由普通作者重复写               |
| ------------------------ | ------------------------------------------------------------------------------------------- | ---: | ------------------------------------ |
| 内容、作品专用交互与风格 | talk.tsx 451、talk.styles.ts 45、assets.ts 19                                               |  515 | 内容/模型应写；默认排版不应重复      |
| 浏览器与审阅宿主         | main.tsx 38、preview.ts 21、talk.stories.tsx 89                                             |  148 | 应由共享宿主或生成器承担             |
| 构建、启动、配置         | build.ts 48、serve.ts 18、HTML 13、Book config 7、tsconfig 10、媒体声明 20、package.json 15 |  131 | 工具生成/维护                        |
| 验收                     | delivery.spec.ts 173、Playwright config 22、test tsconfig 4                                 |  199 | 维护者与复杂作品的定向验收           |
| 专用素材制作             | generate-images.ts 70、record-transfer.ts 121                                               |  191 | 仅这件作品需要                       |
| 说明、来源与迭代历史     | README 69、NOTICES 13、三个 records 126                                                     |  208 | 来源保留；不强制每份讲稿建立同等台账 |
| 字幕                     | local-transfer.vtt                                                                          |   13 | 素材内容                             |
| 总计                     | 已跟踪文本                                                                                  | 1405 | **不是每位作者必须编写 1405 行**     |

`talk.tsx` 的互斥分段：

| 行      | 行数 | 职责                                                         |
| ------- | ---: | ------------------------------------------------------------ |
| 1–28    |   28 | imports、版本、宿主 options                                  |
| 29–105  |   77 | 专用传输动画、RAF、reduced motion、清理与 Replay             |
| 106–120 |   15 | 每场会话的速度、视频时间、派生公式与跳页                     |
| 121–393 |  273 | 五页 JSX，混合文案、排版与互动；其中 15 行是可选视频恢复接线 |
| 394–405 |   12 | 播放器组合及给夹具返回会话状态                               |
| 406–451 |   46 | 另外两页音乐生命周期实验                                     |

动画公式、现场回跳和视频时间恢复并非普通 PPT 的最低需求，不能为了行数把它们假装删成同一作品。真正的问题是它们出现在起手示例中，而且低层写法已落后于现有能力：

- 列比仍手写 Grid/CSS，未使用 `PresentationLayout` 的 1/2/3、wide-start/wide-end 和 header/footer。
- 普通图片仍自己组合 ImagePreview、figure、图注和框高，未使用 `PresentationImage`。
- 要点仍写列表 CSS，未使用 `PresentationList`。
- 标题/正文的默认字号与间距已有主题支持，仍在作品里定义另一套基础规则。
- `position` 本可省略，普通作品无需手写导航状态、knownSlides 或实验深链解析。
- main/preview 分别重复主题/runtime/cleanup；build/serve/媒体声明不应是作者起步任务。

逐文件依据见 `artifacts/presentation-authoring-audit/burden.md`。

## Slidev 的实际作者路径

本次读取官方文档，文档显示 v53.0.0；源码固定到 [`30a0a54c8739b4b395d9b336a6304cc8ebcc3947`](https://github.com/slidevjs/slidev/commit/30a0a54c8739b4b395d9b336a6304cc8ebcc3947)。未安装或运行 Slidev，不把阅读源码说成运行验收。

[官方起步](https://sli.dev/guide/)提供创建项目的命令与生成的 dev/build 脚本。作者通常修改 `slides.md` 并运行 `npm run dev`；入口、导航和默认样式不是作者每次手写。

| 场景       | Slidev 作者写法                                                 | 基础设施承担                                                   |
| ---------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| 简单文字   | Markdown 标题/段落，`---` 分页                                  | 编译、页面识别、排版                                           |
| 双栏       | frontmatter 的 two-cols/two-cols-header，`::right::` 等具名区域 | 通栏标题与区域布局                                             |
| 图片       | 图片引用或 image-right 布局，必要时 contain                     | 图片区域与布局                                                 |
| 逐步呈现   | v-click / v-clicks                                              | 步骤注册、导航和可见性                                         |
| 课堂互动   | 引用自己的 Vue 组件                                             | 自动发现组件；题目状态与反馈仍需实现                           |
| 主题       | headmatter 选一次主题                                           | 默认字号、边缘、常见页面样式                                   |
| 媒体       | SlidevVideo/原生 audio、字幕/说明                               | 视频的页面/点击活动接线；普通 audio 不因此获得同等生命周期合同 |
| 开发与交付 | dev/build 命令                                                  | Vite/HMR 与静态 SPA 构建                                       |

主要依据：[语法](https://sli.dev/guide/syntax)、[布局](https://sli.dev/builtin/layouts)、[渐显](https://sli.dev/guide/animations)、[组件](https://sli.dev/guide/component)、[主题](https://sli.dev/guide/theme-addon)、[CLI](https://sli.dev/builtin/cli)。
源码核对了[脚手架](https://github.com/slidevjs/slidev/blob/30a0a54c8739b4b395d9b336a6304cc8ebcc3947/packages/create-app/template/package.json)、[基础排版](https://github.com/slidevjs/slidev/blob/30a0a54c8739b4b395d9b336a6304cc8ebcc3947/packages/client/styles/layouts-base.css)、[two-cols-header](https://github.com/slidevjs/slidev/blob/30a0a54c8739b4b395d9b336a6304cc8ebcc3947/packages/client/layouts/two-cols-header.vue)、[SlidevVideo](https://github.com/slidevjs/slidev/blob/30a0a54c8739b4b395d9b336a6304cc8ebcc3947/packages/client/builtin/SlidevVideo.vue)与[VClicks](https://github.com/slidevjs/slidev/blob/30a0a54c8739b4b395d9b336a6304cc8ebcc3947/packages/client/builtin/VClicks.ts)。

不能照搬的点：image-right 默认 cover 不适合教材文字截图；两栏实现也不自动解决任意长文/嵌套溢出。Slidev 的可信本地 Vue 创作能力不能扩散成有限 JSON 的执行入口。其 starter 同样展示很多能力，starter 总行数也不是最低创作量。

## 已写出的两个比较样本

样本都覆盖七类页面：文字、双栏、图片、逐步呈现、问答、音视频、总结。正文、题目、媒体与状态策略不完全相同，格式也不同；**不能据此计算减幅、开发效率倍数或等价性能**。

| 样本              | 作者源码                                                           | 宿主/配置                                                                   | 实际验证                                                              |
| ----------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 现有 Meowtail API | slides.tsx 170 行/169 非空、6015 bytes                             | main 28、HTML 21、build 10、tsconfig 4、媒体声明 16，共 79 行；来源另 10 行 | 既有 dist 类型检查、局部 Bun 构建、Chrome 七页切换/渐显/问答/跨页状态 |
| Slidev 自写稿     | slides.md 74 行 + QuickCheck.vue 45 行，共119行/97非空、1972 bytes | 依赖/配置真实存在，由官方脚手架承担                                         | 官方文档与固定源码核对；没有安装实跑                                  |

文件：

- `artifacts/presentation-authoring-comparison/meowtail/slides.tsx`：使用当前 public exports，无作品 CSS、没有新 helper/API。
- 同目录 main/index/build/types 单独保留，不能声称“当前已支持单文件零接线启动”。
- `artifacts/presentation-authoring-comparison/slidev/slides.md`、`components/QuickCheck.vue`、SOURCES 与计数。

现有 API 版每场在 `createDeck(): PresentationProps` 工厂里创建 signals，避免模块单例；默认 theme 支持文字、列表、布局与图片。无外网资源，七页未出现诊断/运行错误；问答返回后选择仍保留。根实际打开封面、双栏、问答和媒体四张原图，不宣称七图均人工审美通过。

实际看图也说明“无 CSS”不等于作者体验已完善：普通 Button 为14px/36px，明显小于28px正文；Check 在 Stack 中变成长条。后续应研究共享的演示内容控件默认值/组合，而非让每份课件写字号、宽度补丁。本轮没有为这个原型改组件。

## 建议的最小能力与作者写法

### P0：一个作者宿主与开发入口

目标：作者只维护 `slides.tsx`、素材和必要的互动组件；一次 scaffold 后用一条 dev 命令进入预览，一条 build 命令交付。命令名称尚未实现或定稿，不把当前 Bun 脚本包装成已存在的 CLI。

统一宿主承担：媒体类型环境、资源图、HTML/viewport、registry、同一 runtime、默认主题、挂载/卸载、页面定位及 preview 许可。浏览器中每场调用一次工厂；不为读取配置在服务端预执行 JSX。宿主的 inactive 许可不得被作者 props spread 覆盖；作者提供 position 时仍是唯一 owner。

先做到修改后自动重建并 reload。reload 会重建会话，不能把它称为保留交互状态的 HMR；真正 HMR 的身份/状态恢复另外设计。

当前可作为输入的数据工厂已用现有类型证明：

```tsx
export default function createDeck(): PresentationProps {
  const choice = signal("");
  return { title: "Read a habitat", slides: [/* existing SlideDefinition values */] };
}
```

它仍不是足够轻的最终作者体验，因为每页还要写 id/title/render、Layout/header 及重复标题。

### P1：有实际作用的薄作者适配器

以下是**拟议写法，尚未实现，不是当前公共 API**。defineDeck 必须实际完成默认标题/布局标准化，不能只是 identity helper：

```tsx
export default function createDeck() {
  const answer = signal("Choose first.");
  const points = ["Describe what changed.", "Point to evidence."];
  return defineDeck({
    title: "Read a habitat",
    slides: [
      { id: "intro", title: "Read a habitat", content: <p>Observe, compare, explain.</p> },
      {
        id: "compare",
        title: "Look for evidence",
        columns: 2,
        content: [
          <PresentationList items={points} />,
          <PresentationImage src={forest} alt="Forest in Wolong" ratio="fill" />,
        ],
      },
      {
        id: "steps",
        title: "Build an explanation",
        steps: points.length,
        content: (
          <Stack>
            {points.map((text, i) => (
              <Reveal at={i + 1}>
                <p>{text}</p>
              </Reveal>
            ))}
          </Stack>
        ),
      },
      { id: "check", title: "Quick check", content: <QuickCheck answer={answer} /> },
    ],
  });
}
```

推荐独立作者类型/适配层标准化为现有 `SlideDefinition` 与 `PresentationProps`，保留低层 interface，避免直接把现有 interface 改成 union 破坏外部继承。没有第二套播放器。

独立审查确认的边界：

- content 与 render 互斥；columns/footer 只归简写分支。简单页 title 同时用于目录和默认 h2，特殊封面、不同画面标题或自定义 header 继续走现有 render。
- 只构造 render 闭包，不预执行组件、遍历 DOM 或预渲染整页；最终仍在 CurrentSlide 的 Context 下挂载 Reveal/Video/互动。
- 用属性是否存在判别 content，不能吞掉数字0或合法空内容；常见 readonly 数组需在作者层明确支持，不顺手改 core Child。
- 页内组件局部状态仍会随离页卸载；需要跨页保留的状态由会话工厂持有。一次性 AsyncIterable 等内容不承诺回访自动重放。
- steps 先保留显式合同；列表可由同一 points 数组的 length/map 去重。不能为省一个数字执行 render 两次或自动扫描任意嵌套 Reveal。
- 普通布局/图片/列表已经具备，无需再添同义组件；课堂常见选择/提示需依据多个真实片段，改共享默认或做小组合，不能把任意业务题目变成自动评分平台。

Markdown/MDX 可作为后续作者入口候选，但不应本轮先建立分页/frontmatter/组件作用域/状态/资源/错误定位的一整套新协议。仓库 MeowPress 虽已有 MDX 编译，当前是静态 `renderToHtml` 路径，不能据依赖存在就当作已具备交互 slide 作者宿主。

## 后续实施的可观察结果

1. 起手入口只展示普通作者维护的讲稿、素材和一小段可选互动；复杂传输作品单独标为实验场。
2. 普通文字页不写 CSS、render 闭包或重复画面标题；双栏/图片只声明语义区域。
3. 不要求作者维护 main/build/serve/registry/theme/cleanup；开发刷新和交付命令真实可用。
4. Reveal、课件状态、媒体停止与有限画布诊断继续走现有组件，不以减少源码破坏生命周期或默认可靠性。
5. 用同一篇讲稿验证作者改标题、加一页、换图、加一步、加互动后的操作数与错误反馈；不以把代码挤成一行证明体验提升。

本轮仅新增此设计记录与忽略目录中的比较稿/证据，未实现上述新公共能力，也没有运行全仓测试或正式发布验收。精简例的局部类型/构建/有限浏览器观察不能外推为 Slidev 对照稿或全套课件通过。
