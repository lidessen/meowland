# Meowtail

`meowtail` 提供跨应用组件、语义布局、标准主题和完整 Assistant 组合。网络、执行、权限与持久化由宿主适配，库不携带 Rossovia 的业务状态或后端。

## 浏览器交互演示

`meowtail/presentation` 提供 `Presentation`、`Reveal`、`PresentationVideo`、`PresentationAudio`
和 `usePresentationActivity`；根入口重导相同实现，沿用同一 MeowJSX/Context/主题身份。
内容区域使用 `PresentationLayout` 的可替换 header/footer 和命名列比，常见标题、图文、对比、
数字、流程与总结组合见[演示内容布局](PRESENTATION-LAYOUTS.md)。
整场与逐页可传 `background`：`"theme"` 或 `{ fill?, image?, overlay?, foreground? }`，
也可传同类型 Signal。`image` 接收 src、cover/contain 的 fit（默认 cover）和九点 position（默认 center）；
fill/overlay 支持 CSS 颜色或渐变。页省略时继承整场，整场省略时沿主题；显式 theme 回主题，
对象完整覆盖而不与整场合并，fill 省略时使用主题纸色。foreground 的 light/dark 指文字颜色，省略沿主题。
装饰背景铺满画布并自行裁切，不改变内容边缘、缩放或步骤生命周期；背景 Signal 更新不重挂当前内容。
同页背景更新不触发切页入场动画，只替换装饰层。
图片失败后保留底色、遮罩和文字明暗，作者须确保无图时仍可读；需要说明与替代文字的图片继续放正文。
使用现有 `createMeowUI()` 与 `meowtail/theme` 的 `standardTheme`，即可取得默认演示结构和视觉。
本地实现不表示已发布；当前公开版本和安装验收以根 README 与当次回执为准。

```tsx
import { h, signal } from "meowjsx";
import {
  Presentation,
  Reveal,
  type SlideDefinition,
  type SlidePosition,
} from "meowtail/presentation";

// Create these once per work instance, outside each slide's render callback.
const speed = signal(20);
const position = signal<SlidePosition>({ slideId: "experiment", step: 0 });
const slides: readonly SlideDefinition[] = [
  {
    id: "experiment",
    title: "Transfer estimate",
    steps: 1,
    render: () => (
      <div>
        <h2>Change the connection speed</h2>
        <input
          type="range"
          min="1"
          max="100"
          value={speed}
          onInput={(event: Event) => {
            speed.value = Number((event.currentTarget as HTMLInputElement).value);
          }}
        />
        <Reveal at={1}>
          <p>The estimate changes with the same experiment input.</p>
        </Reveal>
      </div>
    ),
  },
];
const view = (
  <Presentation title="Image transfer" slides={slides} position={position} active={false} />
);
```

实际作品应在工厂或顶层组件内创建这组值，避免模块级单例使多场演示串值。`position` 提供时
是唯一位置来源，导航与页内跳转都整体写同一 Signal；省略时组件创建本地位置，从第一页第 0 步开始。
页 id 必须唯一非空，`steps` 是第 0 步之外的推进次数，位置和 `Reveal at` 超出范围会明确报错。
步骤只更新局部绑定，换页才卸载旧页。跨页保留输入、计算参数与结果由宿主普通 signals 持有，
旧页的 DOM、媒体、计时器和监听则按各自 owner 清理。回到第 0 步不会清空实验输入。

默认逻辑画布为 1280×720，以 contain 适合可用区域；原尺寸模式提供滚动。工具控件保留自己的
正常尺寸。`presentationTokens` 从 `meowtail/theme` 导出，可调演示标题、正文、颜色和页面边缘，
不改变工作界面控件字号。内容超过画布会显示诊断；仍须实际观察真实文字、字体、媒体与目标尺寸。

外围采用常显的分组控制带：导航与页序、原生目录及设置入口各有自己的位置。低频的暂停/尺寸
操作放在既有 Popover 中，用原生切换按钮保留状态；打开后聚焦首项，Escape 关闭并返回设置入口。
排列与伸缩复用 Inline/Stack/LayoutItem，目录按控制带自身的窄宽度移到整行，适用于宽窗口中的窄宿主。
`presentationTokens` 中的 `chrome*` 值只控制围台、页眉和控制带，独立于舞台纸色/正文字体与
通用 Button 主题；不需额外 props 或主题安装器。窄屏会重排这些分组，控件保留约 44px 的
触控高度、可见焦点与原生键盘语义，不依赖悬停显示。

`active` 是宿主运行许可，缺省 true，与文档可见性、用户暂停和祖先 Reveal 组合。
审阅、后台 iframe 和确定状态摄影应从首次挂载传 false；前台交互再由宿主开放。
`usePresentationActivity()` 在同步组件 render 中捕获只读 Signal；自定义动画通过现有
`context.effect` 响应它并返回清理函数。该许可不等于正在播放或内容已就绪，不能自动暂停任意子组件。
Reveal 保留几何与局部状态，隐藏内容从键盘和可访问树移除；嵌套层共享祖先许可。

Presentation 与 Reveal 可选 `transition`：none（默认）、fade、slide、zoom，或
`{ effect, direction?, speed? }`。direction 为 left/right/up/down，表示移动方向；
slide 前进默认向左、后退默认向右，Reveal 默认向上；fade/zoom 不使用方向。
speed 为 fast/normal/slow。页面切换只让新页入场，旧页立即卸载；Reveal 只在已挂载内容从隐藏变为显示时入场，
直达步骤不补播。显现时即可交互，隐藏时立即 inert 并停止协作活动。
失活、暂停、文档隐藏或 reduced motion 会取消动画并落到终态，恢复后不补播；无 WAAPI 时直接呈现终态。

媒体组件要求 `src` 与可读的 `label`，默认原生 controls、metadata 预加载和用户启动。
`ref`、媒体事件、poster、track children 等原生接缝落到真实 video/audio；`className` 用于外层状态结构，
其他原生属性落到媒体元素。显式播放按钮检查 `play()` 的异步结果；宿主通过原生 ref 调用 play 时同样负责检查结果。
失活或卸载会暂停，恢复许可不自动开声。宿主可在 ref cleanup 中读取最后 `currentTime`，在重进的 metadata
事件后恢复 seek；组件先调用宿主 cleanup，再暂停并释放 src。素材换版的时间失效规则仍由宿主决定。
可选 `soundtrack` 槽沿用同一音频组件，跨页保留、退出清理，不混音，也不自动协调页内媒体音量。

Meowbook 用于审阅和摄影；正式观众入口由消费者用同一 JSX/主题构建 HTML、脚本与资源。
本入口没有 PPT/PDF 导出器、内容编辑器或资产服务。设计边界见
[创作能力设计](../../docs/designs/2026-10-17-presentation-authoring.md)。

本包的 npm 名称是 `meowtail`；既有 `createMeowUI`、`installMeowUI`、`createMeowUICatalog` 等 API 和运行时样式身份保持不变。使用新的包导入路径，不能据包名推导新的函数名、`data-*` 标记或 CSS 变量。

完整组合的使用合同见 [Assistant](ASSISTANT.md)，有限 JSON 入口见 [JSON catalog](JSON.md)。两者的实现与独立验收仍在进行；本页的 API 说明和早期产物验证不等于当前全部源码的同源验收通过。

## 目录

```text
src/
  components/   # Button、Card、Input、Dialog 等基础组件；一个组件一个文件
  chat/         # ChatFrame、ChatMessage、ChatComposer 等对话组件
  icons/        # 品牌标记和小图标；一个图标一个文件
  registry/     # contract 聚合、meowjsx 类型声明和安装入口
  shared/       # 组件内部共享的小工具
  theme/        # 标准主题的 token 定义和按 part 组织的 TS 样式
tests/
  unit/         # Bun，按 components/chat/icons/shared/theme 分组
  types/        # 公共类型合同，使用 *.types.ts / *.types.tsx，由 tsc 验证
  browser/      # Playwright，按 components/chat/theme/catalog 分组
```

产品事实、导航适配和应用专属样式留在宿主；通用活动面板、完整 Assistant 组合、共同页面壳和区域布局由本包提供，不要求消费者重新搭整页。
通用组件通过
className 保留宿主应用的视觉扩展点，标准主题由同一 package 的 `meowtail/theme`
根据 registry 的 component/part 身份提供默认样式。MeowUI 的 registry 是运行时 contract
和安装入口，不是 shadcn 式的源码分发目录。

## 当前组件

`PageFrame` 接收 header、toolbar 和 children，分配页头与 body 的可用高度，并提供共同页面外缘。
业务和 iframe 放入 body，不再各自按 viewport 减去页头高度。
默认 `variant="page"` 提供有限宽度与页面外缘；`variant="workspace"` 用于全宽工具栏和
连续阅读/输入工作区，外壳不重复添加页面 inset，内容组件继续拥有阅读宽度和安全底缘。
两种外壳都约束 body 高度；页头自然取高，动作可换行，就地展开内容可覆盖主体。
`scrollOwner="content"` 是默认值，body 将滚动交给既有内部容器；`scrollOwner="layout"`
让 body 自己承接自然文流与滚动。标题、关闭与其他 header 动作不放进 body 滚动区。
仅 `content` 模式向直属内容根分配伸缩空间；`layout` 模式保留控件自身的默认尺寸。
`RegionLayoutDescription` 用命名矩阵声明页面区域，浏览器宿主调用
`mountRegionLayout(host, layout, options)`，获得 `regions` 内容根、`showGroup`、`back` 和 `dispose`。
作者把内容放入这些根；矩形区域、有限尺寸、局部排列与滚动归属共享同一校验和 renderer。
`content` 行按自然内容领取空间，`fill` 行领取余量；空间不足时 content 区域按其滚动 owner
保持动作可达。组件应限制自身长内容，不能依靠外壳默认裁切来保住阅读空间。
多列在窄窗投影为一列；区域的 `compactRow="content" | "fill"` 可指定该投影中的自然高或
剩余高度，省略时沿原矩阵行推导。它不改变分组、桌面几何、内容挂载或滚动 owner。
跨模块合同和内置/扩展的共同使用见
统一 Extension 的区域布局（原产品仓库历史参考）。
原产品的接线和 UI 验收属于历史证据，不能代替本库迁移后的独立验证。

`CodeBlock` 接收原始 `code` 和可选 `language`，已知语法按需加载 Shiki 高亮，提供独立复制与自动换行开关。
换行只改变显示，复制保留原始空白；浏览器剪贴板失败时显示反馈。`onCopy` 可由宿主绑定其他
剪贴板实现，组件不执行代码。无语言时显示“代码”，`defaultWrap` 设置初始换行状态。
未知语言或高亮加载失败时保留纯文本显示。

`Checkbox`、`Switch` 和 `SegmentedControl` 提供原生表单选择；`Tabs` 负责保留挂载的面板切换。
`Menu`、`HoverCard`、`Toast`、`RiskConfirmation` 提供菜单、预览和反馈，业务操作与显示寿命由宿主负责。
Menu 的 Tab / Shift+Tab 关闭整个菜单链并沿原生顺序离开，不执行菜单项；Escape 逐层关闭并返回该层入口。
`TerminalBlock`、`ReadBlock`、`DiffBlock`、`SearchBlock`、`WebBlock` 与 `JsonBlock/JsonTree`
展示宿主提供的输出；组件不执行工具或读取文件。`ReadBlock` 可传 `lang`，首次进入视口时加载高亮，未知语言保留纯文本。
`ImagePreview` 统一图片加载、失败与预览框，`ImageLightbox` 提供单图查看，
`ShortcutKeys`、`PathLabel`、`StateDot` 和 `TextShimmer` 提供辅助呈现。

`Pill` 用于紧凑胶囊标签或操作，选中状态由宿主提供；静态标签沿用 `Badge`，支持 outline、solid 和 quiet 呈现。

界面改版（系统设计稿（原产品仓库历史参考））新增的通用组件：
`StatusDot` 以 processing（accent 脉冲）、success、returned（空心绿，执行返回不等于目标完成）、
warning、danger、unknown（空心灰，不假装知道）、idle 表达状态，点本身不带文字。
`Status` 接收 `state` 与必填 `label`，把装饰点与可见状态文字作为一个内容单元，标准主题统一点为 7px，
不提供 `size` 或 `halo`。`label` 保留 `Child` 的组合能力并排除直接空值与布尔值；调用方须保证
字符串、数组及动态内容实际非空且可见，并使用适合行内呈现的内容。`ListRow.status` 与
`ResourceCard.status` 仍接收 `Child`，可传入 `Status`；`WorkCard`、`Timeline` 等组件继续拥有内部标记，
不机械替换命令式改写、信号独立点或无逐点文字的装饰点阵。状态文字的非空语义仍由调用方审查。
`Tag` 是挨着内容的静态事实
（中性、强调、橙色计数、等宽路径），可选择与筛选仍用 `Pill`；`ProcessGroup` 与 `ProcessStep` 是折叠的步骤记录；
`WorkCard` 是对话里指向一件工作的单个控件；`IconRail`、`RailItem` 与 `RailSection` 是 56px 图标栏，悬停或键盘
聚焦时展开为覆盖在内容上的 256px 抽屉，分组收起时折成一个图标并显示子项的当前位置与橙点。
`Button` 的 `outline` 是次要层级，另有 `accent`（关于当前活动的软底）与 `stop`（打断运行中的工作）。
第二阶段补齐的详情与页面结构：`DetailSection`（带发丝线的分块，标题是小标签而非页面标题）、`Timeline` 与
`TimelineItem`（一条线串起的事件，标记点沿用 `StatusDot` 语义）、`ResourceLink`（指向一个可打开对象的整行引用，
有 href 时是链接，否则是按钮）；`PageHeader`（页名、一句用途与页面级操作）、`ListGroup` 与 `ListRow`（并列条目共用一圈
轮廓，可在行下展开编辑区，单独使用并设 `tone="accent"` 是摘要行）、`ResourceCard`（概览页里的一项能力，停用态用虚线
低对比）；`Drawer` 是窄屏从起始边滑入的原生模态面板，遮罩点击与 Escape 都交给宿主更新 `open`。`SegmentedControl` 的
轨道与选中态按设计稿收紧。窄屏的 `ChatComposer` 堆叠布局把「添加、输入、发送」放在一行，模型选择留在下方。
色板与层级只在 `theme/palette.ts`：`accentTokens`、`statusTokens`、`radiusTokens`（8/10/14/22）、`lineTokens`
（0.5px 发丝线）、`layerTokens`；accent 只表达「正在发生」与「当前所在」，primary 仍为黑白。

`ChatToolCall` 用 `label` 表示动作，`summary` 表示折叠时仍可见的简短目标；`detail` 与结果 children
在展开后显示。完成状态保留可访问描述，运行、等待、失败和未确认状态始终可见。
`ChatProcess` 用原生 details 聚合过程，可传 `icon` 表示动作类别，展开时显示向上折叠图标。
工具名称、摘要与结果均由宿主提供，组件不推断执行事实。

`ChatMessageList` 的行距由列声明、由行读取：列在每个非首行上给出 `--chat-row-pitch`，行按它设置
上边距，首行的上边距来自列表自身的内距。宿主逐条挂载消息时可以在列与行之间插入无布局容器
（`display: contents`），行距与直接子项一致。工具调用、过程分组与来源共用同一组行度量
（leading 盒、间隙与行盒），并随 `--chat-font-body` 相对 14px 的增量一起缩放：改变对话字号时
字形盒、字形、行盒与展开体缩进一起移动。行所拥有的内容（展开体、分组内的行）挂在行标签的
轴线上，与标签本身区分层级；与行并列的条目留在同一轴线上。

连续回复传入同一头像与 `continuation`，主题保留头像列并隐藏重复头像，正文轴线不依赖相邻 DOM 结构；未传头像的组继续使用无头像布局。

默认尺度与组件开发顺序见 [组件开发约定](AGENTS.md)。新组件先在 Meowbook 与现有控件同屏校准，
再接入应用；主题的字号、控件高度和三层间距是一套关系，不分别为每个组件选择一组新尺寸。
默认按钮高 36px，紧凑按钮高 28px，输入控件高 32px。信息块内部紧凑；页面边缘、独立区块与阅读区域应有充分留白。
局部间距 token 不是页面留白的上限，不将所有层级统一压紧。

界面正文使用 `uiTokens.fontBody`，辅助说明使用 `uiTokens.fontCaption`，长文与对话正文使用
`uiTokens.fontReading`，局部标题使用 `uiTokens.fontTitle`，完整页面标题使用
`uiTokens.fontPageTitle`，不把页面标题尺度用于字段标签。普通控件的水平内距由
`uiTokens.controlPaddingInline` 决定；group、section、panel 分别表达组内、区域之间和容器边缘的留白。
阅读段落的相对缩进、媒体尺寸、图谱坐标与触摸目标仍按真实用途设置，不套用控件尺度。

`PageFrame` 的页面边缘使用 `pageInsetBlock` / `pageInsetInline`，窄窗使用对应的
`pageInsetCompactBlock` / `pageInsetCompactInline`；页面留白不压成局部 panel 内距。
`ResourceCard` 使用统一的局部标题、正文、辅助文字与 card 圆角；紧凑概览对象的内距和
纵向节奏只在组件主题 token 中定义，不增加任意像素或 density 参数。需要核对的 identity
使用辅助文字色与等宽字体，停用状态不抹去名称与操作原因。
Meowbook 的 `page-structure-long-content` 补充长名称、准确标识、邻接状态与禁用动作的组合；
`EmptyState` 透传调用方的原生属性，状态紧急度与加载事实仍由宿主提供。

从仓库根运行 `bun test packages/meowtail/tests/unit` 执行 `tests/unit` 的 Bun 测试；类型检查与 `tests/browser` 的组件行为回归分别执行。文件归属与命名遵循测试文件组织规范（原产品仓库历史参考）。
浏览器测试只启动本包的 Meowbook 场景，不需要 Dashboard。组件交互、布局、对话组件和主题
回归统一位于 `tests/browser`；其中 catalog 验证本包展示配置作为 Meowbook 消费者的实际接合。
Meowbook 自身的工具与独立夹具测试仍由 `test:meowbook` 负责。
完整 UI 回归还需运行 Meowbook 测试及本包 `playwright.config.ts` 的浏览器场景。

`ChoiceGroup` 直接展示少量单选项，复用原生 radio 的键盘、表单和必填校验。
支持选项说明、禁用、受控值及表单重置；不负责提交。
`ChatQuestion` 提供问题、补充说明、回答内容、反馈和操作的布局；回答方式、异步提交和取消的业务含义
由宿主负责。标准主题遵循紧凑工作尺度，相关操作集中排列，不默认拉到容器两端。

### 布局与内容组合

`Stack` 纵向排列，`Inline` 横向排列且默认允许换行。共同提供 `gap`（none/compact/normal/relaxed）、
`align` 和 `justify`；`Inline wrap={false}` 可明确保持单行。组件保留方向与排列结构，theme 决定语义间距。
`Grid` 默认按容器宽度自动排列，`minColumnWidth` 为 compact/normal/wide；也可指定 `columns={1|2|3|4}`。
固定列数不会偷偷变成响应式列数。`Container width` 为 narrow/content/wide/page/full，主题控制内容最大宽度。
Stack 默认 stretch 便于表单与内容区域填满宽度；混合标签和按钮时用 `align="start"` 保留自然尺寸，
或把行动放入 Inline。字段、动作与长文字按内容关系明确选择 stretch、start 或 baseline 对齐。

局部布局可以自由嵌套这些 JSX 组件：先选择横向、纵向或并列关系，再在需要分配余量时使用
`LayoutItem`，内容和原生语义仍由真实组件承载。页壳与命名区域矩阵分配页面空间，
不限制区域内部的组件组合；没有新增可序列化的递归布局模板或另一套布局引擎。

沿用这套布局原语，不在应用中重复实现方向、对齐和间距。Stack/Inline/Grid 的 `rowGap`、
`columnGap` 默认 auto（沿用 gap），可单独使用同一套语义间距。布局可用 `as="header"` 或
`as="footer"` 保留区域语义；组件不会代替宿主选择业务断点、文字截断或换行策略。

`Toolbar` 默认横向并允许换行；`orientation="vertical"` 沿纵向排列。它为自身按钮、原生输入型按钮和有 href 的链接动作集合提供一个 Tab 停靠，方向键、Home / End 在当前集合内移动，横向尊重 RTL。原生 Input、Textarea、Select 和自管键盘的组合控件保留独立 Tab 与编辑键；嵌套 Toolbar 不重复消费。隐藏、disabled、inert 或作者显式 `tabIndex=-1` 的入口不入动作集合，动态成员变化不主动夺焦点。Enter / Space 仍沿控件原生激活，不自动将复杂输入折进 overflow 菜单；卸载恢复本组件管理过的 tabindex，保调用方后续有效属性。

`LayoutItem` 控制直接子项的空间分配：`grow` 默认 false，`shrink` 默认 true，
`basis` 默认 auto，`alignSelf` 默认 auto。它与 Stack/Inline/Grid 的根保留 min-width:0、min-height:0，
让嵌套子项能够接受父容器分配的有限空间；长标识符
是否断行、正文是否截断由内容决定。只在需要控制子项空间时使用，不要求每个元素包一层。

纵向工作区先由宿主或 PageFrame 提供有限高度，再用 `LayoutItem grow` 分配正文余量。
实际滚动内容明确使用 `overflow: auto`；布局组件不会默认裁切内容，也不会自动选择滚动 owner。
中间继续用 Stack 等布局组件时沿用可收缩的根；插入原生 div 等宿主包装时，仍须自行处理其
高度和最小尺寸。无高度限制的 Stack 保持自然文流，`shrink={false}` 的动作仍保留自然尺寸。

```tsx
// 标签与值属于一组，混合字号沿文字基线对齐。
<Inline gap="compact" align="baseline">
  <small>默认连接</small>
  <strong>Codex</strong>
  <small>gpt-6-luna</small>
</Inline>

// 正文使用剩余宽度，动作保留自然尺寸。
<Inline wrap={false}>
  <LayoutItem grow><Stack gap="compact">{title}{description}</Stack></LayoutItem>
  <LayoutItem shrink={false}><Button>编辑连接</Button></LayoutItem>
</Inline>

// 操作靠近排列，换行后留出更清楚的行距。
<Inline as="footer" gap="compact" rowGap="normal">{actions}</Inline>
```

Meowbook 的“布局组合 · 文本基线与固定动作”同时覆盖这些组合与长模型标识符。

`DescriptionList` / `DescriptionItem term={...}` 用原生 `dl` / `dt` / `dd` 组织相关的标签与值。
同组标签自然取宽并有上限，值共享列起点；局部容器宽度不足时，每项按标签、值上下排列，
不按整个窗口宽度判断。默认保留语义字号与可换行长文本，不提供表面、内距或独立滚动。
需要父容器分配可用宽度，不承诺按内容收紧宽度的布局；当前 Web 主题使用 CSS subgrid 与容器查询。
标签和任意值都可传 `Child`，值内继续组合已有布局与控件，不提供元数据 schema 或额外动作插槽。
代码字体、截断和固定尺寸子内容由消费者决定；普通文字与长标识默认可断行。
公开 parts 为 `description-list/root`、`description-item/root/term/value`，原生属性透传到各组件 root。

```tsx
<DescriptionList>
  <DescriptionItem term="工作目录">
    <Inline wrap={false} gap="compact" align="start">
      <LayoutItem grow>
        <code>{workspacePath}</code>
      </LayoutItem>
      <LayoutItem shrink={false}>
        <Button size="small">复制目录</Button>
      </LayoutItem>
    </Inline>
  </DescriptionItem>
  <DescriptionItem term="访问方式">只读</DescriptionItem>
</DescriptionList>
```

Meowbook 的 `description-list-composition` 在同一视口展示宽、窄局部容器、长标签与标识、
值内动作和输入，用于核对共享列、自然重排、原生语义与草稿连续性；它不代表业务页面已验收。

`Card` 支持 CardHeader、CardTitle、CardDescription、CardAction、CardContent、CardFooter。
默认 `variant="auto"` 通过渲染树 Context 取得深度：标准主题将顶层呈现为独立表面、后代融入父级；显式 variant 优先。
深度跟随逻辑组件树，浮层不会因为视觉上离开父卡片而自动变成新根；需要独立表面的弹层内容显式使用 surface。
Title 可以指定 h2–h6，标题等级仍由文档结构决定，不根据卡片嵌套自动猜测。
内部普通分组使用共享表面，独立事项可以明确使用 `variant="surface"`；`variant="embedded"` 明确融入父表面。
嵌套关系不等于必须重复外框和阴影。复杂内容仍使用 Stack/Inline/Grid 排版，不把 Card 变成万能布局组件。

`FieldGroup` 使用原生 fieldset/legend 组织字段，支持整组 disabled；Field 继续负责单个字段关联。
`AspectRatio ratio={16/9}` 控制布局比例，媒体的 object-fit 与裁切由调用方选择。
`Separator` 保留横向/纵向分隔语义。

`Tabs` 使用必需的 id、label 与 items（value/label/content/disabled）创建关联的 tab/tabpanel；
支持方向键、Home/End、受控 value Signal 与 defaultValue。切换时面板保持挂载，草稿不丢失。
`Breadcrumb items` 为 label/href 数组，最后一项标记当前位置。
`Tooltip` 使用 `trigger(bindings)` 为有名称的可聚焦控件补充文字说明，鼠标延迟出现、键盘聚焦立即出现，
Escape 关闭；不要把必要信息或可交互内容只放进 Tooltip，后者使用 Popover。
`Alert tone` 表达视觉状态，`role` 明确选择 status/alert，紧急度不由颜色推断。
`Skeleton` 是 aria-hidden 的占位；调用方提供内容区域的 aria-busy 和加载文案。
`SkeletonBoundary active={loading} label="正在更新资料"` 对已挂载的内容应用骨架呈现，
`active` 接收 boolean 或 Signal；切换不会卸载 children，保留输入草稿与组件状态。
加载时区域标记 aria-busy、内容 inert，屏幕阅读器从区域外的 status 获取调用方提供的加载文案。
开始加载时释放内容内的焦点；完成后不自动抢回焦点。调用方应把取消、重试等可用操作放在边界外。
底层使用 MeowJSX Web 的共享骨架控制器，对文字、图片、图标及输入统一去细节；这只是加载呈现，
不负责发起请求、计时或判断完成。首次加载尚无内容几何时，仍由调用方使用 `Skeleton` 提供占位结构。
宿主显式给 Web renderer 接入 `observation` hub 时，边界从渲染树 Context 取得来源并订阅自己的
组件子树；嵌套边界按 contract 与节点归属定位，不依赖函数名。普通未观察的 renderer 仍用局部 DOM
方式呈现，不强制开启组件索引。两种方式都保留外部 DOM 与主题变化的补充监听。
`Spinner label` 提供可读加载状态，不宣称真实进度。

原生选择控件 `Select` 复用浏览器的选项、键盘与表单语义，提供 `root` part；视觉由 theme 决定。它同时用于 Meowbook 工具外观与场景主题选择。控件保留原生 `size`（行数）语义，不把它复用成视觉尺寸。

`Popover` 是非模态的通用弹层，不默认设置菜单角色或锁住焦点。必需 `id` 和
`trigger(bindings)`；触发按钮展开 bindings，内容放 children。支持 `open` Signal / `defaultOpen`、
`onOpenChange`、`align`、`matchTriggerWidth`、`role` 和 `labelledBy`。`triggerId` 可与外部 Field 关联。
使用浏览器 Popover API 的顶层承载，依赖支持该 API 的浏览器；定位采用 `@floating-ui/dom`
的 offset/flip/shift/size 与打开期间的 autoUpdate，关闭或卸载时清理。外部点击关闭最上层，
Escape 返回当前层入口；焦点移到外部时不抢回焦点。内容按普通 Tab 顺序访问，菜单键盘规则由消费者提供。
局部 DOM 控件先处理 Escape；子 `preventDefault()` 表示消费，未消费时只由原 topmost 调用一次既有 `onKeyDown` 并尝试关闭，回调后重核原层，不能同一键再关 parent。单独 `stopPropagation()` 阻断自定义派发，不承诺阻止原生 Dialog 默认取消。正常回焦仍要求成功关闭且 trigger 可用，controlled 拒绝关闭、外部主动转焦和卸载不被强行覆盖；不吞调用方异常。
定位与限高完成后，仅最上层弹层把内部当前聚焦项滚入可见区域，不移动焦点或滚动外层。
parts 为 `root/panel`，表面、间距与动效归 theme。

`ChoiceSelect` 在 Popover 上实现自定义单选，原生 `Select` 继续用于系统选择器与多选。
`options` 为 `{ value, label, disabled?, group? }[]`，支持 `defaultValue` 或受控 `value` Signal，
用 `onValueChange` 接收选择。方向键、Home/End、字符定位、Enter/Space、Escape 和 Tab 可用。
`id` 用于 Field 关联；`name/required/disabled/form` 接到原生表单控件，必填失败阻止提交并聚焦
触发按钮。错误消息使用浏览器的原生校验文案。重置恢复非受控默认值，受控值仍归调用方。
主题视觉隐藏原生表单载体；不以 hidden input 冒充 required 校验。不提供自定义多选或异步搜索。
parts 为 `root/trigger/value/indicator/list/group/option/native/validation`。

- 基础：Button、AddButton、IconButton、Card、Badge、Input、Textarea、Select、Field、
  SearchInput、Disclosure、Separator、NavItem、EmptyState。
- 对话框：Dialog、DialogPanel、DialogHeader、DialogActions。
- Chat：ChatFrame、ChatHeader、ChatStatus、ChatConversation、ChatMessageList、ChatMessage、ChatBubble、
  ChatMessageActions、ChatComposer、ChatToolCall、ChatAttachments、ChatProcess、ChatSources。
- 图标：统一 Lucide 子集 `Icon` 与 `iconNames`，以及 MeowlandMark、DoodleCat、NotesIcon、TasksIcon、SearchIcon、PlusIcon、
  GithubIcon、ExternalArrowIcon。

新增组件前先确认它能在两个以上的应用或场景中复用；应用只使用一次的页面组件不要
为了“提取”而迁入这里。

`Field` 在只有一个控制子节点且能从 `htmlFor`、`descriptionId` 或 `errorId` 解析关联
时，会把描述和错误节点的 id 连接到控制节点的 `aria-describedby`，并在有错误时设置
`aria-invalid`。多个控制节点或自定义组合仍由调用方显式传递关联属性。

`Dialog` 只负责原生 `<dialog>` 的结构、标签关联和 panel/header/actions 分区；打开、关闭、
Escape、焦点返回和提交结果仍由应用控制。它没有仿 Radix 的 context、portal 或 focus trap，
不要把这些行为默认为组件已经提供。
`DialogPanel header={...}` 与 `Drawer header={...}` 显式组合共享 `PageFrame`，标题和关闭
同处固定 header，body 是唯一的主滚动区。`DialogPanel as="form"` 保留原生表单归属与提交，
短内容自然取高，长内容继承宿主 dialog 的最大高度；不扫描 children 猜标题，也不重复计算页头高度。
消费者将 `DialogHeader` 放进 header 属性，正文与原有末尾动作放进 children；原生窗口、
取消、草稿及打开方式仍归宿主。正文滚动引用沿公开 `page-frame/body` part 获取。
DialogPanel 在直属 header 与 body 内分配标准留白，保证正文首末控件的焦点轮廓位于其滚动视口内；任意 Child header 使用同一 `spaceSection` 分隔，无 header 时 body 四边取 panel 留白。既有 DialogHeader 组合保持原内容几何，不承诺任意自定义 header 总高不变；没有新增 gap 属性。固定标题、退出与唯一 body 滚动仍分开，任何极小高度都足够阅读不是承诺。原生 Dialog 的打开、取消与 caller 焦点前提不变，主题留白修复不表示所有指针/系统焦点路径均已验证。

`EmptyState size="compact"` 用于局部空列表或未选内容区域，沿用标题、说明和动作，去掉装饰插图。
默认 `size="default"` 保留整页空态；加载与失败仍使用各自已有反馈，不改成空态。

`ChatAttachments` 接收 `items: readonly ChatAttachmentItem[]`，每项包含
`id`、`name`、`url`、`mediaType` 和可选的 `sizeBytes`；`label` 默认是“消息附件”。
调用方提供 URL，组件不获取数据。图片默认以可访问的新窗口链接和懒加载预览展示，提供 `onPreview` 时改为预览按钮；
文件链接使用原文件名下载，提供有效大小时显示 B / KB / MB。
主题通过 `partSelector(chatAttachmentsContract, part)` 使用 `chat-attachments` 的
`root/entry/image/preview/file/icon/details/name/size/previewButton/remove` parts。
每项可提供 `onRemove`，只有草稿需要移除操作时才传入；上传、删除文件和 URL 生命周期仍归宿主。

`ChatComposer` 的 `hintId` 会把提示节点和输入框通过 `aria-describedby` 关联；`onInput`
绑定在 textarea 上，`onSubmit` 绑定在外层 form 上。`value` 支持 Signal，`submitDisabled`
仅禁止提交，适合等待结果时继续编辑；`disabled` 同时禁止编辑与提交。请求状态、已提交快照和
最新草稿由调用方管理。`attachments` 放待发送材料，`inputLabel` 提供输入名称。
标准主题把附件、输入、辅助操作和提交组织在同一书写面中。
`layout="inline"` 让短草稿与操作同排，长草稿保持增高；聚焦时显示提示，默认 `stacked` 保留独立工具行。
`layout="hero"` 使用桌面母版空白对话的输入高度。`trailing` 在发送按钮左侧组合 provider、模型等选择入口；
可传入受控 `ChoiceSelect`，用 `placement="top"`、`align="end"`、`matchTriggerWidth={false}`
向上展开分组选项。选项来源、当前值与运行配置的实际切换仍由宿主负责。

`ChatMessage` 管身份、排列与状态，默认在内容中包装 `ChatBubble`，保留原调用方式。
需要将附件、过程和文字分别展示时，设置 `surface="none"`，自行组合 `ChatBubble` 与其他组件。
Bubble 的 `auto` 通过 Context 读取消息角色，主题决定底色；也可显式选择 `plain` / `filled`。
`header` / `footer` 是补充材料和送达反馈的插槽，业务状态仍由宿主提供。

`ChatConversation` 是可选的滚动容器，宿主必须提供受约束的高度。
它在靠近底部时跟随追加内容，上翻时保留位置，并提供返回最新的按钮。
它不实现历史前插、逐消息锚点或持久化阅读恢复。不要与应用已有滚动控制器叠加；
Dashboard 继续使用自身控制器。`ChatMessageList` 仍只提供消息记录语义。

`SearchInput` 提供搜索图标与原生 search input 的共同外壳，`label` 是必需的可访问名称。
`className` 作用于外壳，`inputClassName` 作用于输入；`id/name/value/disabled/readOnly/aria-*`
及事件都传给 input，保留 Field 的说明和错误关联。筛选、提交与结果状态仍由消费者负责。
parts 为 `root/icon/control`，默认表面、焦点和错误边界由 theme 决定。

`PathPicker` 组合受控路径输入与可选的浏览按钮。调用方提供 `value/onValueChange`、
可访问名称 `label`，以及返回路径或 `null`（取消）的异步 `onChoose`；`kind="file" | "directory"`
只确定按钮文字，实际选择能力由宿主注入。不提供 `onChoose` 时仍可手动输入。
组件负责等待、失败反馈与卸载后忽略结果；在途时暂时锁定输入，父值或禁用／只读状态变化后不写回旧选择。
选择只填写路径，不读取文件、上传文件或授予访问权限。说明、校验与保存仍归调用方。

`Disclosure` 使用原生 details/summary，接收 `summary: Child` 与内容 children，支持
`open/name/onToggle` 等原生属性。`summaryClassName`、`contentClassName` 用于宿主布局；
parts 为 `root/summary/icon/content`。它不维护另一份展开状态，也不是多项 Accordion。

## 标准主题（meowtail/theme）

标准主题导出 `standardTheme`、`standardOptions` 和类型化的 `uiTokens`。token 与样式
都由 TypeScript 定义；组件通过稳定的 part 标记与样式选项匹配 CSS，不再由主题插件
生成视觉类名。完整设计见 TypeScript token 与参数化配置（原产品仓库历史参考）。

样式文件统一采用 `<职责>.styles.ts`，标准主题按组件与对话职责分组，应用样式随应用模块维护。
命名、组件族边界与层叠整理见样式文件组织（原产品仓库历史参考）。
现有样式已按此规范迁移，历史对话覆写已并回消息与输入框负责文件。

### 组件安装与样式交付

组件安装和样式加载是两个明确的步骤。`createMeowUI()` 注册组件及样式属性适配器；
`standardTheme.cssText` 提供包含变量声明和组件规则的完整 CSS。动态宿主可以这样组装：

```tsx
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Button, createMeowUI } from "meowtail";
import { standardTheme, standardOptions } from "meowtail/theme";
import { applyTheme, mountStyles } from "meowcss/web";

const runtime = createRuntime({ plugins: [createMeowUI()] });
const web = createWebRenderer(runtime);
const removeStyles = mountStyles(container.ownerDocument, standardTheme.cssText);
const removeTheme = applyTheme(
  container,
  standardTheme,
  standardOptions.select({ scheme: "light" }),
);
const mounted = web.render(<Button variant="quiet">取消</Button>, container);

// 宿主销毁时：
mounted.unmount();
removeTheme();
removeStyles();
```

使用 defaultRuntime 时调用 `installMeowUI(defaultRuntime)`，并让初次渲染和动态控件
使用同一个 runtime。无需另外安装标准主题插件。样式属性的合法值、默认值和承载 part
由组件 contract 的 `defineStyleProps` 声明；适配器负责消费属性，避免将 variant 等
样式选项当作普通 DOM 属性透传。`ThemedProps` 提供联合类型及 Signal 输入；组件沿用
开放的原生 Props，因此不承诺拒绝所有未知属性。

静态宿主在构建时组合 `standardTheme.cssText` 与应用 CSS，写出 `.css` 文件并由 HTML
加载，同时通过 `themeAttributes(standardTheme, config)` 输出根属性。样式在客户端
JavaScript 执行前即可加载。Dashboard 和 Meowbook 使用这条交付路径；
动态预览使用 `mountStyles(document, cssText)`，由宿主持有返回的清理函数。
源码不维护 `.css` 文件，生成的 CSS 仍是浏览器资源。模块导入本身不访问 DOM，
`mountStyles` 不负责跨调用去重，宿主应在文档或应用生命周期内组装一次。

### 根配置与局部覆盖

`standardOptions` 内置 scheme，当前标准主题默认 `auto`，支持 light/dark/auto。
标准视觉以 DeepSeek Harness 为基准：系统字体、正文 14px、辅助 12px、标题 16px；按钮
small/default/large 使用 28/36/44px，输入框默认 32px。控件、菜单和大面板分别使用对应的
圆角与材质，应用从同一语言组合页面。参考来源与许可证见 [第三方说明](THIRD_PARTY_NOTICES.md)，
实施范围及尚未完成的验证见 迁移记录（原产品仓库历史参考）。

```tsx
import { Theme } from "meowcss/web";

<Theme theme={standardTheme} config={standardOptions.select({ scheme: "dark" })}>
  <Button>保存</Button>
  <Theme config={standardOptions.select({ scheme: "light" })}>
    <Preview />
  </Theme>
</Theme>;
```

`Theme` 只绑定配置，不加载 CSS。局部 config 省略的维度继承父级；移除局部选择恢复
继承，组件实例和草稿不需要重建。已有 DOM 根使用 `applyTheme`，静态 HTML 使用
`themeAttributes`，三者共享属性语义。不要为每套主题创建新的 Theme 组件。

### 样式与组件选项

普通 CSS 保持模板形式；token 与 part 在 TypeScript 中引用，避免手写生成后的名称：

```ts
import { buttonContract, buttonOptions } from "meowtail";
import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "meowtail/theme";

const applicationStyles = css`
  .toolbar ${partSelector(buttonContract, "root")} {
    border-radius: ${uiTokens.controlRadius};
    ${buttonOptions.when({ variant: "quiet" })} {
      color: ${uiTokens.info};
    }
  }
`;
```

宿主显式按标准主题、应用基础、应用覆写的顺序组合 CSS。hover、focus、媒体查询与动画
继续由 CSS 执行；原生状态用原生属性匹配，组件样式选项使用 `when`。`className` 和
`style` 保留为应用扩展入口，业务布局不进入标准主题。

自定义 token 使用 `defineTokens`，通过 `defineTheme` 一次组合选项、完整默认值、token
集合和 CSS 片段。组件绑定从片段中的 typed part 引用取得；不要提前将片段转成字符串而
丢失这些信息。无默认值的测量变量使用 `tokenRef`，通过 `.name` 交给 `setProperty`。
纯生成与 typed adapter 的写法和作用域边界见 [MeowCSS](../meowcss/README.md)。

构建并安装本地包后，从仓库根运行 `bunx --no-install meowbook serve --config packages/meowtail/meowbook.config.ts`
打开组件场景，核对明暗、桌面与窄屏、输入草稿和状态切换。尺寸是 Web 适配，
当前视觉基准见上述 DeepSeek 迁移记录；设计判断与打磨方法见
meow-design（原产品仓库历史参考），其历史探索配方不作为标准主题规范。

### 生命周期扩展

静态视觉使用 CSS。只有需要真实 DOM、实例状态、监听或清理时才使用 shadow：

```ts
// Web shadow：context.element 是真实 Element。
import { defineShadow } from "meowjsx/web";

runtime.use({
  shadows: [
    defineShadow(Button, "root", (props, context) => {
      const active = context.signal(false);
      context.effect(() => {
        context.element.classList.toggle("is-active", active.value);
      });
      const enter = () => {
        active.value = true;
      };
      const leave = () => {
        active.value = false;
      };
      context.element.addEventListener("pointerenter", enter);
      context.element.addEventListener("pointerleave", leave);
      context.onCleanup(() => {
        context.element.removeEventListener("pointerenter", enter);
        context.element.removeEventListener("pointerleave", leave);
      });
    }),
  ],
});
```

集中注册，不生成包装组件。shadow 与组件共享 signal/effect/onCleanup 生命周期 API。
插件卸载阻止后续应用；现有元素的实例清理由其 mount 的 unmount 负责。不要用
renderToHtml + innerHTML 代替需要生命周期的浏览器挂载。

### 文件与验证

- `meowcss`：通用 token/选项/CSS 生成；`meowcss/meowjsx` 负责 typed parts 与自动 carrier；`meowcss/web` 负责 DOM 主题生命周期，详见 [MeowCSS](../meowcss/README.md)。
- `src/theme/tokens.ts`、`palette.ts`：共享参数与语义色板。
- `src/theme/base.styles.ts` 与 `components/chat/icons/shared` 下的 `*.styles.ts`：按职责编写的 CSS 模板；
  专属高亮 token 在 `shared/code-highlight.tokens.ts`。
- `src/theme/index.ts`：标准主题的显式组装与公共导出。
- `bun test packages/meowtail/tests/unit`：组件与标准主题合同；通用 token/选项合同在 MeowCSS 测试中验证。
- `tsc --noEmit --project packages/meowtail/tsconfig.json`：检查实现、展示场景、浏览器测试和
  `tests/types/` 的公共类型合同；类型用例不由 Bun 执行。
- `tests/browser/theme/parameterized-theme.spec.ts`：参数化主题、局部覆盖及真实组件组合回归，针对
  `tests/fixtures/theme-prototype-demo.tsx` 与 `tests/fixtures/real-controls-demo.tsx` 的独立测试场景，
  由本包 Playwright 专用测试配置加载，不进入组件 gallery。
- Rossovia 的 Dashboard 组合验证仍由产品仓库维护，不是本库的可运行命令；库内不保留依赖产品 checkout 的测试。

浏览器验收覆盖对应场景，不能用类型或构建通过替代。组件注册必须作用于实际渲染的
runtime；需要生命周期的内容使用 render 挂载，而非 HTML 字符串插入。
