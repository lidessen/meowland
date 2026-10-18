# 播放器与生命周期合同

`meowslides` 提供 `Presentation`、`Reveal`、`PresentationVideo`、`PresentationAudio`
和 `usePresentationActivity`；根入口重导相同实现，沿用同一 MeowJSX/Context/主题身份。
内容区域使用 `PresentationLayout` 的可替换 header/footer、`1 | 2 | 3` 等宽列或既有命名列比，常见标题、图文、对比、
数字、流程与总结组合见[演示内容布局](PRESENTATION-LAYOUTS.md)。
`PresentationList items={...}` 生成原生 ul/li，`as="ol"` 可继续传 start/reversed；
它使用演示正文 token（标准主题默认 28px），不另设 size/density，也不自动压缩无限长内容。
正文图片用 `PresentationImage src alt`，默认 16:9、contain、center，caption 保持自然高度并复用 ImagePreview 的加载/失败反馈。
数值 ratio 是优选框比例，`ratio="fill"` 须由有限父级分配空间；图注也占内容预算。
cover 需明确选择，position 为与背景相同的九点；比例不同时，完整显示与填满区域需取舍，文字图优先 contain。
Meowbook 的 `presentation-foundations` 可实际查看两列、三列、列表、照片 cover 与文字图 contain。
整场与逐页可传 `background`：`"theme"` 或 `{ fill?, image?, overlay?, foreground? }`，
也可传同类型 Signal。`image` 接收 src、cover/contain 的 fit（默认 cover）和九点 position（默认 center）；
fill/overlay 支持 CSS 颜色或渐变。页省略时继承整场，整场省略时沿主题；显式 theme 回主题，
对象完整覆盖而不与整场合并，fill 省略时使用主题纸色。foreground 的 light/dark 指文字颜色，省略沿主题。
装饰背景铺满画布并自行裁切，不改变内容边缘、缩放或步骤生命周期；背景 Signal 更新不重挂当前内容。
同页背景更新不触发切页入场动画，只替换装饰层。
图片失败后保留底色、遮罩和文字明暗，作者须确保无图时仍可读；需要说明与替代文字的图片继续放正文。
宿主在同一 Runtime 安装 `createMeowUI()` 与 `createMeowSlides()`，并加载 `meowslides/theme` 的完整 `presentationTheme`，即可取得默认演示结构和视觉。
本地实现不表示已发布；当前公开版本和安装验收以根 README 与当次回执为准。

```tsx
import { h, signal } from "meowjsx";
import { Presentation, Reveal, type SlideDefinition, type SlidePosition } from "meowslides";

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
正常尺寸。`presentationTokens` 从 `meowslides/theme` 导出，可调演示标题、正文、颜色和页面边缘，
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
`Reveal` 二选一接收 `at={n}` 或 `when={booleanOrSignal}`，不能同时传或都省略。
`at` 沿页步骤累计显现；`when` 由作品局部状态控制，可反复显隐而不改变 slide/step。
两种入口共用保挂载、几何、焦点回退、隐藏语义、祖先活动与动画清理；仍须在 Presentation 页内使用。
提示、答案和依据可分别用普通 signals 接入 `when`，作品不复制 visibility / inert / ARIA 接线。

作品内容样式使用 `slideClassName`：类只落在当前页 article，后代标题/表单规则不会因此选中外围播放器。
`className` 继续作用整个 Presentation 根，保持既有合同；两者不新增内容 wrapper，也不隔离任意全局 CSS。
固定画布诊断同时检查可见内容与命名布局区域分配，避免正文侵入 footer 却未超出整张画布时漏报；
明确的滚动区仍由自身承担滚动。诊断指出超容量，不自动缩字、隐藏正文或保证任意内容都能装入一页。

Presentation 与 Reveal 可选 `transition`：none（默认）、fade、slide、zoom，或
`{ effect, direction?, speed? }`。direction 为 left/right/up/down，表示移动方向；
slide 前进默认向左、后退默认向右，Reveal 默认向上；fade/zoom 不使用方向。
speed 为 fast/normal/slow。页面切换只让新页入场，旧页立即卸载；Reveal 只在已挂载内容从隐藏变为显示时入场，
直达步骤不补播。显现时即可交互，隐藏时立即 inert 并停止协作活动。
失活、暂停、文档隐藏或 reduced motion 会取消动画并落到终态，恢复后不补播；无 WAAPI 时直接呈现终态。

媒体组件要求 `src` 与可读的 `label`，默认原生 controls、metadata 预加载和用户启动。
共享动作提供 Play / continue、Pause 与 Back to start；后者暂停并回到开头，仍等用户明确播放。
暂停或回到开头会使尚未完成的播放请求失效，迟到的 Promise 不会重新启动媒体。
有限 Stack 中媒体画面可收缩并保持 contain，状态和操作保留自然高度；错误反馈与名称分块，不挤在同一段文本里。图片或视频区域可配合 `LayoutItem grow basis={0}` 分配剩余空间，文字仍需遵守有限画布容量，不承诺无限内容自动适配。
`ref`、媒体事件、poster、track children 等原生接缝落到真实 video/audio；`className` 用于外层状态结构，
其他原生属性落到媒体元素。显式播放按钮检查 `play()` 的异步结果；宿主通过原生 ref 调用 play 时同样负责检查结果。
失活或卸载会暂停，恢复许可不自动开声。宿主可在 ref cleanup 中读取最后 `currentTime`，在重进的 metadata
事件后恢复 seek；组件先调用宿主 cleanup，再暂停并释放 src。素材换版的时间失效规则仍由宿主决定。
可选 `soundtrack` 槽沿用同一音频组件，跨页保留、退出清理，不混音，也不自动协调页内媒体音量。

Meowbook 用于审阅和摄影；默认 MDX 作品由新包 CLI 生成正式 HTML、脚本与资源，高级消费者也可用同一 JSX/主题构建宿主。
本入口没有 PPT/PDF 导出器、内容编辑器或资产服务。设计边界见
[创作能力设计](../../docs/designs/2026-10-17-presentation-authoring.md)。
